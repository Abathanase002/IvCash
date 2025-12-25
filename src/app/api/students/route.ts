import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET students (admin gets all, students get their own)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin gets all students
    if (['admin', 'super_admin'].includes(session.user.role)) {
      const students = await prisma.student.findMany({
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              profileImage: true,
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
    }

    // Students get their own profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json(student)
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
      universityName = 'Ashesi University',
      studentId,
      program,
      yearOfStudy,
      expectedGraduation,
      hostelName,
      roomNumber,
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
        hostelName: hostelName || null,
        roomNumber: roomNumber || null,
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

// PUT update student profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      universityName = 'Ashesi University',
      studentId,
      program,
      yearOfStudy,
      expectedGraduation,
      hostelName,
      roomNumber,
      nationalId,
      dateOfBirth,
      address,
      firstName,
      lastName,
      phone,
    } = body

    // Update user info if provided
    if (firstName || lastName || phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone && { phone }),
        },
      })
    }

    // Update student profile
    const student = await prisma.student.update({
      where: { userId: session.user.id },
      data: {
        universityName,
        studentId,
        program,
        yearOfStudy: parseInt(yearOfStudy),
        expectedGraduation: new Date(expectedGraduation),
        hostelName: hostelName || null,
        roomNumber: roomNumber || null,
        nationalId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
