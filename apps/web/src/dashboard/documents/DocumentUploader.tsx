import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fileValidation } from '@/lib/file-validation';
import { DocumentsService, DocumentDTO } from '@/services';

interface DocumentUploaderProps {
  shipmentId: string;
  onUploaded?: (doc: DocumentDTO) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ shipmentId, onUploaded }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validator = fileValidation;
    const results = await validator.validateFiles(selected);
    const validFiles: File[] = [];
    results.forEach((result, idx) => {
      if (!result.valid) {
        toast({ title: 'Invalid file', description: result.errors.join(', '), variant: 'destructive' });
      } else {
        validFiles.push(selected[idx]);
      }
    });
    setFiles(validFiles);
  };

  const uploadAll = async () => {
    if (!shipmentId) {
      toast({ title: 'Missing shipment', description: 'No shipment selected for upload', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        setProgress(p => ({ ...p, [file.name]: 0 }));
        const res = await DocumentsService.upload(shipmentId, file, (pct) => {
          setProgress(p => ({ ...p, [file.name]: pct }));
        });
        onUploaded?.(res);
        toast({ title: 'Uploaded', description: `${file.name} uploaded successfully` });
      }
    } catch (e: any) {
      toast({ title: 'Upload failed', description: typeof e === 'string' ? e : 'Error uploading files', variant: 'destructive' });
    } finally {
      setUploading(false);
      setFiles([]);
      setProgress({});
    }
  };

  return (
    <div className="space-y-3">
      <Input type="file" multiple onChange={handleSelect} accept="image/jpeg,image/png,application/pdf" />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.name} className="space-y-1">
              <div className="text-sm">{f.name} ({(f.size / (1024*1024)).toFixed(2)} MB)</div>
              <Progress value={progress[f.name] || 0} />
            </div>
          ))}
          <Button onClick={uploadAll} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;