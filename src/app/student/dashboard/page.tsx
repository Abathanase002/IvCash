'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  CreditCard, Clock, CheckCircle, Plus, TrendingUp, Wallet, 
  ArrowUpRight, Calendar, GraduationCap, Building
} from 'lucide-react'

interface Loan {
  id: string
  amount: number
  status: string
  totalRepayment: number
  monthlyPayment: number
  dueDate: string | null
  repayments: Array<{ amount: number }>
}

interface StudentProfile {
  hostelName: string | null
  roomNumber: string | null
  program: string
  yearOfStudy: number
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [loans, setLoans] = useState<Loan[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/loans').then(res => res.json()),
      fetch('/api/students').then(res => res.json()),
    ])
      .then(([lns, prof]) => {
        setLoans(lns)
        if (prof && !prof.error) setProfile(prof)
      })
      .finally(() => setLoading(false))
  }, [])

  const activeLoan = loans.find(l => ['disbursed', 'repaying'].includes(l.status))
  const pendingLoan = loans.find(l => l.status === 'pending')
  const completedLoans = loans.filter(l => l.status === 'completed').length
  const totalBorrowed = loans
    .filter(l => ['disbursed', 'repaying', 'completed'].includes(l.status))
    .reduce((sum, l) => sum + l.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Borrowed',
      value: `${totalBorrowed.toLocaleString()} GHC`,
      icon: Wallet,
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      label: 'Pending Requests',
      value: pendingLoan ? 1 : 0,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Completed Loans',
      value: completedLoans,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your financial overview at Ashesi</p>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <GraduationCap className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-gray-700">{profile.program} • Year {profile.yearOfStudy}</span>
            </div>
          )}
          {!activeLoan && !pendingLoan && (
            <Link
              href="/student/loans/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Request Loan
            </Link>
          )}
        </div>
      </div>

      {/* Student Info Card */}
      {profile?.hostelName && (
        <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-4 border border-secondary-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Residence</p>
            <p className="font-semibold text-gray-900">{profile.hostelName} {profile.roomNumber && `• Room ${profile.roomNumber}`}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Loan */}
      {activeLoan ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-ashesi-pattern opacity-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Active Loan</h2>
              </div>
              {activeLoan.dueDate && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Due: {new Date(activeLoan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-primary-200 text-sm mb-1">Amount</p>
                <p className="text-2xl md:text-3xl font-bold">{activeLoan.amount.toLocaleString()} GHC</p>
              </div>
              <div>
                <p className="text-primary-200 text-sm mb-1">Total to Repay</p>
                <p className="text-2xl md:text-3xl font-bold">{activeLoan.totalRepayment.toLocaleString()} GHC</p>
              </div>
              <div>
                <p className="text-primary-200 text-sm mb-1">Paid</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {(activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0).toLocaleString()} GHC
                </p>
              </div>
              <div>
                <p className="text-primary-200 text-sm mb-1">Monthly</p>
                <p className="text-2xl md:text-3xl font-bold">{activeLoan.monthlyPayment?.toLocaleString() || '0'} GHC</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-primary-200">Repayment Progress</span>
                <span className="font-semibold">
                  {Math.round(((activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0) / activeLoan.totalRepayment) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-secondary-400 to-secondary-500 h-4 rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${Math.min(
                      ((activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0) / activeLoan.totalRepayment) * 100,
                      100
                    )}%`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            <Link
              href="/student/payments"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Make Payment
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 text-center border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Loan</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You don't have any active loans right now. Apply for a loan to support your studies at Ashesi.
          </p>
          {!pendingLoan && (
            <Link
              href="/student/loans/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Request a Loan
            </Link>
          )}
        </div>
      )}

      {/* Pending Loan */}
      {pendingLoan && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 text-lg">Loan Application Pending</h3>
              <p className="text-amber-700 mt-1">
                Your loan request for <strong>{pendingLoan.amount.toLocaleString()} GHC</strong> is being reviewed by the Ashesi Loans team.
                We'll notify you once it's approved.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
