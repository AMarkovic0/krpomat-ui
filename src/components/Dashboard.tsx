import React from "react";
import { DateRange } from "react-day-picker";
import { VendingMachineGrid } from "./VendingMachineGrid";
import { SalesOverviewChart } from "./SalesOverviewChart";
import { SearchBar } from "./SearchBar";
import { OnlineStateTimeline } from "./OnlineStateTimeline";

interface AverageSale {
  monthly: { [machineId: string]: number };
  annual: { [machineId: string]: number };
}

interface DashboardProps {
  machines: any[];
  filteredMachines: any[];
  selectedMachine: string | null;
  onMachineSelect: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  salesData: any[];
  avgSales: AverageSale;
  onlineStateHistory: any[];
  date: DateRange | undefined;
}

export function Dashboard({
  machines,
  filteredMachines,
  selectedMachine,
  onMachineSelect,
  searchQuery,
  onSearchQueryChange,
  salesData,
  avgSales,
  onlineStateHistory,
  date,
}: DashboardProps) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <SalesOverviewChart
          salesData={salesData}
          selectedMachine={selectedMachine}
          machines={filteredMachines}
          dateRange={date}
          searchQuery={searchQuery}
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
        <SearchBar value={searchQuery} onChange={onSearchQueryChange} />
      </div>

      <VendingMachineGrid
        machines={filteredMachines}
        selectedMachine={selectedMachine}
        onMachineSelect={onMachineSelect}
        avgSales={avgSales}
        onlineStateHistory={onlineStateHistory}
        dateRange={date}
      />
    </>
  );
}
