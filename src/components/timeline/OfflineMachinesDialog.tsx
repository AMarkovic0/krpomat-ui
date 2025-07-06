
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OfflineMachinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDayData: {
    date: string;
    machines: string[];
  };
}

export const OfflineMachinesDialog = ({
  open,
  onOpenChange,
  selectedDayData
}: OfflineMachinesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offline Machines - {selectedDayData.date}</DialogTitle>
        </DialogHeader>
        <div className="max-h-60 overflow-y-auto">
          {selectedDayData.machines.length > 0 ? (
            <ul className="space-y-2">
              {selectedDayData.machines.map((machineName, index) => (
                <li key={index} className="p-2 bg-muted rounded text-sm">
                  {machineName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No offline machines found for this day.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
