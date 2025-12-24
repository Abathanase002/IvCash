import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AcademicYear {
  FIRST = '1st_year',
  SECOND = '2nd_year',
  THIRD = '3rd_year',
  FOURTH = '4th_year',
  FIFTH = '5th_year',
  POSTGRADUATE = 'postgraduate',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 200 })
  institution: string;

  @Column({ length: 200 })
  program: string;

  @Column({ nullable: true })
  studentId: string;

  @Column({
    type: 'enum',
    enum: AcademicYear,
    default: AcademicYear.FIRST,
  })
  yearOfStudy: AcademicYear;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  trustScore: number;

  @Column({ nullable: true })
  expectedGraduationDate: Date;

  @Column({ nullable: true })
  nationalIdNumber: string;

  @Column({ nullable: true })
  nationalIdImage: string;

  @Column({ nullable: true })
  studentIdImage: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalBorrowed: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRepaid: number;

  @Column({ default: 0 })
  loansCount: number;

  @Column({ default: 0 })
  onTimePayments: number;

  @Column({ default: 0 })
  latePayments: number;

  @Column({ default: false })
  isEligibleForLoan: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 50000 })
  maxLoanAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
