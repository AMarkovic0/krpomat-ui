
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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

            if (i === 0) {
              for (var id in data.monthly) {
                average += data.monthly[id];
              }
            } else {
              for (var id in data.selected) {
                average += data.selected[id];
              }
            }

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
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Monthly Average Sales History (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Average Sales', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Average Sales']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar
                  dataKey="average"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Average Sales"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {isLoading
              ? 'Loading monthly data...'
              : 'No monthly data available'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
