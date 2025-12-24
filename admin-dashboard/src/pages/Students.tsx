import { useEffect, useState } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

interface Student {
  id: string;
  institution: string;
  program: string;
  yearOfStudy: string;
  trustScore: number;
  totalBorrowed: number;
  totalRepaid: number;
  loansCount: number;
  isEligibleForLoan: boolean;
  maxLoanAmount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    verificationStatus: string;
  };
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStudents(page, 10);
      setStudents(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ivcash-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Students</h2>
        <p className="text-gray-500">Manage registered students and their profiles</p>
      </div>

      {/* Students table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trust Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loans
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-ivcash-primary rounded-full flex items-center justify-center text-white font-medium">
                        {student.user?.firstName?.[0]}
                        {student.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.user?.firstName} {student.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">{student.institution || 'Not set'}</p>
                      <p className="text-xs text-gray-500">{student.program || '-'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustScoreColor(
                        student.trustScore
                      )}`}
                    >
                      {student.trustScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{student.loansCount} loans</p>
                    <p className="text-xs text-gray-500">
                      {Number(student.totalBorrowed).toLocaleString()} RWF borrowed
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.isEligibleForLoan
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.isEligibleForLoan ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowModal(true);
                      }}
                      className="text-ivcash-primary hover:text-blue-700"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Student detail modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-ivcash-primary rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {selectedStudent.user?.firstName?.[0]}
                  {selectedStudent.user?.lastName?.[0]}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedStudent.user?.firstName} {selectedStudent.user?.lastName}
                  </h4>
                  <p className="text-gray-500">{selectedStudent.user?.email}</p>
                  <p className="text-gray-500">{selectedStudent.user?.phone}</p>
                </div>
              </div>

              {/* Academic info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-medium">{selectedStudent.institution || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium">{selectedStudent.program || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year of Study</p>
                  <p className="font-medium capitalize">
                    {selectedStudent.yearOfStudy?.replace('_', ' ') || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedStudent.user?.verificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedStudent.user?.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Financial stats */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedStudent.trustScore}%
                    </p>
                    <p className="text-sm text-gray-600">Trust Score</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-green-600">
                      {Number(selectedStudent.totalBorrowed).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Borrowed (RWF)</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {Number(selectedStudent.totalRepaid).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Repaid (RWF)</p>
                  </div>
                </div>
              </div>

              {/* Loan eligibility */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Loan Eligibility</p>
                    <p className="font-medium">
                      {selectedStudent.isEligibleForLoan
                        ? 'Eligible for loans'
                        : 'Not eligible for loans'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Loan Amount</p>
                    <p className="font-medium text-ivcash-primary">
                      {Number(selectedStudent.maxLoanAmount).toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
