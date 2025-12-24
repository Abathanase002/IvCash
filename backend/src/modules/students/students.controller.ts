import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CompleteStudentProfileDto, UpdateStudentProfileDto } from './dto/student.dto';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current student profile' })
  async getProfile(@CurrentUser() user: User) {
    return this.studentsService.getStudentByUserId(user.id);
  }

  @Post('profile/complete')
  @ApiOperation({ summary: 'Complete student profile' })
  async completeProfile(
    @CurrentUser() user: User,
    @Body() dto: CompleteStudentProfileDto,
  ) {
    return this.studentsService.completeProfile(user.id, dto);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update student profile' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentsService.updateProfile(user.id, dto);
  }

  @Get('score')
  @ApiOperation({ summary: 'Get student trust score and stats' })
  async getScore(@CurrentUser() user: User) {
    return this.studentsService.getStudentScore(user.id);
  }
}
