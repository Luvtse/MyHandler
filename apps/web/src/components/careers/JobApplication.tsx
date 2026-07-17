import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface JobApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  resume: FileList;
  coverLetter: string;
}

interface JobApplicationProps {
  jobTitle: string;
  onClose: () => void;
}

const JobApplication: React.FC<JobApplicationProps> = ({ jobTitle, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<JobApplicationFormData>();
  const { toast } = useToast();

  const onSubmit = async (data: JobApplicationFormData) => {
    try {
      // Simulate job application submission with success
      
      // Add realistic delay to simulate file upload and API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Application Submitted Successfully',
        description: 'Thank you for your application. Our HR team will review it and contact you within 5-7 business days.',
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for {jobTitle}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'First name is required' })}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'Last name is required' })}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
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
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              {...register('experience', { required: 'Experience is required' })}
              className={errors.experience ? 'border-red-500' : ''}
            />
            {errors.experience && (
              <p className="text-red-500 text-sm">{errors.experience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              {...register('resume', { required: 'Resume is required' })}
              className={errors.resume ? 'border-red-500' : ''}
            />
            {errors.resume && (
              <p className="text-red-500 text-sm">{errors.resume.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              {...register('coverLetter', { required: 'Cover letter is required' })}
              className={errors.coverLetter ? 'border-red-500' : ''}
              rows={6}
            />
            {errors.coverLetter && (
              <p className="text-red-500 text-sm">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand hover:bg-brand-600">
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplication;