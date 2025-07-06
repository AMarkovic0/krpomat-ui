import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { getAvgSales } from "../api";

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
            const data = await getAvgSales(salesParams);
            let average = 0;

            for (var id in data.selected) {
              average += data.selected[id];
            }

            average = average / Object.keys(data.selected).length;

            // Temporary remove peak
            if (average > 80) average = 0;

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
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Monthly Average Sales History (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[150px]">
            <p className="text-muted-foreground">Loading monthly data...</p>
          </div>
        ) : monthlyData.length > 0 ? (
          <div className="w-full h-[150px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 30 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={25}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                    width={25}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="average"
                    fill="#8884d8"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[150px]">
            <p className="text-muted-foreground">No monthly data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
