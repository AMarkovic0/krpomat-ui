import { useState, useCallback, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { VendingMachineGrid } from "@/components/VendingMachineGrid";
import { SalesOverviewChart } from "@/components/SalesOverviewChart";
import { DateSelector } from "@/components/DateSelector";
import { OnlineStateTimeline } from "@/components/OnlineStateTimeline";
import { DateTime } from "luxon";

import { getMachines, getSales, getOnlineStateHistory, getAvgSales } from "../api";
import { dateToIso } from "@/utils";

// Define the AverageSale type
interface AverageSale {
  monthly: { [machineId: string]: number };
  annual: { [machineId: string]: number };
}

const MIN10_IN_MS = 60 * 1000 * 10;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [avgSales, setAvgSalesData] = useState<AverageSale>({
    monthly: {},
    annual: {}
  });

  const [onlineStateHistory, setOnlineStateHistory] = useState<any[]>([]);

  const [machines, setMachines] = useState<any[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<any[]>([]);

  const makeMachineStockLevel = useCallback((machine: any) => {
    let levels = [];

    for (let i = 1; i < machine.num_of_prod + 1; i++) {
      let lvl = machine['p' + i];
      levels.push(lvl === 1);
    }

    return levels;
  }, []);

  const repackMachines = useCallback((machine: any, index: number) => {
    const repacked = {
      id: machine.machine_id,
      name: machine.machine_name,
      location: machine.machine_name,
      isOnline: true,
      lastSeen: DateTime.fromFormat(
        machine.sale_date,
        "dd.MM.yyyy HH:mm:ss"
      ).toJSDate(),
      onlineStatusChanged: DateTime.fromFormat(
        machine.online_status_changed,
        "dd.MM.yyyy HH:mm:ss"
      ).toJSDate(),
      stockLevel: makeMachineStockLevel(machine),
      totalSlots: machine.num_of_prod,
      companyName: machine.username,
      phoneNumber: machine.phone_number,
    };

    let lastSeenTimeOffset = repacked.lastSeen.getTime() + MIN10_IN_MS;
    repacked.isOnline = new Date(lastSeenTimeOffset) > new Date();

    return repacked;
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      if (filteredMachines.length > 0) return;

      try {
        const data = await getMachines();
        const repackedMachines = data.map((machine: any, index: number) =>
          repackMachines(machine, index)
        );

        setMachines(repackedMachines);
        filterMachines(repackedMachines, searchQuery);
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };

    fetchMachines();
  }, [repackMachines]);

  // Fetch sales data when date range or selected machine changes
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!date?.from) return;
      const toDate = date?.to || new Date(); // Use current date as fallback if to is undefined

      try {
        const formattedFromDate = `${date.from.getDate()}.${date.from.getMonth() + 1}.${date.from.getFullYear()}.`;
        const formattedToDate = `${toDate.getDate()}.${toDate.getMonth() + 1}.${toDate.getFullYear()}.`;

        const salesParams = {
          start_date: formattedFromDate,
          end_date: formattedToDate,
          machine_id: selectedMachine || undefined
        };

        const data = await getSales(salesParams);
        setSalesData(data);

        const history = await getOnlineStateHistory(salesParams);
        setOnlineStateHistory(history);

        const avg_sale = await getAvgSales();
        setAvgSalesData(avg_sale);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]);
      }
    };

    fetchSalesData();
  }, [date, selectedMachine]);

  const filterMachines = useCallback((machineList: any[], query: string) => {
    const filtered = machineList.filter(
      (machine) =>
        machine.name.toLowerCase().includes(query.toLowerCase()) ||
        machine.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, []);

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
            machines={filteredMachines}
            dateRange={date}
            searchQuery={searchQuery}
            avgSales={avgSales}
          />
        </div>
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
