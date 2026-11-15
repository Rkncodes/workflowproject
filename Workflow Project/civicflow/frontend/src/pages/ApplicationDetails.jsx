import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Download, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  FileText, 
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import WorkflowTracker from '../components/WorkflowTracker';
import DepartmentApprovalGrid from '../components/DepartmentApprovalGrid';
import api from '../services/api';
import confetti from 'canvas-confetti';

export default function ApplicationDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [uploadingRevision, setUploadingRevision] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = async (simulateFailure = false) => {
    setPaying(true);
    setMessage('');
    try {
      const res = await api.post('/payments', {
        applicationId: id,
        amount: data?.application?.calculatedFee || 15000,
        paymentMethod: 'NET_BANKING',
        simulateFailure
      });

      if (simulateFailure) {
        setMessage('Payment Gateway Error: Simulated transaction declined. You can retry payment.');
      } else {
        setMessage('Payment successful! Permit generated with digital signature.');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      loadDetails();
    } catch (err) {
      setMessage('Payment failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setPaying(false);
    }
  };

  const handleUploadRevision = async () => {
    setUploadingRevision(true);
    setMessage('');

    try {
      // Simulate multipart file upload for revised blueprint
      const blob = new Blob(["Revised blueprint CAD schematic v2"], { type: "text/plain" });
      const file = new File([blob], "Revised_Architectural_Plan_v2.pdf");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "REVISED_BLUEPRINT");

      await api.post(`/applications/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage('Revised blueprint uploaded! Workflow looped back to departmental review.');
      loadDetails();
    } catch (err) {
      setMessage('Upload failed: ' + (err.response?.data || err.message));
    } finally {
      setUploadingRevision(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading permit details...</div>;
  }

  if (!data?.application) {
    return <div className="p-8 text-center text-rose-500">Application not found.</div>;
  }

  const app = data.application;
  const reviews = data.reviews || [];
  const documents = data.documents || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              {app.applicationNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Submitted on {new Date(app.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{app.projectName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {app.propertyAddress}, {app.city} | Survey #{app.surveyNumber}
          </p>
        </div>

        {/* Status & Quick Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadDetails}
            className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Refresh State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {app.status === 'PERMIT_ISSUED' && (
            <a
              href={`/api/permits/${app.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              Download Permit PDF
            </a>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-lg">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Camunda 8 Workflow Visual Tracker */}
      <WorkflowTracker status={app.status} revisionCount={app.revisionCount} />

      {/* REVISION ACTION CALLOUT */}
      {app.status === 'REVISION_REQUIRED' && (
        <div className="p-5 rounded-xl border border-amber-300 bg-amber-50 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Departmental Revision Requested</h4>
              <p className="text-xs text-amber-800 mt-1">
                One or more municipal departments requested corrections on your architectural submission.
                Upload your updated blueprints below to loop the application back into review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleUploadRevision}
              disabled={uploadingRevision}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploadingRevision ? 'Uploading...' : 'Upload Corrected Blueprint'}
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT CALLOUT */}
      {app.status === 'PENDING_PAYMENT' && (
        <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/70 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-indigo-950">Statutory Approvals Cleared – Fee Payable</h4>
                <p className="text-xs text-indigo-800 mt-1">
                  Permit fee has been automatically computed via Camunda Call Activity based on square footage & floor count.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-indigo-600 font-semibold block">Calculated Fee</span>
              <span className="text-2xl font-black text-indigo-900 font-mono">
                INR {app.calculatedFee?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-100 flex items-center justify-end gap-3">
            <button
              onClick={() => handleMockPayment(true)}
              disabled={paying}
              className="px-3.5 py-2 border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 font-semibold text-xs rounded-lg transition"
            >
              Simulate Failed Payment
            </button>
            <button
              onClick={() => handleMockPayment(false)}
              disabled={paying}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {paying ? 'Processing...' : 'Pay Permit Fee Now'}
            </button>
          </div>
        </div>
      )}

      {/* Parallel Department Reviews */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-800">Departmental Review Statuses</h3>
        <DepartmentApprovalGrid reviews={reviews} />
      </div>

      {/* Property & Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Property Specifications</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Survey Cadastral #</span>
              <span className="font-mono font-bold text-teal-700">{app.surveyNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Land Registry Status</span>
              <span className="font-semibold text-emerald-700">{app.landVerificationStatus}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Building Type</span>
              <span className="font-semibold text-slate-800">{app.buildingType}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Plot Land Area</span>
              <span className="font-semibold text-slate-800">{app.plotArea} sq.m</span>
            </div>
            <div>
              <span className="text-slate-400 block">Number of Floors</span>
              <span className="font-semibold text-slate-800">{app.numberOfFloors} Floors</span>
            </div>
            <div>
              <span className="text-slate-400 block">Proposed Built Area</span>
              <span className="font-semibold text-slate-800">{app.proposedBuildingArea} sq.m</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Submitted Documents</h3>
          <div className="space-y-2 text-xs">
            {documents.length === 0 ? (
              <div className="text-slate-400 italic">Pre-verified digital blueprints on record.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-2.5 rounded-lg bg-slate-50 border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-700">{doc.documentType}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{doc.fileName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

