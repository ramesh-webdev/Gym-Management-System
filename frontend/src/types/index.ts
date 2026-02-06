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
  permissions?: string[]; // Optional permissions for restricted admins
}

export interface Member extends User {
  membershipId: string;
  membershipType: string;
  membershipExpiry: Date;
  joinDate: Date;
  payments: Payment[];
  hasPersonalTraining: boolean;
  dietPlan?: DietPlan;
}

export interface Trainer extends User {
  specialization: string[];
  experience: number;
  bio: string;
  rating: number;
  clients: string[];
  schedule: ScheduleSlot[];
}

// Membership Types
export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'supplements' | 'gear' | 'clothing' | 'other';
  image: string;
  stock: number;
  status: 'active' | 'inactive';
}

// Payment Types
export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'membership' | 'personal_training' | 'product' | 'other';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date: Date;
  dueDate?: Date;
  invoiceNumber: string;
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
  createdAt: Date;
  isActive: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment';
  isRead: boolean;
  createdAt: Date;
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
}
