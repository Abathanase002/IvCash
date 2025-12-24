'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CreditCard, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'

interface Loan {
  id: string
  amount: number
  status: string
  totalRepayment: number
  repayments: Array<{ amount: number }>
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(setLoans)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold">{totalBorrowed.toLocaleString()} RWF</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold">{pendingLoan ? 1 : 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Loans</p>
              <p className="text-2xl font-bold">{completedLoans}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loan */}
      {activeLoan ? (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Active Loan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-green-200 text-sm">Amount</p>
              <p className="text-2xl font-bold">{activeLoan.amount.toLocaleString()} RWF</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Total to Repay</p>
              <p className="text-2xl font-bold">{activeLoan.totalRepayment.toLocaleString()} RWF</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Paid</p>
              <p className="text-2xl font-bold">
                {(activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0).toLocaleString()} RWF
              </p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Status</p>
              <p className="text-2xl font-bold capitalize">{activeLoan.status}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-green-800 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(
                    ((activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0) / activeLoan.totalRepayment) * 100, 
                    100
                  )}%` 
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 border text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Loan</h3>
          <p className="text-gray-600 mb-4">You don't have any active loans right now</p>
          {!pendingLoan && (
            <Link
              href="/student/loans/new"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Request a Loan
            </Link>
          )}
        </div>
      )}

      {/* Pending Loan */}
      {pendingLoan && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800">Loan Application Pending</h3>
              <p className="text-yellow-700">
                Your loan request for {pendingLoan.amount.toLocaleString()} RWF is being reviewed.
                We'll notify you once it's approved.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
