import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, MapPin, Phone, Link2, ExternalLink, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getAlumniProfile, createAlumniProfile, updateAlumniProfile } from '../services/alumniService';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Media', 'Government', 'Non-Profit', 'Other',
];

const InputField = ({ label, id, icon: Icon, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
      )}
      <input
        id={id}
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border rounded-lg text-sm transition-colors
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-[#4F46E5]'}
          focus:outline-none focus:ring-2 focus:border-transparent bg-white text-slate-900 placeholder-slate-400`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export const AlumniProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    location: '',
    graduationYear: CURRENT_YEAR - 1,
    department: '',
    college: '',
    currentCompany: '',
    currentRole: '',
    industry: '',
    yearsOfExperience: '',
    bio: '',
    skills: '',
    careerInterests: '',
    linkedinUrl: '',
    githubUrl: '',
    mentorshipAvailable: false,
    mentorshipAreas: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getAlumniProfile();
        if (res.data) {
          const p = res.data;
          setForm({
            fullName: p.fullName || '',
            phone: p.phone || '',
            location: p.location || '',
            graduationYear: p.graduationYear || CURRENT_YEAR - 1,
            department: p.department || '',
            college: p.college || '',
            currentCompany: p.currentCompany || '',
            currentRole: p.currentRole || '',
            industry: p.industry || '',
            yearsOfExperience: p.yearsOfExperience ?? '',
            bio: p.bio || '',
            skills: (p.skills || []).join(', '),
            careerInterests: (p.careerInterests || []).join(', '),
            linkedinUrl: p.linkedinUrl || '',
            githubUrl: p.githubUrl || '',
            mentorshipAvailable: p.mentorshipAvailable || false,
            mentorshipAreas: (p.mentorshipAreas || []).join(', '),
          });
          setIsNew(false);
        } else {
          setIsNew(true);
        }
      } catch {
        setIsNew(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.college.trim()) e.college = 'College is required';
    if (!form.graduationYear) e.graduationYear = 'Graduation year is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const toArray = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        yearsOfExperience: form.yearsOfExperience === '' ? undefined : Number(form.yearsOfExperience),
        skills: toArray(form.skills),
        careerInterests: toArray(form.careerInterests),
        mentorshipAreas: toArray(form.mentorshipAreas),
      };
      if (isNew) {
        await createAlumniProfile(payload);
      } else {
        await updateAlumniProfile(payload);
      }
      setIsNew(false);
      showToast('success', 'Profile saved successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <AlertCircle className="w-5 h-5 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] mb-3">
          <User className="w-3.5 h-3.5" />
          Alumni Profile
        </div>
        <h1 className="text-3xl font-bold text-[#172033]">
          {isNew ? 'Create Your Alumni Profile' : 'Edit Alumni Profile'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete your profile so students can connect with you for mentorship and referrals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#172033] mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-[#7C3AED]" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Full Name *" id="fullName" name="fullName" icon={User}
              value={form.fullName} onChange={handleChange} placeholder="Jane Smith"
              error={errors.fullName} />
            <InputField label="Phone" id="phone" name="phone" icon={Phone}
              value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
            <InputField label="Location" id="location" name="location" icon={MapPin}
              value={form.location} onChange={handleChange} placeholder="Mumbai, India" />
          </div>
        </section>

        {/* Academic Info */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#172033] mb-5 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#4F46E5]" /> Academic Background
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Department / Branch *" id="department" name="department"
              value={form.department} onChange={handleChange} placeholder="Computer Science"
              error={errors.department} />
            <InputField label="College / University *" id="college" name="college"
              value={form.college} onChange={handleChange} placeholder="IIT Bombay"
              error={errors.college} />
            <div>
              <label htmlFor="graduationYear" className="block text-sm font-medium text-slate-700 mb-1">
                Graduation Year *
              </label>
              <select id="graduationYear" name="graduationYear" value={form.graduationYear}
                onChange={handleChange}
                className="block w-full pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white text-slate-900">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.graduationYear && <p className="mt-1 text-xs text-red-600">{errors.graduationYear}</p>}
            </div>
          </div>
        </section>

        {/* Professional Info */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#172033] mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#38BDF8]" /> Professional Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Current Company" id="currentCompany" name="currentCompany"
              value={form.currentCompany} onChange={handleChange} placeholder="Google" />
            <InputField label="Current Role / Designation" id="currentRole" name="currentRole"
              value={form.currentRole} onChange={handleChange} placeholder="Software Engineer" />
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <select id="industry" name="industry" value={form.industry} onChange={handleChange}
                className="block w-full pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-white text-slate-900">
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <InputField label="Years of Experience" id="yearsOfExperience" name="yearsOfExperience"
              type="number" min="0" max="50"
              value={form.yearsOfExperience} onChange={handleChange} placeholder="3" />
          </div>
          <div className="mt-5">
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Bio / Summary</label>
            <textarea id="bio" name="bio" rows={4} value={form.bio} onChange={handleChange}
              placeholder="A brief description of your career journey and expertise..."
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none bg-white text-slate-900 placeholder-slate-400" />
          </div>
        </section>

        {/* Skills & Interests */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#172033] mb-2">Skills &amp; Interests</h2>
          <p className="text-xs text-slate-400 mb-5">Separate multiple entries with commas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
              <input id="skills" name="skills" value={form.skills} onChange={handleChange}
                placeholder="React, Node.js, Python, AWS"
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-white text-slate-900 placeholder-slate-400" />
            </div>
            <div>
              <label htmlFor="careerInterests" className="block text-sm font-medium text-slate-700 mb-1">Career Interests</label>
              <input id="careerInterests" name="careerInterests" value={form.careerInterests} onChange={handleChange}
                placeholder="Product Management, Startups, AI/ML"
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-white text-slate-900 placeholder-slate-400" />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#172033] mb-5">Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="LinkedIn URL" id="linkedinUrl" name="linkedinUrl" icon={Link2}
              value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            <InputField label="GitHub URL" id="githubUrl" name="githubUrl" icon={ExternalLink}
              value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/..." />
          </div>
        </section>

        {/* Mentorship */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#172033] mb-5">Mentorship</h2>
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input type="checkbox" name="mentorshipAvailable" checked={form.mentorshipAvailable}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
            <span className="text-sm text-slate-700 font-medium">I am available for mentorship</span>
          </label>
          {form.mentorshipAvailable && (
            <div>
              <label htmlFor="mentorshipAreas" className="block text-sm font-medium text-slate-700 mb-1">
                Mentorship Areas <span className="text-slate-400">(comma-separated)</span>
              </label>
              <input id="mentorshipAreas" name="mentorshipAreas" value={form.mentorshipAreas} onChange={handleChange}
                placeholder="Resume review, Interview prep, Career guidance"
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-white text-slate-900 placeholder-slate-400" />
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/alumni')}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : isNew ? 'Create Profile' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlumniProfilePage;
