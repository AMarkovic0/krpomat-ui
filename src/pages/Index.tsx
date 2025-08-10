
import { useState, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { VendingMachineGrid } from "@/components/VendingMachineGrid";
import { SalesOverviewChart } from "@/components/SalesOverviewChart";
import { DateSelector } from "@/components/DateSelector";
import { OnlineStateTimeline } from "@/components/OnlineStateTimeline";
import { AverageSalesCard } from "@/components/AverageSalesCard";
import { MonthlySalesHistoryCard } from "@/components/MonthlySalesHistoryCard";
import { useMachines } from "@/hooks/useMachines";
import { useSalesData } from "@/hooks/useSalesData";
import { calculateAverages } from "@/utils/salesCalculations";
import { ExportSalesButton } from "@/components/ExportSalesButton";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  const { machines, filteredMachines, filterMachines } = useMachines();
  const { salesData, avgSales, onlineStateHistory } = useSalesData(date, selectedMachine);

  const searchQueryChangeHandler = useCallback((query: string) => {
    setSearchQuery(query);
    filterMachines(machines, query);
  }, [machines, filterMachines]);

  const handleDateSelect = useCallback((newDate: DateRange | undefined) => {
    setDate(newDate);
  }, []);

  const handleMachineSelect = useCallback((machineId: string) => {
    setSelectedMachine(machineId === selectedMachine ? null : machineId);
  }, [selectedMachine]);

  const averages = calculateAverages(avgSales);

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Vending Machines Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Monitor the status and stock levels of all vending machines
            </p>
          </div>
          <ExportSalesButton />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <div className="flex flex-col order-2 lg:order-1 min-h-[300px]">
          <DateSelector date={date} onSelect={handleDateSelect} />
        </div>

        <div className="flex flex-col order-1 lg:order-2 min-h-[300px]">
          <SalesOverviewChart
            salesData={salesData}
            selectedMachine={selectedMachine}
            machines={filteredMachines}
            dateRange={date}
            searchQuery={searchQuery}
            avgSales={avgSales}
          />
        </div>
      </div>

      <div className="mb-6">
        <MonthlySalesHistoryCard />
      </div>

      <div className="mb-6">
        <AverageSalesCard
          averages={averages}
        />
      </div>

      <div className="mb-6">
        <OnlineStateTimeline
          selectedMachine={selectedMachine}
          history={onlineStateHistory}
          machines={machines}
          dateRange={date}
        />
      </div>

      <div className="w-full mb-6">
        <SearchBar value={searchQuery} onChange={searchQueryChangeHandler} />
      </div>

      <VendingMachineGrid
        machines={filteredMachines}
        selectedMachine={selectedMachine}
        onMachineSelect={handleMachineSelect}
        avgSales={avgSales}
        onlineStateHistory={onlineStateHistory}
        dateRange={date}
      />
    </div>
  );
};

export default Index;
