import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicYear } from '../entities/student.entity';

export class CompleteStudentProfileDto {
  @ApiProperty({ example: 'University of Rwanda', description: 'Institution name' })
  @IsNotEmpty()
  @IsString()
  institution: string;

  @ApiProperty({ example: 'Computer Science', description: 'Program/Course of study' })
  @IsNotEmpty()
  @IsString()
  program: string;

  @ApiPropertyOptional({ example: 'STU2024001', description: 'Student ID number' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ enum: AcademicYear, example: AcademicYear.SECOND })
  @IsEnum(AcademicYear)
  yearOfStudy: AcademicYear;

  @ApiPropertyOptional({ example: '2027-06-30', description: 'Expected graduation date' })
  @IsOptional()
  @IsDateString()
  expectedGraduationDate?: string;

  @ApiPropertyOptional({ description: 'National ID number' })
  @IsOptional()
  @IsString()
  nationalIdNumber?: string;
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ example: 'University of Rwanda' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ enum: AcademicYear })
  @IsOptional()
  @IsEnum(AcademicYear)
  yearOfStudy?: AcademicYear;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedGraduationDate?: string;
}

export class StudentScoreResponseDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  trustScore: number;

  @ApiProperty()
  totalBorrowed: number;

  @ApiProperty()
  totalRepaid: number;

  @ApiProperty()
  loansCount: number;

  @ApiProperty()
  onTimePayments: number;

  @ApiProperty()
  latePayments: number;

  @ApiProperty()
  isEligibleForLoan: boolean;

  @ApiProperty()
  maxLoanAmount: number;
}
