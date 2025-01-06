import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AddMachineDialog } from "./AddMachineDialog";

interface VendingMachineFiltersProps {
  showOffline: boolean;
  showEmptyStock: boolean;
  onOfflineChange: (checked: boolean) => void;
  onEmptyStockChange: (checked: boolean) => void;
  onAddMachine: (newMachine: {
    userName: string;
    name: string;
    id: string;
    totalSlots: number;
    phone: string;
  }) => void;
}

export function VendingMachineFilters({
  showOffline,
  showEmptyStock,
  onOfflineChange,
  onEmptyStockChange,
  onAddMachine,
}: VendingMachineFiltersProps) {
  return (
    <div className="flex items-center gap-6 mb-4">
      <AddMachineDialog onConfirm={onAddMachine} />
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="offline"
            checked={showOffline}
            onCheckedChange={(checked) => onOfflineChange(checked as boolean)}
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
            onCheckedChange={(checked) => onEmptyStockChange(checked as boolean)}
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
  );
}