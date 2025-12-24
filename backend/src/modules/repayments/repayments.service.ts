import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repayment, RepaymentStatus, PaymentMethod } from './entities/repayment.entity';
import { Loan, LoanStatus } from '../loans/entities/loan.entity';
import { LoansService } from '../loans/loans.service';
import { TransactionsService } from '../transactions/transactions.service';
import { MakeRepaymentDto } from './dto/repayment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RepaymentsService {
  constructor(
    @InjectRepository(Repayment)
    private readonly repaymentRepository: Repository<Repayment>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly loansService: LoansService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async makeRepayment(userId: string, dto: MakeRepaymentDto): Promise<Repayment> {
    // Get loan and verify ownership
    const loan = await this.loansService.getLoanById(dto.loanId, userId);

    // Check if loan is active
    if (![LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.OVERDUE].includes(loan.status)) {
      throw new BadRequestException('This loan is not eligible for repayment');
    }

    // Check if amount exceeds outstanding balance
    if (dto.amount > loan.outstandingBalance) {
      throw new BadRequestException(
        `Repayment amount exceeds outstanding balance of ${loan.outstandingBalance} RWF`,
      );
    }

    // Validate payment method requirements
    if (dto.paymentMethod === PaymentMethod.MOBILE_MONEY && !dto.phoneNumber) {
      throw new BadRequestException('Phone number is required for mobile money payments');
    }

    if (dto.paymentMethod === PaymentMethod.BANK_TRANSFER && !dto.bankAccount) {
      throw new BadRequestException('Bank account is required for bank transfers');
    }

    // Generate repayment reference
    const repaymentReference = `REP-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create repayment record
    const repayment = this.repaymentRepository.create({
      loanId: dto.loanId,
      repaymentReference,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      phoneNumber: dto.phoneNumber,
      bankAccount: dto.bankAccount,
      status: RepaymentStatus.PENDING,
    });

    await this.repaymentRepository.save(repayment);

    // In a real application, this would initiate the payment gateway
    // For now, we'll simulate immediate processing
    await this.processRepayment(repayment.id);

    return this.repaymentRepository.findOne({
      where: { id: repayment.id },
      relations: ['loan'],
    });
  }

  async processRepayment(repaymentId: string): Promise<Repayment> {
    const repayment = await this.repaymentRepository.findOne({
      where: { id: repaymentId },
      relations: ['loan'],
    });

    if (!repayment) {
      throw new NotFoundException('Repayment not found');
    }

    if (repayment.status !== RepaymentStatus.PENDING) {
      throw new BadRequestException('Repayment is not in pending status');
    }

    // Update repayment status
    repayment.status = RepaymentStatus.PROCESSING;
    await this.repaymentRepository.save(repayment);

    try {
      // Simulate payment processing (in production, call payment gateway)
      // await this.paymentGateway.processPayment(repayment);

      // Mark as completed
      repayment.status = RepaymentStatus.COMPLETED;
      repayment.processedAt = new Date();
      repayment.externalReference = `EXT-${Date.now()}`;

      await this.repaymentRepository.save(repayment);

      // Update loan repayment amount
      await this.loansService.updateLoanRepayment(repayment.loanId, repayment.amount);

      // Create transaction record
      await this.transactionsService.createRepaymentTransaction(repayment);

      return repayment;
    } catch (error) {
      repayment.status = RepaymentStatus.FAILED;
      repayment.failureReason = error.message;
      await this.repaymentRepository.save(repayment);
      throw error;
    }
  }

  async getRepaymentById(id: string): Promise<Repayment> {
    const repayment = await this.repaymentRepository.findOne({
      where: { id },
      relations: ['loan'],
    });

    if (!repayment) {
      throw new NotFoundException('Repayment not found');
    }

    return repayment;
  }

  async getRepaymentsByLoan(loanId: string): Promise<Repayment[]> {
    return this.repaymentRepository.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentRepayments(userId: string): Promise<Repayment[]> {
    // Get all loans for the student
    const loans = await this.loansService.getStudentLoans(userId);
    const loanIds = loans.map((loan) => loan.id);

    if (loanIds.length === 0) {
      return [];
    }

    return this.repaymentRepository.find({
      where: loanIds.map((loanId) => ({ loanId })),
      relations: ['loan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllRepayments(page: number = 1, limit: number = 10) {
    const [repayments, total] = await this.repaymentRepository.findAndCount({
      relations: ['loan', 'loan.student', 'loan.student.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: repayments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
