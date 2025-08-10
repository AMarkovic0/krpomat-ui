
import { format, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { dateToIso } from "@/utils";
import { OnlineStateHistory, OnlineStateEvent, Machine, DailyData, DailyOfflineCount } from "./types";

export const processHistoryData = (
  selectedMachine: string | null,
  history: OnlineStateHistory[],
  dateRange: DateRange | undefined
): OnlineStateEvent[] => {
  if (!dateRange?.from || !history.length) return [];

  // If a machine is selected, filter history for that machine
  if (selectedMachine) {
    const machineId = parseInt(selectedMachine);
    if (isNaN(machineId)) return [];

    // Filter history for the selected machine
    const machineHistory = history.filter(item => item.machine_id === machineId);

    return machineHistory.map(period => ({
      startTime: new Date(dateToIso(period.last_report)),
      endTime: new Date(dateToIso(period.new_report)),
      status: 0, // 0 represents offline periods
      machineId: period.machine_id
    }));
  }

  // For overview (no machine selected), return all history events
  return history.map(period => ({
    startTime: new Date(dateToIso(period.last_report)),
    endTime: new Date(dateToIso(period.new_report)),
    status: 0,
    machineId: period.machine_id
  }));
};

export const generateOptimizedData = (
  selectedMachine: string | null,
  machines: Machine[],
  dateRange: DateRange | undefined,
  offlinePeriods: OnlineStateEvent[]
): DailyData[] | DailyOfflineCount[] => {
  if (!dateRange?.from) return [];

  const from = dateRange.from;
  const to = dateRange.to ? new Date(dateRange.to) : new Date();

  // Get offline machines from the machines list (excluding those with default date "01.01.1970 00:00:00")
  const defaultTime = new Date("01.01.1970 00:00:00").getTime();
  const offlineMachinesFromList = machines.filter(machine =>
    !machine.isOnline && machine.lastSeen.getTime() !== defaultTime
  );

  // If a machine is selected, show its online/offline timeline
  if (selectedMachine) {
    // Find the selected machine to check if it's online
    const selectedMachineObj = machines.find(m => m.id === selectedMachine);
    let defaultTime = new Date("01.01.1970 00:00:00").getTime();
    const isSelectedMachineOnline = selectedMachineObj?.lastSeen.getTime() !== defaultTime;

    // Group by day for better visualization
    const dailyData: DailyData[] = [];

    // Iterate through each day in the range
    let currentDate = new Date(from);
    while (currentDate <= to) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      // Calculate total minutes in the day (that are within our range)
      const rangeStart = currentDate.getTime() === from.getTime() ? currentDate : dayStart;
      const rangeEnd = currentDate.getTime() === to.getTime() ? to : dayEnd;
      const totalMinutes = differenceInMinutes(rangeEnd, rangeStart);

      // Calculate offline minutes for this day
      let offlineMinutes = 0;
      for (const period of offlinePeriods) {
        // Skip if period is completely outside this day
        if (period.endTime < rangeStart || period.startTime > rangeEnd) continue;

        // Calculate intersection of period with this day
        const overlapStart = period.startTime > rangeStart ? period.startTime : rangeStart;
        const overlapEnd = period.endTime < rangeEnd ? period.endTime : rangeEnd;

        offlineMinutes += differenceInMinutes(overlapEnd, overlapStart);
      }

      // For online devices with no history data, set to 100% online
      let onlinePercentage = 100;
      if (offlinePeriods.length > 0) {
        // Only calculate percentage if we have offline periods
        onlinePercentage = Math.round(((totalMinutes - offlineMinutes) / totalMinutes) * 100);
      } else if (!isSelectedMachineOnline) {
        // If machine is offline and has no history, show as 0% online
        onlinePercentage = 0;
      }

      dailyData.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        formattedDate: format(currentDate, 'MMM dd'),
        totalMinutes,
        offlineMinutes,
        onlinePercentage
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  }
    // No machine selected - show count of offline machines per day
  else {
    const dailyOfflineCounts: DailyOfflineCount[] = [];

    // Iterate through each day in the range
    let currentDate = new Date(from);
    while (currentDate <= to) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      // Create a set of unique machine IDs that were offline on this day
      const offlineMachinesForDay = new Set<number>();

      // Check each offline period to see if it overlaps with this day
      for (const period of offlinePeriods) {
        // If this period overlaps with the current day, add the machine to the set
        if (!(period.endTime < dayStart || period.startTime > dayEnd)) {
          offlineMachinesForDay.add(period.machineId);
        }
      }

      // Add offline machines from the machines list that are currently offline
      // and had a sale
      for (const machine of offlineMachinesFromList) {
        const beginOfEpoch = new Date(0);
        const machineLastSale = machine.lastSale;
        if (machineLastSale.getTime() !== defaultTime) {
          offlineMachinesForDay.add(parseInt(machine.id));
        }
      }

      const offlineMachineIds = Array.from(offlineMachinesForDay);

      dailyOfflineCounts.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        formattedDate: format(currentDate, 'MMM dd'),
        offlineMachineCount: offlineMachineIds.length,
        offlineMachineIds
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyOfflineCounts;
  }
};
