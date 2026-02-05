import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAttendance } from '@/data/mockData';

export function AttendanceManagement() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('list');

  const filteredAttendance = mockAttendance.filter((record) =>
    record.memberName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track member attendance and check-ins</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
            className={view === 'calendar' ? 'bg-lime-500 text-primary-foreground' : 'border-border text-foreground'}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-lime-500 text-primary-foreground' : 'border-border text-foreground'}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Check-ins', value: '87', icon: UserCheck, color: 'text-lime-500' },
          { label: 'Currently Active', value: '42', icon: Clock, color: 'text-blue-500' },
          { label: 'Weekly Average', value: '78', icon: CalendarIcon, color: 'text-purple-500' },
          { label: 'No Show Today', value: '15', icon: UserX, color: 'text-red-400' },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-card/50 border border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {view === 'calendar' ? (
        /* Calendar View */
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-muted-foreground text-sm py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const hasAttendance = day === 25 || day === 24;
              return (
                <button
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-colors ${
                    hasAttendance
                      ? 'bg-lime-500/20 border border-lime-500/30'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-foreground font-medium">{day}</span>
                  {hasAttendance && (
                    <span className="text-lime-500 text-xs">{day === 25 ? '87' : '92'}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search attendance records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
            />
          </div>

          {/* Attendance Table */}
          <div className="rounded-xl bg-card/50 border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Member</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Check In</TableHead>
                  <TableHead className="text-muted-foreground">Check Out</TableHead>
                  <TableHead className="text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  const duration = record.checkOut
                    ? Math.round((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / 60000)
                    : null;
                  
                  return (
                    <TableRow key={record.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center">
                            <span className="text-lime-500 text-sm font-medium">
                              {record.memberName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-foreground">{record.memberName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.checkOut
                            ? 'bg-lime-500/20 text-lime-500'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {record.checkOut ? 'Completed' : 'Active'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
