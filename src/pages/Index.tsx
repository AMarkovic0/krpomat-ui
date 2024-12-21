import { useState } from "react";
import { VendingMachineCard } from "@/components/VendingMachineCard";
import { SearchBar } from "@/components/SearchBar";

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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMachines = mockMachines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Vending Machines Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor the status and stock levels of all vending machines
        </p>
      </div>
      
      <div className="mb-6 max-w-md">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
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