
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  phone: z.string().regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
    message: 'Invalid phone number format.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  state: z.string().min(2, {
    message: 'State must be at least 2 characters.',
  }),
  zip: z.string().regex(/^\d{5}(?:-\d{4})?$/, {
    message: 'Invalid zip code format.',
  }),
  date: z.date(),
  time: z.string().min(5, {
    message: 'Time must be at least 5 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SchedulePickup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      date: new Date(),
      time: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Simulate network error occasionally
      if (Math.random() > 0.8) {
        throw new Error("Network connection issues");
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Submitting pickup request:", values);
      
      toast.success('Pickup scheduled successfully!');
      
      // Reset form after successful submission
      form.reset({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        date: new Date(),
        time: '',
      });
    } catch (error) {
      console.error("Pickup scheduling error:", error);
      
      if (error instanceof Error) {
        // Handle network or API errors
        if (error.message.includes("Network")) {
          setFormError("Network connection issue. Please check your internet connection and try again.");
        } else {
          // Handle critical errors that need user attention
          setCriticalError(error.message);
          setShowErrorDialog(true);
        }
      } else {
        toast.error('Failed to schedule pickup. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Schedule a Pickup</h1>
          <p className="text-gray-500 mb-8">
            Please fill out the form below to schedule a pickup for your
            shipment.
          </p>
          
          {/* Display form errors */}
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          className="logistics-input" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="Your phone number" 
                          className="logistics-input" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your address" 
                        className="logistics-input" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City" 
                          className="logistics-input" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="State" 
                          className="logistics-input" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Zip Code" 
                          className="logistics-input" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Pickup Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="logistics-input" 
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            try {
                              const date = e.target.value ? new Date(e.target.value) : null;
                              field.onChange(date);
                            } catch (err) {
                              console.error("Date parsing error:", err);
                              toast.error("Invalid date format");
                              field.onChange(new Date());
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Pickup Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          className="logistics-input" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Pickup
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-sm text-gray-500">
            Already scheduled a pickup?{' '}
            <Link to="/tracking" className="text-brand hover:underline">
              Track your shipment
            </Link>
          </div>
        </div>
      </div>
      
      {/* Critical Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error Scheduling Pickup</AlertDialogTitle>
            <AlertDialogDescription>
              {criticalError || "An unexpected error occurred while scheduling your pickup. Our team has been notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowErrorDialog(false);
              form.handleSubmit(onSubmit)();
            }}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default SchedulePickup;
