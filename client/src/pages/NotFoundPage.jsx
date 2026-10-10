import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full text-center" padding="lg">
        <span className="text-6xl font-extrabold text-[#4F46E5] block mb-2">404</span>
        <h1 className="text-2xl font-bold text-[#172033] mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button to="/" variant="primary" icon={Home}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default NotFoundPage;
