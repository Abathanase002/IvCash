# 🎓 IvCash - Student Digital Lending Platform

> **Smart Money for Student Life**

A Next.js full-stack application for student digital lending, hosted on Vercel.

## 🚀 Live Demo

- **App**: [https://ivcash.vercel.app](https://ivcash.vercel.app)

## 🌟 Features

### For Students
- 📝 Easy registration and profile setup
- 💰 Request loans up to 500,000 RWF
- 📊 Build trust score with on-time payments
- 💳 Track loan history and repayments

### For Administrators
- 📈 Real-time dashboard with key metrics
- ✅ Approve/Reject loan applications
- 👥 Manage student profiles
- 💵 Track disbursements and repayments

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (free at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Abathanase002/IvCash.git
cd IvCash
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your database URL and secret:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Initialize database**
```bash
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🚀 Deploy to Vercel

### One-Click Deploy

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import this repository
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A random secret key
   - `NEXTAUTH_URL` - Your Vercel app URL (after first deploy)
5. Click **Deploy**!

### Free PostgreSQL Options
- [Neon](https://neon.tech) - 512MB free
- [Supabase](https://supabase.com) - 500MB free
- [Railway](https://railway.app) - $5 free credits

## 📁 Project Structure

```
ivcash-nextjs/
IvCash/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── loans/     # Loan CRUD
│   │   │   ├── students/  # Student profiles
│   │   │   ├── repayments/# Payment processing
│   │   │   └── admin/     # Dashboard stats
│   │   ├── admin/         # Admin panel pages
│   │   ├── student/       # Student portal pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── components/        # React components
│   ├── lib/               # Utilities (Prisma, Auth)
│   └── types/             # TypeScript types
├── prisma/
│   └── schema.prisma      # Database schema
├── vercel.json            # Vercel config
```

## 💰 Business Logic

- **Interest Rate**: 5% per loan
- **Platform Fee**: 5% of principal
- **Max Loan**: 500,000 RWF
- **Trust Score**: Increases with successful repayments

## 📄 License

MIT License

---

Built with ❤️ for Rwandan students
