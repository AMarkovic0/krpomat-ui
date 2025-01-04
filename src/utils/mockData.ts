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

export const generateSalesData = (startDate: Date, endDate: Date, machineId?: string) => {
  const data = [];
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate data for all machines if no specific machine is selected
  const machineIds = machineId ? [machineId] : mockMachines.map(m => m.id);

  machineIds.forEach(id => {
    dateRange.forEach(date => {
      const dailyData: any = {
        date: format(date, 'MMM dd'),
        machineId: id,
      };

      // Generate random sales data for each slot
      for (let slot = 1; slot <= 5; slot++) {
        // Each machine has slightly different sales patterns
        const baseAmount = Math.floor(Math.random() * 20) + 5;
        const multiplier = parseInt(id.replace('vm', '')) * 0.5; // Use machine ID to create variation
        dailyData[`slot${slot}`] = Math.floor(baseAmount * multiplier);
      }

      data.push(dailyData);
    });
  });

  return data;
};