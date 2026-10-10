import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { UserPlus, ArrowLeft } from 'lucide-react';

export const RegisterPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center" padding="lg">
        <div className="flex justify-center mb-6">
          <BrandLogo size="lg" />
        </div>

        <div className="w-12 h-12 bg-purple-50 text-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
          <UserPlus className="w-6 h-6" />
        </div>

        <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] rounded-full mb-2">
          Phase 1 Placeholder
        </span>

        <h1 className="text-2xl font-bold text-[#172033] mb-2">
          Create CareerBridge Account
        </h1>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Registration with distinct onboarding workflows for Students, Alumni, and Institutional Officers will be activated in upcoming phases.
        </p>

        <div className="space-y-3">
          <Button to="/login" variant="outline" fullWidth>
            Already have an account? Sign In
          </Button>
          <Button to="/" variant="ghost" fullWidth icon={ArrowLeft}>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
