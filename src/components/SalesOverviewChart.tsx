import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesOverviewChartProps {
  salesData: any[];
  selectedMachine: string | null;
  machines: Array<{
    id: string;
    name: string;
    totalSlots: number;
  }>;
}

const slotColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

export const SalesOverviewChart = ({ salesData, selectedMachine, machines }: SalesOverviewChartProps) => {
  const selectedMachineData = selectedMachine ? machines.find(m => m.id === selectedMachine) : null;
  const numSlots = selectedMachineData?.totalSlots || 5;

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {selectedMachine
            ? `Sales Overview - ${machines.find(m => m.id === selectedMachine)?.name}`
            : 'Sales Overview - All Machines'}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {Array.from({ length: numSlots }, (_, i) => (
                <Bar
                  key={`slot${i + 1}`}
                  dataKey={`slot${i + 1}`}
                  stackId="a"
                  fill={slotColors[i]}
                  name={`Slot ${i + 1}`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};