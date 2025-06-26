
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { getSales, getOnlineStateHistory, getAvgSales } from "../api";

interface AverageSale {
  monthly: { [machineId: string]: number };
  annual: { [machineId: string]: number };
  selected: { [machineId: string]: number };
}

export const useSalesData = (date: DateRange | undefined, selectedMachine: string | null) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [avgSales, setAvgSalesData] = useState<AverageSale>({
    monthly: {},
    annual: {},
    selected: {}
  });
  const [onlineStateHistory, setOnlineStateHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!date?.from) return;
      const toDate = date?.to || new Date();

      try {
        const formattedFromDate = `${date.from.getDate()}.${date.from.getMonth() + 1}.${date.from.getFullYear()}.`;
        const formattedToDate = `${toDate.getDate()}.${toDate.getMonth() + 1}.${toDate.getFullYear()}.`;

        const salesParams = {
          start_date: formattedFromDate,
          end_date: formattedToDate,
          machine_id: selectedMachine || undefined
        };

        const data = await getSales(salesParams);
        setSalesData(data);

        const history = await getOnlineStateHistory(salesParams);
        setOnlineStateHistory(history);

        const avg_sale = await getAvgSales(salesParams);
        setAvgSalesData(avg_sale);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]);
      }
    };

    fetchSalesData();
  }, [date, selectedMachine]);

  return {
    salesData,
    avgSales,
    onlineStateHistory
  };
};
