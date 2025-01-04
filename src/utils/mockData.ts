import { format, eachDayOfInterval } from "date-fns";

export const mockMachines = [
  {
    id: "vm1",
    name: "Snack Machine 1",
    location: "Building A, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 2,
    totalSlots: 4,
  },
  {
    id: "vm2",
    name: "Drink Machine 1",
    location: "Building B, Floor 2",
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
    stockLevel: 1,
    totalSlots: 5,
  },
  {
    id: "vm3",
    name: "Combo Machine 1",
    location: "Building C, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 5,
    totalSlots: 5,
  },
  {
    id: "vm4",
    name: "Snack Machine 2",
    location: "Building A, Floor 3",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 1,
    totalSlots: 1,
  },
  {
    id: "vm5",
    name: "Snack Machine 3",
    location: "Building A, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 0,
    totalSlots: 1,
  },
  {
    id: "vm6",
    name: "Drink Machine 2",
    location: "Building B, Floor 2",
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
    stockLevel: 0,
    totalSlots: 2,
  },
  {
    id: "vm7",
    name: "Combo Machine 2",
    location: "Building C, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 3,
    totalSlots: 3,
  },
  {
    id: "vm8",
    name: "Snack Machine 4",
    location: "Building A, Floor 3",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 4,
    totalSlots: 5,
  },
];

// Generate random sales between min and max
const generateRandomSales = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate sales data for a specific machine
const generateMachineSalesData = (startDate: Date, endDate: Date, machineId: string) => {
  const machine = mockMachines.find(m => m.id === machineId);
  if (!machine) return [];
  
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  return dateRange.map(date => {
    const dailyData: Record<string, any> = {
      date: format(date, 'MMM dd'),
      machineId,
    };

    // Generate sales data for each slot
    for (let slot = 1; slot <= machine.totalSlots; slot++) {
      // Different machines have different sales patterns
      const baseMin = parseInt(machineId.replace('vm', '')) * 2;
      const baseMax = baseMin + 10;
      dailyData[`slot${slot}`] = generateRandomSales(baseMin, baseMax);
    }

    return dailyData;
  });
};

export const generateSalesData = (startDate: Date, endDate: Date, selectedMachineId?: string) => {
  if (selectedMachineId) {
    return generateMachineSalesData(startDate, endDate, selectedMachineId);
  }

  // Generate data for all machines
  const allData = mockMachines.flatMap(machine => 
    generateMachineSalesData(startDate, endDate, machine.id)
  );

  // Group by date for the overview chart
  const groupedByDate = allData.reduce((acc: any[], curr) => {
    const existingDate = acc.find(item => item.date === curr.date);
    if (existingDate) {
      Object.keys(curr).forEach(key => {
        if (key.startsWith('slot')) {
          existingDate[key] = (existingDate[key] || 0) + curr[key];
        }
      });
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);

  return groupedByDate;
};

// Calculate average daily sales for a specific machine
export const calculateMachineAverageSales = (
  salesData: any[],
  machineId: string
): number => {
  const machineSales = salesData.filter(data => data.machineId === machineId);
  if (!machineSales.length) return 0;

  const totalSales = machineSales.reduce((sum, day) => {
    const slotSales = Object.entries(day)
      .filter(([key]) => key.startsWith('slot'))
      .reduce((slotSum, [_, value]) => slotSum + (value as number), 0);
    return sum + slotSales;
  }, 0);

  return Number((totalSales / machineSales.length).toFixed(1));
};