
import { useState, useCallback, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { VendingMachineGrid } from "@/components/VendingMachineGrid";
import { SalesOverviewChart } from "@/components/SalesOverviewChart";
import { DateSelector } from "@/components/DateSelector";
import { OnlineStateTimeline } from "@/components/OnlineStateTimeline";
import { generateSalesData } from "@/utils/mockData";
import { DateTime } from "luxon";

import { getMachines } from "../api";

const MIN10_IN_MS = 60 * 1000 * 10;

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

  const [machines, setMachines] = useState<any[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      stockLevel: machine.p1,
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
      
      setIsLoading(true);
      try {
        const data = await getMachines();
        const repackedMachines = data.map((machine: any, index: number) => 
          repackMachines(machine, index)
        );
        
        setMachines(repackedMachines);
        filterMachines(repackedMachines, searchQuery);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching machines:', error);
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, [repackMachines]);

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
    if (newDate?.from && newDate?.to) {
      setSalesData(generateSalesData(newDate.from, newDate.to, selectedMachine));
    }
  }, [selectedMachine]);

  const handleMachineSelect = useCallback((machineId: string) => {
    setSelectedMachine(machineId === selectedMachine ? null : machineId);
    if (date?.from && date?.to) {
      setSalesData(generateSalesData(
        date.from,
        date.to,
        machineId === selectedMachine ? undefined : machineId
      ));
    }
  }, [selectedMachine, date]);

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
          />
        </div>
      </div>

      <div className="mb-6">
        <OnlineStateTimeline
          selectedMachine={selectedMachine}
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
      />
    </div>
  );
};

export default Index;
