'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calculator } from 'lucide-react'
import Link from 'next/link'

export default function NewLoanPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    duration: '3',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = parseFloat(formData.amount) || 0
  const duration = parseInt(formData.duration) || 3
  const interestRate = 5
  const platformFee = 5
  const totalInterest = (amount * interestRate * duration) / 100 / 12
  const totalFee = (amount * platformFee) / 100
  const totalRepayment = amount + totalInterest + totalFee
  const monthlyPayment = totalRepayment / duration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          duration: parseInt(formData.duration),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      router.push('/student/loans')
    } catch (err: any) {
      setError(err.message || 'Failed to submit loan request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/student/loans"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loans
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Request a Loan</h1>
        <p className="text-gray-600">Fill out the form below to request a loan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (RWF)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 100000"
              min="10000"
              max="500000"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Min: 10,000 RWF - Max: 500,000 RWF</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="What will you use this loan for?"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repayment Duration
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="1">1 Month</option>
              <option value="2">2 Months</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>
        </div>

        {/* Loan Calculator */}
        {amount > 0 && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Loan Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Principal Amount</p>
                <p className="font-semibold">{amount.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-gray-600">Interest ({interestRate}%)</p>
                <p className="font-semibold">{totalInterest.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-gray-600">Platform Fee ({platformFee}%)</p>
                <p className="font-semibold">{totalFee.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-gray-600">Total Repayment</p>
                <p className="font-bold text-green-700">{totalRepayment.toLocaleString()} RWF</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-green-200">
                <p className="text-gray-600">Monthly Payment</p>
                <p className="text-xl font-bold text-green-700">
                  {monthlyPayment.toLocaleString()} RWF/month
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Loan Request'}
        </button>
      </form>
    </div>
  )
}
