import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  User,
  Utensils,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Dumbbell,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMyClients, getClientDetails } from '@/api/trainers';
import { getStoredUser } from '@/api/auth';
import type { Member, DietPlan } from '@/types';
import { formatDate } from '@/utils/date';
import { toast } from 'sonner';

export function TrainerDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Member & { dietPlan?: DietPlan | null } | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loadingClientDetails, setLoadingClientDetails] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getMyClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (error: any) {
      // Only show error if it's not a 401/403 (those will be handled by auth)
      if (error?.status !== 401 && error?.status !== 403) {
        toast.error(error?.message || 'Failed to load clients');
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = async (client: Member) => {
    try {
      setLoadingClientDetails(true);
      setIsDetailsDialogOpen(true);
      const details = await getClientDetails(client.id);
      setSelectedClient(details);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load client details');
      setIsDetailsDialogOpen(false);
    } finally {
      setLoadingClientDetails(false);
    }
  };

  const activeClients = clients.filter((c) => c.status === 'active');
  const ptClients = clients.filter((c) => c.hasPersonalTraining);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || 'Trainer'}
            </span>
            !
          </h1>
          <p className="text-muted-foreground">Manage your clients and their fitness journeys</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-foreground">{activeClients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">PT Clients</p>
              <p className="text-2xl font-bold text-foreground">{ptClients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">My Clients</h2>
        {loading ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No clients assigned yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="p-6 rounded-xl bg-card/50 border border-border hover:border-ko-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ko-500 to-ko-600 flex items-center justify-center text-primary-foreground font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-ko-500 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-ko-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {client.status}
                    </Badge>
                    {client.hasPersonalTraining && (
                      <Badge className="bg-purple-500/20 text-purple-500 text-xs">PT</Badge>
                    )}
                  </div>
                  {client.membershipType && (
                    <p className="text-sm text-muted-foreground">Plan: {client.membershipType}</p>
                  )}
                  {client.membershipExpiry && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {formatDate(client.membershipExpiry)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
          {loadingClientDetails ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading client details...</p>
            </div>
          ) : selectedClient ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selectedClient.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedClient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                  {selectedClient.membershipType && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Membership Plan</p>
                      <p className="text-foreground">{selectedClient.membershipType}</p>
                    </div>
                  )}
                  {selectedClient.membershipExpiry && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Expiry Date</p>
                      <p className="text-foreground">
                        {formatDate(selectedClient.membershipExpiry)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Onboarding Data */}
                {selectedClient.onboardingData && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-3">Fitness Profile</h3>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                      {selectedClient.onboardingData.age && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Age</p>
                          <p className="text-foreground font-medium">{selectedClient.onboardingData.age} years</p>
                        </div>
                      )}
                      {selectedClient.onboardingData.weight && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Weight</p>
                          <p className="text-foreground font-medium">{selectedClient.onboardingData.weight} kg</p>
                        </div>
                      )}
                      {selectedClient.onboardingData.height && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Height</p>
                          <p className="text-foreground font-medium">{selectedClient.onboardingData.height} cm</p>
                        </div>
                      )}
                      {selectedClient.onboardingData.gender && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Gender</p>
                          <p className="text-foreground font-medium capitalize">
                            {selectedClient.onboardingData.gender}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedClient.onboardingData.fitnessGoals && selectedClient.onboardingData.fitnessGoals.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Fitness Goals</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedClient.onboardingData.fitnessGoals.map((goal, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedClient.onboardingData.medicalConditions && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Medical Conditions</p>
                        <p className="text-foreground text-sm">{selectedClient.onboardingData.medicalConditions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Diet Plan */}
                {selectedClient.hasPersonalTraining && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      Diet Plan
                    </h3>
                    {selectedClient.dietPlan ? (
                      <div className="p-4 rounded-lg bg-muted/30 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">{selectedClient.dietPlan.name}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Daily Calories</p>
                              <p className="text-foreground font-medium flex items-center gap-2">
                                <Flame className="w-4 h-4 text-ko-500" />
                                {selectedClient.dietPlan.dailyCalories} kcal
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Meals</p>
                              <p className="text-foreground font-medium">
                                {selectedClient.dietPlan.meals?.length || 0} meals
                              </p>
                            </div>
                          </div>
                          {selectedClient.dietPlan.macros && (
                            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Protein</p>
                                <p className="text-sm font-medium text-foreground">
                                  {selectedClient.dietPlan.macros.protein}g
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Carbs</p>
                                <p className="text-sm font-medium text-foreground">
                                  {selectedClient.dietPlan.macros.carbs}g
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Fats</p>
                                <p className="text-sm font-medium text-foreground">
                                  {selectedClient.dietPlan.macros.fats}g
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/30 text-center">
                        <p className="text-muted-foreground text-sm">No diet plan assigned yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
