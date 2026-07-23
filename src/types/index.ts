export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Allergen {
  name: string;
  severity: 'low' | 'medium' | 'high';
}
export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  allergies: Allergen[];
}
export interface Goal {
  key: string;
  label: string;
}
export interface HealthProfile {
  goals: Goal[];
  allergies: Allergen[];
  familyMembers: FamilyMember[];
}
export interface ApiError {
  code: string;
  message: string;
}
