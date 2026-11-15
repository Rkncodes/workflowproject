import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  FilePlus, 
  FileCheck2, 
  CheckSquare, 
  BarChart3, 
  LogOut, 
  ShieldAlert, 
  Flame, 
  Droplets, 
  Compass, 
  Trees 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDepartmentIcon = (dept) => {
    switch (dept) {
      case 'FIRE_SAFETY': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'WATER': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'ZONING': return <Compass className="w-4 h-4 text-amber-400" />;
      case 'ENVIRONMENTAL': return <Trees className="w-4 h-4 text-emerald-400" />;
      default: return null;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide text-white">CivicFlow</h1>
          <p className="text-xs text-slate-400 font-medium">Municipal E-Permit</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-teal-400 border border-slate-700">
                {user?.role}
              </span>
              {user?.department && user.department !== 'NONE' && (
                <span className="flex items-center gap-1 text-[10px] text-slate-300">
                  {getDepartmentIcon(user.department)}
                  {user.department.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {/* Applicant Links */}
        {user?.role === 'APPLICANT' && (
          <>
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Applicant Portal
            </div>
            <NavLink
              to="/applicant/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              My Applications
            </NavLink>
            <NavLink
              to="/applicant/new-application"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <FilePlus className="w-4 h-4" />
              Apply for Permit
            </NavLink>
          </>
        )}

        {/* Officer Links */}
        {user?.role === 'OFFICER' && (
          <>
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Officer Review
            </div>
            <NavLink
              to="/officer/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <CheckSquare className="w-4 h-4" />
              Pending Reviews
            </NavLink>
          </>
        )}

        {/* Admin Links */}
        {user?.role === 'ADMIN' && (
          <>
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Municipal Admin
            </div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              Overview & Analytics
            </NavLink>
            <NavLink
              to="/admin/applications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <FileCheck2 className="w-4 h-4" />
              All Permit Requests
            </NavLink>
            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4" />
              Audit Logs & SLA
            </NavLink>
          </>
        )}
      </nav>

      {/* Camunda 8 Engine Link & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <a 
          href="http://localhost:8080/operate" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded bg-slate-800/80 hover:bg-slate-800 text-teal-300 border border-slate-700 transition"
        >
          <span>Camunda 8 Operate</span>
          <span className="text-[10px] px-1 bg-teal-500/20 text-teal-300 rounded">v8.8</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

