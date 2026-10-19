import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw, User, GraduationCap, Briefcase } from 'lucide-react';
import { getPendingAlumni, verifyAlumni } from '../services/alumniService';

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:  { cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock,         label: 'Pending' },
    VERIFIED: { cls: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle,   label: 'Verified' },
    REJECTED: { cls: 'bg-red-50 text-red-700 border-red-200',         icon: XCircle,       label: 'Rejected' },
  };
  const { cls, icon: Icon, label } = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
};

export const AdminAlumniVerificationPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('PENDING');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingAlumni();
      setAlumni(res.data || []);
    } catch (err) {
      showToast('error', err.message || 'Failed to load alumni list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleVerify = async (id, status) => {
    setActionId(id + status);
    try {
      await verifyAlumni(id, status);
      setAlumni(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, verificationStatus: status } : a));
      showToast('success', `Alumni ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully`);
    } catch (err) {
      showToast('error', err.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const filtered = alumni.filter(a => filter === 'ALL' || (a.verificationStatus || 'PENDING') === filter);

  const counts = {
    ALL: alumni.length,
    PENDING: alumni.filter(a => (a.verificationStatus || 'PENDING') === 'PENDING').length,
    VERIFIED: alumni.filter(a => a.verificationStatus === 'VERIFIED').length,
    REJECTED: alumni.filter(a => a.verificationStatus === 'REJECTED').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
          </div>
          <h1 className="text-3xl font-bold text-[#172033]">Alumni Verification</h1>
          <p className="text-slate-500 text-sm mt-1">Review and verify alumni degree credentials before granting full access.</p>
        </div>
        <button onClick={fetchPending}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',    value: counts.ALL,      color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200' },
          { label: 'Pending',  value: counts.PENDING,  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
          { label: 'Verified', value: counts.VERIFIED, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
          { label: 'Rejected', value: counts.REJECTED, color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border rounded-xl p-4`}>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors
              ${filter === tab ? 'bg-[#4F46E5] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}>
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No alumni in this category</h3>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'PENDING' ? 'All alumni have been reviewed.' : `No ${filter.toLowerCase()} alumni found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((alumnus) => {
            const alumnusId = alumnus._id || alumnus.id;
            const status = alumnus.verificationStatus || 'PENDING';
            const isPending = status === 'PENDING';
            const displayName = alumnus.fullName || alumnus.name || 'Alumni Member';
            return (
              <div key={alumnusId}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0 text-lg font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#172033] text-base">{displayName}</h3>
                        <StatusBadge status={status} />
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{alumnus.email}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Alumni
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          ID: {(alumnusId || '').slice(-8)}
                        </span>
                        {alumnus.createdAt && (
                          <span>Registered: {new Date(alumnus.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isPending ? (
                      <>
                        <button
                          disabled={!!actionId}
                          onClick={() => handleVerify(alumnusId, 'VERIFIED')}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                          {actionId === alumnusId + 'VERIFIED'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle className="w-4 h-4" />}
                          Verify
                        </button>
                        <button
                          disabled={!!actionId}
                          onClick={() => handleVerify(alumnusId, 'REJECTED')}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                          {actionId === alumnusId + 'REJECTED'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <XCircle className="w-4 h-4" />}
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {status === 'VERIFIED' ? 'Already verified' : 'Already rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAlumniVerificationPage;
