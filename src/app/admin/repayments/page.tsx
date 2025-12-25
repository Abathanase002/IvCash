'use client'

import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'

interface Repayment {
  id: string
  amount: number
  paymentMethod: string
  reference: string | null
  paidAt: string
  loan: {
    id: string
    amount: number
    student: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }
}

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/repayments')
      .then(res => res.json())
      .then(setRepayments)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Repayments</h1>
        <p className="text-gray-600">Track all loan repayments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {repayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    No repayments found
                  </td>
                </tr>
              ) : (
                repayments.map((repayment) => (
                  <tr key={repayment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(repayment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {repayment.loan.student.user.firstName} {repayment.loan.student.user.lastName}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-semibold">
                      +{repayment.amount.toLocaleString()} GHC
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {repayment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {repayment.reference || '-'}
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

