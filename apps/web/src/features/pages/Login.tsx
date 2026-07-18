
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiService } from '@/lib/api/client';
import { ClientAuth } from  '@/features/auth/lib/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { login, isLoading, error, resetError, user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // If user is already logged in, redirect to dashboard when role is available
  useEffect(() => {
    if (user && user.role) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Handle OAuth callback: store tokens and fetch user profile
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('accessToken') || searchParams.get('token');
    if (!accessToken) return;

    // Persist access token via shared ClientAuth
    ClientAuth.setTokens({ accessToken });

    // Fetch the authenticated user's profile
    (async () => {
      try {
        const { success, data } = await apiService.request<{ id: string; email: string; name: string; role: any }>({
          method: 'GET',
          url: API_ENDPOINTS.users.profile,
        });
        if (success && data) {
          // Map server response to frontend User type shape
          const mappedUser: any = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            createdAt: new Date().toISOString(),
            accountType: 'personal',
          };
          setUser(mappedUser);
          navigate('/dashboard', { replace: true });
        } else {
          toast.error('Failed to load profile after login');
        }
      } catch (err) {
        console.error('OAuth profile fetch error:', err);
        toast.error('Authentication succeeded, but failed loading profile');
      }
    })();
  }, [location, navigate, setUser]);

  // Check for too many login attempts
  useEffect(() => {
    if (loginAttempts >= 5) {
      setFormError("Too many login attempts. Please try again later or reset your password.");
    }
  }, [loginAttempts]);

  const validateInputs = (): boolean => {
    if (!email || !email.includes('@')) {
      setFormError("Please enter a valid email address");
      return false;
    }
    
    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }
    
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    
    if (!validateInputs()) {
      return;
    }
    
    try {
      await login(email, password);
      setLoginAttempts(0); // Reset attempts on success
    } catch (err) {
      console.error("Login error:", err);
      setLoginAttempts(prev => prev + 1);
      
      // Auth errors are handled by the useAuthStore, this is for unexpected errors
      if (!error) {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      resetError();
    };
  }, [resetError]);

  const handleOAuthLogin = (provider: 'github' | 'google') => {
    window.location.href = `http://localhost:4000/api/oauth/${provider}`;
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-300px)] bg-gray-50 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <div className="flex justify-center">
                <Package className="h-12 w-12 text-brand" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your GoodsHandler account
              </p>
            </div>
            
            {(error || formError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error || formError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError && formError.includes('email')) {
                        setFormError(null);
                      }
                    }}
                    required
                    aria-invalid={!!formError && formError.includes('email')}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs text-brand hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError && formError.includes('password')) {
                        setFormError(null);
                      }
                    }}
                    required
                    aria-invalid={!!formError && formError.includes('password')}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-brand hover:bg-brand-600" 
                  disabled={isLoading || loginAttempts >= 5}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="text-center text-sm text-gray-500">
                  <p>Demo accounts available:</p>
                  <p className="text-xs mt-1">
                    customer@example.com / driver@example.com / admin@example.com
                  </p>
                  <p className="text-xs">Password: password</p>
                </div>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('github')}
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.481 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.099-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.7 1.028 1.592 1.028 2.683 0 3.842-2.34 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                  </svg>
                  <span>GitHub</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('google')}
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.3a6.3 6.3 0 110-12.6 6.3 6.3 0 010 12.6z"></path>
                    <path d="M10.7 9.3h3c.1 0 .2-.1.2-.3v-.9c0-.2-.1-.3-.2-.3h-3V5.3c0-.2-.1-.3-.3-.3h-1c-.1 0-.2.1-.2.3v2.5h-3c-.1 0-.2.1-.2.3v.9c0 .2.1.3.2.3h3v6.4c0 .2.1.3.3.3h1c.1 0 .2-.1.2-.3V9.3z"></path>
                  </svg>
                  <span>Google</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-brand hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
