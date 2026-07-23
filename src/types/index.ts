export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Allergen {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  lastUpdated?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'child' | 'spouse' | 'parent' | 'sibling' | 'other';
  allergies: Allergen[];
  dietaryPreferences: string[];
}

export type Goal =
  | 'WEIGHT_MANAGEMENT'
  | 'DIABETES_CONTROL'
  | 'ALLERGY_MANAGEMENT'
  | 'HEART_HEALTH'
  | 'GENERAL_WELLNESS';

export interface HealthProfile {
  userId: string;
  allergies: Allergen[];
  conditions: string[];
  goals: Goal[];
  dietaryPreferences: string[];
  familyMembers: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: number;
  message: string;
  details?: unknown;
}
