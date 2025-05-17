
// Define common types used throughout the application
export interface AverageSale {
  monthly: {
    [machineId: string]: number;
  };
  annual: {
    [machineId: string]: number;
  };
}
