import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface TimelineEvent {
  machineId: string;
  machineName: string;
  timestamp: Date;
  isOnline: boolean;
}

interface OnlineStateTimelineProps {
  selectedMachine: string | null;
  machines: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    lastSeen: Date;
  }>;
}

export const OnlineStateTimeline = ({ selectedMachine, machines }: OnlineStateTimelineProps) => {
  // Generate mock timeline data based on machines' last seen timestamps
  const generateTimelineEvents = (): TimelineEvent[] => {
    return machines
      .filter(machine => !selectedMachine || machine.id === selectedMachine)
      .map(machine => ({
        machineId: machine.id,
        machineName: machine.name,
        timestamp: machine.lastSeen,
        isOnline: machine.isOnline,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const timelineEvents = generateTimelineEvents();

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {selectedMachine
            ? `Online Status Timeline - ${machines.find(m => m.id === selectedMachine)?.name}`
            : 'Online Status Timeline - All Machines'}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={`${event.machineId}-${index}`} className="flex items-start gap-4">
              <div className="relative flex-none">
                <div
                  className={`h-3 w-3 rounded-full ${
                    event.isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-1.5 top-3 h-full w-px bg-border" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">
                  {event.machineName} - {event.isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(event.timestamp, 'PPpp')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};