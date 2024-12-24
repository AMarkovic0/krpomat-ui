import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesOverviewChartProps {
  salesData: any[];
  selectedMachine: string | null;
  machines: Array<{
    id: string;
    name: string;
  }>;
}

export const SalesOverviewChart = ({ salesData, selectedMachine, machines }: SalesOverviewChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedMachine
            ? `Sales Overview - ${machines.find(m => m.id === selectedMachine)?.name}`
            : 'Sales Overview - All Machines'}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="slot1" stackId="a" fill="#8884d8" name="Slot 1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="slot2" stackId="a" fill="#82ca9d" name="Slot 2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="slot3" stackId="a" fill="#ffc658" name="Slot 3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="slot4" stackId="a" fill="#ff7300" name="Slot 4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="slot5" stackId="a" fill="#a4de6c" name="Slot 5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};