'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Calendar,
  GraduationCap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Loans', href: '/student/loans', icon: CreditCard },
  { name: 'Payments', href: '/student/payments', icon: Receipt },
  { name: 'Appointments', href: '/student/appointments', icon: Calendar },
  { name: 'Profile', href: '/student/profile', icon: User },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.profileImage) {
          setProfileImage(data.user.profileImage)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700"></div>
        <div className="absolute inset-0 bg-ashesi-pattern opacity-10"></div>

        <div className="relative h-full flex flex-col">
          <div className="flex items-center justify-between h-24 px-6 border-b border-white/10">
            <Link href="/student/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-secondary-500/50 overflow-hidden">
                <Image src="/logo.png" alt="Ashesi" width={48} height={48} className="rounded-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Ashesi</span>
                <span className="block text-xs text-secondary-400 font-medium">Student Loans</span>
              </div>
            </Link>
            <button className="lg:hidden text-white/80 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-white text-primary-700 shadow-lg shadow-primary-900/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center ring-2 ring-secondary-400/50 overflow-hidden">
                  {profileImage ? (
                    <Image src={profileImage} alt="Profile" width={48} height={48} className="rounded-full object-cover w-full h-full" />
                  ) : (
                    <span className="text-white font-bold text-lg">{session?.user?.name?.[0] || 'S'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{session?.user?.name}</p>
                  <p className="text-white/60 text-sm truncate">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition-all border border-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 lg:px-8">
          <button className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Student Portal</h1>
              <p className="text-xs text-gray-500">Ashesi University</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-primary-600 font-medium">Student</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center ring-2 ring-secondary-400/30 overflow-hidden">
              {profileImage ? (
                <Image src={profileImage} alt="Profile" width={40} height={40} className="rounded-full object-cover w-full h-full" />
              ) : (
                <span className="text-white font-semibold">{session?.user?.name?.[0] || 'S'}</span>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
