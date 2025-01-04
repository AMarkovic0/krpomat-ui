import React from "react";
import { VendingMachineCard } from "./VendingMachineCard";
import { Checkbox } from "@/components/ui/checkbox";
import { AddMachineDialog } from "./AddMachineDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface VendingMachine {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: Date;
  stockLevel: number;
  totalSlots: number;
}

interface VendingMachineGridProps {
  machines: VendingMachine[];
  selectedMachine: string | null;
  onMachineSelect: (id: string) => void;
  salesData: any[];
}

export function VendingMachineGrid({
  machines,
  selectedMachine,
  onMachineSelect,
  salesData,
}: VendingMachineGridProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showOffline, setShowOffline] = React.useState(false);
  const [showEmptyStock, setShowEmptyStock] = React.useState(false);
  const itemsPerPage = 6;

  const calculateAverageSales = (machineId: string) => {
    const machineSales = salesData.filter(sale => sale.machineId === machineId);
    if (!machineSales.length) return 0;
    
    const totalSales = machineSales.reduce((acc, day) => {
      let dailyTotal = 0;
      for (let i = 1; i <= 5; i++) {
        if (day[`slot${i}`]) {
          dailyTotal += day[`slot${i}`];
        }
      }
      return acc + dailyTotal;
    }, 0);
    
    return totalSales / machineSales.length;
  };

  const handleAddMachine = (newMachine: {
    userName: string;
    name: string;
    id: string;
    totalSlots: number;
    phone: string;
  }) => {
    const machine: VendingMachine = {
      id: newMachine.id,
      name: newMachine.name,
      location: "New Location",
      isOnline: true,
      lastSeen: new Date(),
      stockLevel: 0,
      totalSlots: newMachine.totalSlots,
    };
    
    console.log("New machine created:", machine);
  };

  const filteredMachines = machines.filter((machine) => {
    if (showOffline && !showEmptyStock) {
      return !machine.isOnline;
    }
    if (!showOffline && showEmptyStock) {
      return machine.isOnline && machine.stockLevel < machine.totalSlots;
    }
    if (showOffline && showEmptyStock) {
      return !machine.isOnline || (machine.isOnline && machine.stockLevel < machine.totalSlots);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const paginatedMachines = filteredMachines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Pre-calculate average sales for all machines
  const machineAverageSales = React.useMemo(() => {
    return machines.reduce((acc, machine) => {
      acc[machine.id] = calculateAverageSales(machine.id);
      return acc;
    }, {} as Record<string, number>);
  }, [salesData, machines]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 mb-4">
        <AddMachineDialog onConfirm={handleAddMachine} />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="offline"
              checked={showOffline}
              onCheckedChange={(checked) => setShowOffline(checked as boolean)}
            />
            <label
              htmlFor="offline"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Offline
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="empty"
              checked={showEmptyStock}
              onCheckedChange={(checked) => setShowEmptyStock(checked as boolean)}
            />
            <label
              htmlFor="empty"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Empty Stock
            </label>
          </div>
        </div>
      </div>

      <div className="relative border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMachines.map((machine) => (
            <VendingMachineCard
              key={machine.id}
              {...machine}
              isSelected={machine.id === selectedMachine}
              onClick={() => onMachineSelect(machine.id)}
              averageSales={machineAverageSales[machine.id]}
            />
          ))}
        </div>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}