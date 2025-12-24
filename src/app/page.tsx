import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    if (['admin', 'super_admin'].includes(session.user.role)) {
      redirect('/admin/dashboard')
    } else {
      redirect('/student/dashboard')
    }
  }
  
  redirect('/login')
}
