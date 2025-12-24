# 🎓 IvCash - Student Digital Lending Platform

> **Smart Money for Student Life**

IvCash is a student-focused digital lending platform designed to solve short-term and semester-based financial challenges faced by students. Built with transparency, trust, and student welfare at its core.

## 🌟 Features

### For Students
- 📝 Easy registration and profile setup
- 💰 Request loans up to 500,000 RWF
- 📊 Build your trust score with on-time payments
- 💳 Multiple payment methods (Mobile Money, Bank Transfer)
- 📱 View loan history and repayment schedules

### For Administrators
- 📈 Real-time dashboard with key metrics
- ✅ Approve/Reject loan applications
- 👥 Manage student profiles
- 💵 Track disbursements and repayments
- 📋 Full audit trail of transactions

## 🏗️ Project Structure

```
IvCash/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Authentication & Authorization
│   │   │   ├── users/      # User management
│   │   │   ├── students/   # Student profiles
│   │   │   ├── loans/      # Loan management
│   │   │   ├── repayments/ # Payment processing
│   │   │   ├── transactions/# Transaction audit
│   │   │   └── admin/      # Admin operations
│   │   └── common/         # Shared utilities
│   └── Dockerfile
│
├── admin-dashboard/         # React Admin Panel
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── stores/         # State management
│   └── Dockerfile
│
├── docker-compose.yml       # Production deployment
└── docker-compose.dev.yml   # Development services
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   cd IvCash
   ```

2. **Start development databases**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run start:dev
   ```

4. **Setup Admin Dashboard**
   ```bash
   cd admin-dashboard
   npm install
   npm run dev
   ```

5. **Access the applications**
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/docs
   - Admin Dashboard: http://localhost:5174
   - pgAdmin: http://localhost:5050

### Production Deployment

```bash
docker-compose up -d --build
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:3000/docs for the complete Swagger API documentation.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/loans/request` | Request a loan |
| GET | `/api/v1/loans/{id}` | Get loan details |
| POST | `/api/v1/repayments/pay` | Make repayment |
| GET | `/api/v1/students/score` | Get trust score |

## 💰 Pricing & Fees

| Fee Type | Amount |
|----------|--------|
| Platform Fee | 3-5% per loan |
| Late Fee | 2% flat (after grace period) |
| Grace Period | 7 days |

**No hidden fees. No compound interest. Full transparency.**

## 🔐 Security Features

- 🔒 JWT-based authentication
- 🛡️ Role-based access control (RBAC)
- 🔑 Password hashing with bcrypt
- 📝 Full audit trail
- 🚫 Rate limiting protection

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd admin-dashboard
npm run test
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **students** - Student profiles and trust scores
- **loans** - Loan applications and status
- **repayments** - Payment records
- **transactions** - Complete audit trail

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License.

## 👥 Team

**IvCash Product & Engineering Team**

---

<p align="center">
  <strong>🎓 IvCash - Building infrastructure for dignity, opportunity, and trust.</strong>
</p>
