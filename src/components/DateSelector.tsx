import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { subDays, subMonths, subYears, startOfDay } from "date-fns";

interface DateSelectorProps {
  date: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
}

export const DateSelector = ({ date, onSelect }: DateSelectorProps) => {
  const handleShortcutClick = (shortcut: string) => {
    const today = startOfDay(new Date());
    
    switch (shortcut) {
      case 'day':
        onSelect({
          from: subDays(today, 1),
          to: today
        });
        break;
      case 'week':
        onSelect({
          from: subDays(today, 7),
          to: today
        });
        break;
      case 'month':
        onSelect({
          from: subMonths(today, 1),
          to: today
        });
        break;
      case 'year':
        onSelect({
          from: subYears(today, 1),
          to: today
        });
        break;
      case 'all':
        onSelect({
          from: new Date(2024, 0, 1), // January 1st, 2024
          to: today
        });
        break;
    }
  };

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Select Date Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcutClick('day')}
          >
            Last Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcutClick('week')}
          >
            Last Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcutClick('month')}
          >
            Last Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcutClick('year')}
          >
            Last Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcutClick('all')}
          >
            All Time
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={date}
          onSelect={onSelect}
          numberOfMonths={1}
          className="rounded-md border"
          classNames={{
            months: "space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:flex-row",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
            day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100",
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </CardContent>
    </Card>
  );
};