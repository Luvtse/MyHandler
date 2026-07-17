// components/awb/AWBStatusBadge.tsx (or wherever it's located)

import React from 'react';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AWBStatusBadgeProps {
  awbNumber: string;
  isLoading?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const AWBStatusBadge: React.FC<AWBStatusBadgeProps> = ({
  awbNumber,
  isLoading = false,
  className,
  showLabel = true,
}) => {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg", className)}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        <div className="flex flex-col">
          <span className="text-blue-700 text-sm font-medium">Generating AWB number...</span>
          <span className="text-blue-600 text-xs">This may take a few seconds</span>
        </div>
      </div>
    );
  }

  if (!awbNumber) return null;

  const { isValid, type, description } = validateAWBFormat(awbNumber);

  const getStatusConfig = () => {
    switch (type) {
      case 'draft':
        return {
          icon: Clock,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-700',
          iconColor: 'text-amber-600',
          label: 'Draft',
        };
      case 'final':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          iconColor: 'text-green-600',
          label: 'Final',
        };
      case 'invalid':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          label: 'Invalid',
        };
      default:
        return {
          icon: Package,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-600',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={cn(`p-3 border rounded-lg ${config.bgColor} ${config.borderColor}`, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
          <span className={`font-mono text-sm font-semibold ${config.textColor}`}>{awbNumber}</span>
        </div>
        {showLabel && (
          <span
            className={`px-2 py-1 text-xs rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
          >
            {config.label}
          </span>
        )}
      </div>
      {description && <p className={`text-xs mt-1 ${config.textColor}`}>{description}</p>}
    </div>
  );
};

// Shared AWB validation logic
const validateAWBFormat = (awb: string): {
  isValid: boolean;
  type: 'draft' | 'final' | 'invalid';
  description?: string;
} => {
  if (!awb) {
    return {
      isValid: false,
      type: 'invalid',
      description: 'AWB number is missing',
    };
  }

  // Draft format
  if (awb.startsWith('DRAFT-')) {
    return {
      isValid: true,
      type: 'draft',
      description: 'This is a draft AWB. Final number will be assigned on submission.',
    };
  }

  // Final IATA format: ANU + 2-digit year + 8-digit sequence = 13 chars total
  const iataAWBRegex = /^ANU\d{10}$/; // ANU + 10 digits = 13 characters

  if (iataAWBRegex.test(awb)) {
    return {
      isValid: true,
      type: 'final',
      description: 'Valid IATA AWB number',
    };
  }

  return {
    isValid: false,
    type: 'invalid',
    description: 'Invalid AWB format. Expected: ANUYYXXXXXXXX (13 characters)',
  };
};