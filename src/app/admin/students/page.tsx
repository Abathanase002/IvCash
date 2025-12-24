'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Star } from 'lucide-react'

interface Student {
  id: string
  universityName: string
  studentId: string
  program: string
  yearOfStudy: number
  trustScore: number
  isEligible: boolean
  maxLoanAmount: number
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    isActive: boolean
  }
  loans: Array<{ id: string; amount: number; status: string }>
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [])

  const filteredStudents = students.filter(student =>
    `${student.user.firstName} ${student.user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    student.user.email.toLowerCase().includes(search.toLowerCase()) ||
    student.universityName.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage registered students</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trust Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Loan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Loans</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{student.user.firstName} {student.user.lastName}</p>
                        <p className="text-sm text-gray-500">{student.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{student.universityName}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{student.program}</p>
                        <p className="text-sm text-gray-500">Year {student.yearOfStudy}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{student.trustScore.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{student.maxLoanAmount.toLocaleString()} RWF</td>
                    <td className="px-6 py-4">{student.loans.length}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
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
