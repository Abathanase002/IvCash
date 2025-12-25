import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalStudents,
      totalLoans,
      pendingLoans,
      activeLoans,
      completedLoans,
      loans,
      repayments,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.loan.count(),
      prisma.loan.count({ where: { status: 'pending' } }),
      prisma.loan.count({ where: { status: { in: ['disbursed', 'repaying'] } } }),
      prisma.loan.count({ where: { status: 'completed' } }),
      prisma.loan.findMany({
        where: { status: { in: ['disbursed', 'repaying', 'completed'] } },
        select: { amount: true, totalRepayment: true },
      }),
      prisma.repayment.aggregate({
        _sum: { amount: true },
      }),
    ])

    const totalDisbursed = loans.reduce(
      (sum: number, l: { amount: number; totalRepayment: number }) => sum + l.amount,
      0
    )
    const totalExpectedRepayments = loans.reduce(
      (sum: number, l: { amount: number; totalRepayment: number }) => sum + l.totalRepayment,
      0
    )
    const totalCollected = repayments._sum.amount || 0
    const platformRevenue = totalCollected * 0.05 // 5% platform fee

    // Recent loans
    const recentLoans = await prisma.loan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      stats: {
        totalStudents,
        totalLoans,
        pendingLoans,
        activeLoans,
        completedLoans,
        totalDisbursed,
        totalCollected,
        platformRevenue,
        outstandingAmount: totalExpectedRepayments - totalCollected,
      },
      recentLoans: recentLoans.map((loan: {
        id: number;
        amount: number;
        status: string;
        createdAt: Date;
        student: {
          user: {
            firstName: string;
            lastName: string;
          };
        };
      }) => ({
        id: loan.id,
        studentName: `${loan.student.user.firstName} ${loan.student.user.lastName}`,
        amount: loan.amount,
        status: loan.status,
        createdAt: loan.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

