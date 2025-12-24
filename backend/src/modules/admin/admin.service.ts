import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { LoansService } from '../loans/loans.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly loansService: LoansService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async getDashboardStats() {
    const loanStats = await this.loansService.getLoanStats();
    const transactionStats = await this.transactionsService.getTransactionStats();

    return {
      loans: loanStats,
      transactions: transactionStats,
    };
  }

  async getUsers(page: number = 1, limit: number = 10) {
    return this.usersService.getAllUsers(page, limit);
  }

  async getStudents(page: number = 1, limit: number = 10) {
    return this.studentsService.getAllStudents(page, limit);
  }
}
