'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Plus, Eye } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-600">View and manage your loan applications</p>
        </div>
        {canRequestLoan && (
          <Link
            href="/student/loans/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            Request Loan
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No loans yet</p>
                    <Link
                      href="/student/loans/new"
                      className="text-green-600 font-semibold hover:underline mt-2 inline-block"
                    >
                      Request your first loan
                    </Link>
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const totalPaid = loan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0
                  const progress = (totalPaid / loan.totalRepayment) * 100

                  return (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {loan.amount.toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate">
                        {loan.purpose}
                      </td>
                      <td className="px-6 py-4">{loan.duration} months</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          loan.status === 'disbursed' ? 'bg-green-100 text-green-800' :
                          loan.status === 'repaying' ? 'bg-purple-100 text-purple-800' :
                          loan.status === 'completed' ? 'bg-teal-100 text-teal-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {['disbursed', 'repaying', 'completed'].includes(loan.status) ? (
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
