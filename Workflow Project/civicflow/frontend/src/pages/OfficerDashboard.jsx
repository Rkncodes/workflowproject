import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Flame, 
  Droplets, 
  Compass, 
  Trees,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [comments, setComments] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  const officerDepartment = user?.department || 'FIRE_SAFETY';

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/pending', {
        params: { department: officerDepartment }
      });
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (action) => {
    if ((action === 'reject' || action === 'revision') && !comments.trim()) {
      setActionError(`Mandatory comments are required to ${action === 'reject' ? 'reject' : 'request revision'}.`);
      return;
    }

    setProcessing(true);
    setActionError('');
    setActionSuccess('');

    try {
      await api.post(`/reviews/${selectedReview.application.id}/${action}`, {
        officerId: user?.id,
        department: officerDepartment,
        comments: comments.trim() || 'Approved based on statutory compliance check.'
      });

      setActionSuccess(`Review successfully marked as ${action.toUpperCase()}!`);
      setSelectedReview(null);
      setComments('');
      fetchReviews();
    } catch (err) {
      setActionError('Action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const getDeptColor = () => {
    switch (officerDepartment) {
      case 'FIRE_SAFETY': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'WATER': return 'text-cyan-500 bg-cyan-50 border-cyan-200';
      case 'ZONING': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'ENVIRONMENTAL': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      default: return 'text-teal-500 bg-teal-50 border-teal-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDeptColor()}`}>
              {officerDepartment.replace('_', ' ')} DEPARTMENT
            </span>
            <span className="text-xs text-slate-400">Statutory Review Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Assigned Applications Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as {user?.fullName}. Evaluate architectural blueprints and issue departmental clearance.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="p-3 bg-slate-50 border rounded-xl">
            <p className="text-xs text-slate-500">Pending Reviews</p>
            <p className="text-2xl font-black text-slate-800">{reviews.length}</p>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Main Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Pending Applications</h3>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading queue...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No applications awaiting review in this department.</p>
          ) : (
            <div className="space-y-2">
              {reviews.map((r) => {
                const app = r.application;
                const isSelected = selectedReview?.id === r.id;

                return (
                  <div
                    key={r.id}
                    onClick={() => { setSelectedReview(r); setComments(''); setActionError(''); }}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      isSelected 
                        ? 'border-teal-500 bg-teal-50/50 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-700">{app?.applicationNumber}</span>
                      {r.isOverdue && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                          SLA Overdue
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-xs text-slate-800 mt-1">{app?.projectName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{app?.buildingType} | {app?.proposedBuildingArea} sq.m</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Inspection & Action Workspace */}
        <div className="lg:col-span-2">
          {selectedReview ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedReview.application?.applicationNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    Stage: {selectedReview.application?.currentStage}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mt-2">
                  {selectedReview.application?.projectName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedReview.application?.propertyAddress}, {selectedReview.application?.city}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Survey Cadastral #</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReview.application?.surveyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Building Category</span>
                  <span className="font-bold text-slate-800">{selectedReview.application?.buildingType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Floors</span>
                  <span className="font-bold text-slate-800">{selectedReview.application?.numberOfFloors} Floors</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Proposed Built Area</span>
                  <span className="font-bold text-slate-800">{selectedReview.application?.proposedBuildingArea} sq.m</span>
                </div>
              </div>

              {/* Review Decision Form */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Department Officer Review Comments
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter compliance verification remarks or required architectural modifications (Required for Rejection/Revision)..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-3 border rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />

                {actionError && (
                  <p className="text-xs text-rose-600 font-semibold">{actionError}</p>
                )}

                {/* 3 Review Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleDecision('reject')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleDecision('revision')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Request Revision
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleDecision('approve')}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Clearance
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              Select an application from the left queue to review blueprints and record statutory clearance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

