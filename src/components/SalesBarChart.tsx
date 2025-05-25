
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SalesBarChartProps {
  salesData: any[];
  numSlots: number;
}

const slotColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

export const SalesBarChart = ({ salesData, numSlots }: SalesBarChartProps) => {
  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={salesData} 
          margin={{ 
            top: 5, 
            right: 5, 
            left: 5, 
            bottom: 5 
          }}
        >
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={25}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '10px' }}
            iconSize={10}
          />
          {Array.from({ length: numSlots }, (_, i) => (
            <Bar
              key={`slot${i + 1}`}
              dataKey={`slot${i + 1}`}
              stackId="a"
              fill={slotColors[i % slotColors.length]}
              name={`Slot ${i + 1}`}
              radius={[1, 1, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
