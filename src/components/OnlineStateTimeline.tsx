
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DateRange } from "react-day-picker";

interface TimelineEvent {
  timestamp: Date;
  status: number;
}

interface OnlineStateTimelineProps {
  selectedMachine: string | null;
  machines: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    lastSeen: Date;
    onlineStatusChanged?: Date;
  }>;
  dateRange: DateRange | undefined;
}

export const OnlineStateTimeline = ({ selectedMachine, machines, dateRange }: OnlineStateTimelineProps) => {
  // Generate timeline data based on machine history
  const generateTimelineData = (): TimelineEvent[] => {
    const selectedMachineData = machines.find(m => m.id === selectedMachine);
    if (!selectedMachineData || !dateRange?.from || !dateRange?.to) return [];

    const timelineData: TimelineEvent[] = [];
    const endDate = new Date(dateRange.to);
    const startDate = new Date(dateRange.from);
    
    // If we have lastSeen data, use it to determine online status
    if (selectedMachineData.lastSeen) {
      // Create initial data point at the start of the range
      timelineData.push({
        timestamp: new Date(startDate),
        // Check if the machine was online at the beginning of the time range
        // A machine is considered offline if no data for more than 3 minutes
        status: isWithinThreeMinutes(startDate, selectedMachineData.lastSeen) ? 1 : 0,
      });

      // If we have onlineStatusChanged data, add those points
      if (selectedMachineData.onlineStatusChanged) {
        const statusChangeTime = new Date(selectedMachineData.onlineStatusChanged);
        
        // Only add if it's within our date range
        if (statusChangeTime >= startDate && statusChangeTime <= endDate) {
          // Get the previous status before the change
          const previousStatus = timelineData[timelineData.length - 1].status;
          
          // Add the status change event (status flips from previous)
          timelineData.push({
            timestamp: statusChangeTime,
            status: previousStatus === 1 ? 0 : 1
          });
        }
      }

      // Add the lastSeen point if it's within our range
      const lastSeenDate = new Date(selectedMachineData.lastSeen);
      if (lastSeenDate >= startDate && lastSeenDate <= endDate) {
        // Get current online status based on the 3-minute threshold
        const currentStatus = selectedMachineData.isOnline ? 1 : 0;
        
        // Add the last seen point
        timelineData.push({
          timestamp: lastSeenDate,
          status: currentStatus
        });
      }

      // Ensure the data ends with the current state
      timelineData.push({
        timestamp: endDate,
        status: selectedMachineData.isOnline ? 1 : 0
      });
    }

    // Sort timeline data by timestamp
    return timelineData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  // Helper function to check if a time is within 3 minutes of another time
  const isWithinThreeMinutes = (time1: Date, time2: Date): boolean => {
    const diffInMinutes = Math.abs(time1.getTime() - time2.getTime()) / (60 * 1000);
    return diffInMinutes <= 3;
  };

  const timelineData = generateTimelineData();
  const formattedData = timelineData.map(event => ({
    timestamp: format(event.timestamp, 'MM/dd HH:mm'),
    status: event.status,
    raw: event.timestamp, // Keep the raw timestamp for tooltip sorting
  }));

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {selectedMachine
            ? `Online Status Timeline - ${machines.find(m => m.id === selectedMachine)?.name}`
            : 'Select a machine to view its online status timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedMachine ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  tickFormatter={(value) => (value === 1 ? 'Online' : 'Offline')}
                />
                <Tooltip
                  formatter={(value: number) => [
                    value === 1 ? 'Online' : 'Offline',
                    'Status'
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                  // Sort by raw timestamp to ensure correct order
                  itemSorter={(item) => {
                    const dataItem = formattedData.find(d => d.timestamp === item.payload.timestamp);
                    return dataItem?.raw ? -dataItem.raw.getTime() : 0;
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="status"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Click on a machine card to view its online status timeline
          </p>
        )}
      </CardContent>
    </Card>
  );
};
