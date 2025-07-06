
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { DailyData, DailyOfflineCount, Machine } from "./types";

interface TimelineChartProps {
  selectedMachine: string | null;
  timelineData: DailyData[] | DailyOfflineCount[];
  machines: Machine[];
  onBarClick: (data: any) => void;
}

export const TimelineChart = ({ 
  selectedMachine, 
  timelineData, 
  onBarClick 
}: TimelineChartProps) => {
  if (timelineData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {selectedMachine
          ? 'No timeline data available for the selected time period'
          : 'No offline machine data available for the selected time period'}
      </p>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {selectedMachine ? (
          <BarChart data={timelineData as DailyData[]}>
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
          <BarChart data={timelineData as DailyOfflineCount[]} onClick={onBarClick}>
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
              onClick={onBarClick}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
