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
  const multiplier = machineId ? parseInt(machineId.replace('vm', '')) : 1;
  const slotColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  dateRange.forEach(date => {
    const dailyData: any = {
      date: format(date, 'MMM dd'),
    };

    for (let slot = 1; slot <= 5; slot++) {
      dailyData[`slot${slot}`] = Math.floor((Math.random() * 20 + 5) * multiplier);
    }

    data.push(dailyData);
  });

  return data;
};
