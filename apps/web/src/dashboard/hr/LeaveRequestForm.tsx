// src/dashboard/hr/LeaveRequestForm.tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar, FileText, Phone, UserCheck, Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Calendar as CalendarComponent } from '@/shared/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';
import { useLeaveTypes, useLeaveApprovers } from '@/hooks/useLeaveRequests';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/shared/ui/Alert';

interface LeaveRequestFormData {
  leaveType?: string;
  startDate?: Date;
  endDate?: Date;
  reason: string;
  emergencyContact: string;
  managerId?: string;
  hrId?: string;
  backupEmployeeId?: string;
  documents?: File[];
}

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<LeaveRequestFormData>;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  isLoading: externalLoading = false,
  defaultValues
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch, 
    control,
    reset 
  } = useForm<LeaveRequestFormData>({
    defaultValues: {
      leaveType: undefined,
      emergencyContact: '',
      reason: '',
      backupEmployeeId: undefined,
      ...defaultValues
    }
  });

  // Fetch data with proper typing
  const { data: leaveTypes = [], isLoading: isLoadingTypes } = useLeaveTypes();
  const { data: approversResponse, isLoading: isLoadingApprovers } = useLeaveApprovers();
  
  // Extract approvers with safe fallbacks
  const managers = approversResponse?.managers ?? [];
  const hrStaff = approversResponse?.hrStaff ?? [];
  const backupEmployees = approversResponse?.backupEmployees ?? [];
  
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const leaveType = watch('leaveType');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: LeaveRequestFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit({
        ...data,
        documents: uploadedFiles
      });
      reset();
      setUploadedFiles([]);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = externalLoading || isSubmitting || isLoadingTypes || isLoadingApprovers;

  if (isLoadingTypes || isLoadingApprovers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedLeaveType = leaveTypes.find(t => t.id === leaveType);
  const remainingDays = selectedLeaveType?.remainingDays || 0;
  const requestedDays = calculateDays();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Leave Type and Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type *</Label>
          <Controller
            name="leaveType"
            control={control}
            rules={{ required: 'Leave type is required' }}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="leaveType"
                  className={cn(errors.leaveType && "border-red-500")}
                >
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex justify-between items-center w-full gap-4">
                        <span>{type.name}</span>
                        <span className={cn(
                          "text-xs",
                          type.remainingDays !== null && type.remainingDays <= 3 ? "text-red-500 font-medium" : "text-muted-foreground"
                        )}>
                          {type.remainingDays ?? type.daysPerYear} days
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.leaveType && (
            <p className="text-sm text-red-500">{errors.leaveType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="emergencyContact"
              {...register('emergencyContact', { 
                required: 'Emergency contact is required',
                pattern: {
                  value: /^[+]?[\d\s-()]{7,}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              placeholder="+251 9XX XXX XXXX"
              className={cn("pl-10", errors.emergencyContact && "border-red-500")}
              disabled={isLoading}
            />
          </div>
          {errors.emergencyContact && (
            <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
          )}
        </div>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Controller
            name="startDate"
            control={control}
            rules={{ 
              required: 'Start date is required',
              validate: (value) => {
                if (value) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (value < today) {
                    return 'Start date cannot be in the past';
                  }
                }
                return true;
              }
            }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal", 
                      !field.value && "text-muted-foreground",
                      errors.startDate && "border-red-500"
                    )} 
                    disabled={isLoading}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent 
                    mode="single" 
                    selected={field.value} 
                    onSelect={field.onChange} 
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today || date > new Date(today.getFullYear() + 1, 11, 31);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <Controller
            name="endDate"
            control={control}
            rules={{ 
              required: 'End date is required',
              validate: (value) => {
                if (startDate && value < startDate) {
                  return 'End date must be after start date';
                }
                if (startDate && value) {
                  const maxEndDate = new Date(startDate);
                  maxEndDate.setMonth(maxEndDate.getMonth() + 3);
                  if (value > maxEndDate) {
                    return 'Leave cannot exceed 3 months';
                  }
                }
                return true;
              }
            }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal", 
                      !field.value && "text-muted-foreground",
                      errors.endDate && "border-red-500"
                    )} 
                    disabled={isLoading || !startDate}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent 
                    mode="single" 
                    selected={field.value} 
                    onSelect={field.onChange} 
                    disabled={(date) => {
                      if (!startDate) return true;
                      return date < startDate;
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Approvers Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Approvers & Backup</h3>
          <span className="text-xs text-muted-foreground">(Required)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manager Selection */}
          <div className="space-y-2">
            <Label htmlFor="managerId">Reporting Manager *</Label>
            <Controller
              name="managerId"
              control={control}
              rules={{ required: 'Please select a manager' }}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={isLoading || managers.length === 0}
                >
                  <SelectTrigger 
                    id="managerId"
                    className={cn(errors.managerId && "border-red-500")}
                  >
                    <SelectValue placeholder="Select your manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>{manager.name}</span>
                          {manager.departmentId && (
                            <span className="text-xs text-muted-foreground">
                              ({manager.departmentId})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {managers.length === 0 && (
                      <SelectItem value="no-manager" disabled>
                        No managers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.managerId && (
              <p className="text-sm text-red-500">{errors.managerId.message}</p>
            )}
          </div>

          {/* HR Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="hrId">HR Approver *</Label>
            <Controller
              name="hrId"
              control={control}
              rules={{ required: 'Please select an HR approver' }}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={isLoading || hrStaff.length === 0}
                >
                  <SelectTrigger 
                    id="hrId"
                    className={cn(errors.hrId && "border-red-500")}
                  >
                    <SelectValue placeholder="Select HR staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrStaff.map((hr) => (
                      <SelectItem key={hr.id} value={hr.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{hr.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({hr.role?.replace('_', ' ')})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    {hrStaff.length === 0 && (
                      <SelectItem value="no-hr" disabled>
                        No HR staff available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.hrId && (
              <p className="text-sm text-red-500">{errors.hrId.message}</p>
            )}
          </div>
        </div>

        {/* Backup Employee Selection */}
        <div className="space-y-2">
          <Label htmlFor="backupEmployeeId">Backup Employee </Label>
          <Controller
            name="backupEmployeeId"
            control={control}
            render={({ field }) => (
              <Select 
                onValueChange={(val) => field.onChange(val === 'none' ? undefined : val)} 
                value={field.value || 'none'}
                disabled={isLoading}
              >
                <SelectTrigger id="backupEmployeeId">
                  <SelectValue placeholder="Select backup person (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {backupEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        <span>{employee.name}</span>
                        {employee.departmentId && (
                          <span className="text-xs text-muted-foreground">
                            ({employee.departmentId})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Leave Summary */}
      {startDate && endDate && leaveType && (
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Leave Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">
                {requestedDays} day{requestedDays !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leave Type:</span>
              <span className="font-medium">{selectedLeaveType?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className={cn(
                "font-medium",
                remainingDays - requestedDays < 0 ? "text-red-500" : "text-green-600"
              )}>
                {remainingDays} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining After:</span>
              <span className={cn(
                "font-medium",
                remainingDays - requestedDays < 0 ? "text-red-500" : "text-green-600"
              )}>
                {remainingDays - requestedDays} days
              </span>
            </div>
          </div>
          {remainingDays - requestedDays < 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient leave balance. You need {Math.abs(remainingDays - requestedDays)} more day(s).
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Leave *</Label>
        <Textarea
          id="reason"
          {...register('reason', { 
            required: 'Please provide a reason',
            minLength: {
              value: 10,
              message: 'Reason must be at least 10 characters'
            },
            maxLength: {
              value: 500,
              message: 'Reason must not exceed 500 characters'
            }
          })}
          placeholder="Please provide a detailed reason for your leave request..."
          className={cn(
            "min-h-[120px]",
            errors.reason && "border-red-500"
          )}
          disabled={isLoading}
        />
        {errors.reason && (
          <p className="text-sm text-red-500">{errors.reason.message}</p>
        )}
      </div>

      {/* Supporting Documents Upload */}
      <div className="space-y-2">
        <Label>Supporting Documents (Optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden" 
            id="file-upload"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Click to upload medical certificates or other documents
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, DOCX, JPG, PNG up to 5MB each
            </p>
          </label>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading || (remainingDays - requestedDays < 0 && requestedDays > 0)} 
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Leave Request'
        )}
      </Button>
    </form>
  );
};
