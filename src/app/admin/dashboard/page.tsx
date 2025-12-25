'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react'

interface DashboardStats {
  stats: {
    totalStudents: number
    totalLoans: number
    pendingLoans: number
    activeLoans: number
    completedLoans: number
    totalDisbursed: number
    totalCollected: number
    platformRevenue: number
    outstandingAmount: number
  }
  recentLoans: Array<{
    id: string
    studentName: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

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

  const stats = data?.stats

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total Loans', value: stats?.totalLoans || 0, icon: CreditCard, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending Loans', value: stats?.pendingLoans || 0, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Active Loans', value: stats?.activeLoans || 0, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Completed Loans', value: stats?.completedLoans || 0, icon: CheckCircle, gradient: 'from-cyan-500 to-blue-500' },
    { label: 'Platform Revenue', value: `${(stats?.platformRevenue || 0).toLocaleString()} GHC`, icon: DollarSign, gradient: 'from-primary-500 to-secondary-500' },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      disbursed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      repaying: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      completed: 'bg-teal-100 text-teal-700 border-teal-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      defaulted: 'bg-red-100 text-red-700 border-red-200',
    }
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Ashesi University Student Loans Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-5 h-5" />
              <h3 className="font-medium text-emerald-100">Total Disbursed</h3>
            </div>
            <p className="text-3xl font-bold">
              {(stats?.totalDisbursed || 0).toLocaleString()} GHC
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownRight className="w-5 h-5" />
              <h3 className="font-medium text-blue-100">Total Collected</h3>
            </div>
            <p className="text-3xl font-bold">
              {(stats?.totalCollected || 0).toLocaleString()} GHC
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5" />
              <h3 className="font-medium text-amber-100">Outstanding</h3>
            </div>
            <p className="text-3xl font-bold">
              {(stats?.outstandingAmount || 0).toLocaleString()} GHC
            </p>
          </div>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Loan Applications</h2>
          <Link
            href="/admin/loans"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recentLoans?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No loan applications yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.recentLoans?.map((loan, index) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {loan.studentName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{loan.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {loan.amount.toLocaleString()} GHC
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(loan.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

