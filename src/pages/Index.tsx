import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { VendingMachineGrid } from "@/components/VendingMachineGrid";
import { SalesOverviewChart } from "@/components/SalesOverviewChart";
import { DateSelector } from "@/components/DateSelector";
import { OnlineStateTimeline } from "@/components/OnlineStateTimeline";
import { mockMachines } from "@/utils/mockData";
import { generateSalesData } from "@/utils/salesDataGenerator";

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
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Vending Machines Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Monitor the status and stock levels of all vending machines
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <div className="flex flex-col order-2 lg:order-1 min-h-[300px]">
          <DateSelector date={date} onSelect={handleDateSelect} />
        </div>

        <div className="flex flex-col order-1 lg:order-2 min-h-[300px]">
          <SalesOverviewChart 
            salesData={salesData}
            selectedMachine={selectedMachine}
            machines={mockMachines}
          />
        </div>
      </div>

      <div className="mb-6">
        <OnlineStateTimeline
          selectedMachine={selectedMachine}
          machines={mockMachines}
          dateRange={date}
        />
      </div>

      <div className="w-full mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
