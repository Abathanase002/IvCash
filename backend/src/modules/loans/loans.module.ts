import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { Student } from '../students/entities/student.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { StudentsModule } from '../students/students.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, Student]),
    StudentsModule,
    forwardRef(() => TransactionsModule),
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
