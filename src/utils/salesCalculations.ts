interface SalesData {
  [key: string]: string | number;
  date: string;
}

export const calculateMachineAverageSales = (
  salesData: SalesData[],
  machineId: string
): number => {
  const machineSales = salesData.filter((data) => 
    'machineId' in data && data.machineId === machineId
  );
  
  if (machineSales.length === 0) return 0;

  const totalSales = machineSales.reduce((sum, day) => {
    const dailyTotal = Object.entries(day)
      .filter(([key]) => key.startsWith('slot'))
      .reduce((slotSum, [_, value]) => slotSum + (value as number), 0);
    return sum + dailyTotal;
  }, 0);

  return Number((totalSales / machineSales.length).toFixed(1));
};