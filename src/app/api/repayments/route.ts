import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET all repayments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = {}
    
    // Students can only see their own repayments
    if (session.user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      })
      if (student) {
        where.loan = { studentId: student.id }
      }
    }

    const repayments = await prisma.repayment.findMany({
      where,
      include: {
        loan: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    })

    return NextResponse.json(repayments)
  } catch (error) {
    console.error('Error fetching repayments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repayments' },
      { status: 500 }
    )
  }
}

// POST create repayment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { loanId, amount, paymentMethod, reference } = body

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        student: true,
        repayments: true,
      },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    // Students can only pay their own loans
    if (session.user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      })
      if (!student || loan.studentId !== student.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!['disbursed', 'repaying'].includes(loan.status)) {
      return NextResponse.json(
        { error: 'Loan is not in repayment status' },
        { status: 400 }
      )
    }

    // Calculate total paid
    const totalPaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0) + amount
    const remaining = loan.totalRepayment - totalPaid

    // Create repayment
    const repayment = await prisma.repayment.create({
      data: {
        loanId,
        amount,
        paymentMethod,
        reference,
      },
    })

    // Create transaction
    await prisma.transaction.create({
      data: {
        loanId,
        userId: loan.student.userId,
        type: 'repayment',
        amount,
        description: `Loan repayment via ${paymentMethod}`,
        reference,
      },
    })

    // Update loan status
    const newStatus = remaining <= 0 ? 'completed' : 'repaying'
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: newStatus,
        completedAt: remaining <= 0 ? new Date() : null,
      },
    })

    // Update trust score if loan completed
    if (remaining <= 0) {
      await prisma.student.update({
        where: { id: loan.studentId },
        data: {
          trustScore: { increment: 10 },
          maxLoanAmount: { increment: 50000 },
        },
      })
    }

    return NextResponse.json(repayment)
  } catch (error) {
    console.error('Error creating repayment:', error)
    return NextResponse.json(
      { error: 'Failed to create repayment' },
      { status: 500 }
    )
  }
}
