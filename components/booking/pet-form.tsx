'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PetInfo {
  name: string;
  breed: string;
  weightKg: number;
  ageYears: number;
  notes: string;
  aggressive: boolean;
  specialCare: boolean;
  vaccinationsUrl: string[];
}

interface PetFormProps {
  petInfo: PetInfo;
  onChange: (petInfo: PetInfo) => void;
}

export function PetForm({ petInfo, onChange }: PetFormProps) {
  const updatePetInfo = (field: keyof PetInfo, value: any) => {
    onChange({ ...petInfo, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petName">Pet Name *</Label>
          <Input
            id="petName"
            value={petInfo.name}
            onChange={(e) => updatePetInfo('name', e.target.value)}
            placeholder="e.g., Buddy"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="breed">Breed *</Label>
          <Input
            id="breed"
            value={petInfo.breed}
            onChange={(e) => updatePetInfo('breed', e.target.value)}
            placeholder="e.g., Golden Retriever"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="weight">Weight (kg) *</Label>
          <Input
            id="weight"
            type="number"
            min="0.1"
            step="0.1"
            value={petInfo.weightKg || ''}
            onChange={(e) => updatePetInfo('weightKg', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 25.5"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="age">Age (years) *</Label>
          <Input
            id="age"
            type="number"
            min="0"
            step="1"
            value={petInfo.ageYears || ''}
            onChange={(e) => updatePetInfo('ageYears', parseInt(e.target.value) || 0)}
            placeholder="e.g., 3"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="petNotes">Special Notes</Label>
        <Textarea
          id="petNotes"
          value={petInfo.notes}
          onChange={(e) => updatePetInfo('notes', e.target.value)}
          placeholder="Any special instructions, medical conditions, dietary requirements, etc."
          rows={3}
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="aggressive"
            checked={petInfo.aggressive}
            onCheckedChange={(checked) => updatePetInfo('aggressive', checked as boolean)}
          />
          <Label htmlFor="aggressive" className="text-sm">
            My pet can be aggressive or reactive with other dogs or people
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="specialCare"
            checked={petInfo.specialCare}
            onCheckedChange={(checked) => updatePetInfo('specialCare', checked as boolean)}
          />
          <Label htmlFor="specialCare" className="text-sm">
            My pet requires special care or has medical conditions
          </Label>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Vaccination Requirements</h4>
        <p className="text-sm text-yellow-700">
          All pets must be up-to-date on vaccinations (rabies, DHPP, bordetella). 
          Please bring vaccination records or have your vet email them to us at BeautifulSoulsPetBoarding@hotmail.com.
        </p>
      </div>
    </div>
  );
}
