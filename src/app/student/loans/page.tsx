'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Plus, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react'

interface Loan {
  id: string
  amount: number
  purpose: string
  duration: number
  status: string
  totalRepayment: number
  createdAt: string
  repayments: Array<{ amount: number }>
}

export default function StudentLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(setLoans)
      .finally(() => setLoading(false))
  }, [])

  const canRequestLoan = !loans.some(l => 
    ['pending', 'approved', 'disbursed', 'repaying'].includes(l.status)
  )

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      disbursed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: TrendingUp },
      repaying: { bg: 'bg-purple-100', text: 'text-purple-700', icon: TrendingUp },
      completed: { bg: 'bg-teal-100', text: 'text-teal-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      defaulted: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    }
    return configs[status] || configs.pending
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-600">View and manage your loan applications</p>
        </div>
        {canRequestLoan && (
          <Link
            href="/student/loans/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" />
            Request Loan
          </Link>
        )}
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Loans Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't applied for any loans yet. Get started by requesting your first loan.
          </p>
          <Link
            href="/student/loans/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5" />
            Request Your First Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan, index) => {
            const config = getStatusConfig(loan.status)
            const Icon = config.icon
            const totalPaid = loan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0
            const progress = (totalPaid / loan.totalRepayment) * 100

            return (
              <div 
                key={loan.id} 
                className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 hover:shadow-card-hover transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${config.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{loan.amount.toLocaleString()} GHC</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{loan.purpose}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied on {new Date(loan.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{loan.duration} months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">{loan.totalRepayment.toLocaleString()} GHC</p>
                    </div>
                    {['disbursed', 'repaying', 'completed'].includes(loan.status) && (
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-primary-600">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
