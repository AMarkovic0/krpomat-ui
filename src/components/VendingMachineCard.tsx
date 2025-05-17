
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { VendingMachineSettings } from "./VendingMachineSettings";

interface AverageSale {
  monthly: number[];
  annual: number[];
}

interface VendingMachineCardProps {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: Date;
  stockLevel: boolean[];
  totalSlots: number;
  filledSlots?: number[];
  isSelected?: boolean;
  onClick?: () => void;
  companyName: string;
  phoneNumber: string;
  avgSales: AverageSale;
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
  avgSales,
}: VendingMachineCardProps) {
  const [stockLevel, setStockLevel] = React.useState(initialStockLevel);
  const [totalSlots, setTotalSlots] = React.useState(initialTotalSlots);

  const round2 = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const handleSettingsUpdate = (newSlots: number) => {
    setTotalSlots(newSlots);
    // Adjust stock level array to match new slot count
    const newStockLevel = [...stockLevel];
    if (newSlots > stockLevel.length) {
      // Add new slots as empty (false)
      for (let i = stockLevel.length; i < newSlots; i++) {
        newStockLevel.push(false);
      }
    } else if (newSlots < stockLevel.length) {
      // Remove excess slots
      newStockLevel.splice(newSlots);
    }
    setStockLevel(newStockLevel);
  };

  const getLastSeenString = (date) => {
    let lastSeenTime = lastSeen.getTime();
    let defaultTime = new Date("01.01.1970 00:00:00").getTime();
    return (lastSeenTime === defaultTime) ?
      "Waiting for data..." :
      format(lastSeen, 'dd/MM/yyyy HH:mm:ss');
  }

  // Generate stock level indicators based on current stockLevel
  const renderStockIndicators = () => {
    return Array.from({ length: totalSlots }).map((_, index) => {
      // Calculate if this slot should be filled
      const isFilled = index < stockLevel.length ? stockLevel[index] : false;

      return (
        <div
          key={index}
          className={cn(
            "h-2 w-2 rounded-full",
            isFilled
              ? "bg-green-200"
              : (isOnline ? "bg-red-500" : "bg-gray-200")
          )}
        />
      );
    });
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
              {renderStockIndicators()}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Seen</span>
            <span className="text-sm font-medium">
              {getLastSeenString(lastSeen)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg. Monthly Sale</span>
            <span className="text-sm font-medium">{
              avgSales.monthly && avgSales.monthly[id] ? round2(avgSales.monthly[id]) : 0
            }</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg. Annual Sale</span>
            <span className="text-sm font-medium">{
              avgSales.annual && avgSales.annual[id] ? round2(avgSales.annual[id]) : 0
            }</span>
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
