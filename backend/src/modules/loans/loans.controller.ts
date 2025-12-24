import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { LoanStatus } from './entities/loan.entity';
import { RequestLoanDto, ApproveLoanDto, RejectLoanDto } from './dto/loan.dto';

@ApiTags('loans')
@Controller('loans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request a new loan' })
  async requestLoan(
    @CurrentUser() user: User,
    @Body() dto: RequestLoanDto,
  ) {
    return this.loansService.requestLoan(user.id, dto);
  }

  @Get('terms')
  @ApiOperation({ summary: 'Get loan terms and fees for a specific amount' })
  @ApiQuery({ name: 'amount', type: Number })
  async getLoanTerms(
    @CurrentUser() user: User,
    @Query('amount') amount: number,
  ) {
    return this.loansService.getLoanTerms(user.id, amount);
  }

  @Get('my-loans')
  @ApiOperation({ summary: 'Get current user loans' })
  @ApiQuery({ name: 'status', enum: LoanStatus, required: false })
  async getMyLoans(
    @CurrentUser() user: User,
    @Query('status') status?: LoanStatus,
  ) {
    return this.loansService.getStudentLoans(user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  async getLoanById(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.loansService.getLoanById(id, user.id);
  }

  // Admin endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all loans (Admin only)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'status', enum: LoanStatus, required: false })
  async getAllLoans(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: LoanStatus,
  ) {
    return this.loansService.getAllLoans(page, limit, status);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve a loan (Admin only)' })
  async approveLoan(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ApproveLoanDto,
  ) {
    return this.loansService.approveLoan(id, user.id, dto);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject a loan (Admin only)' })
  async rejectLoan(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RejectLoanDto,
  ) {
    return this.loansService.rejectLoan(id, user.id, dto);
  }

  @Post(':id/disburse')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Disburse an approved loan (Admin only)' })
  async disburseLoan(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.loansService.disburseLoan(id, user.id);
  }

  @Get('stats/overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get loan statistics (Admin only)' })
  async getLoanStats() {
    return this.loansService.getLoanStats();
  }
}
