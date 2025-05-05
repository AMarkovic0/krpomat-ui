
import { useState, useEffect } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns"; // Changed from dayjs to date-fns since it's already in use

import { getSales } from './../api';

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

function getToday() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  return `${date}.${month}.${year}.`;
}

function getDefaultStartDate() {
  const today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();
  const date = today.getDate();

  if (month == 0) {
    month = 12;
    year = year - 1;
  }

  return `${date}.${month}.${year}.`;
}

export const SalesOverviewChart = ({ salesData, selectedMachine, machines }: SalesOverviewChartProps) => {
  const [salesDataForSelected, setSalesDataForSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedMachineData = selectedMachine ? machines.find(m => m.id === selectedMachine) : null;
  const numSlots = selectedMachineData?.totalSlots || 1;

  useEffect(() => {
    // If we already have data, don't fetch again
    if (salesDataForSelected.length > 0) return;
    
    let isMounted = true;
    setIsLoading(true);
    
    const fetchSalesData = async () => {
      try {
        const data = await getSales({
          start_date: getDefaultStartDate(),
          end_date: getToday(),
          machine_id: selectedMachine
        });
        
        if (isMounted) {
          setSalesDataForSelected(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSalesData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedMachine]);

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {selectedMachineData
            ? `Sales Overview - ${selectedMachineData.name}`
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
