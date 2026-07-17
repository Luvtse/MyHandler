import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthService } from '@/features/auth/lib/service';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res: any = await AuthService.forgotPassword(email);
      // In dev, backend returns { success: true, token }
      if (res && (res as any).token) {
        setDevToken((res as any).token);
      }
      setMessage('If an account exists for that email, a reset link has been sent.');
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Failed to request password reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-300px)] bg-gray-50 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold mb-2">Forgot your password?</h1>
            <p className="text-sm text-gray-600 mb-6">Enter your email to receive a password reset link.</p>

            {error && (
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-brand hover:bg-brand-600" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            {devToken && (
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-1">Development token (use for testing reset):</p>
                <div className="p-2 bg-gray-100 rounded text-xs break-all">{devToken}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;