'use client';

import * as React from 'react';
import { CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  type DateRangePreset,
  getPresetRange,
  getPresetLabel,
  formatRangeLabel,
} from '@/utils/dateRange';

export interface DateRangeFilterValue {
  preset: DateRangePreset;
  dateFrom: string | null;
  dateTo: string | null;
}

const PRESETS: DateRangePreset[] = [
  'last_7',
  'last_30',
  'this_month',
  'last_month',
  'this_quarter',
  'last_quarter',
  'year_to_date',
  'all',
];

export interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  /** Hide "All time" (e.g. for member dashboard where "all" is default) */
  showAllTime?: boolean;
  className?: string;
  /** Compact trigger (e.g. icon + "Filter") */
  compact?: boolean;
}

export function DateRangeFilter({
  value,
  onChange,
  showAllTime = true,
  className,
  compact = false,
}: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo, setCustomTo] = React.useState('');
  const [customActive, setCustomActive] = React.useState(false);

  const handlePreset = (preset: DateRangePreset) => {
    if (preset === 'all') {
      onChange({ preset: 'all', dateFrom: null, dateTo: null });
      setCustomActive(false);
      setOpen(false);
      return;
    }
    const range = getPresetRange(preset);
    if (range) {
      onChange({
        preset,
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
      });
      setCustomActive(false);
      setOpen(false);
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom);
      const to = new Date(customTo);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
        onChange({
          preset: 'all',
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
        });
        setCustomActive(true);
        setOpen(false);
      }
    }
  };

  const handleClear = () => {
    onChange({ preset: 'all', dateFrom: null, dateTo: null });
    setCustomFrom('');
    setCustomTo('');
    setCustomActive(false);
    setOpen(false);
  };

  const displayLabel = React.useMemo(() => {
    if (customActive && value.dateFrom && value.dateTo) {
      return formatRangeLabel(value.dateFrom, value.dateTo);
    }
    return getPresetLabel(value.preset);
  }, [value, customActive]);

  const hasFilter = value.preset !== 'all' || value.dateFrom != null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'min-w-[140px] justify-between font-normal',
            hasFilter && 'border-ko-500/50 bg-ko-500/5',
            className
          )}
        >
          {compact ? (
            <>
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{displayLabel}</span>
            </>
          ) : (
            <>
              <span className="truncate">{displayLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b">
          <p className="text-sm font-medium text-foreground mb-2">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.filter((p) => p !== 'all' || showAllTime).map((preset) => (
              <Button
                key={preset}
                variant={value.preset === preset && !customActive ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                onClick={() => handlePreset(preset)}
              >
                {getPresetLabel(preset)}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-3 border-b">
          <p className="text-sm font-medium text-foreground mb-2">Custom range</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            />
            <Button size="sm" onClick={handleCustomApply}>
              Apply
            </Button>
          </div>
        </div>
        {hasFilter && (
          <div className="p-2">
            <Button variant="ghost" size="sm" className="w-full justify-center gap-1" onClick={handleClear}>
              <X className="h-3.5 w-3.5" />
              Clear filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Get current filter as API params (dateFrom/dateTo). Returns undefined when no filter. */
export function getDateRangeParams(value: DateRangeFilterValue): { dateFrom: string; dateTo: string } | undefined {
  if (value.dateFrom && value.dateTo) {
    return { dateFrom: value.dateFrom, dateTo: value.dateTo };
  }
  return undefined;
}
