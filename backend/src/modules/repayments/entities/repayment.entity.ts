import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Loan } from '../../loans/entities/loan.entity';

export enum RepaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  WALLET = 'wallet',
}

@Entity('repayments')
export class Repayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loanId: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column({ unique: true })
  repaymentReference: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: RepaymentStatus,
    default: RepaymentStatus.PENDING,
  })
  status: RepaymentStatus;

  @Column({ nullable: true })
  externalReference: string;

  @Column({ nullable: true })
  paymentGatewayResponse: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  bankAccount: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true, type: 'text' })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
