import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';
import { Student } from '../students/entities/student.entity';
import { StudentsService } from '../students/students.service';
import { TransactionsService } from '../transactions/transactions.service';
import { RequestLoanDto, ApproveLoanDto, RejectLoanDto } from './dto/loan.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoansService {
  private readonly PLATFORM_FEE_PERCENTAGE = 5; // 5%
  private readonly GRACE_PERIOD_DAYS = 7;
  private readonly LATE_FEE_PERCENTAGE = 2; // 2% flat late fee

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly studentsService: StudentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async requestLoan(userId: string, dto: RequestLoanDto): Promise<Loan> {
    // Get student profile
    const student = await this.studentsService.getStudentByUserId(userId);

    // Check eligibility
    if (!student.isEligibleForLoan) {
      throw new BadRequestException(
        'You are not currently eligible for a loan. Please complete your profile and ensure your trust score is sufficient.',
      );
    }

    // Check if amount is within limit
    if (dto.amount > student.maxLoanAmount) {
      throw new BadRequestException(
        `Requested amount exceeds your maximum loan limit of ${student.maxLoanAmount} RWF`,
      );
    }

    // Check for existing active loans
    const activeLoan = await this.loanRepository.findOne({
      where: {
        studentId: student.id,
        status: In([
          LoanStatus.PENDING,
          LoanStatus.APPROVED,
          LoanStatus.DISBURSED,
          LoanStatus.ACTIVE,
          LoanStatus.OVERDUE,
        ]),
      },
    });

    if (activeLoan) {
      throw new BadRequestException(
        'You already have an active loan. Please repay it before requesting a new one.',
      );
    }

    // Validate due date
    const dueDate = new Date(dto.dueDate);
    const today = new Date();
    const minDueDate = new Date(today.setDate(today.getDate() + 7)); // Minimum 7 days
    const maxDueDate = new Date();
    maxDueDate.setMonth(maxDueDate.getMonth() + 3); // Maximum 3 months

    if (dueDate < minDueDate) {
      throw new BadRequestException('Due date must be at least 7 days from today');
    }

    if (dueDate > maxDueDate) {
      throw new BadRequestException('Due date cannot be more than 3 months from today');
    }

    // Calculate fees
    const feeAmount = (dto.amount * this.PLATFORM_FEE_PERCENTAGE) / 100;
    const totalAmount = dto.amount + feeAmount;
    const lateFee = (dto.amount * this.LATE_FEE_PERCENTAGE) / 100;

    // Generate loan reference
    const loanReference = `IVC-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create loan
    const loan = this.loanRepository.create({
      studentId: student.id,
      loanReference,
      amount: dto.amount,
      feePercentage: this.PLATFORM_FEE_PERCENTAGE,
      feeAmount,
      totalAmount,
      outstandingBalance: totalAmount,
      purpose: dto.purpose,
      purposeDescription: dto.purposeDescription,
      dueDate: new Date(dto.dueDate),
      gracePeriodDays: this.GRACE_PERIOD_DAYS,
      lateFee,
      status: LoanStatus.PENDING,
    });

    await this.loanRepository.save(loan);

    return loan;
  }

  async getLoanTerms(userId: string, amount: number) {
    const student = await this.studentsService.getStudentByUserId(userId);

    const feeAmount = (amount * this.PLATFORM_FEE_PERCENTAGE) / 100;
    const totalAmount = amount + feeAmount;
    const lateFee = (amount * this.LATE_FEE_PERCENTAGE) / 100;

    return {
      amount,
      feePercentage: this.PLATFORM_FEE_PERCENTAGE,
      feeAmount,
      totalAmount,
      gracePeriodDays: this.GRACE_PERIOD_DAYS,
      lateFee,
      maxLoanAmount: student.maxLoanAmount,
      isEligible: student.isEligibleForLoan,
    };
  }

  async getLoanById(loanId: string, userId?: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['student', 'student.user'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // If userId is provided, verify ownership
    if (userId) {
      const student = await this.studentsService.getStudentByUserId(userId);
      if (loan.studentId !== student.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    return loan;
  }

  async getStudentLoans(userId: string, status?: LoanStatus) {
    const student = await this.studentsService.getStudentByUserId(userId);

    const whereClause: any = { studentId: student.id };
    if (status) {
      whereClause.status = status;
    }

    const loans = await this.loanRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });

    return loans;
  }

  async approveLoan(loanId: string, adminId: string, dto: ApproveLoanDto): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['student'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Only pending loans can be approved');
    }

    loan.status = LoanStatus.APPROVED;
    loan.approvedBy = adminId;
    loan.approvedAt = new Date();
    loan.adminNotes = dto.adminNotes;

    await this.loanRepository.save(loan);

    return loan;
  }

  async rejectLoan(loanId: string, adminId: string, dto: RejectLoanDto): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Only pending loans can be rejected');
    }

    loan.status = LoanStatus.REJECTED;
    loan.rejectionReason = dto.rejectionReason;
    loan.approvedBy = adminId;

    await this.loanRepository.save(loan);

    return loan;
  }

  async disburseLoan(loanId: string, adminId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['student'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException('Only approved loans can be disbursed');
    }

    // Update loan status
    loan.status = LoanStatus.DISBURSED;
    loan.disbursedAt = new Date();

    await this.loanRepository.save(loan);

    // Update student stats
    await this.studentsService.updateLoanStats(loan.studentId, loan.amount, 'borrow');

    // Record transaction
    await this.transactionsService.createDisbursementTransaction(loan);

    // Mark as active after disbursement
    loan.status = LoanStatus.ACTIVE;
    await this.loanRepository.save(loan);

    return loan;
  }

  async updateLoanRepayment(
    loanId: string,
    amount: number,
  ): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    loan.amountRepaid = Number(loan.amountRepaid) + Number(amount);
    loan.outstandingBalance = Number(loan.totalAmount) - Number(loan.amountRepaid);

    // Check if fully repaid
    if (loan.outstandingBalance <= 0) {
      loan.outstandingBalance = 0;
      loan.status = LoanStatus.REPAID;
      loan.repaidAt = new Date();

      // Check if on-time or late
      const isOnTime = new Date() <= loan.dueDate;
      await this.studentsService.updateTrustScore(loan.studentId, isOnTime);
    }

    await this.loanRepository.save(loan);

    // Update student repayment stats
    await this.studentsService.updateLoanStats(loan.studentId, amount, 'repay');

    return loan;
  }

  async getAllLoans(
    page: number = 1,
    limit: number = 10,
    status?: LoanStatus,
  ) {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const [loans, total] = await this.loanRepository.findAndCount({
      where: whereClause,
      relations: ['student', 'student.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: loans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoanStats() {
    const totalLoans = await this.loanRepository.count();
    const pendingLoans = await this.loanRepository.count({
      where: { status: LoanStatus.PENDING },
    });
    const activeLoans = await this.loanRepository.count({
      where: { status: In([LoanStatus.ACTIVE, LoanStatus.DISBURSED]) },
    });
    const repaidLoans = await this.loanRepository.count({
      where: { status: LoanStatus.REPAID },
    });
    const overdueLoans = await this.loanRepository.count({
      where: { status: LoanStatus.OVERDUE },
    });

    const totalDisbursed = await this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.status IN (:...statuses)', {
        statuses: [LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.REPAID, LoanStatus.OVERDUE],
      })
      .select('SUM(loan.amount)', 'total')
      .getRawOne();

    const totalRepaid = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.amountRepaid)', 'total')
      .getRawOne();

    return {
      totalLoans,
      pendingLoans,
      activeLoans,
      repaidLoans,
      overdueLoans,
      totalDisbursed: totalDisbursed?.total || 0,
      totalRepaid: totalRepaid?.total || 0,
    };
  }
}
