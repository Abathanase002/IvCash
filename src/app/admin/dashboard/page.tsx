'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle,
  DollarSign,
  TrendingUp 
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const stats = data?.stats

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Loans', value: stats?.totalLoans || 0, icon: CreditCard, color: 'bg-purple-500' },
    { label: 'Pending Loans', value: stats?.pendingLoans || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Active Loans', value: stats?.activeLoans || 0, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Completed Loans', value: stats?.completedLoans || 0, icon: CheckCircle, color: 'bg-teal-500' },
    { label: 'Platform Revenue', value: `${(stats?.platformRevenue || 0).toLocaleString()} RWF`, icon: DollarSign, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to IvCash Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-gray-600 mb-2">Total Disbursed</h3>
          <p className="text-3xl font-bold text-green-600">
            {(stats?.totalDisbursed || 0).toLocaleString()} RWF
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-gray-600 mb-2">Total Collected</h3>
          <p className="text-3xl font-bold text-blue-600">
            {(stats?.totalCollected || 0).toLocaleString()} RWF
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-gray-600 mb-2">Outstanding Amount</h3>
          <p className="text-3xl font-bold text-orange-600">
            {(stats?.outstandingAmount || 0).toLocaleString()} RWF
          </p>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Loan Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.recentLoans?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No loan applications yet
                  </td>
                </tr>
              ) : (
                data?.recentLoans?.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{loan.studentName}</td>
                    <td className="px-6 py-4">{loan.amount.toLocaleString()} RWF</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        loan.status === 'disbursed' ? 'bg-green-100 text-green-800' :
                        loan.status === 'completed' ? 'bg-teal-100 text-teal-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(loan.createdAt).toLocaleDateString()}
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
