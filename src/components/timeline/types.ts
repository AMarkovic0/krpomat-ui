
import { DateRange } from "react-day-picker";

export interface OnlineStateHistory {
  machine_id: number;
  last_report: string;
  new_report: string;
}

export interface OnlineStateEvent {
  startTime: Date;
  endTime: Date;
  status: number; // 0 for offline
  machineId: number;
}

export interface Machine {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: Date;
  onlineStatusChanged?: Date;
}

export interface OnlineStateTimelineProps {
  selectedMachine: string | null;
  history: OnlineStateHistory[];
  machines: Machine[];
  dateRange: DateRange | undefined;
}

export interface DailyData {
  date: string;
  formattedDate: string;
  totalMinutes: number;
  offlineMinutes: number;
  onlinePercentage: number;
}

export interface DailyOfflineCount {
  date: string;
  formattedDate: string;
  offlineMachineCount: number;
  offlineMachineIds: number[];
}
