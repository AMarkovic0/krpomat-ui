import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface DateSelectorProps {
  date: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
}

export const DateSelector = ({ date, onSelect }: DateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="range"
          selected={date}
          onSelect={onSelect}
          numberOfMonths={1}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};