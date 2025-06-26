
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { getSales } from "../api";

interface MonthlyData {
  month: string;
  average: number;
}

export const MonthlySalesHistoryCard = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      const currentDate = new Date();
      const monthlyResults: MonthlyData[] = [];

      try {
        // Get data for the last 12 months
        for (let i = 11; i >= 0; i--) {
          const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
          
          const formattedFromDate = `${targetDate.getDate()}.${targetDate.getMonth() + 1}.${targetDate.getFullYear()}.`;
          const formattedToDate = `${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}.`;

          const salesParams = {
            start_date: formattedFromDate,
            end_date: formattedToDate
          };

          try {
            const data = await getSales(salesParams);
            
            // Calculate average sales for the month
            const totalSales = data.reduce((sum: number, sale: any) => {
              const saleAmount = sale.amount || sale.total || 1; // Default to 1 if no amount field
              return sum + saleAmount;
            }, 0);
            
            const average = data.length > 0 ? totalSales / data.length : 0;
            
            monthlyResults.push({
              month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              average: parseFloat(average.toFixed(2))
            });
          } catch (error) {
            console.error(`Error fetching data for ${targetDate.toLocaleDateString()}:`, error);
            monthlyResults.push({
              month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              average: 0
            });
          }
        }

        setMonthlyData(monthlyResults);
      } catch (error) {
        console.error('Error fetching monthly sales history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Monthly Average Sales History (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground text-sm">Loading monthly data...</p>
          </div>
        ) : monthlyData.length > 0 ? (
          <div className="w-full h-[200px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                >
                  <XAxis 
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={35}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground text-sm">No monthly data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
