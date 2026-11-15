import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText, 
  CreditCard, 
  Award,
  Layers
} from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Application Submitted', key: 'SUBMITTED', icon: FileText },
  { id: 2, label: 'Doc & Land Verification', key: 'UNDER_VERIFICATION', icon: CheckCircle2 },
  { id: 3, label: 'Departmental Review', key: 'DEPARTMENTAL_REVIEW', icon: Layers },
  { id: 4, label: 'Revision (If Needed)', key: 'REVISION_REQUIRED', icon: AlertCircle },
  { id: 5, label: 'Fee Calculation & Payment', key: 'PENDING_PAYMENT', icon: CreditCard },
  { id: 6, label: 'Permit Issuance', key: 'PERMIT_ISSUED', icon: Award },
];

export default function WorkflowTracker({ status, revisionCount = 0 }) {
  const getStageIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'SUBMITTED': return 0;
      case 'UNDER_VERIFICATION': return 1;
      case 'DEPARTMENTAL_REVIEW': return 2;
      case 'REVISION_REQUIRED': return 3;
      case 'PENDING_PAYMENT': return 4;
      case 'PAYMENT_COMPLETED':
      case 'PERMIT_ISSUED': return 5;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(status);

  if (status === 'REJECTED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800">
        <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Application Rejected</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            This permit application has been rejected during statutory review. Please check review notes below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
          Camunda 8 Workflow Execution State
        </h3>
        {revisionCount > 0 && (
          <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
            Revision Loop Cycle #{revisionCount}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div 
                key={stage.id} 
                className={`relative flex flex-col p-3 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-teal-50/70 border-teal-500 shadow-sm ring-1 ring-teal-500/30' 
                    : isCompleted 
                    ? 'bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-white border-dashed border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent 
                      ? 'bg-teal-600 text-white' 
                      : isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    0{stage.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-teal-600 animate-pulse" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className={`text-xs font-semibold leading-tight ${isCurrent ? 'text-teal-900 font-bold' : ''}`}>
                  {stage.label}
                </p>
                <p className="text-[10px] mt-1 text-slate-400 capitalize">
                  {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

