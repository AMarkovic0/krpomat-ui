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
const generateMachineSalesData = (startDate: Date, endDate: Date, machineId: string): any[] => {
  const machine = mockMachines.find(m => m.id === machineId);
  if (!machine) return [];
  
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  return dateRange.map(date => {
    const baseMin = parseInt(machineId.replace('vm', '')) * 2;
    const baseMax = baseMin + 10;
    
    const slotData: Record<string, number> = {};
    for (let i = 0; i < machine.totalSlots; i++) {
      slotData[`slot${i + 1}`] = generateRandomSales(baseMin, baseMax);
    }

    return {
      date: format(date, 'MMM dd'),
      machineId,
      ...slotData
    };
  });
};

export const generateSalesData = (startDate: Date, endDate: Date, selectedMachineId?: string): any[] => {
  if (selectedMachineId) {
    return generateMachineSalesData(startDate, endDate, selectedMachineId);
  }

  // Generate data for all machines
  const allData = mockMachines.flatMap(machine => 
    generateMachineSalesData(startDate, endDate, machine.id)
  );

  // Group by date
  const groupedByDate = Object.values(allData.reduce((acc: Record<string, any>, curr) => {
    const date = curr.date;
    if (!acc[date]) {
      const slotData: Record<string, number> = {};
      Object.keys(curr).forEach(key => {
        if (key.startsWith('slot')) {
          slotData[key] = 0;
        }
      });
      
      acc[date] = {
        date,
        ...slotData
      };
    }
    
    Object.keys(curr).forEach(key => {
      if (key.startsWith('slot')) {
        acc[date][key] = (acc[date][key] || 0) + curr[key];
      }
    });
    
    return acc;
  }, {}));

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
    const dailyTotal = Object.entries(day)
      .filter(([key]) => key.startsWith('slot'))
      .reduce((slotSum, [_, value]) => slotSum + (value as number), 0);
    return sum + dailyTotal;
  }, 0);

  return Number((totalSales / machineSales.length).toFixed(1));
};