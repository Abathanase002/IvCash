import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  ACTIVE = 'active',
  REPAID = 'repaid',
  OVERDUE = 'overdue',
  DEFAULTED = 'defaulted',
}

export enum LoanPurpose {
  TUITION = 'tuition',
  BOOKS = 'books',
  ACCOMMODATION = 'accommodation',
  TRANSPORT = 'transport',
  FOOD = 'food',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ unique: true })
  loanReference: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5 })
  feePercentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  feeAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountRepaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({
    type: 'enum',
    enum: LoanPurpose,
    default: LoanPurpose.OTHER,
  })
  purpose: LoanPurpose;

  @Column({ nullable: true, type: 'text' })
  purposeDescription: string;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  disbursedAt: Date;

  @Column({ nullable: true })
  repaidAt: Date;

  @Column({ type: 'int', default: 7 })
  gracePeriodDays: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  lateFee: number;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true, type: 'text' })
  rejectionReason: string;

  @Column({ nullable: true, type: 'text' })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
