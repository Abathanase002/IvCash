import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanPurpose, LoanStatus } from '../entities/loan.entity';

export class RequestLoanDto {
  @ApiProperty({ example: 50000, description: 'Loan amount in RWF' })
  @IsNumber()
  @Min(5000, { message: 'Minimum loan amount is 5,000 RWF' })
  @Max(500000, { message: 'Maximum loan amount is 500,000 RWF' })
  amount: number;

  @ApiProperty({ enum: LoanPurpose, example: LoanPurpose.BOOKS })
  @IsEnum(LoanPurpose)
  purpose: LoanPurpose;

  @ApiPropertyOptional({ description: 'Additional details about loan purpose' })
  @IsOptional()
  @IsString()
  purposeDescription?: string;

  @ApiProperty({ example: '2025-02-15', description: 'Requested due date' })
  @IsDateString()
  dueDate: string;
}

export class ApproveLoanDto {
  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class RejectLoanDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}

export class LoanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  loanReference: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  feePercentage: number;

  @ApiProperty()
  feeAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  amountRepaid: number;

  @ApiProperty()
  outstandingBalance: number;

  @ApiProperty()
  purpose: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  gracePeriodDays: number;

  @ApiProperty()
  createdAt: Date;
}

export class LoanTermsDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  feePercentage: number;

  @ApiProperty()
  feeAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  gracePeriodDays: number;

  @ApiProperty()
  lateFee: number;
}
