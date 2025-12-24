import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET single loan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        repayments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    // Students can only view their own loans
    if (session.user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      })
      if (!student || loan.studentId !== student.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error fetching loan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
      { status: 500 }
    )
  }
}

// PATCH update loan (approve/reject/disburse)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, rejectionReason } = body

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: { student: true },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'approve':
        if (loan.status !== 'pending') {
          return NextResponse.json(
            { error: 'Can only approve pending loans' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: session.user.id,
        }
        break

      case 'reject':
        if (loan.status !== 'pending') {
          return NextResponse.json(
            { error: 'Can only reject pending loans' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'rejected',
          rejectionReason,
          approvedBy: session.user.id,
        }
        break

      case 'disburse':
        if (loan.status !== 'approved') {
          return NextResponse.json(
            { error: 'Can only disburse approved loans' },
            { status: 400 }
          )
        }
        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() + loan.duration)
        
        updateData = {
          status: 'disbursed',
          disbursedAt: new Date(),
          dueDate,
        }

        // Create disbursement transaction
        await prisma.transaction.create({
          data: {
            loanId: loan.id,
            userId: loan.student.userId,
            type: 'disbursement',
            amount: loan.amount,
            description: `Loan disbursement for ${loan.purpose}`,
          },
        })

        // Update student trust score
        await prisma.student.update({
          where: { id: loan.studentId },
          data: {
            trustScore: { increment: 2 },
          },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: updateData,
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
    })

    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error('Error updating loan:', error)
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    )
  }
}
