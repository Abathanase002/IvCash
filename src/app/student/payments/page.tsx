'use client'

import { useEffect, useState } from 'react'
import { 
  Receipt, CreditCard, Calendar, TrendingUp, CheckCircle, 
  Clock, ArrowUpRight, Wallet, PieChart, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Loan {
  id: string
  amount: number
  totalRepayment: number
  monthlyPayment: number
  status: string
  dueDate: string | null
  repayments: Array<{ amount: number; paidAt: string }>
}

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
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/repayments').then(res => res.json()),
      fetch('/api/loans').then(res => res.json()),
    ])
      .then(([reps, lns]) => {
        setRepayments(reps)
        setLoans(lns)
      })
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

  const totalPaid = repayments.reduce((sum, r) => sum + r.amount, 0)
  const activeLoan = loans.find(l => ['disbursed', 'repaying'].includes(l.status))
  const remainingBalance = activeLoan ? activeLoan.totalRepayment - (activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0) : 0
  const progressPercent = activeLoan ? ((activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0) / activeLoan.totalRepayment) * 100 : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Track your loan repayments and payment history</p>
      </div>

      {/* Payment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-ashesi-pattern opacity-10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-primary-200" />
              <span className="text-primary-100 text-sm font-medium">Total Paid</span>
            </div>
            <p className="text-3xl font-bold">{totalPaid.toLocaleString()} GHC</p>
            <p className="text-primary-200 text-sm mt-2">{repayments.length} payments made</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-ashesi-pattern opacity-10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-secondary-200" />
              <span className="text-secondary-100 text-sm font-medium">Remaining Balance</span>
            </div>
            <p className="text-3xl font-bold">{remainingBalance.toLocaleString()} GHC</p>
            {activeLoan && (
              <p className="text-secondary-200 text-sm mt-2">
                {activeLoan.monthlyPayment.toLocaleString()} GHC/month
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-500 text-sm font-medium">Repayment Progress</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{progressPercent.toFixed(0)}%</p>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Loan Payment Schedule */}
      {activeLoan && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Schedule</h2>
                <p className="text-gray-500 text-sm">Your current loan repayment plan</p>
              </div>
              {activeLoan.dueDate && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Next Due Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(activeLoan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
                <p className="text-xl font-bold text-gray-900">{activeLoan.amount.toLocaleString()} GHC</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Total to Repay</p>
                <p className="text-xl font-bold text-gray-900">{activeLoan.totalRepayment.toLocaleString()} GHC</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-600 mb-1">Amount Paid</p>
                <p className="text-xl font-bold text-emerald-700">
                  {(activeLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0).toLocaleString()} GHC
                </p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-600 mb-1">Remaining</p>
                <p className="text-xl font-bold text-amber-700">{remainingBalance.toLocaleString()} GHC</p>
              </div>
            </div>

            {/* Visual Progress */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Repayment Progress</span>
                <span className="text-sm font-bold text-primary-600">{progressPercent.toFixed(1)}% Complete</span>
              </div>
              <div className="relative">
                <div className="w-full bg-white rounded-full h-6 shadow-inner overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(progressPercent, 5)}%` }}
                  >
                    {progressPercent > 10 && (
                      <span className="text-xs font-bold text-white">{progressPercent.toFixed(0)}%</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0 GHC</span>
                  <span>{activeLoan.totalRepayment.toLocaleString()} GHC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <p className="text-gray-500 text-sm">All your past payments</p>
        </div>
        
        {repayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Once you make payments on your loan, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {repayments.map((payment, index) => (
              <div 
                key={payment.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">Payment Received</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.paidAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">+{payment.amount.toLocaleString()} GHC</p>
                  <p className="text-sm text-gray-500">{payment.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Methods Info */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How to Make Payments</h3>
            <p className="text-gray-600 text-sm mb-3">
              You can make loan repayments through the following methods:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                Mobile Money (MTN, Vodafone, AirtelTigo)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                Bank Transfer to Ashesi Student Loans Account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                Cash payment at the Admin Office
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
