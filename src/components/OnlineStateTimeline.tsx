
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
  sales: any[]; // Define a more specific type if possible
  machines: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    lastSeen: Date;
    onlineStatusChanged?: Date;
  }>;
  dateRange: DateRange | undefined;
}

function checkOnline(start_date: string, end_date: number) {
  return end_date > (new Date(dateToIso(start_date)).getTime() + MIN3);
}

// Helper function to check if a time is within 3 minutes of another time
const isWithinThreeMinutes = (time1: Date, time2: Date): boolean => {
  const diffInMinutes = Math.abs(time1.getTime() - time2.getTime()) / (60 * 1000);
  return diffInMinutes <= 3;
};

export const OnlineStateTimeline = ({ selectedMachine, sales, machines, dateRange }: OnlineStateTimelineProps) => {
  const generateTimelineData = (): TimelineEvent[] => {
    const selectedData = sales?.filter((m) => m.machine_id === selectedMachine);
    if (!selectedData || !selectedData.length || !dateRange?.from) return [];

    const timelineData: TimelineEvent[] = [];

    let oldSaleDate = loadDateTime;
    if (selectedData) {
      for (let i = 0; i < selectedData.length; i++) {
        const sale = selectedData[i];
        
        if (sale && sale.sale_date) {
          try {
            // Make sure the timestamp is a valid Date object
            const saleDate = new Date(dateToIso(sale.sale_date));
            if (!isNaN(saleDate.getTime())) {
              timelineData.push({
                timestamp: saleDate,
                status: checkOnline(sale.sale_date, oldSaleDate) ? 1 : 0
              });
              
              oldSaleDate = saleDate.getTime();
            }
          } catch (error) {
            console.error("Error parsing date:", sale.sale_date, error);
          }
        }
      }
    }

    return timelineData;
  };

  const timelineData = generateTimelineData();
  
  // Format data safely with valid date checks
  const formattedData = timelineData.map(event => {
    // Make sure the timestamp is valid before formatting
    if (!event.timestamp || isNaN(event.timestamp.getTime())) {
      console.error("Invalid timestamp:", event.timestamp);
      // Return a placeholder with current time as fallback
      return {
        timestamp: "Invalid date",
        status: event.status,
        raw: new Date() // Fallback to current date
      };
    }
    
    return {
      timestamp: format(event.timestamp, 'MM/dd HH:mm'),
      status: event.status,
      raw: event.timestamp, // Keep the raw timestamp for tooltip sorting
    };
  });

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
            {selectedMachine 
              ? 'No timeline data available for the selected time period'
              : 'Click on a machine card to view its online status timeline'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
