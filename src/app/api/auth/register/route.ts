
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'student',
      universityName = 'Ashesi University',
      studentId,
      program,
      yearOfStudy,
      expectedGraduation,
      hostelName,
      roomNumber,
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
      },
    })

    // If student, create Student record
    if (role === 'student') {
      if (!studentId || !program || !yearOfStudy || !expectedGraduation) {
        return NextResponse.json(
          { error: 'Missing student information' },
          { status: 400 }
        )
      }
      await prisma.student.create({
        data: {
          userId: user.id,
          universityName,
          studentId,
          program,
          yearOfStudy: parseInt(yearOfStudy, 10),
          expectedGraduation: new Date(expectedGraduation),
          hostelName: hostelName || null,
          roomNumber: roomNumber || null,
        },
      })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}

