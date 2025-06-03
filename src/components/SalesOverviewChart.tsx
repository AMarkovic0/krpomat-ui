
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
  avgSales?: {
    monthly: { [machineId: string]: number };
    annual: { [machineId: string]: number };
  };
}

export const SalesOverviewChart = ({ selectedMachine, machines, dateRange, searchQuery = "", avgSales }: SalesOverviewChartProps) => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected machine data, considering the search query
  const selectedMachineData = selectedMachine
    ? machines.find(m => m.id === selectedMachine)
    : null;

  // Filter machines based on search query if no specific machine is selected
  const numSlots = selectedMachineData?.totalSlots || 1;

  // Calculate averages
  const calculateAverages = () => {
    if (!avgSales) return { monthly: 0, annual: 0, selected: 0 };

    let monthlyAvg = 0;
    let annualAvg = 0;
    let selectedAvg = 0;

    if (selectedMachine) {
      // Show averages for selected machine
      monthlyAvg = avgSales.monthly[selectedMachine] || 0;
      annualAvg = avgSales.annual[selectedMachine] || 0;
      
      // Calculate selected period average from current sales data
      const totalSales = salesData.reduce((sum: number, day: any) => {
        return sum + Object.keys(day).filter(key => key.startsWith('slot')).reduce((daySum, slot) => daySum + (day[slot] || 0), 0);
      }, 0);
      selectedAvg = salesData.length > 0 ? totalSales / salesData.length : 0;
    } else {
      // Show averages for all machines
      const monthlyValues = Object.values(avgSales.monthly);
      const annualValues = Object.values(avgSales.annual);
      
      monthlyAvg = monthlyValues.length > 0 ? monthlyValues.reduce((sum: number, val: number) => sum + val, 0) / monthlyValues.length : 0;
      annualAvg = annualValues.length > 0 ? annualValues.reduce((sum: number, val: number) => sum + val, 0) / annualValues.length : 0;
      
      // Calculate selected period average from current sales data
      const totalSales = salesData.reduce((sum: number, day: any) => {
        return sum + Object.keys(day).filter(key => key.startsWith('slot')).reduce((daySum, slot) => daySum + (day[slot] || 0), 0);
      }, 0);
      selectedAvg = salesData.length > 0 ? totalSales / salesData.length : 0;
    }

    return { monthly: monthlyAvg, annual: annualAvg, selected: selectedAvg };
  };

  const averages = calculateAverages();

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
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {selectedMachineData
            ? `Sales Overview - ${selectedMachineData.name}`
            : searchQuery
              ? `Sales Overview - Filtered by "${searchQuery}"`
              : 'Sales Overview - All Machines'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px]">
            <p className="text-muted-foreground text-sm">Loading sales data...</p>
          </div>
        ) : salesData.length > 0 ? (
          <div className="space-y-4">
            <div className="w-full h-[180px]">
              <SalesBarChart salesData={salesData} numSlots={numSlots} />
            </div>
            <div className="flex justify-center space-x-6 text-xs pt-2 border-t">
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Monthly Avg</div>
                <div className="font-semibold">{averages.monthly.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Annual Avg</div>
                <div className="font-semibold">{averages.annual.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Selected Avg</div>
                <div className="font-semibold">{averages.selected.toFixed(1)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[240px]">
            <p className="text-muted-foreground text-sm">
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
