import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET all students (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
          },
        },
        loans: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST create student profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      universityName,
      studentId,
      program,
      yearOfStudy,
      expectedGraduation,
      nationalId,
      dateOfBirth,
      address,
    } = body

    // Check if student profile already exists
    const existingStudent = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student profile already exists' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        userId: session.user.id,
        universityName,
        studentId,
        program,
        yearOfStudy: parseInt(yearOfStudy),
        expectedGraduation: new Date(expectedGraduation),
        nationalId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
      },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student profile' },
      { status: 500 }
    )
  }
}
