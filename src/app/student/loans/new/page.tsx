'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calculator, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react'
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

  const loanPurposes = [
    'Tuition Fees',
    'Accommodation',
    'Books & Supplies',
    'Living Expenses',
    'Project Materials',
    'Emergency',
    'Other'
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/student/loans"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loans
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Request a Loan</h1>
        <p className="text-gray-600">Apply for financial support at Ashesi University</p>
      </div>

      {/* Ashesi Info Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4 border border-primary-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Ashesi Student Loans</p>
          <p className="text-sm text-gray-600">Quick approval for eligible students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (GHC)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-lg font-semibold"
              placeholder="Enter amount"
              min="100"
              max="5000"
              required
            />
            <p className="text-sm text-gray-500 mt-2">Min: 100 GHC • Max: 5,000 GHC</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              required
            >
              <option value="">Select loan purpose</option>
              {loanPurposes.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repayment Duration
            </label>
            <div className="grid grid-cols-5 gap-2">
              {['1', '2', '3', '6', '12'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration: d })}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.duration === d
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d} {parseInt(d) === 1 ? 'mo' : 'mos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loan Calculator */}
        {amount > 0 && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border border-primary-100 p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Loan Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-primary-100">
                <span className="text-gray-600">Principal Amount</span>
                <span className="font-semibold text-gray-900">{amount.toLocaleString()} GHC</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-primary-100">
                <span className="text-gray-600">Interest ({interestRate}% p.a.)</span>
                <span className="font-semibold text-gray-900">{totalInterest.toFixed(2)} GHC</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-primary-100">
                <span className="text-gray-600">Platform Fee ({platformFee}%)</span>
                <span className="font-semibold text-gray-900">{totalFee.toFixed(2)} GHC</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-primary-100">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">{duration} month{duration > 1 ? 's' : ''}</span>
              </div>
              
              <div className="bg-white rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Repayment</span>
                  <span className="text-xl font-bold text-primary-600">{totalRepayment.toFixed(2)} GHC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Payment</span>
                  <span className="text-2xl font-bold text-primary-700">{monthlyPayment.toFixed(2)} GHC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Loan Terms</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
              Loans are reviewed within 24-48 hours
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
              Funds disbursed directly to your mobile money or bank account
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
              Flexible repayment options available
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
              No hidden fees or charges
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || amount <= 0}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </span>
          ) : (
            'Submit Loan Request'
          )}
        </button>
      </form>
    </div>
  )
}
