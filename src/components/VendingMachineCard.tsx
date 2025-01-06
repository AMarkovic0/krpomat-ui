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
  stockLevel: number;
  totalSlots: number;
  filledSlots?: number[];
  isSelected?: boolean;
  onClick?: () => void;
  companyName: string;
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
}: VendingMachineCardProps) {
  const [stockLevel, setStockLevel] = React.useState(initialStockLevel);
  const [totalSlots, setTotalSlots] = React.useState(initialTotalSlots);

  const stockPercentage = (stockLevel / totalSlots) * 100;
  const isLowStock = stockPercentage < 20;

  const handleSettingsUpdate = (newSlots: number) => {
    setTotalSlots(newSlots);
    setStockLevel(Math.min(stockLevel, newSlots));
  };

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
                    filledSlots.includes(index)
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Seen</span>
            <span className="text-sm font-medium">
              {format(lastSeen, 'dd/MM/yyyy HH:mm:ss')}
            </span>
          </div>
        </div>
      </CardContent>
      <VendingMachineSettings
        id={id}
        initialName={name}
        initialSlots={totalSlots}
        initialCompanyName={companyName}
        onSave={handleSettingsUpdate}
      />
    </Card>
  );
}