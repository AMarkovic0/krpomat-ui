
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { VendingMachineSettings } from "./VendingMachineSettings";

interface VendingMachineCardProps {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: Date;
  stockLevel: boolean[]; // Changed from number to boolean[]
  totalSlots: number;
  filledSlots?: number[];
  isSelected?: boolean;
  onClick?: () => void;
  companyName: string;
  phoneNumber: string;
}

export function VendingMachineCard({
  id,
  name,
  location,
  isOnline,
  lastSeen,
  stockLevel: initialStockLevel,
  totalSlots: initialTotalSlots,
  filledSlots = [0, 2, 4],
  isSelected,
  onClick,
  companyName,
  phoneNumber,
}: VendingMachineCardProps) {
  const [stockLevel, setStockLevel] = React.useState<boolean[]>(
    Array.isArray(initialStockLevel) ? initialStockLevel : Array(initialTotalSlots).fill(false)
  );
  const [totalSlots, setTotalSlots] = React.useState(initialTotalSlots);

  const filledSlotsCount = stockLevel.filter(Boolean).length;
  const stockPercentage = (filledSlotsCount / totalSlots) * 100;
  const isLowStock = stockPercentage < 20;

  const handleSettingsUpdate = (newSlots: number) => {
    setTotalSlots(newSlots);
    // Adjust stockLevel array to match new slot count
    setStockLevel(prevStockLevel => {
      if (prevStockLevel.length > newSlots) {
        return prevStockLevel.slice(0, newSlots);
      } else {
        const newStockLevel = [...prevStockLevel];
        while (newStockLevel.length < newSlots) {
          newStockLevel.push(false);
        }
        return newStockLevel;
      }
    });
  };

  const getLastSeenString = (date) => {
    let lastSeenTime = lastSeen.getTime();
    let defaultTime = new Date("01.01.1970 00:00:00").getTime();
    return (lastSeenTime === defaultTime) ?
      "Waiting for data..." :
      format(lastSeen, 'dd/MM/yyyy HH:mm:ss');
  }

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow cursor-pointer relative",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-lg font-bold">{name}</CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isOnline && "bg-green-500 animate-pulse",
                !isOnline && "bg-red-500"
              )}
            />
            <span className="text-sm text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground flex justify-between items-center">
            <span>Company:</span>
            <span className="font-medium">{companyName}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Location</span>
            <span className="text-sm font-medium">{location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Stock Level</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSlots }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    stockLevel[index] ? "bg-primary" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Seen</span>
            <span className="text-sm font-medium">
              {getLastSeenString(lastSeen)}
            </span>
          </div>
        </div>
      </CardContent>
      <VendingMachineSettings
        id={id}
        initialName={name}
        initialSlots={totalSlots}
        initialCompanyName={companyName}
        initialPhone={phoneNumber}
        onSave={handleSettingsUpdate}
      />
    </Card>
  );
}
