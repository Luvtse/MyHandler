import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2 } from 'lucide-react';
import { useShipmentTemplates } from '@/hooks/useShipmentTemplates';
import ShipmentTemplateDialog from './ShipmentTemplateDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ShipmentTemplates = () => {
  const { templates, isLoading, deleteTemplate, addTemplate, updateTemplate } = useShipmentTemplates();

  const handleAddTemplate = async (templateData: any) => {
    await addTemplate(templateData);
  };

  const handleUpdateTemplate = async (id: string, templateData: any) => {
    await updateTemplate(id, templateData);
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Shipment Templates</CardTitle>
            <CardDescription>Manage your saved shipment templates</CardDescription>
          </div>
          <ShipmentTemplateDialog mode="add" onSave={handleAddTemplate} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.recipient}</TableCell>
                  <TableCell>{template.items}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{template.frequency}</Badge>
                  </TableCell>
                  <TableCell>{template.lastUsed}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <ShipmentTemplateDialog
                      mode="edit"
                      template={template}
                      onSave={(data) => handleUpdateTemplate(template.id, data)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentTemplates;