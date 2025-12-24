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
    amount: number
  }
}

export default function StudentPaymentsPage() {
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

  const totalPaid = repayments.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        <p className="text-gray-600">View your payment history</p>
      </div>

      {/* Summary */}
      <div className="bg-green-600 rounded-xl p-6 text-white">
        <p className="text-green-100">Total Amount Paid</p>
        <p className="text-3xl font-bold">{totalPaid.toLocaleString()} RWF</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {repayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    No payments yet
                  </td>
                </tr>
              ) : (
                repayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {payment.amount.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {payment.reference || '-'}
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
