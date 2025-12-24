import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, VerificationStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.verificationStatus;
    
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async updateVerificationStatus(
    id: string,
    status: VerificationStatus,
  ): Promise<User> {
    const user = await this.findById(id);
    user.verificationStatus = status;
    return this.userRepository.save(user);
  }

  async deactivateUser(id: string): Promise<void> {
    const user = await this.findById(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
