import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repayment } from './entities/repayment.entity';
import { Loan } from '../loans/entities/loan.entity';
import { RepaymentsService } from './repayments.service';
import { RepaymentsController } from './repayments.controller';
import { LoansModule } from '../loans/loans.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repayment, Loan]),
    forwardRef(() => LoansModule),
    forwardRef(() => TransactionsModule),
  ],
  controllers: [RepaymentsController],
  providers: [RepaymentsService],
  exports: [RepaymentsService],
})
export class RepaymentsModule {}
