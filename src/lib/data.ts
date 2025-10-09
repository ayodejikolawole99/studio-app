import type { Employee } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const employees: Employee[] = [
  { id: 'E-001', name: 'Alice Johnson', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp1')?.imageUrl ?? '' },
  { id: 'E-002', name: 'Bob Williams', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp2')?.imageUrl ?? '' },
  { id: 'E-003', name: 'Charlie Brown', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp3')?.imageUrl ?? '' },
  { id: 'E-004', name: 'Diana Miller', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp4')?.imageUrl ?? '' },
  { id: 'E-005', name: 'Ethan Garcia', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp5')?.imageUrl ?? '' },
  { id: 'E-006', name: 'Fiona Rodriguez', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp6')?.imageUrl ?? '' },
  { id: 'E-007', name: 'George Smith', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp7')?.imageUrl ?? '' },
  { id: 'E-008', name: 'Hannah Davis', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp8')?.imageUrl ?? '' },
  { id: 'E-009', name: 'Ian Martinez', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp9')?.imageUrl ?? '' },
  { id: 'E-010', name: 'Jane Wilson', avatarUrl: PlaceHolderImages.find(p => p.id === 'emp10')?.imageUrl ?? '' },
];
