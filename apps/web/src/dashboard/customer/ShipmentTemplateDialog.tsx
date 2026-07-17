import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit } from 'lucide-react';

interface ShipmentTemplateDialogProps {
  mode: 'add' | 'edit';
  template?: {
    id: string;
    name: string;
    recipient: string;
    items: string;
    frequency: string;
    lastUsed: string;
  };
  onSave: (template: Omit<ShipmentTemplateDialogProps['template'], 'id' | 'lastUsed'>) => void;
}

const ShipmentTemplateDialog: React.FC<ShipmentTemplateDialogProps> = ({ mode, template, onSave }) => {
  const [formData, setFormData] = React.useState({
    name: template?.name || '',
    recipient: template?.recipient || '',
    items: template?.items || '',
    frequency: template?.frequency || 'Monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === 'add' ? (
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            New Template
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Template' : 'Edit Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monthly Office Supplies"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="e.g., Branch Office A"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="items">Items</Label>
            <Textarea
              id="items"
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              placeholder="e.g., Office supplies, documents"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {mode === 'add' ? 'Create Template' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentTemplateDialog;