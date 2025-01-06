import React from "react";
import { VendingMachineCard } from "./VendingMachineCard";
import { VendingMachineFilters } from "./VendingMachineFilters";
import { VendingMachinePagination } from "./VendingMachinePagination";

interface VendingMachine {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: Date;
  stockLevel: number;
  totalSlots: number;
  companyName: string;
}

interface VendingMachineGridProps {
  machines: VendingMachine[];
  selectedMachine: string | null;
  onMachineSelect: (id: string) => void;
}

export function VendingMachineGrid({
  machines,
  selectedMachine,
  onMachineSelect,
}: VendingMachineGridProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showOffline, setShowOffline] = React.useState(false);
  const [showEmptyStock, setShowEmptyStock] = React.useState(false);
  const itemsPerPage = 6;

  const handleAddMachine = (newMachine: {
    userName: string;
    name: string;
    id: string;
    totalSlots: number;
    phone: string;
    companyName: string;
  }) => {
    const machine: VendingMachine = {
      id: newMachine.id,
      name: newMachine.name,
      location: "New Location",
      isOnline: true,
      lastSeen: new Date(),
      stockLevel: 0,
      totalSlots: newMachine.totalSlots,
      companyName: newMachine.companyName,
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

  return (
    <div className="space-y-6">
      <VendingMachineFilters
        showOffline={showOffline}
        showEmptyStock={showEmptyStock}
        onOfflineChange={setShowOffline}
        onEmptyStockChange={setShowEmptyStock}
        onAddMachine={handleAddMachine}
      />

      <div className="relative border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMachines.map((machine) => (
            <VendingMachineCard
              key={machine.id}
              {...machine}
              isSelected={machine.id === selectedMachine}
              onClick={() => onMachineSelect(machine.id)}
            />
          ))}
        </div>
      </div>

      <VendingMachinePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}