import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, RotateCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const BackupRestore = () => {
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock data for backup history
  const backupHistory = [
    {
      id: 'backup1',
      timestamp: '2024-02-20 10:00:00',
      size: '256 MB',
      type: 'Automated',
      status: 'Completed',
    },
    {
      id: 'backup2',
      timestamp: '2024-02-19 10:00:00',
      size: '255 MB',
      type: 'Manual',
      status: 'Completed',
    },
    {
      id: 'backup3',
      timestamp: '2024-02-18 10:00:00',
      size: '254 MB',
      type: 'Automated',
      status: 'Completed',
    },
  ];

  const simulateBackup = () => {
    setBackupInProgress(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBackupInProgress(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const simulateRestore = () => {
    setRestoreInProgress(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRestoreInProgress(false);
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
          <h1 className="text-2xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground">Manage system backups and restoration</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Backup</CardTitle>
            <CardDescription>Generate a new system backup</CardDescription>
          </CardHeader>
          <CardContent>
            {backupInProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backup in progress...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Last backup was created on {backupHistory[0].timestamp}
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    className="flex items-center gap-2"
                    onClick={simulateBackup}
                  >
                    <Download size={16} />
                    Create Backup
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RotateCw size={16} />
                    Schedule Backup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restore System</CardTitle>
            <CardDescription>Restore from a previous backup</CardDescription>
          </CardHeader>
          <CardContent>
            {restoreInProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Restore in progress...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Restoring will override current system data
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={simulateRestore}
                >
                  <Upload size={16} />
                  Restore System
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>List of previous system backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">{backup.timestamp}</TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>{backup.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{backup.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-500"
                      >
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500"
                      >
                        Delete
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

export default BackupRestore;