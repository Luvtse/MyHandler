
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  taxId?: string;
  businessType?: string;
  industry?: string;
  terms: boolean;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const { register: registerUser, isLoading } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      const userData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        password: data.password,
        accountType,
        role: 'customer' as const,
        ...(accountType === 'business' && {
          businessInfo: {
            companyName: data.companyName!,
            taxId: data.taxId,
            businessType: data.businessType,
            industry: data.industry
          }
        })
      };

      await registerUser(userData as any);

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    }
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
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="mt-2 text-sm text-gray-600">
                Join WORIYA EXPRESS for fast and reliable shipping
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md focus:outline-none ${
                    accountType === 'personal'
                      ? 'bg-brand text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setAccountType('personal')}
                >
                  Personal Account
                </button>
                <button
                  type="button"
                  className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md focus:outline-none ${
                    accountType === 'business'
                      ? 'bg-brand text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setAccountType('business')}
                >
                  Business Account
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {accountType === 'business' && (
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <Input
                      id="companyName"
                      placeholder="Your Business Name"
                      {...register('companyName', { required: accountType === 'business' })}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-500">Company name is required</p>
                    )}
                    
                    <div className="mt-4">
                      <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                        Tax ID
                      </label>
                      <Input id="taxId" placeholder="Tax ID" {...register('taxId')} />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type
                      </label>
                      <Input id="businessType" placeholder="e.g. Corporation, LLC" {...register('businessType')} />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <Input id="industry" placeholder="e.g. Retail, Manufacturing" {...register('industry')} />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName', { required: true })}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">First name is required</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      {...register('lastName', { required: true })}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">Last name is required</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: true,
                      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">Valid email is required</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="(123) 456-7890"
                    {...register('phone', { required: true })}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">Phone number is required</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password', {
                      required: true,
                      minLength: 8,
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">Password must meet requirements</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword', {
                      required: true,
                      validate: (val: string) => val === watch('password')
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">Passwords must match</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register('terms', { required: true })}
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-brand hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-brand hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                <Button type="submit" className="w-full bg-brand hover:bg-brand-600" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.481 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.099-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.7 1.028 1.592 1.028 2.683 0 3.842-2.34 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                  </svg>
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.3a6.3 6.3 0 110-12.6 6.3 6.3 0 010 12.6z"></path>
                    <path d="M10.7 9.3h3c.1 0 .2-.1.2-.3v-.9c0-.2-.1-.3-.2-.3h-3V5.3c0-.2-.1-.3-.3-.3h-1c-.1 0-.2.1-.2.3v2.5h-3c-.1 0-.2.1-.2.3v.9c0 .2.1.3.2.3h3v6.4c0 .2.1.3.3.3h1c.1 0 .2-.1.2-.3V9.3z"></path>
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
