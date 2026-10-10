import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center" padding="lg">
        <div className="flex justify-center mb-6">
          <BrandLogo size="lg" />
        </div>
        <div className="w-12 h-12 bg-red-50 text-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033] mb-2">Access Denied</h1>
        <p className="text-sm text-slate-500 mb-6">
          You do not have permission to view this page. Please log in with an account that has the required role.
        </p>
        <div className="space-y-3">
          <Button to="/login" variant="primary" fullWidth>
            Go to Login
          </Button>
          <Button to="/" variant="ghost" fullWidth>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
