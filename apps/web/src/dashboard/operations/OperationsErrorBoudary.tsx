// @/dashboard/operations/OperationsErrorBoundary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OperationsErrorBoundaryProps {
  children: React.ReactNode;
}

interface OperationsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class OperationsErrorBoundary extends React.Component<
  OperationsErrorBoundaryProps,
  OperationsErrorBoundaryState
> {
  constructor(props: OperationsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[OperationsDashboard] Widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Operations View Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A critical error occurred loading real-time logistics data.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Dashboard
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default OperationsErrorBoundary;