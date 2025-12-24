import { useEffect, useState } from 'react';
import {
  BanknotesIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { adminAPI, loansAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DashboardStats {
  loans: {
    totalLoans: number;
    pendingLoans: number;
    activeLoans: number;
    repaidLoans: number;
    overdueLoans: number;
    totalDisbursed: number;
    totalRepaid: number;
  };
  transactions: {
    totalDisbursements: number;
    totalRepayments: number;
    totalFees: number;
    transactionCount: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ivcash-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Loans',
      value: stats?.loans.totalLoans || 0,
      icon: BanknotesIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Approval',
      value: stats?.loans.pendingLoans || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Active Loans',
      value: stats?.loans.activeLoans || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Overdue',
      value: stats?.loans.overdueLoans || 0,
      icon: ExclamationCircleIcon,
      color: 'bg-red-500',
    },
  ];

  const financialStats = [
    {
      title: 'Total Disbursed',
      value: `${Number(stats?.loans.totalDisbursed || 0).toLocaleString()} RWF`,
      icon: BanknotesIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Repaid',
      value: `${Number(stats?.loans.totalRepaid || 0).toLocaleString()} RWF`,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Platform Fees Earned',
      value: `${Number(stats?.transactions.totalFees || 0).toLocaleString()} RWF`,
      icon: ArrowTrendingUpIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Total Transactions',
      value: stats?.transactions.transactionCount || 0,
      icon: ClockIcon,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  const loanStatusData = {
    labels: ['Pending', 'Active', 'Repaid', 'Overdue'],
    datasets: [
      {
        data: [
          stats?.loans.pendingLoans || 0,
          stats?.loans.activeLoans || 0,
          stats?.loans.repaidLoans || 0,
          stats?.loans.overdueLoans || 0,
        ],
        backgroundColor: ['#fbbf24', '#22c55e', '#3b82f6', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-ivcash-primary to-ivcash-secondary rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome to IvCash Admin</h2>
        <p className="text-blue-100 mt-1">
          Monitor loans, manage students, and track platform performance.
        </p>
      </div>

      {/* Loan stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {financialStats.map((stat) => (
              <div
                key={stat.title}
                className={`${stat.bg} rounded-lg p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-gray-600 text-sm">{stat.title}</span>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Loan Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut
              data={loanStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/loans?status=pending" className="btn-primary">
            Review Pending Loans ({stats?.loans.pendingLoans || 0})
          </a>
          <a href="/loans?status=overdue" className="btn-danger">
            View Overdue Loans ({stats?.loans.overdueLoans || 0})
          </a>
          <a href="/students" className="btn-secondary">
            Manage Students
          </a>
          <a href="/transactions" className="btn-secondary">
            View Transactions
          </a>
        </div>
      </div>
    </div>
  );
}
