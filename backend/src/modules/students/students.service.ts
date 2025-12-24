import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User, VerificationStatus } from '../users/entities/user.entity';
import { CompleteStudentProfileDto, UpdateStudentProfileDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStudentByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  async completeProfile(
    userId: string,
    dto: CompleteStudentProfileDto,
  ): Promise<Student> {
    const student = await this.getStudentByUserId(userId);

    // Update student profile
    student.institution = dto.institution;
    student.program = dto.program;
    student.studentId = dto.studentId || student.studentId;
    student.yearOfStudy = dto.yearOfStudy;
    student.expectedGraduationDate = dto.expectedGraduationDate
      ? new Date(dto.expectedGraduationDate)
      : student.expectedGraduationDate;
    student.nationalIdNumber = dto.nationalIdNumber || student.nationalIdNumber;

    // Calculate initial eligibility
    student.isEligibleForLoan = this.calculateEligibility(student);

    await this.studentRepository.save(student);

    return student;
  }

  async updateProfile(
    userId: string,
    dto: UpdateStudentProfileDto,
  ): Promise<Student> {
    const student = await this.getStudentByUserId(userId);

    Object.assign(student, dto);

    if (dto.expectedGraduationDate) {
      student.expectedGraduationDate = new Date(dto.expectedGraduationDate);
    }

    await this.studentRepository.save(student);

    return student;
  }

  async getStudentScore(userId: string) {
    const student = await this.getStudentByUserId(userId);

    return {
      studentId: student.id,
      trustScore: student.trustScore,
      totalBorrowed: student.totalBorrowed,
      totalRepaid: student.totalRepaid,
      loansCount: student.loansCount,
      onTimePayments: student.onTimePayments,
      latePayments: student.latePayments,
      isEligibleForLoan: student.isEligibleForLoan,
      maxLoanAmount: student.maxLoanAmount,
    };
  }

  async updateTrustScore(studentId: string, isOnTime: boolean): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (isOnTime) {
      student.onTimePayments += 1;
      // Increase trust score for on-time payment
      student.trustScore = Math.min(100, student.trustScore + 5);
      // Increase max loan amount
      student.maxLoanAmount = Math.min(
        500000,
        student.maxLoanAmount * 1.1,
      );
    } else {
      student.latePayments += 1;
      // Decrease trust score for late payment
      student.trustScore = Math.max(0, student.trustScore - 10);
      // Decrease max loan amount
      student.maxLoanAmount = Math.max(
        10000,
        student.maxLoanAmount * 0.9,
      );
    }

    // Recalculate eligibility
    student.isEligibleForLoan = this.calculateEligibility(student);

    await this.studentRepository.save(student);
  }

  async updateLoanStats(
    studentId: string,
    amount: number,
    type: 'borrow' | 'repay',
  ): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (type === 'borrow') {
      student.totalBorrowed = Number(student.totalBorrowed) + Number(amount);
      student.loansCount += 1;
    } else {
      student.totalRepaid = Number(student.totalRepaid) + Number(amount);
    }

    await this.studentRepository.save(student);
  }

  private calculateEligibility(student: Student): boolean {
    // Basic eligibility rules
    // 1. Must have completed profile
    if (!student.institution || !student.program) {
      return false;
    }

    // 2. Trust score should be above threshold
    if (student.trustScore < 20) {
      return false;
    }

    // 3. Not too many late payments
    const totalPayments = student.onTimePayments + student.latePayments;
    if (totalPayments > 0) {
      const lateRatio = student.latePayments / totalPayments;
      if (lateRatio > 0.5) {
        return false;
      }
    }

    return true;
  }

  async getAllStudents(page: number = 1, limit: number = 10) {
    const [students, total] = await this.studentRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
