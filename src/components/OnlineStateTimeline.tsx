
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnlineStateTimelineProps } from "./timeline/types";
import { processHistoryData, generateOptimizedData } from "./timeline/dataProcessing";
import { TimelineChart } from "./timeline/TimelineChart";
import { OfflineMachinesDialog } from "./timeline/OfflineMachinesDialog";

export const OnlineStateTimeline = ({ 
  selectedMachine, 
  history, 
  machines, 
  dateRange 
}: OnlineStateTimelineProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    machines: string[];
  }>({ date: "", machines: [] });

  const offlinePeriods = processHistoryData(selectedMachine, history, dateRange);
  const timelineData = generateOptimizedData(selectedMachine, machines, dateRange, offlinePeriods);

  // Find the selected machine name for display
  const selectedMachineName = selectedMachine ?
    machines.find(m => m.id === selectedMachine)?.name : null;

  const handleBarClick = (data: any) => {
    if (!selectedMachine && data && data.offlineMachineIds) {
      const offlineMachineNames = data.offlineMachineIds
        .map((id: number) => machines.find(m => m.id === id.toString())?.name)
        .filter(Boolean);
      
      setSelectedDayData({
        date: data.formattedDate,
        machines: offlineMachineNames
      });
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="min-w-[300px]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {selectedMachine
              ? `Online Status Timeline - ${selectedMachineName || 'Machine #' + selectedMachine}`
              : 'Daily Offline Machine Count'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart
            selectedMachine={selectedMachine}
            timelineData={timelineData}
            machines={machines}
            onBarClick={handleBarClick}
          />
        </CardContent>
      </Card>

      <OfflineMachinesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDayData={selectedDayData}
      />
    </>
  );
};
