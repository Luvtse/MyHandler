import { create } from 'zustand';
import { toast } from 'sonner';

interface Address {
  id: string;
  name: string;
  contact: string;
  address: string;
  city: string;
  category: string;
  favorite: boolean;
}

interface AddressBookState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  resetError: () => void;
}

// Mock data for initial state
const initialAddresses: Address[] = [
  {
    id: 'addr1',
    name: 'Main Office',
    contact: 'John Smith',
    address: '123 Business Ave, Suite 100',
    city: 'New York',
    category: 'Office',
    favorite: true,
  },
  {
    id: 'addr2',
    name: 'Warehouse B',
    contact: 'Mike Johnson',
    address: '456 Industrial Park',
    city: 'Chicago',
    category: 'Warehouse',
    favorite: false,
  },
];

export const useAddressBook = create<AddressBookState>((set, get) => ({
  addresses: initialAddresses,
  isLoading: false,
  error: null,

  addAddress: async (addressData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newAddress: Address = {
        ...addressData,
        id: `addr${Date.now()}`,
      };

      set((state) => ({
        addresses: [...state.addresses, newAddress],
        isLoading: false,
      }));

      toast.success('Address added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add address';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  updateAddress: async (id, addressData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        addresses: state.addresses.map((addr) =>
          addr.id === id ? { ...addr, ...addressData } : addr
        ),
        isLoading: false,
      }));

      toast.success('Address updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update address';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        addresses: state.addresses.filter((addr) => addr.id !== id),
        isLoading: false,
      }));

      toast.success('Address deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  toggleFavorite: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        addresses: state.addresses.map((addr) =>
          addr.id === id ? { ...addr, favorite: !addr.favorite } : addr
        ),
        isLoading: false,
      }));

      toast.success('Favorite status updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite status';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  resetError: () => set({ error: null }),
}));