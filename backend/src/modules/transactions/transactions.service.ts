import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { Loan } from '../loans/entities/loan.entity';
import { Repayment } from '../repayments/entities/repayment.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createDisbursementTransaction(loan: Loan): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      reference: `TXN-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`,
      type: TransactionType.LOAN_DISBURSEMENT,
      amount: loan.amount,
      status: TransactionStatus.COMPLETED,
      loanId: loan.id,
      userId: loan.student?.userId,
      description: `Loan disbursement for ${loan.loanReference}`,
      metadata: {
        loanReference: loan.loanReference,
        purpose: loan.purpose,
      },
    });

    return this.transactionRepository.save(transaction);
  }

  async createRepaymentTransaction(repayment: Repayment): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      reference: `TXN-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`,
      type: TransactionType.LOAN_REPAYMENT,
      amount: repayment.amount,
      status: TransactionStatus.COMPLETED,
      loanId: repayment.loanId,
      repaymentId: repayment.id,
      externalReference: repayment.externalReference,
      description: `Loan repayment for ${repayment.repaymentReference}`,
      metadata: {
        repaymentReference: repayment.repaymentReference,
        paymentMethod: repayment.paymentMethod,
      },
    });

    return this.transactionRepository.save(transaction);
  }

  async createFeeTransaction(loan: Loan): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      reference: `TXN-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`,
      type: TransactionType.FEE_COLLECTION,
      amount: loan.feeAmount,
      status: TransactionStatus.COMPLETED,
      loanId: loan.id,
      description: `Platform fee for ${loan.loanReference}`,
      metadata: {
        loanReference: loan.loanReference,
        feePercentage: loan.feePercentage,
      },
    });

    return this.transactionRepository.save(transaction);
  }

  async getTransactionById(id: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ where: { id } });
  }

  async getTransactionByReference(reference: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ where: { reference } });
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async getTransactionsByLoan(loanId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { loanId },
      order: { timestamp: 'DESC' },
    });
  }

  async getAllTransactions(
    page: number = 1,
    limit: number = 10,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ) {
    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (startDate && endDate) {
      whereClause.timestamp = Between(startDate, endDate);
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: { timestamp: 'DESC' },
    });

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionStats(startDate?: Date, endDate?: Date) {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    if (startDate && endDate) {
      queryBuilder.where('transaction.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalDisbursements = await queryBuilder
      .clone()
      .andWhere('transaction.type = :type', { type: TransactionType.LOAN_DISBURSEMENT })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    const totalRepayments = await queryBuilder
      .clone()
      .andWhere('transaction.type = :type', { type: TransactionType.LOAN_REPAYMENT })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    const totalFees = await queryBuilder
      .clone()
      .andWhere('transaction.type = :type', { type: TransactionType.FEE_COLLECTION })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    const transactionCount = await queryBuilder.clone().getCount();

    return {
      totalDisbursements: totalDisbursements?.total || 0,
      totalRepayments: totalRepayments?.total || 0,
      totalFees: totalFees?.total || 0,
      transactionCount,
    };
  }
}
