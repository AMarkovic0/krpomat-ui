import { useState } from "react";
import { VendingMachineCard } from "@/components/VendingMachineCard";
import { SearchBar } from "@/components/SearchBar";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { addDays, format, subDays } from "date-fns";

// Mock data - in a real app, this would come from an API
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
];

// Mock sales data
const generateSalesData = (startDate: Date, endDate: Date) => {
  const data = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    data.push({
      date: format(currentDate, 'MMM dd'),
      sales: Math.floor(Math.random() * 100) + 20,
    });
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [salesData, setSalesData] = useState(() => 
    generateSalesData(subDays(new Date(), 6), new Date())
  );

  const filteredMachines = mockMachines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setSalesData(generateSalesData(subDays(newDate, 6), newDate));
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
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <ChartTooltip>
                    <ChartTooltipContent />
                  </ChartTooltip>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMachines.map((machine) => (
          <VendingMachineCard key={machine.id} {...machine} />
        ))}
      </div>
    </div>
  );
};

export default Index;