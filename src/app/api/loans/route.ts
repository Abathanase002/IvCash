import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET all loans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let where: any = {}
    
    // Students can only see their own loans
    if (session.user.role === 'student') {
      where.student = { userId: session.user.id }
    }
    
    if (status) {
      where.status = status
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        repayments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}

// POST create loan request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, purpose, duration } = body

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found. Please complete your profile first.' },
        { status: 400 }
      )
    }

    if (!student.isEligible) {
      return NextResponse.json(
        { error: 'You are not eligible for a loan at this time.' },
        { status: 400 }
      )
    }

    if (amount > student.maxLoanAmount) {
      return NextResponse.json(
        { error: `Maximum loan amount is ${student.maxLoanAmount} RWF` },
        { status: 400 }
      )
    }

    // Check for existing pending/active loans
    const existingLoan = await prisma.loan.findFirst({
      where: {
        studentId: student.id,
        status: { in: ['pending', 'approved', 'disbursed', 'repaying'] },
      },
    })

    if (existingLoan) {
      return NextResponse.json(
        { error: 'You already have an active loan application' },
        { status: 400 }
      )
    }

    // Calculate loan details
    const interestRate = 5 // 5%
    const platformFee = 5 // 5%
    const totalInterest = (amount * interestRate * duration) / 100 / 12
    const totalFee = (amount * platformFee) / 100
    const totalRepayment = amount + totalInterest + totalFee
    const monthlyPayment = totalRepayment / duration

    const loan = await prisma.loan.create({
      data: {
        studentId: student.id,
        amount,
        purpose,
        duration,
        interestRate,
        platformFee,
        totalRepayment,
        monthlyPayment,
      },
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Failed to create loan request' },
      { status: 500 }
    )
  }
}
