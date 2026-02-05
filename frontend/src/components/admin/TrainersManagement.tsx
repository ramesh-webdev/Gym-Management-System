import { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Users,
  Phone,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { mockTrainers } from '@/data/mockData';

export function TrainersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredTrainers = mockTrainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Trainers & Staff</h1>
          <p className="text-muted-foreground">Manage trainers and staff members</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
              <Plus className="w-4 h-4 mr-2" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add New Trainer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                  <Input className="bg-muted/50 border-border text-foreground" placeholder="John" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                  <Input className="bg-muted/50 border-border text-foreground" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input className="bg-muted/50 border-border text-foreground" placeholder="9876543210" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Specializations</label>
                <Input className="bg-muted/50 border-border text-foreground" placeholder="e.g. Strength Training, HIIT, Yoga" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Experience (years)</label>
                <Input type="number" className="bg-muted/50 border-border text-foreground" placeholder="5" />
              </div>
              <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                Create Trainer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search trainers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
        />
      </div>

      {/* Trainers Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => (
          <div
            key={trainer.id}
            className="p-6 rounded-xl bg-card/50 border border-border hover:border-border transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={trainer.avatar}
                  alt={trainer.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{trainer.name}</h3>
                  <div className="flex items-center gap-1 text-lime-500">
                    <Star className="w-4 h-4 fill-lime-500" />
                    <span className="text-sm font-medium">{trainer.rating}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-muted/50 cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-muted/50 cursor-pointer">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4" />
                {trainer.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="w-4 h-4" />
                {trainer.clients.length} active clients
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-2 mb-4">
              {trainer.specialization.map((spec, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-muted/50 text-muted-foreground hover:bg-muted"
                >
                  {spec}
                </Badge>
              ))}
            </div>

            {/* Experience & Status */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-muted-foreground text-sm">Experience</p>
                <p className="text-foreground font-medium">{trainer.experience} years</p>
              </div>
              <Badge className="bg-lime-500/20 text-lime-500">
                {trainer.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
