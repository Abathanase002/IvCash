import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    studentId?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      studentId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    studentId?: string
  }
}
