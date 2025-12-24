import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

/**
 * Seed script to create initial admin user
 * Run with: npx ts-node src/seeds/seed-admin.ts
 */

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ivcash',
    synchronize: true,
    entities: ['src/**/*.entity.ts'],
  });

  await dataSource.initialize();
  console.log('Database connected');

  const userRepository = dataSource.getRepository('User');

  // Check if admin exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@ivcash.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    await dataSource.destroy();
    return;
  }

  // Create admin user
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('Admin@123', salt);

  const admin = userRepository.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@ivcash.com',
    phone: '+250780000001',
    password: hashedPassword,
    role: 'admin',
    verificationStatus: 'verified',
    isActive: true,
  });

  await userRepository.save(admin);
  console.log('Admin user created successfully');
  console.log('Email: admin@ivcash.com');
  console.log('Password: Admin@123');
  console.log('⚠️  Please change the password after first login!');

  await dataSource.destroy();
}

seedAdmin().catch(console.error);
