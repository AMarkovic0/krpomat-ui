import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  }>;
}

export const OnlineStateTimeline = ({ selectedMachine, machines }: OnlineStateTimelineProps) => {
  // Generate mock timeline data with more frequent status changes
  const generateTimelineData = (): TimelineEvent[] => {
    const selectedMachineData = machines.find(m => m.id === selectedMachine);
    if (!selectedMachineData) return [];

    const timelineData: TimelineEvent[] = [];
    const endDate = new Date();
    const startDate = subDays(endDate, 7); // Show last 7 days of data

    // Generate random status changes
    let currentTime = startDate;
    let currentStatus = selectedMachineData.isOnline ? 1 : 0;

    while (currentTime <= endDate) {
      timelineData.push({
        timestamp: new Date(currentTime),
        status: currentStatus,
      });

      // Randomly change status (20% chance)
      if (Math.random() < 0.2) {
        currentStatus = currentStatus === 1 ? 0 : 1;
      }

      // Move forward by 4 hours
      currentTime = new Date(currentTime.getTime() + 4 * 60 * 60 * 1000);
    }

    // Ensure the last status matches the current machine status
    timelineData.push({
      timestamp: endDate,
      status: selectedMachineData.isOnline ? 1 : 0,
    });

    return timelineData;
  };

  const timelineData = generateTimelineData();
  const formattedData = timelineData.map(event => ({
    timestamp: format(event.timestamp, 'MM/dd HH:mm'),
    status: event.status,
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
                />
                <Line
                  type="stepAfter"
                  dataKey="status"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
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