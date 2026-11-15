import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2, 
  TrendingUp, 
  Users,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading municipal analytics...</div>;
  }

  // Transform data for charts
  const statusChartData = stats?.statusDistribution ? Object.entries(stats.statusDistribution).map(([key, val]) => ({
    name: key.replace('_', ' '),
    count: val
  })) : [];

  const deptData = [
    { name: 'Fire Safety', pending: stats?.departmentPendingCounts?.FIRE_SAFETY || 0, approved: stats?.departmentApprovedCounts?.FIRE_SAFETY || 0 },
    { name: 'Water Works', pending: stats?.departmentPendingCounts?.WATER || 0, approved: stats?.departmentApprovedCounts?.WATER || 0 },
    { name: 'Zoning Board', pending: stats?.departmentPendingCounts?.ZONING || 0, approved: stats?.departmentApprovedCounts?.ZONING || 0 },
    { name: 'Environmental', pending: stats?.departmentPendingCounts?.ENVIRONMENTAL || 0, approved: stats?.departmentApprovedCounts?.ENVIRONMENTAL || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Municipal Administration & SLA Monitor</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time workflow execution metrics, departmental review efficiency, and timer-based SLA escalations.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Submitted</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats?.totalApplications || 0}</p>
          <span className="text-[11px] text-teal-600 font-medium">All municipal wards</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold uppercase">
            <span>Permits Issued</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2">{stats?.approvedApplications || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Digitally certified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold uppercase">
            <span>Under Review</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-800 mt-2">{stats?.pendingApplications || 0}</p>
          <span className="text-[11px] text-blue-600 font-medium">Camunda Parallel review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold uppercase">
            <span>SLA Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-800 mt-2">{stats?.overdueReviewsCount || 0}</p>
          <span className="text-[11px] text-rose-600 font-bold">Timer Boundary Escalated</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800">Department Performance & Clearance Ratio</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name="Approved" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800">Workflow State Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

