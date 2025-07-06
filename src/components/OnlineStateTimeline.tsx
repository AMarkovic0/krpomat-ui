import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, differenceInMinutes, differenceInHours, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { DateRange } from "react-day-picker";
import { dateToIso } from "@/utils";

interface OnlineStateHistory {
  machine_id: number;
  last_report: string;
  new_report: string;
}

interface OnlineStateEvent {
  startTime: Date;
  endTime: Date;
  status: number; // 0 for offline
  machineId: number;
}

interface OnlineStateTimelineProps {
  selectedMachine: string | null;
  history: OnlineStateHistory[];
  machines: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    lastSeen: Date;
    onlineStatusChanged?: Date;
  }>;
  dateRange: DateRange | undefined;
}

export const OnlineStateTimeline = ({ selectedMachine, history, machines, dateRange }: OnlineStateTimelineProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    machines: string[];
  }>({ date: "", machines: [] });

  const processHistoryData = (): OnlineStateEvent[] => {
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
        machineId: period.machine_id // Fixed: Added the missing machineId property
      }));
    }

    // For overview (no machine selected), return all history events
    return history.map(period => ({
      startTime: new Date(dateToIso(period.last_report)),
      endTime: new Date(dateToIso(period.new_report)),
      status: 0,
      machineId: period.machine_id // Fixed: Added the missing machineId property
    }));
  };

  const generateOptimizedData = () => {
    if (!dateRange?.from) return [];

    const offlinePeriods = processHistoryData();
    const from = dateRange.from;
    const to = dateRange.to ? new Date(dateRange.to) : new Date();

    // If a machine is selected, show its online/offline timeline
    if (selectedMachine) {
      // Find the selected machine to check if it's online
      const selectedMachineObj = machines.find(m => m.id === selectedMachine);
      const isSelectedMachineOnline = selectedMachineObj?.isOnline || false;

      // Group by day for better visualization
      const dailyData: {
        date: string;
        formattedDate: string;
        totalMinutes: number;
        offlineMinutes: number;
        onlinePercentage: number;
      }[] = [];

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
      const dailyOfflineCounts: {
        date: string;
        formattedDate: string;
        offlineMachineCount: number;
        offlineMachineIds: number[];
      }[] = [];

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

        // Get current offline machines count for this day
        const currentlyOfflineMachines = machines.filter(m => !m.isOnline);

        // For the current day, if we don't have any history, use the current offline machines
        let offlineMachineIds: number[] = [];
        if (currentDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) &&
            offlineMachinesForDay.size === 0) {
          offlineMachineIds = currentlyOfflineMachines.map(m => parseInt(m.id));
        } else {
          offlineMachineIds = Array.from(offlineMachinesForDay);
        }

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

  const timelineData = generateOptimizedData();

  // Find the selected machine name for display
  const selectedMachineName = selectedMachine ?
    machines.find(m => m.id === selectedMachine)?.name : null;

  const handleBarClick = (data: any) => {
    if (!selectedMachine && data && data.offlineMachineIds) {
      const offlineMachineNames = data.offlineMachineIds
        .map((id: number) => machines.find(m => m.id === id.toString())?.name)
        .filter(Boolean);
      
      setSelectedDayData({
        date: data.formattedDate,
        machines: offlineMachineNames
      });
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="min-w-[300px]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {selectedMachine
              ? `Online Status Timeline - ${selectedMachineName || 'Machine #' + selectedMachine}`
              : 'Daily Offline Machine Count'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMachine ? (
                  <BarChart data={timelineData}>
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Online Time', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Online Time']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <ReferenceLine y={90} stroke="#ff4d4f" strokeDasharray="3 3" />
                    <Bar
                      dataKey="onlinePercentage"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Online %"
                    />
                  </BarChart>
                ) : (
                  <BarChart data={timelineData} onClick={handleBarClick}>
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Offline Machines', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}`, 'Machines Offline']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar
                      dataKey="offlineMachineCount"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                      name="Offline Machines"
                      onClick={handleBarClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {selectedMachine
                ? 'No timeline data available for the selected time period'
                : 'No offline machine data available for the selected time period'}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offline Machines - {selectedDayData.date}</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto">
            {selectedDayData.machines.length > 0 ? (
              <ul className="space-y-2">
                {selectedDayData.machines.map((machineName, index) => (
                  <li key={index} className="p-2 bg-muted rounded text-sm">
                    {machineName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No offline machines found for this day.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
