import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';

interface NewsletterFormData {
  email: string;
}

const NewsletterSubscription = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsletterFormData>();
  const { toast } = useToast();

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      // Simulate newsletter subscription with success
      
      // Add realistic delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: 'Subscription Successful',
        description: 'Thank you for subscribing! Check your email for confirmation.',
      });
      
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-brand/5 rounded-lg p-8 mt-12">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="h-6 w-6 text-brand" />
        <h2 className="text-2xl font-bold text-gray-900">Subscribe to Our Newsletter</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Stay informed about our latest news, industry insights, and company updates.
        Subscribe to our newsletter for regular updates delivered to your inbox.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
        <div className="flex-grow">
          <Input
            type="email"
            placeholder="Enter your email address"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="bg-brand hover:bg-brand-600 whitespace-nowrap">
          Subscribe Now
        </Button>
      </form>
    </div>
  );
};

export default NewsletterSubscription;