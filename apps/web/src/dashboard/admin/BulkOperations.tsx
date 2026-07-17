import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BulkOperations = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock data for import history
  const importHistory = [
    {
      id: 'import1',
      timestamp: '2024-02-20 15:30:00',
      filename: 'users_batch_1.csv',
      records: 150,
      status: 'Completed',
      success: 148,
      failed: 2,
    },
    {
      id: 'import2',
      timestamp: '2024-02-19 14:20:00',
      filename: 'users_batch_2.csv',
      records: 100,
      status: 'Completed',
      success: 100,
      failed: 0,
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const simulateImport = () => {
    if (!selectedFile) return;

    setImporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Operations</h1>
          <p className="text-muted-foreground">Import and export user data in bulk</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download size={16} />
          Export Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Users</CardTitle>
            <CardDescription>Upload CSV file to import multiple users</CardDescription>
          </CardHeader>
          <CardContent>
            {importing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Importing users...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and
                        drop
                      </p>
                      <p className="text-xs text-gray-500">CSV files only</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                {selectedFile && (
                  <div className="space-y-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Selected file: {selectedFile.name}
                      </AlertDescription>
                    </Alert>
                    <Button
                      className="w-full"
                      onClick={simulateImport}
                    >
                      Start Import
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Guidelines</CardTitle>
            <CardDescription>Follow these steps for successful import</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Download Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Use our CSV template to ensure correct data format
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Prepare Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Fill in the template with your user data
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-medium">Important Notes</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Maximum 1000 users per import</li>
                    <li>Required fields must not be empty</li>
                    <li>Email addresses must be unique</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Previous bulk import operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importHistory.map((import_) => (
                  <TableRow key={import_.id}>
                    <TableCell className="font-medium">{import_.timestamp}</TableCell>
                    <TableCell>{import_.filename}</TableCell>
                    <TableCell>{import_.records}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {import_.failed === 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>{import_.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600">{import_.success}</TableCell>
                    <TableCell className="text-red-600">{import_.failed}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-500"
                      >
                        Download Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperations;