import { useState } from 'react';
import { format, type DateRange } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onRangeChange: (range: { from?: string; to?: string }) => void;
  defaultFrom?: Date;
  defaultTo?: Date;
  className?: string;
}

export function DateRangePicker({ onRangeChange, defaultFrom, defaultTo, className }: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(
    defaultFrom || defaultTo ? { from: defaultFrom, to: defaultTo } : undefined
  );
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    onRangeChange({
      from: selectedRange?.from?.toISOString(),
      to: selectedRange?.to?.toISOString(),
    });
    
    if (selectedRange?.from && selectedRange?.to) {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setRange(undefined);
    onRangeChange({ from: undefined, to: undefined });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !range && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
                </>
              ) : (
                format(range.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {range && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  );
}
