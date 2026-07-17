// @/components/executive/RegionSelector.tsx
import React from 'react';
import { useAuth } from '@/features/auth/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';

// Define valid regions (match your backend)
const REGIONS = [
  { id: 'addis_ababa', name: 'Addis Ababa' },
  { id: 'dire_dawa', name: 'Dire Dawa' },
  { id: 'hawassa', name: 'Hawassa' },
  { id: 'mekelle', name: 'Mekelle' },
  { id: 'bahir_dar', name: 'Bahir Dar' },
];

interface RegionSelectorProps {
  currentRegion: string;
  onRegionChange: (regionId: string) => void;
  className?: string;
}

const RegionSelector = ({ currentRegion, onRegionChange, className }: RegionSelectorProps) => {
  const { user } = useAuth();
  
  // Regional managers can only view their own region
  if (user?.role === 'regional_manager') {
    const myRegion = REGIONS.find(r => r.id === user.region);
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <MapPin className="h-4 w-4" />
        <span>{myRegion?.name || 'Unknown Region'}</span>
      </div>
    );
  }

  // COO, CEO, admin can switch regions
  return (
    <Select value={currentRegion} onValueChange={onRegionChange}>
      <SelectTrigger className={className}>
        <MapPin className="h-4 w-4 mr-2 opacity-70" />
        <SelectValue placeholder="Select region" />
      </SelectTrigger>
      <SelectContent>
        {REGIONS.map(region => (
          <SelectItem key={region.id} value={region.id}>
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RegionSelector;