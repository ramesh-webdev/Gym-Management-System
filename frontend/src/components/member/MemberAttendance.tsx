import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  CalendarDays,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAttendance, mockMembers } from '@/data/mockData';

export function MemberAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const member = mockMembers[0];

  // Filter attendance for current member
  const myAttendance = mockAttendance.filter(a => a.memberId === member.id);

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

  // Check if a day has attendance
  const hasAttendanceOnDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return myAttendance.some(a => 
      a.date.toISOString().startsWith(dateStr)
    );
  };

  // Calculate stats
  const totalVisits = member.attendanceCount;
  const thisMonthVisits = myAttendance.filter(a => 
    a.date.getMonth() === new Date().getMonth()
  ).length;
  const avgDuration = '1h 15m'; // Mock average

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your gym visits and activity</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: totalVisits, icon: CalendarDays, color: 'text-lime-500' },
          { label: 'This Month', value: thisMonthVisits, icon: CalendarIcon, color: 'text-blue-500' },
          { label: 'Current Streak', value: '5 days', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Avg. Duration', value: avgDuration, icon: Clock, color: 'text-orange-500' },
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

      {/* Calendar */}
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
            const hasAttendance = hasAttendanceOnDay(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <button
                key={day}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-colors ${
                  hasAttendance
                    ? 'bg-lime-500/20 border border-lime-500/30'
                    : 'bg-muted/50 hover:bg-muted'
                } ${isToday ? 'ring-2 ring-lime-500' : ''}`}
              >
                <span className={`font-medium ${isToday ? 'text-lime-500' : 'text-foreground'}`}>
                  {day}
                </span>
                {hasAttendance && (
                  <CheckCircle className="w-3 h-3 text-lime-500 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">Recent Visits</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Check In</TableHead>
                <TableHead className="text-muted-foreground">Check Out</TableHead>
                <TableHead className="text-muted-foreground">Duration</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAttendance.map((record) => {
                const duration = record.checkOut
                  ? Math.round((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / 60000)
                  : null;
                
                return (
                  <TableRow key={record.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-foreground">
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
    </div>
  );
}
