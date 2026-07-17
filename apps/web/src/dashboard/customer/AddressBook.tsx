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
import { Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { useAddressBook } from '@/hooks/useAddressBook';
import AddressDialog from './AddressDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AddressBook = () => {
  const { addresses, isLoading, deleteAddress, addAddress, updateAddress, toggleFavorite } = useAddressBook();

  const handleAddAddress = async (addressData: any) => {
    await addAddress(addressData);
  };

  const handleUpdateAddress = async (id: string, addressData: any) => {
    await updateAddress(id, addressData);
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
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
            <CardTitle>Address Book</CardTitle>
            <CardDescription>Manage your saved addresses</CardDescription>
          </div>
          <AddressDialog mode="add" onSave={handleAddAddress} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Favorite</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map((address) => (
                <TableRow key={address.id}>
                  <TableCell className="font-medium">{address.name}</TableCell>
                  <TableCell>{address.contact}</TableCell>
                  <TableCell>
                    {address.address}, {address.city}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{address.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleFavorite(address.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${address.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <AddressDialog
                      mode="edit"
                      address={address}
                      onSave={(data) => handleUpdateAddress(address.id, data)}
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
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(address.id)}
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

export default AddressBook;