import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FilePlus, 
  Search, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications', {
        params: { applicantId: user?.id }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PERMIT_ISSUED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Permit Issued</span>;
      case 'PAYMENT_COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-200">Payment Completed</span>;
      case 'PENDING_PAYMENT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">Fee Payable</span>;
      case 'DEPARTMENTAL_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">In Review</span>;
      case 'REVISION_REQUIRED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Revision Required</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">Submitted</span>;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['SUBMITTED', 'UNDER_VERIFICATION', 'DEPARTMENTAL_REVIEW'].includes(a.status)).length,
    approved: applications.filter(a => ['PERMIT_ISSUED', 'PAYMENT_COMPLETED'].includes(a.status)).length,
    revision: applications.filter(a => a.status === 'REVISION_REQUIRED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'ALL' || app.status === filter;
    const matchesSearch = app.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Applicant Portal</h1>
          <p className="text-sm text-slate-500">
            Welcome back, {user?.fullName}. Track and submit municipal building permit applications.
          </p>
        </div>
        <Link
          to="/applicant/new-application"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition"
        >
          <FilePlus className="w-4 h-4" />
          New Application
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Filed</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Review</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Need Revision</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.revision}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or project name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'DEPARTMENTAL_REVIEW', 'REVISION_REQUIRED', 'PENDING_PAYMENT', 'PERMIT_ISSUED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === st 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Type & Area</th>
                <th className="py-3 px-4">Current Workflow Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading permit applications...</td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No applications match your filter criteria.</td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-teal-700">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {app.projectName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <div>{app.buildingType}</div>
                      <div className="text-[11px] text-slate-400">{app.proposedBuildingArea} sq.m ({app.numberOfFloors} Flr)</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{app.currentStage}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-semibold border border-slate-200 transition"
                      >
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

