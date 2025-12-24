import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { loansAPI } from '../services/api';

interface Loan {
  id: string;
  loanReference: string;
  amount: number;
  feeAmount: number;
  totalAmount: number;
  amountRepaid: number;
  outstandingBalance: number;
  purpose: string;
  status: string;
  dueDate: string;
  createdAt: string;
  student: {
    id: string;
    institution: string;
    program: string;
    trustScore: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  disbursed: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800',
  repaid: 'bg-gray-100 text-gray-800',
  overdue: 'bg-red-100 text-red-800',
};

export default function Loans() {
  const [searchParams] = useSearchParams();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchLoans();
  }, [page, statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loansAPI.getAll(page, 10, statusFilter);
      setLoans(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loan: Loan) => {
    setActionLoading(true);
    try {
      await loansAPI.approve(loan.id);
      toast.success('Loan approved successfully');
      fetchLoans();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (loan: Loan) => {
    if (!rejectReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await loansAPI.reject(loan.id, rejectReason);
      toast.success('Loan rejected');
      fetchLoans();
      setShowModal(false);
      setRejectReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async (loan: Loan) => {
    setActionLoading(true);
    try {
      await loansAPI.disburse(loan.id);
      toast.success('Loan disbursed successfully');
      fetchLoans();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disburse loan');
    } finally {
      setActionLoading(false);
    }
  };

  const openLoanModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ivcash-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Loans Management</h2>
          <p className="text-gray-500">Review and manage student loan applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'active', 'repaid', 'overdue'].map((status) => (
          <a
            key={status}
            href={status ? `/loans?status=${status}` : '/loans'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-ivcash-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </a>
        ))}
      </div>

      {/* Loans table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {loan.loanReference}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {loan.student?.user?.firstName} {loan.student?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.student?.institution}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {Number(loan.amount).toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: {Number(loan.totalAmount).toLocaleString()} RWF
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[loan.status] || 'bg-gray-100'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openLoanModal(loan)}
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

        {loans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No loans found</p>
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

      {/* Loan detail modal */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Loan Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Loan info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Reference</p>
                  <p className="font-medium">{selectedLoan.loanReference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedLoan.status]
                    }`}
                  >
                    {selectedLoan.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">
                    {Number(selectedLoan.amount).toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Platform Fee</p>
                  <p className="font-medium">
                    {Number(selectedLoan.feeAmount).toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-ivcash-primary">
                    {Number(selectedLoan.totalAmount).toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outstanding</p>
                  <p className="font-medium text-red-600">
                    {Number(selectedLoan.outstandingBalance).toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium capitalize">{selectedLoan.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">
                    {new Date(selectedLoan.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Student info */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {selectedLoan.student?.user?.firstName}{' '}
                      {selectedLoan.student?.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedLoan.student?.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="font-medium">{selectedLoan.student?.institution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trust Score</p>
                    <p className="font-medium">{selectedLoan.student?.trustScore}%</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedLoan.status === 'pending' && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="label">Rejection Reason (if rejecting)</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="input"
                      rows={2}
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedLoan)}
                      disabled={actionLoading}
                      className="btn-success flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Approve Loan
                    </button>
                    <button
                      onClick={() => handleReject(selectedLoan)}
                      disabled={actionLoading}
                      className="btn-danger flex items-center gap-2"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Reject Loan
                    </button>
                  </div>
                </div>
              )}

              {selectedLoan.status === 'approved' && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => handleDisburse(selectedLoan)}
                    disabled={actionLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <BanknotesIcon className="w-5 h-5" />
                    Disburse Loan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
