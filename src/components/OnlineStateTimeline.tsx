
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DateRange } from "react-day-picker";
import { dateToIso } from "@/utils";

interface OnlineStateHistory {
  machine_id: number;
  last_report: string;
  new_report: string;
}

interface TimelineEvent {
  timestamp: Date;
  status: number; // 1 for online, 0 for offline
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

const checkOnlineState = (history: OnlineStateHistory[], timestamp: Date, machineId: number): number => {
  // Default to online (1) unless we find an offline period that includes this timestamp
  let status = 1;
  
  // Filter history for the selected machine
  const machineHistory = history.filter(item => item.machine_id === machineId);
  
  // Check if timestamp falls within any offline period
  for (const period of machineHistory) {
    const lastReport = new Date(dateToIso(period.last_report));
    const newReport = new Date(dateToIso(period.new_report));
    
    // If timestamp is within offline period, set status to offline (0)
    if (timestamp >= lastReport && timestamp <= newReport) {
      status = 0;
      break;
    }
  }
  
  return status;
};

export const OnlineStateTimeline = ({ selectedMachine, history, machines, dateRange }: OnlineStateTimelineProps) => {
  const generateTimelineData = (): TimelineEvent[] => {
    if (!selectedMachine || !dateRange?.from) return [];
    
    const machineId = parseInt(selectedMachine);
    if (isNaN(machineId)) return [];
    
    const timelineData: TimelineEvent[] = [];
    const from = new Date(dateRange.from);
    const to = dateRange.to ? new Date(dateRange.to) : new Date();
    
    // Generate data points at 5-minute intervals across the date range
    for (let d = new Date(from); d <= to; d.setTime(d.getTime() + 5 * 60000)) {
      timelineData.push({
        timestamp: new Date(d),
        status: checkOnlineState(history, new Date(d), machineId)
      });
    }
    
    return timelineData;
  };

  const timelineData = generateTimelineData();

  // Format data for the chart
  const formattedData = timelineData.map(event => {
    if (!event.timestamp || isNaN(event.timestamp.getTime())) {
      console.error("Invalid timestamp:", event.timestamp);
      return {
        timestamp: "Invalid date",
        status: event.status,
        raw: new Date()
      };
    }

    return {
      timestamp: format(event.timestamp, 'MM/dd HH:mm'),
      status: event.status,
      raw: event.timestamp,
    };
  });

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
        {selectedMachine && formattedData.length > 0 ? (
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
            {selectedMachine
              ? 'No timeline data available for the selected time period'
              : 'Click on a machine card to view its online status timeline'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
