import { useState, type FormEvent } from 'react';
import {
    User,
    Activity,
    Calendar,
    Contact,
    Ruler,
    Weight,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { updateMe } from '@/api/auth';
import { toast } from 'sonner';
import type { MemberOnboardingData } from '@/types';

interface MemberOnboardingProps {
    onComplete: (data: any) => void;
    user: any;
}

export function MemberOnboarding({ onComplete, user }: MemberOnboardingProps) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        weight: '',
        height: '',
        fitnessGoals: [] as string[],
        medicalConditions: '',
        emergencyName: '',
        emergencyPhone: '',
    });

    const goals = [
        'Weight Loss',
        'Muscle Gain',
        'Cardio Fitness',
        'Flexibility',
        'Endurance',
        'Strength',
        'Overall Health',
        'Stress Relief'
    ];

    const handleGoalToggle = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            fitnessGoals: prev.fitnessGoals.includes(goal)
                ? prev.fitnessGoals.filter(g => g !== goal)
                : [...prev.fitnessGoals, goal]
        }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.age || !formData.gender || !formData.weight || !formData.height) {
                toast.error("Please fill in all fields (Age, Gender, Weight, Height)");
                return false;
            }
            // Validate numeric values
            const age = Number(formData.age);
            const weight = Number(formData.weight);
            const height = Number(formData.height);
            if (isNaN(age) || age <= 0 || age > 150) {
                toast.error("Please enter a valid age (1-150)");
                return false;
            }
            if (isNaN(weight) || weight <= 0 || weight > 500) {
                toast.error("Please enter a valid weight (1-500 kg)");
                return false;
            }
            if (isNaN(height) || height <= 0 || height > 300) {
                toast.error("Please enter a valid height (1-300 cm)");
                return false;
            }
        }
        if (currentStep === 2) {
            if (formData.fitnessGoals.length === 0) {
                toast.error("Please select at least one fitness goal");
                return false;
            }
        }
        if (currentStep === 3) {
            if (!formData.emergencyName || !formData.emergencyPhone) {
                toast.error("Please fill in all emergency contact fields");
                return false;
            }
            if (formData.emergencyPhone.length !== 10) {
                toast.error("Please enter a valid 10-digit phone number");
                return false;
            }
        }
        return true;
    };

    const validateAllSteps = () => {
        // Validate step 1
        if (!formData.age || !formData.gender || !formData.weight || !formData.height) {
            toast.error("Please complete Step 1: Personal Profile (Age, Gender, Weight, Height)");
            return false;
        }
        const age = Number(formData.age);
        const weight = Number(formData.weight);
        const height = Number(formData.height);
        if (isNaN(age) || age <= 0 || age > 150) {
            toast.error("Please enter a valid age (1-150)");
            return false;
        }
        if (isNaN(weight) || weight <= 0 || weight > 500) {
            toast.error("Please enter a valid weight (1-500 kg)");
            return false;
        }
        if (isNaN(height) || height <= 0 || height > 300) {
            toast.error("Please enter a valid height (1-300 cm)");
            return false;
        }
        // Validate step 2
        if (formData.fitnessGoals.length === 0) {
            toast.error("Please complete Step 2: Select at least one fitness goal");
            return false;
        }
        // Validate step 3
        if (!formData.emergencyName || !formData.emergencyPhone) {
            toast.error("Please complete Step 3: Emergency Contact (Name and Phone)");
            return false;
        }
        if (formData.emergencyPhone.length !== 10) {
            toast.error("Please enter a valid 10-digit emergency contact phone number");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            nextStep();
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validate all steps before submission
        if (!validateAllSteps()) {
            return;
        }

        setSaving(true);
        try {
            const onboardingData: MemberOnboardingData = {
                age: Number(formData.age),
                gender: formData.gender as 'male' | 'female' | 'other',
                weight: Number(formData.weight),
                height: Number(formData.height),
                fitnessGoals: formData.fitnessGoals,
                medicalConditions: formData.medicalConditions || undefined,
                emergencyContact: {
                    name: formData.emergencyName,
                    phone: formData.emergencyPhone,
                },
            };
            await updateMe({
                onboardingData,
                isOnboarded: true,
            });
            toast.success('Onboarding completed successfully!');
            onComplete(onboardingData);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save onboarding data');
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                        Welcome to KO Fitness, {user.name.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                        Let's get some basic details to personalize your experience.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={cn(
                                "h-2 flex-1 rounded-full bg-muted overflow-hidden",
                                s <= step && "bg-ko-500/20"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-full bg-gradient-to-r from-ko-500 to-ko-600 transition-all duration-500",
                                    s <= step ? "w-full" : "w-0 shadow-lg"
                                )}
                            />
                        </div>
                    ))}
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-ko-500/10 flex items-center justify-center text-ko-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl font-bold">Personal Profile</h2>
                                        <p className="text-sm text-muted-foreground">Your physical metrics</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Age</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="25"
                                                className="pl-10 bg-muted/50 border-border"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                required
                                                min="1"
                                                max="150"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Weight (kg)</label>
                                        <div className="relative">
                                            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="70"
                                                className="pl-10 bg-muted/50 border-border"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                required
                                                min="1"
                                                max="500"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Height (cm)</label>
                                        <div className="relative">
                                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="175"
                                                className="pl-10 bg-muted/50 border-border"
                                                value={formData.height}
                                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                required
                                                min="1"
                                                max="300"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    type="button"
                                    onClick={handleNext} 
                                    className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-ko-500/10 flex items-center justify-center text-ko-500">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl font-bold">Fitness Goals</h2>
                                        <p className="text-sm text-muted-foreground">What do you want to achieve?</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {goals.map((goal) => (
                                        <button
                                            key={goal}
                                            type="button"
                                            onClick={() => handleGoalToggle(goal)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border transition-all text-sm",
                                                formData.fitnessGoals.includes(goal)
                                                    ? "bg-ko-500/10 border-ko-500 text-foreground"
                                                    : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {goal}
                                            {formData.fitnessGoals.includes(goal) && (
                                                <CheckCircle2 className="w-4 h-4 text-ko-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Any Medical Conditions?</label>
                                    <Input
                                        placeholder="None / Asthama / Back pain..."
                                        className="bg-muted/50 border-border"
                                        value={formData.medicalConditions}
                                        onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        onClick={prevStep} 
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        type="button"
                                        onClick={handleNext} 
                                        className="flex-[2] bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground"
                                    >
                                        Next Step
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-ko-500/10 flex items-center justify-center text-ko-500">
                                        <Contact className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl font-bold">Emergency Contact</h2>
                                        <p className="text-sm text-muted-foreground">Safety first</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                                        <Input
                                            placeholder="Spouse / Parent / Friend"
                                            className="bg-muted/50 border-border"
                                            value={formData.emergencyName}
                                            onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                                                +91
                                            </span>
                                            <Input
                                                type="tel"
                                                placeholder="9876543210"
                                                className="rounded-l-none bg-muted border-border"
                                                value={formData.emergencyPhone}
                                                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                required
                                                pattern="[0-9]{10}"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        onClick={prevStep} 
                                        className="flex-1" 
                                        disabled={saving}
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-[2] bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground" 
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Complete Onboarding'}
                                        {!saving && <CheckCircle2 className="w-4 h-4 ml-2" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
