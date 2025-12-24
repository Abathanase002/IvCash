import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/repayment.entity';

export class MakeRepaymentDto {
  @ApiProperty({ description: 'Loan ID to repay' })
  @IsNotEmpty()
  @IsString()
  loanId: string;

  @ApiProperty({ example: 10000, description: 'Repayment amount' })
  @IsNumber()
  @Min(1000, { message: 'Minimum repayment is 1,000 RWF' })
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: '+250780000000', description: 'Phone number for mobile money' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Bank account for bank transfer' })
  @IsOptional()
  @IsString()
  bankAccount?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Repayment ID' })
  @IsNotEmpty()
  @IsString()
  repaymentId: string;

  @ApiProperty({ description: 'External payment reference' })
  @IsNotEmpty()
  @IsString()
  externalReference: string;
}
