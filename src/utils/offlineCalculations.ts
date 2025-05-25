
import { DateRange } from "react-day-picker";
import { dateToIso } from "@/utils";

interface OnlineStateHistory {
  machine_id: number;
  last_report: string;
  new_report: string;
}

export const calculateOfflineCount = (
  machineId: string,
  history: OnlineStateHistory[],
  dateRange: DateRange | undefined
): number => {
  if (!dateRange?.from || !history.length) return 0;

  const machineIdNum = parseInt(machineId);
  if (isNaN(machineIdNum)) return 0;

  const from = dateRange.from;
  const to = dateRange.to ? new Date(dateRange.to) : new Date();

  // Filter history for the specific machine within the date range
  const machineOfflineEvents = history.filter(event => {
    if (event.machine_id !== machineIdNum) return false;
    
    const eventStart = new Date(dateToIso(event.last_report));
    const eventEnd = new Date(dateToIso(event.new_report));
    
    // Check if the offline event overlaps with our date range
    return !(eventEnd < from || eventStart > to);
  });

  return machineOfflineEvents.length;
};
