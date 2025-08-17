import { DigitalResource } from '@/types/api';

// Minimal fallback data for when API is unavailable
// In production, this should be empty or contain only essential placeholder data
export const initialDigitalResources: DigitalResource[] = [];

// In a real app, this would be connected to a database or API
let digitalResourcesData = [...initialDigitalResources];

export function getDigitalResources(): DigitalResource[] {
  return digitalResourcesData;
}

export function addDigitalResource(resource: Omit<DigitalResource, "id">): DigitalResource {
  const newResource: DigitalResource = {
    ...resource,
    id: (digitalResourcesData.length + 1).toString(),
  };
  digitalResourcesData.push(newResource);
  return newResource;
}

export function updateDigitalResource(id: string, resource: Partial<DigitalResource>): DigitalResource | null {
  const index = digitalResourcesData.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  digitalResourcesData[index] = { ...digitalResourcesData[index], ...resource };
  return digitalResourcesData[index];
}

export function deleteDigitalResource(id: string): boolean {
  const index = digitalResourcesData.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  digitalResourcesData.splice(index, 1);
  return true;
}
