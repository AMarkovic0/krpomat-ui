
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { getSales } from './../api';
import { DateRange } from "react-day-picker";
import { SalesBarChart } from "./SalesBarChart";
import { processDataByMachine, processDataByDate } from "../utils/salesChartUtils";

interface SalesOverviewChartProps {
  salesData: any[];
  selectedMachine: string | null;
  machines: Array<{
    id: string;
    name: string;
    totalSlots: number;
  }>;
  dateRange: DateRange | undefined;
  searchQuery?: string;
}

export const SalesOverviewChart = ({ selectedMachine, machines, dateRange, searchQuery = "" }: SalesOverviewChartProps) => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected machine data, considering the search query
  const selectedMachineData = selectedMachine
    ? machines.find(m => m.id === selectedMachine)
    : null;

  // Filter machines based on search query if no specific machine is selected
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
          // Process the data to filter only selected machine or by search query
          const filteredSales = processDataByMachine(data, selectedMachine, searchQuery, selectedMachineData);
          // Process the data to aggregate by date
          const processedData = processDataByDate(filteredSales, dateRange, numSlots, format);
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
  }, [dateRange, selectedMachine, machines, searchQuery]);

  return (
    <Card className="min-w-[300px] w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">
          {selectedMachineData
            ? `Sales Overview - ${selectedMachineData.name}`
            : searchQuery
              ? `Sales Overview - Filtered by "${searchQuery}"`
              : 'Sales Overview - All Machines'}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px] p-2 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading sales data...</p>
          </div>
        ) : salesData.length > 0 ? (
          <div className="w-full h-full overflow-hidden">
            <SalesBarChart salesData={salesData} numSlots={numSlots} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              {dateRange?.from
                ? searchQuery
                  ? 'No sales data available for the filtered machines'
                  : 'No sales data available for the selected period'
                : 'Select a date range to view sales data'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
