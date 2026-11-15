import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  MapPin, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STEPS = [
  { id: 1, title: 'Applicant Details' },
  { id: 2, title: 'Property Information' },
  { id: 3, title: 'Document Upload' },
  { id: 4, title: 'Review & Submit' }
];

export default function NewApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    applicantType: 'ARCHITECT',
    propertyAddress: '',
    city: 'Metro City',
    pinCode: '560001',
    surveyNumber: 'SURVEY-789-Z',
    plotArea: 1200,
    buildingType: 'RESIDENTIAL',
    numberOfFloors: 4,
    proposedBuildingArea: 2500,
  });

  // Mock file names for UI step 3
  const [documents, setDocuments] = useState({
    blueprint: 'Architectural_Master_Blueprint_v1.dwg.pdf',
    ownership: 'Registered_Sale_Deed_Title_Certificate.pdf',
    sitePlan: 'Topographical_Site_Ingress_Plan.pdf',
    structural: 'Licensed_Structural_Stability_Certificate.pdf',
    identityProof: 'Architect_Council_License_ID.pdf'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'plotArea' || name === 'proposedBuildingArea' || name === 'numberOfFloors') 
        ? Number(value) 
        : value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.projectName) {
      setError('Please provide a Project Name.');
      return;
    }
    if (currentStep === 2 && (!formData.propertyAddress || !formData.surveyNumber)) {
      setError('Please complete all property details.');
      return;
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        applicantId: user?.id || 6,
        projectName: formData.projectName,
        applicantType: formData.applicantType,
        propertyAddress: formData.propertyAddress,
        city: formData.city,
        pinCode: formData.pinCode,
        surveyNumber: formData.surveyNumber,
        plotArea: Number(formData.plotArea),
        buildingType: formData.buildingType,
        numberOfFloors: Number(formData.numberOfFloors),
        proposedBuildingArea: Number(formData.proposedBuildingArea)
      };

      const res = await api.post('/applications', payload);
      const newApp = res.data;

      // Automatically redirect to the detail view where Camunda workflow can be tracked
      navigate(`/applications/${newApp.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit application to Camunda workflow.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">New Building Permit Application</h1>
        <p className="text-sm text-slate-500">
          Submit statutory blueprints and details to begin automated departmental reviews.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCompleted ? 'bg-emerald-600 text-white' :
                    isCurrent ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className={`text-xs font-semibold hidden md:inline ${
                    isCurrent ? 'text-teal-900 font-bold' : 'text-slate-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${
                    currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        {error && (
          <div className="mb-6 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* STEP 1: Applicant Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">Step 1: Project & Applicant Category</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  placeholder="e.g. Royal Orchid Grand Towers"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Type</label>
                <select
                  name="applicantType"
                  value={formData.applicantType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="INDIVIDUAL">Individual Owner</option>
                  <option value="ARCHITECT">Licensed Architect</option>
                  <option value="COMPANY">Real Estate Developer / Firm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={user?.fullName || 'Ar. Vikram Mehta'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID</label>
                <input
                  type="email"
                  value={user?.email || 'vikram.mehta@studioarch.com'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Property Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">Step 2: Property & Building Specs</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Site Address *</label>
                <textarea
                  name="propertyAddress"
                  rows="2"
                  placeholder="Plot 105, Sector 4, Outer Ring Highway"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Revenue Cadastral Survey Number *
                </label>
                <input
                  type="text"
                  name="surveyNumber"
                  placeholder="e.g. SURVEY-789-Z (or test: SURVEY-999-DISPUTED)"
                  value={formData.surveyNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Tip: Include "DISPUTED" to simulate Land Registry rejection scenario.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Building Category</label>
                <select
                  name="buildingType"
                  value={formData.buildingType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="RESIDENTIAL">Residential (INR 20/sq.m)</option>
                  <option value="COMMERCIAL">Commercial (INR 40/sq.m)</option>
                  <option value="INDUSTRIAL">Industrial (INR 30/sq.m)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Land Area (sq. meters) *</label>
                <input
                  type="number"
                  name="plotArea"
                  value={formData.plotArea}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Proposed Floors *</label>
                <input
                  type="number"
                  name="numberOfFloors"
                  value={formData.numberOfFloors}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Construction Area (sq.m) *</label>
                <input
                  type="number"
                  name="proposedBuildingArea"
                  value={formData.proposedBuildingArea}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Document Uploads */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">Step 3: Statutory Blueprints & Certificates</h3>

            <div className="space-y-3">
              {[
                { label: 'Building Architectural Blueprint (PDF/DWG)', file: documents.blueprint, req: true },
                { label: 'Land Ownership / Sale Deed Certificate', file: documents.ownership, req: true },
                { label: 'Topographical Site & Ingress Plan', file: documents.sitePlan, req: true },
                { label: 'Structural Stability Certificate', file: documents.structural, req: true },
                { label: 'Identity Proof / Council Registration', file: documents.identityProof, req: true },
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 border rounded-lg bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{doc.label}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.file}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Review and Submit */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">Step 4: Review Application & Start Camunda Workflow</h3>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Project:</span>{' '}
                  <span className="font-bold text-slate-800">{formData.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Applicant Category:</span>{' '}
                  <span className="font-bold text-slate-800">{formData.applicantType}</span>
                </div>
                <div>
                  <span className="text-slate-500">Survey No:</span>{' '}
                  <span className="font-mono font-bold text-teal-700">{formData.surveyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Building Type:</span>{' '}
                  <span className="font-bold text-slate-800">{formData.buildingType}</span>
                </div>
                <div>
                  <span className="text-slate-500">Total Plot Area:</span>{' '}
                  <span className="font-bold text-slate-800">{formData.plotArea} sq.m</span>
                </div>
                <div>
                  <span className="text-slate-500">Proposed Built Area:</span>{' '}
                  <span className="font-bold text-slate-800">{formData.proposedBuildingArea} sq.m ({formData.numberOfFloors} floors)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-900 leading-relaxed">
              <p className="font-bold mb-1">Orchestration Process Flow on Submission:</p>
              1. Auto-start Camunda 8 Zeebe Process Instance.<br />
              2. Document Integrity verification worker check.<br />
              3. Mock GIS Land Registry REST API verification.<br />
              4. Parallel distribution to Fire, Water, Zoning, and Environmental department user tasks.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Starting Camunda 8 Process...' : 'Confirm & Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

