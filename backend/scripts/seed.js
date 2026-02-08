require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const MembershipPlan = require('../src/models/MembershipPlan');
const Product = require('../src/models/Product');
const Payment = require('../src/models/Payment');
const Notification = require('../src/models/Notification');
const DietPlan = require('../src/models/DietPlan');
const Recipe = require('../src/models/Recipe');
const GymSettings = require('../src/models/GymSettings');
const Testimonial = require('../src/models/Testimonial');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kayal-gms';
const DEFAULT_PASSWORD = 'password123';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    MembershipPlan.deleteMany({}),
    Product.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    DietPlan.deleteMany({}),
    Recipe.deleteMany({}),
    GymSettings.deleteMany({}),
    Testimonial.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Membership plans
  const plans = await MembershipPlan.insertMany([
    { name: 'Monthly', description: 'Flexible monthly commitment for beginners', price: 1300, duration: 1, features: ['Access to gym equipment', 'Locker room access', 'Basic fitness assessment', 'Open gym hours'], isActive: true },
    { name: 'Quarterly', description: 'Commit to 3 months and save', price: 3400, duration: 3, features: ['All Monthly features', '1 Free PT session', 'Diet consultation', 'Quarterly progress check'], isActive: true },
    { name: 'Half Yearly', description: '6 months of dedicated fitness', price: 6300, duration: 6, features: ['All Quarterly features', '3 Free PT sessions', 'Advanced body composition analysis', 'Priority class booking'], isPopular: true, isActive: true },
    { name: 'Annually', description: 'Best value for year-round fitness', price: 9000, duration: 12, features: ['All Half Yearly features', '6 Free PT sessions', 'Personal locker', 'Unlimited guest passes', 'Free merchandise pack'], isActive: true },
    { name: 'Personal Training', description: 'Dedicated 1-on-1 coaching', price: 4000, duration: 1, features: ['Customized workout plan', 'Nutritional guidance', 'Weekly progress tracking', '24/7 Trainer support'], isActive: true },
  ]);
  const planPro = plans[1];
  const planElite = plans[2];
  const planBasic = plans[0];

  // Super Admin (full access; can create other admins with limited permissions)
  const admin = await User.create({
    name: 'Admin User',
    phone: '9876543210',
    passwordHash: hash,
    role: 'admin',
    status: 'active',
    isSuperAdmin: true,
    isOnboarded: true,
  });

  // Staff admin (limited permissions; for Settings > Staff Access demo)
  await User.create({
    name: 'Manager Sarah',
    phone: '9876543211',
    passwordHash: hash,
    role: 'admin',
    status: 'active',
    isSuperAdmin: false,
    permissions: ['admin-dashboard', 'admin-members', 'admin-plans'],
    isOnboarded: true,
  });

  // Members
  const member1 = await User.create({
    name: 'Sarah Johnson',
    phone: '9876543212',
    passwordHash: hash,
    role: 'member',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    membershipId: 'mem-001',
    membershipPlan: planPro._id,
    membershipType: 'Pro',
    membershipExpiry: new Date('2024-06-15'),
    joinDate: new Date('2023-03-15'),
    hasPersonalTraining: true,
    isOnboarded: true,
  });
  const member2 = await User.create({
    name: 'Michael Chen',
    phone: '9876543213',
    passwordHash: hash,
    role: 'member',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    membershipId: 'mem-002',
    membershipPlan: planElite._id,
    membershipType: 'Elite',
    membershipExpiry: new Date('2024-08-20'),
    joinDate: new Date('2023-05-20'),
    hasPersonalTraining: false,
    isOnboarded: true,
  });
  const member3 = await User.create({
    name: 'Emily Davis',
    phone: '9876543214',
    passwordHash: hash,
    role: 'member',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    membershipId: 'mem-003',
    membershipPlan: planBasic._id,
    membershipType: 'Basic',
    membershipExpiry: new Date('2024-02-10'),
    joinDate: new Date('2023-07-10'),
    hasPersonalTraining: false,
    isOnboarded: true,
  });
  const member4 = await User.create({
    name: 'James Wilson',
    phone: '9876543215',
    passwordHash: hash,
    role: 'member',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?u=james',
    membershipId: 'mem-004',
    membershipPlan: planPro._id,
    membershipType: 'Pro',
    membershipExpiry: new Date('2023-12-05'),
    joinDate: new Date('2023-01-05'),
    hasPersonalTraining: false,
    isOnboarded: true,
  });
  const member5 = await User.create({
    name: 'Amanda Brown',
    phone: '9876543216',
    passwordHash: hash,
    role: 'member',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=amanda',
    membershipId: 'mem-005',
    membershipPlan: planPro._id,
    membershipType: 'Pro',
    membershipExpiry: new Date('2024-09-01'),
    joinDate: new Date('2023-09-01'),
    hasPersonalTraining: true,
    isOnboarded: true,
  });

  // Trainers
  const trainer1 = await User.create({
    name: 'Marcus Johnson',
    phone: '9876543220',
    passwordHash: hash,
    role: 'trainer',
    status: 'active',
    avatar: '/trainer-1.jpg',
    specialization: ['Strength Training', 'Bodybuilding', 'Powerlifting'],
    experience: 8,
    bio: 'Certified strength coach with 8+ years of experience helping clients build muscle and increase strength.',
    rating: 4.9,
    clients: [member1._id, member2._id, member3._id],
  });
  const trainer2 = await User.create({
    name: 'Lisa Anderson',
    phone: '9876543221',
    passwordHash: hash,
    role: 'trainer',
    status: 'active',
    avatar: '/trainer-2.jpg',
    specialization: ['HIIT', 'Cardio', 'Weight Loss'],
    experience: 6,
    bio: 'High-energy trainer specializing in fat loss and cardiovascular fitness.',
    rating: 4.8,
    clients: [member4._id, member5._id],
  });

  // Products
  await Product.insertMany([
    { name: 'Whey Protein Isolate', description: 'Premium whey protein isolate for muscle recovery. 25g protein per serving.', price: 4500, category: 'supplements', image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=1000', stock: 50, status: 'active' },
    { name: 'Pre-Workout Energy', description: 'High energy pre-workout formula for intense training sessions.', price: 3200, category: 'supplements', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=1000', stock: 35, status: 'active' },
    { name: 'KO Fitness T-Shirt', description: 'Breathable performance fabric t-shirt with KO Fitness logo.', price: 1200, category: 'clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000', stock: 100, status: 'active' },
    { name: 'Lifting Straps', description: 'Heavy duty lifting straps for deadlifts and pull exercises.', price: 800, category: 'gear', image: 'https://images.unsplash.com/photo-1517963683444-15f51bac37d9?auto=format&fit=crop&q=80&w=1000', stock: 25, status: 'active' },
    { name: 'Multivitamin Complex', description: 'Daily essential vitamins and minerals for active lifestyles.', price: 1500, category: 'supplements', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000', stock: 60, status: 'inactive' },
  ]);

  // Payments
  await Payment.insertMany([
    { member: member1._id, memberName: 'Sarah Johnson', amount: 49, type: 'membership', status: 'paid', date: new Date('2024-01-01'), invoiceNumber: 'INV-2024-001' },
    { member: member2._id, memberName: 'Michael Chen', amount: 79, type: 'membership', status: 'paid', date: new Date('2024-01-05'), invoiceNumber: 'INV-2024-002' },
    { member: member3._id, memberName: 'Emily Davis', amount: 29, type: 'membership', status: 'pending', date: new Date('2024-01-10'), dueDate: new Date('2024-01-15'), invoiceNumber: 'INV-2024-003' },
    { member: member5._id, memberName: 'Amanda Brown', amount: 49, type: 'membership', status: 'paid', date: new Date('2024-01-12'), invoiceNumber: 'INV-2024-004' },
    { member: member1._id, memberName: 'Sarah Johnson', amount: 150, type: 'personal_training', status: 'paid', date: new Date('2024-01-15'), invoiceNumber: 'INV-2024-005' },
  ]);

  // Notifications (for admin)
  await Notification.insertMany([
    { user: admin._id, title: 'New Member Registration', message: 'John Smith has joined with a Pro membership.', type: 'info', isRead: false },
    { user: admin._id, title: 'Payment Received', message: 'Payment of $49 received from Sarah Johnson.', type: 'success', isRead: false },
    { user: admin._id, title: 'Membership Expiring', message: "Emily Davis's membership expires in 3 days.", type: 'warning', isRead: true },
  ]);

  // Diet plan for member1 (Sarah), by trainer2 (Lisa as nutritionist)
  await DietPlan.create({
    member: member1._id,
    nutritionist: trainer2._id,
    name: 'Lean Muscle Nutrition',
    dailyCalories: 2200,
    macros: { protein: 165, carbs: 220, fats: 73 },
    meals: [
      { type: 'breakfast', foods: ['Oatmeal with protein powder', 'Banana', 'Almonds'], calories: 550, time: '7:00 AM' },
      { type: 'lunch', foods: ['Grilled chicken breast', 'Brown rice', 'Steamed vegetables'], calories: 650, time: '12:30 PM' },
      { type: 'dinner', foods: ['Salmon fillet', 'Sweet potato', 'Asparagus'], calories: 600, time: '7:00 PM' },
      { type: 'snack', foods: ['Greek yogurt', 'Mixed berries'], calories: 200, time: '3:30 PM' },
    ],
  });

  // Recipes
  await Recipe.create({
    name: 'Protein Oats',
    description: 'High-protein oatmeal for breakfast.',
    category: 'breakfast',
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    calories: 400,
    macros: { protein: 25, carbs: 45, fats: 12 },
    ingredients: ['Oats', 'Protein powder', 'Banana', 'Almond milk'],
    instructions: ['Cook oats', 'Stir in protein powder', 'Top with banana'],
    tags: ['breakfast', 'high-protein'],
    createdBy: admin._id,
    isActive: true,
  });

  // Gym settings (single doc)
  await GymSettings.create({
    name: 'KO Fitness',
    address: '123 Fitness Ave',
    phone: '9876543210',
    workingHours: { open: '06:00', close: '22:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    socialLinks: {},
  });

  // Testimonials
  await Testimonial.insertMany([
    { name: 'Jennifer Lee', role: 'Member since 2022', avatar: 'https://i.pravatar.cc/150?u=jennifer', content: 'KO Fitness completely transformed my fitness journey. The trainers are exceptional and the facilities are top-notch!', rating: 5 },
    { name: 'Robert Taylor', role: 'Member since 2023', avatar: 'https://i.pravatar.cc/150?u=robert', content: "Best gym I've ever been to. The equipment is always maintained and the atmosphere is motivating.", rating: 5 },
    { name: 'Maria Garcia', role: 'Member since 2021', avatar: 'https://i.pravatar.cc/150?u=maria', content: 'The personal training sessions have helped me achieve goals I never thought possible. Highly recommend!', rating: 5 },
  ]);

  console.log('Seed completed successfully.');
  console.log('');
  console.log('Login credentials (password for all):', DEFAULT_PASSWORD);
  console.log('  Admin:  9876543210');
  console.log('  Member: 9876543212 (Sarah), 9876543213 (Michael), 9876543214 (Emily), 9876543215 (James), 9876543216 (Amanda)');
  console.log('  Trainer: 9876543220 (Marcus), 9876543221 (Lisa)');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
