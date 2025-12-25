'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Search, Check, X, Banknote } from 'lucide-react'

interface Loan {
  id: string
  amount: number
  purpose: string
  duration: number
  status: string
  totalRepayment: number
  monthlyPayment: number
  createdAt: string
  student: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  repayments: Array<{ amount: number }>
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchLoans = () => {
    const url = filter === 'all' ? '/api/loans' : `/api/loans?status=${filter}`
    fetch(url)
      .then(res => res.json())
      .then(setLoans)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLoans()
  }, [filter])

  const handleAction = async (loanId: string, action: string) => {
    setActionLoading(loanId)
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchLoans()
      }
    } finally {
      setActionLoading(null)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600">Manage loan applications</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Loans</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disbursed">Disbursed</option>
          <option value="repaying">Repaying</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repaid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    No loans found
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const totalPaid = loan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0
                  const progress = (totalPaid / loan.totalRepayment) * 100

                  return (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{loan.student.user.firstName} {loan.student.user.lastName}</p>
                          <p className="text-sm text-gray-500">{loan.student.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{loan.amount.toLocaleString()} GHC</p>
                          <p className="text-sm text-gray-500">Total: {loan.totalRepayment.toLocaleString()} GHC</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate">{loan.purpose}</td>
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
                        {['disbursed', 'repaying', 'completed'].includes(loan.status) && (
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{totalPaid.toLocaleString()}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {loan.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(loan.id, 'approve')}
                                disabled={actionLoading === loan.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleAction(loan.id, 'reject')}
                                disabled={actionLoading === loan.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {loan.status === 'approved' && (
                            <button
                              onClick={() => handleAction(loan.id, 'disburse')}
                              disabled={actionLoading === loan.id}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                              title="Disburse"
                            >
                              <Banknote className="w-5 h-5" />
                            </button>
                          )}
                        </div>
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

