import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, UserCheck, FileText, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('PERMIT')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('REJECT')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (action.includes('REVISION')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (action.includes('ESCALATION')) return 'bg-rose-200 text-rose-900 border-rose-300 font-bold';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Trail & Workflow Governance</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event log tracking all Camunda 8 process transitions, user decisions, and SLA escalations.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">App ID</th>
                <th className="py-3 px-4">Workflow Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">Loading audit events...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">No audit events recorded.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-teal-700">
                      #{log.applicationId || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {log.performedBy} <span className="text-[10px] text-slate-400">({log.userRole})</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {log.details}
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

