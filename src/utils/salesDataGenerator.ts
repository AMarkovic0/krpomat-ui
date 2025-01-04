import { format, eachDayOfInterval } from "date-fns";
import { mockMachines } from "./mockData";

// Generate random sales between min and max
const generateRandomSales = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate sales data for a specific machine
const generateMachineSalesData = (
  startDate: Date,
  endDate: Date,
  machineId: string
): Array<{
  date: string;
  machineId: string;
  [key: string]: string | number;
}> => {
  const machine = mockMachines.find((m) => m.id === machineId);
  if (!machine) return [];

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  return dateRange.map((date) => {
    const baseMin = parseInt(machineId.replace("vm", "")) * 2;
    const baseMax = baseMin + 10;

    const slotData: Record<string, number> = {};
    for (let i = 0; i < machine.totalSlots; i++) {
      slotData[`slot${i + 1}`] = generateRandomSales(baseMin, baseMax);
    }

    return {
      date: format(date, "MMM dd"),
      machineId,
      ...slotData,
    };
  });
};

export const generateSalesData = (
  startDate: Date,
  endDate: Date,
  selectedMachineId?: string
): Array<{
  date: string;
  [key: string]: string | number;
}> => {
  if (selectedMachineId) {
    return generateMachineSalesData(startDate, endDate, selectedMachineId);
  }

  // Generate data for all machines
  const allData = mockMachines.flatMap((machine) =>
    generateMachineSalesData(startDate, endDate, machine.id)
  );

  // Group by date
  const groupedData = allData.reduce<Record<string, any>>((acc, curr) => {
    const date = curr.date;
    if (!acc[date]) {
      const slotData: Record<string, number> = {};
      Object.keys(curr).forEach((key) => {
        if (key.startsWith("slot")) {
          slotData[key] = 0;
        }
      });

      acc[date] = {
        date,
        ...slotData,
      };
    }

    Object.keys(curr).forEach((key) => {
      if (key.startsWith("slot")) {
        acc[date][key] = (acc[date][key] || 0) + curr[key];
      }
    });

    return acc;
  }, {});

  return Object.values(groupedData);
};