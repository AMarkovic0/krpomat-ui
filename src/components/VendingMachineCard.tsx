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
  isSelected?: boolean;
  onClick?: () => void;
}

export function VendingMachineCard({
  id,
  name,
  location,
  isOnline,
  lastSeen,
  stockLevel: initialStockLevel,
  totalSlots: initialTotalSlots,
  isSelected,
  onClick,
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center justify-between w-full">
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
            <span className={cn(
              "text-sm font-medium",
              isLowStock && "text-red-500"
            )}>
              {stockLevel}/{totalSlots} slots filled
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Seen</span>
            <span className="text-sm font-medium">
              {format(lastSeen, 'dd/MM/yy')}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className={cn(
                "h-2.5 rounded-full",
                stockPercentage > 20 ? "bg-blue-600" : "bg-red-500"
              )}
              style={{ width: `${stockPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <VendingMachineSettings
        id={id}
        initialName={name}
        initialSlots={totalSlots}
        onSave={handleSettingsUpdate}
      />
    </Card>
  );
}