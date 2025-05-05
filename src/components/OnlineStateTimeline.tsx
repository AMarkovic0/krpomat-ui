
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DateRange } from "react-day-picker";
import { dateToIso } from "@/utils";

const MIN3 = 3*60000;
const loadDateTime = (new Date()).getTime();

interface TimelineEvent {
  timestamp: Date;
  status: number;
}

interface OnlineStateTimelineProps {
  selectedMachine: string | null;
  sales: any; // Define a more specific type if possible
  machines: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    lastSeen: Date;
    onlineStatusChanged?: Date;
  }>;
  dateRange: DateRange | undefined;
}

function checkOnline(start_date, end_date) {
  return end_date > (new Date(dateToIso(start_date)).getTime() + MIN3);
}

// Helper function to check if a time is within 3 minutes of another time
const isWithinThreeMinutes = (time1: Date, time2: Date): boolean => {
  const diffInMinutes = Math.abs(time1.getTime() - time2.getTime()) / (60 * 1000);
  return diffInMinutes <= 3;
};

export const OnlineStateTimeline = ({ selectedMachine, sales, machines, dateRange }: OnlineStateTimelineProps) => {
  const generateTimelineData = (): TimelineEvent[] => {
    const selectedData = sales?.find(m => m.machine_id === selectedMachine);
    if (!selectedData || !dateRange?.from || !dateRange?.to) return [];

    const timelineData: TimelineEvent[] = [];

    let oldSaleDate = loadDateTime;
    if (selectedData) {
      for (var sale in selectedData) {
        if (sale && selectedData[sale] && selectedData[sale].sale_date) {
          timelineData.push({
            timestamp: new Date(oldSaleDate),
            status: checkOnline(selectedData[sale].sale_date, oldSaleDate) ? 1 : 0
          });

          oldSaleDate = new Date(dateToIso(selectedData[sale].sale_date)).getTime();
        }
      }
    }

    console.log("Timeline data generated:", timelineData);
    return timelineData;
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
          {selectedMachine && machines
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
