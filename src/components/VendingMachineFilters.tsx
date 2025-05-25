
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AddMachineDialog } from "./AddMachineDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VendingMachineFiltersProps {
  showOffline: boolean;
  showEmptyStock: boolean;
  onOfflineChange: (checked: boolean) => void;
  onEmptyStockChange: (checked: boolean) => void;
  onSortChange?: (value: string) => void;
  sortBy?: string;
  onAddMachine: (newMachine: {
    userName: string;
    name: string;
    id: string;
    totalSlots: number;
    phone: string;
    companyName: string;
  }) => void;
}

export function VendingMachineFilters({
  showOffline,
  showEmptyStock,
  onOfflineChange,
  onEmptyStockChange,
  onSortChange,
  sortBy = "none",
  onAddMachine,
}: VendingMachineFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <AddMachineDialog onConfirm={onAddMachine} />
      
      <div className="w-52">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sorting</SelectItem>
            <SelectItem value="monthly">By Avg. Monthly Sale</SelectItem>
            <SelectItem value="annual">By Avg. Annual Sale</SelectItem>
            <SelectItem value="offline-count">By Offline Count</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
