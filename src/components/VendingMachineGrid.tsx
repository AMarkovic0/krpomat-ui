import React from "react";
import { VendingMachineCard } from "./VendingMachineCard";
import { VendingMachineFilters } from "./VendingMachineFilters";
import { VendingMachinePagination } from "./VendingMachinePagination";
import { addMachine } from './../api';
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AverageSale {
  monthly: number;
  annual: number;
}

interface VendingMachine {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: Date;
  stockLevel: boolean[];
  totalSlots: number;
  companyName: string;
  phoneNumber?: string;
}

interface VendingMachineGridProps {
  machines: VendingMachine[];
  selectedMachine: string | null;
  onMachineSelect: (id: string) => void;
  avgSales: AverageSale;
}

export function VendingMachineGrid({
  machines,
  selectedMachine,
  onMachineSelect,
  avgSales,
}: VendingMachineGridProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showOffline, setShowOffline] = React.useState(false);
  const [showEmptyStock, setShowEmptyStock] = React.useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 6;

  const handleAddMachine = (newMachine: {
    userName: string;
    name: string;
    id: string;
    totalSlots: number;
    phone: string;
    companyName: string;
  }) => {
    addMachine(
      newMachine.id,
      newMachine.name,
      newMachine.userName,
      newMachine.totalSlots,
      newMachine.phone
    ).then(() => {
      toast({
        title: "Success",
        description: "Machine added successfully"
      });
      // Use React Router to refresh the page
      navigate(0);
    }).catch(error => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add machine"
      });
    });
  };

  const filteredMachines = machines.filter((machine) => {
    if (showOffline) {
      return !machine.isOnline;
    }
    if (!showOffline && showEmptyStock) {
      // Check if all stock levels are false (empty)
      const hasEmptyStock = machine.stockLevel.every(slot => slot === false);
      return machine.isOnline && hasEmptyStock;
    }
    return true;
  });

  let paginatedMachines = [];
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);

  if (filteredMachines.length <= 6) {
    paginatedMachines = filteredMachines;
  } else {
    paginatedMachines = filteredMachines.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }

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
              id={machine.id}
              name={machine.name}
              location={machine.location}
              isOnline={machine.isOnline}
              lastSeen={machine.lastSeen}
              stockLevel={machine.stockLevel}
              totalSlots={machine.totalSlots}
              phoneNumber={machine.phoneNumber || ""}
              companyName={machine.companyName}
              avgSales={avgSales}
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
