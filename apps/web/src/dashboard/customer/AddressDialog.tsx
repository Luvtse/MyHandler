import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface AddressDialogProps {
  mode: 'add' | 'edit';
  address?: {
    id: string;
    name: string;
    contact: string;
    address: string;
    city: string;
    category: string;
    favorite: boolean;
  };
  onSave: (address: Omit<AddressDialogProps['address'], 'id'>) => void;
}

const AddressDialog: React.FC<AddressDialogProps> = ({ mode, address, onSave }) => {
  const [formData, setFormData] = React.useState({
    name: address?.name || '',
    contact: address?.contact || '',
    address: address?.address || '',
    city: address?.city || '',
    category: address?.category || 'Office',
    favorite: address?.favorite || false,
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
            Add Address
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus size={16} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Address' : 'Edit Address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Office"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="e.g., John Smith"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., 123 Business Ave, Suite 100"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., New York"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite"
              checked={formData.favorite}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, favorite: checked as boolean })
              }
            />
            <Label htmlFor="favorite">Mark as favorite</Label>
          </div>
          <Button type="submit" className="w-full">
            {mode === 'add' ? 'Add Address' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;