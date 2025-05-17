
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInMinutes, differenceInHours, startOfDay, endOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
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
  const processHistoryData = (): OnlineStateEvent[] => {
    if (!selectedMachine || !dateRange?.from || !history.length) return [];
    
    const machineId = parseInt(selectedMachine);
    if (isNaN(machineId)) return [];
    
    // Filter history for the selected machine
    const machineHistory = history.filter(item => item.machine_id === machineId);
    
    return machineHistory.map(period => ({
      startTime: new Date(dateToIso(period.last_report)),
      endTime: new Date(dateToIso(period.new_report)),
      status: 0 // 0 represents offline periods
    }));
  };

  const generateOptimizedData = () => {
    if (!selectedMachine || !dateRange?.from) return [];
    
    // Find the selected machine to check if it's online
    const selectedMachineObj = machines.find(m => m.id === selectedMachine);
    const isSelectedMachineOnline = selectedMachineObj?.isOnline || false;
    
    const offlinePeriods = processHistoryData();
    const from = dateRange.from;
    const to = dateRange.to ? new Date(dateRange.to) : new Date();
    
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
  };

  const timelineData = generateOptimizedData();

  // Find the selected machine name for display
  const selectedMachineName = selectedMachine ? 
    machines.find(m => m.id === selectedMachine)?.name : null;

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {selectedMachine 
            ? `Online Status Timeline - ${selectedMachineName || 'Machine #' + selectedMachine}` 
            : 'Select a machine to view its online status timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedMachine && timelineData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} barGap={2}>
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
                >
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {selectedMachine
              ? 'No timeline data available for the selected time period'
              : 'Click on a machine card to view its online status timeline'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
