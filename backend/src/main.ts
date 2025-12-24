import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('IvCash API')
    .setDescription('Student Digital Lending Platform API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('students', 'Student management endpoints')
    .addTag('loans', 'Loan management endpoints')
    .addTag('repayments', 'Repayment endpoints')
    .addTag('admin', 'Admin endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🎓 IvCash Backend Server                        ║
    ║   Smart Money for Student Life                    ║
    ║                                                   ║
    ║   Server running on: http://localhost:${port}        ║
    ║   API Docs: http://localhost:${port}/docs            ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
  `);
}

bootstrap();
