import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await api.get('/admin/applications');
      setApps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = apps.filter(a => 
    a.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    a.applicationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">All Municipal Permit Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive view of all citizen and architect filings across the municipality.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search permits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Current Workflow Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">Loading applications...</td></tr>
              ) : filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-teal-700">{app.applicationNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{app.projectName}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{app.applicant?.fullName || 'N/A'}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-medium">{app.currentStage}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/applications/${app.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
                    >
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

