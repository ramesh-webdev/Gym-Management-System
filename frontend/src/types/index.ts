// User Types
export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'member' | 'trainer';
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
  /** True = full access (super-admin). False/undefined = access limited by permissions (admin created by super-admin). */
  isSuperAdmin?: boolean;
  /** Menu/feature IDs this admin can access. Only used when isSuperAdmin is false. */
  permissions?: string[];
  isOnboarded?: boolean; // Track if the user has completed onboarding
  /** Member-specific: whether they have personal training (enables diet plan access). */
  hasPersonalTraining?: boolean;
}

export interface MemberOnboardingData {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number; // in kg
  height?: number; // in cm
  fitnessGoals?: string[];
  medicalConditions?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface Member extends User {
  membershipId: string;
  membershipPlan?: string | MembershipPlan | null;
  membershipType: string;
  membershipExpiry: Date;
  joinDate: Date;
  payments: Payment[];
  hasPersonalTraining: boolean;
  assignedTrainer?: { id: string; name: string; phone: string } | null;
  dietPlan?: DietPlan;
  onboardingData?: MemberOnboardingData;
}

export interface Trainer extends User {
  specialization: string[];
  experience: number;
  bio: string;
  rating: number;
  clients: string[];
  clientsCount?: number;
  schedule?: ScheduleSlot[];
}

// Membership Types
export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months (0 or unused for add-on plans)
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  /** Add-on plan (e.g. Personal Training) – not a monthly membership */
  isAddOn?: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'supplements' | 'gear' | 'clothing' | 'other';
  image: string;
  cloudinaryId?: string;
  stock: number;
  status: 'active' | 'inactive';
}

// Payment Types (API: date/dueDate/createdAt are ISO strings)
export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'membership' | 'personal_training' | 'product' | 'other';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date: string; // ISO from API
  dueDate?: string | null;
  invoiceNumber: string;
  createdAt?: string;
  /** Populated by API for display: plan name (membership), product name (product), etc. */
  planName?: string | null;
  productName?: string | null;
  addPersonalTraining?: boolean;
}



// Schedule Types
export interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  trainerId?: string;
  trainerName?: string;
  capacity: number;
  booked: number;
}

// Diet Plans
export interface DietPlan {
  id: string;
  memberId: string;
  nutritionistId: string;
  name: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  calories: number;
  time: string;
}

// Recipe Types
export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'smoothie';
  image?: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: string[];
  instructions: string[];
  tags: string[];
  createdBy: string; // admin/trainer ID
  createdByName?: string; // populated from backend
  createdAt: Date | string; // ISO string from API
  isActive: boolean;
}

// Notification Types
export type NotificationKind =
  | 'general'
  | 'membership'
  | 'diet_plan'
  | 'assignment'
  | 'payment'
  | 'announcement';

export interface Notification {
  id: string;
  userId: string;
  /** Set when listing with scope=all (admin); recipient's display name */
  recipientName?: string | null;
  /** Set when listing with scope=all (admin); recipient's role */
  recipientRole?: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment';
  kind?: NotificationKind;
  isRead: boolean;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string; // ISO from API
}

// Dashboard Stats
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  expiringMemberships: number;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  type: 'revenue' | 'members' | 'trainers';
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
}

// Settings Types
export interface GymSettings {
  name: string;
  address: string;
  phone: string;
  logo?: string;
  workingHours: {
    open: string;
    close: string;
    days: string[];
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  /** Personal training add-on price (per member, not part of any plan) */
  personalTrainingPrice?: number;
}
