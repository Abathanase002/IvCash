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
} from '@nestjs/swagger';
import { RepaymentsService } from './repayments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { MakeRepaymentDto } from './dto/repayment.dto';

@ApiTags('repayments')
@Controller('repayments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RepaymentsController {
  constructor(private readonly repaymentsService: RepaymentsService) {}

  @Post('pay')
  @ApiOperation({ summary: 'Make a loan repayment' })
  async makeRepayment(
    @CurrentUser() user: User,
    @Body() dto: MakeRepaymentDto,
  ) {
    return this.repaymentsService.makeRepayment(user.id, dto);
  }

  @Get('my-repayments')
  @ApiOperation({ summary: 'Get current user repayments' })
  async getMyRepayments(@CurrentUser() user: User) {
    return this.repaymentsService.getStudentRepayments(user.id);
  }

  @Get('loan/:loanId')
  @ApiOperation({ summary: 'Get repayments for a specific loan' })
  async getRepaymentsByLoan(@Param('loanId') loanId: string) {
    return this.repaymentsService.getRepaymentsByLoan(loanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get repayment by ID' })
  async getRepaymentById(@Param('id') id: string) {
    return this.repaymentsService.getRepaymentById(id);
  }

  // Admin endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all repayments (Admin only)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAllRepayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.repaymentsService.getAllRepayments(page, limit);
  }
}
