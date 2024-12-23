import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { addDays, format, subDays, eachDayOfInterval } from "date-fns";
import { DateRange } from "react-day-picker";
import { VendingMachineGrid } from "@/components/VendingMachineGrid";

const mockMachines = [
  {
    id: "vm1",
    name: "Snack Machine 1",
    location: "Building A, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 15,
    totalSlots: 20,
  },
  {
    id: "vm2",
    name: "Drink Machine 1",
    location: "Building B, Floor 2",
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
    stockLevel: 8,
    totalSlots: 24,
  },
  {
    id: "vm3",
    name: "Combo Machine 1",
    location: "Building C, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 4,
    totalSlots: 30,
  },
  {
    id: "vm4",
    name: "Snack Machine 2",
    location: "Building A, Floor 3",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 18,
    totalSlots: 20,
  },
  {
    id: "vm1",
    name: "Snack Machine 1",
    location: "Building A, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 15,
    totalSlots: 20,
  },
  {
    id: "vm2",
    name: "Drink Machine 1",
    location: "Building B, Floor 2",
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
    stockLevel: 8,
    totalSlots: 24,
  },
  {
    id: "vm3",
    name: "Combo Machine 1",
    location: "Building C, Floor 1",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 4,
    totalSlots: 30,
  },
  {
    id: "vm4",
    name: "Snack Machine 2",
    location: "Building A, Floor 3",
    isOnline: true,
    lastSeen: new Date(),
    stockLevel: 18,
    totalSlots: 20,
  },
];

// Mock sales data
const generateSalesData = (startDate: Date, endDate: Date, machineId?: string) => {
  const data = [];
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const multiplier = machineId ? parseInt(machineId.replace('vm', '')) : 1;

  dateRange.forEach(date => {
    data.push({
      date: format(date, 'MMM dd'),
      sales: Math.floor((Math.random() * 100 + 20) * multiplier),
    });
  });

  return data;
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [salesData, setSalesData] = useState(() =>
    generateSalesData(subDays(new Date(), 6), new Date())
  );

  const filteredMachines = mockMachines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      setSalesData(generateSalesData(newDate.from, newDate.to, selectedMachine));
    }
  };

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachine(machineId === selectedMachine ? null : machineId);
    if (date?.from && date?.to) {
      setSalesData(generateSalesData(
        date.from,
        date.to,
        machineId === selectedMachine ? undefined : machineId
      ));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Vending Machines Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor the status and stock levels of all vending machines
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Card>
            <CardHeader>
              <CardTitle>Select Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMachine
                ? `Sales Overview - ${mockMachines.find(m => m.id === selectedMachine)?.name}`
                : 'Sales Overview - All Machines'}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <VendingMachineGrid
        machines={filteredMachines}
        selectedMachine={selectedMachine}
        onMachineSelect={handleMachineSelect}
      />
    </div>
  );
};

export default Index;
