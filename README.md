# Ashesi Student Loans Platform

A modern student lending platform built for Ashesi University students.

## Features

- 🎓 Student registration with Ashesi-specific fields (hostel, room number)
- 💰 Loan application and management
- 📊 Payment tracking with visual progress
- 📅 Admin appointment scheduling
- 👤 Profile photo upload
- 🎨 Beautiful Ashesi-branded UI (Maroon & Gold)

## Quick Deploy to Vercel (FREE)

### Step 1: Create MongoDB Atlas Database (FREE)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Click "Build a Database" → Select **M0 FREE** tier
3. Choose a region and click "Create"
4. Create a database user (remember the password!)
5. In "Network Access" → "Add IP Address" → **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click "Connect" → "Connect your application" → Copy the connection string
7. Replace `<password>` in the string with your actual password

Your connection string should look like:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/ashesi_loans?retryWrites=true&w=majority
```

### Step 2: Deploy to Vercel (FREE)

1. Push this code to GitHub
2. Go to [Vercel](https://vercel.com) and sign up with GitHub
3. Click "New Project" → Import your repository
4. Add these Environment Variables:
   - `DATABASE_URL` = your MongoDB Atlas connection string
   - `NEXTAUTH_URL` = `https://your-project-name.vercel.app`
   - `NEXTAUTH_SECRET` = generate with `openssl rand -base64 32`
5. Click "Deploy"

### Step 3: Create Admin User

After deployment, you'll need to create an admin user. Run this in MongoDB Atlas:

```javascript
// In MongoDB Atlas, go to "Browse Collections" → "ashesi_loans" → "User"
// Or use the setAdmin.ts script after creating a regular account
```

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB Atlas URL

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

## Tech Stack

- Next.js 14
- TypeScript
- Prisma (MongoDB)
- NextAuth.js
- Tailwind CSS
- Lucide Icons

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Your app URL (e.g., https://your-app.vercel.app) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |

## License

MIT
