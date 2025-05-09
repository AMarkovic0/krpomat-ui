import { useState, useEffect } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { getSales } from './../api';
import { dateToIso } from "@/utils";
import { DateRange } from "react-day-picker";

interface SalesOverviewChartProps {
  salesData: any[];
  selectedMachine: string | null;
  machines: Array<{
    id: string;
    name: string;
    totalSlots: number;
  }>;
  dateRange: DateRange | undefined;
}

const slotColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

export const SalesOverviewChart = ({ selectedMachine, machines, dateRange }: SalesOverviewChartProps) => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedMachineData = selectedMachine ? machines.find(m => m.id === selectedMachine) : null;
  const numSlots = selectedMachineData?.totalSlots || 1;

  useEffect(() => {
    if (!dateRange?.from) return;
    
    const toDate = dateRange?.to || new Date(); // Use current date as fallback if to is undefined

    let isMounted = true;
    setIsLoading(true);

    const fetchSalesData = async () => {
      try {
        const formattedFromDate = `${dateRange.from.getDate()}.${dateRange.from.getMonth() + 1}.${dateRange.from.getFullYear()}.`;
        const formattedToDate = `${toDate.getDate()}.${toDate.getMonth() + 1}.${toDate.getFullYear()}.`;

        const salesParams = {
          start_date: formattedFromDate,
          end_date: formattedToDate,
          machine_id: selectedMachine || undefined
        };

        const data = await getSales(salesParams);

        if (isMounted) {
          // Process the data to filter only selected machine
          const selectedMachineSale = processDataByMachine(data, selectedMachine);
          // Process the data to aggregate by date
          const processedData = processDataByDate(selectedMachineSale);
          setSalesData(processedData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        if (isMounted) {
          setSalesData([]);
          setIsLoading(false);
        }
      }
    };

    fetchSalesData();

    return () => {
      isMounted = false;
    };
  }, [dateRange, selectedMachine]);

  const processDataByMachine = (data: any[], selectedMachine) => {
    if (!data || !data.length) return [];

    if (!selectedMachine) return data;

    try {
      return data.filter((sale) => sale.machine_id === selectedMachine);
    } catch (error) {
      console.error("Error processing sale by selected machine:", selectedMachine, error);
    }

    return [];
  };

  // Process the data to aggregate by date and slot
  const processDataByDate = (data: any[]) => {
    if (!data || !data.length) return [];

    const dateMap = new Map();

    data.forEach(sale => {
      if (!sale || !sale.sale_date) return;

      try {
        // Extract the date part only
        const dateParts = sale.sale_date.split(' ')[0].split('.');
        const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;

        if (!dateMap.has(formattedDate)) {
          // Initialize date entry with all slots at 0
          const dateEntry = { date: formattedDate };
          for (let i = 1; i <= numSlots; i++) {
            dateEntry[`slot${i}`] = 0;
          }
          dateMap.set(formattedDate, dateEntry);
        }

        // Increment the appropriate slot for this sale
        const slotNum = sale.prod_id ? Math.min(parseInt(sale.prod_id), numSlots) : 1;
        const dateEntry = dateMap.get(formattedDate);
        dateEntry[`slot${slotNum}`] = (dateEntry[`slot${slotNum}`] || 0) + 1;
      } catch (error) {
        console.error("Error processing sale date:", sale.sale_date, error);
      }
    });

    // Convert map to array and sort by date
    const result = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        ...entry,
        date: format(new Date(entry.date), 'MMM dd') // Format date for display
      }));

    return result;
  };

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
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading sales data...</p>
          </div>
        ) : salesData.length > 0 ? (
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
                    fill={slotColors[i % slotColors.length]}
                    name={`Slot ${i + 1}`}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              {dateRange?.from
                ? 'No sales data available for the selected period'
                : 'Select a date range to view sales data'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
