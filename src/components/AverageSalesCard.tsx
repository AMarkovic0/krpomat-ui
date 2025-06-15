
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AverageSalesCardProps {
  averages: {
    monthly: number;
    annual: number;
    selected: number;
  };
  selectedMachine?: string | null;
  selectedMachineData?: {
    name: string;
  } | null;
  searchQuery?: string;
}

export const AverageSalesCard = ({ 
  averages, 
  selectedMachine, 
  selectedMachineData, 
  searchQuery = "" 
}: AverageSalesCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {selectedMachineData
            ? `Average Sales - ${selectedMachineData.name}`
            : searchQuery
              ? `Average Sales - Filtered by "${searchQuery}"`
              : 'Average Sales - All Machines'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex justify-center space-x-6 text-xs">
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Monthly Avg</div>
            <div className="font-semibold">{averages.monthly.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Annual Avg</div>
            <div className="font-semibold">{averages.annual.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Selected Avg</div>
            <div className="font-semibold">{averages.selected.toFixed(1)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
