import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { LoansModule } from '../loans/loans.module';
import { RepaymentsModule } from '../repayments/repayments.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    StudentsModule,
    LoansModule,
    RepaymentsModule,
    TransactionsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
