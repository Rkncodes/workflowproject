import React from 'react';
import { Flame, Droplets, Compass, Trees, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const DEPARTMENTS = [
  { key: 'FIRE_SAFETY', label: 'Fire Safety Dept', icon: Flame, color: 'text-orange-500' },
  { key: 'WATER', label: 'Water Works Dept', icon: Droplets, color: 'text-cyan-500' },
  { key: 'ZONING', label: 'Zoning & Master Plan', icon: Compass, color: 'text-amber-500' },
  { key: 'ENVIRONMENTAL', label: 'Environmental Board', icon: Trees, color: 'text-emerald-500' }
];

export default function DepartmentApprovalGrid({ reviews = [] }) {
  const getReviewForDept = (deptKey) => {
    return reviews.find(r => r.department === deptKey);
  };

  const getStatusBadge = (review) => {
    if (!review || review.status === 'PENDING') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          <Clock className="w-3 h-3 text-slate-400" /> Pending Review
        </span>
      );
    }
    if (review.status === 'APPROVED') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" /> Cleared
        </span>
      );
    }
    if (review.status === 'REJECTED') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" /> Rejected
        </span>
      );
    }
    if (review.status === 'REVISION_REQUESTED') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Revision Requested
        </span>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {DEPARTMENTS.map((dept) => {
        const review = getReviewForDept(dept.key);
        const Icon = dept.icon;

        return (
          <div 
            key={dept.key} 
            className={`border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between ${
              review?.isOverdue ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${dept.color}`} />
                </div>
                {getStatusBadge(review)}
              </div>

              <h4 className="font-bold text-sm text-slate-800">{dept.label}</h4>

              {review?.officerName && (
                <p className="text-xs text-slate-500 mt-1">
                  Reviewed by: <span className="font-medium text-slate-700">{review.officerName}</span>
                </p>
              )}

              {review?.comments && (
                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100 italic">
                  "{review.comments}"
                </div>
              )}
            </div>

            {review?.isOverdue && (
              <div className="mt-3 pt-2 border-t border-rose-100 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue (SLA Exceeded)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

