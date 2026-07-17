import { create } from 'zustand';
import { toast } from 'sonner';

interface ShipmentTemplate {
  id: string;
  name: string;
  recipient: string;
  items: string;
  frequency: string;
  lastUsed: string;
}

interface ShipmentTemplatesState {
  templates: ShipmentTemplate[];
  isLoading: boolean;
  error: string | null;
  addTemplate: (template: Omit<ShipmentTemplate, 'id' | 'lastUsed'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<ShipmentTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  resetError: () => void;
}

// Mock data for initial state
const initialTemplates: ShipmentTemplate[] = [
  {
    id: 'template1',
    name: 'Monthly Office Supplies',
    recipient: 'Branch Office A',
    items: 'Office supplies, documents',
    frequency: 'Monthly',
    lastUsed: '2024-02-15',
  },
  {
    id: 'template2',
    name: 'Weekly Product Delivery',
    recipient: 'Warehouse B',
    items: 'Product samples, marketing materials',
    frequency: 'Weekly',
    lastUsed: '2024-02-19',
  },
];

export const useShipmentTemplates = create<ShipmentTemplatesState>((set, get) => ({
  templates: initialTemplates,
  isLoading: false,
  error: null,

  addTemplate: async (templateData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTemplate: ShipmentTemplate = {
        ...templateData,
        id: `template${Date.now()}`,
        lastUsed: new Date().toISOString().split('T')[0],
      };

      set((state) => ({
        templates: [...state.templates, newTemplate],
        isLoading: false,
      }));

      toast.success('Template added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add template';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  updateTemplate: async (id, templateData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id ? { ...template, ...templateData } : template
        ),
        isLoading: false,
      }));

      toast.success('Template updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update template';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
        isLoading: false,
      }));

      toast.success('Template deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete template';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  resetError: () => set({ error: null }),
}));