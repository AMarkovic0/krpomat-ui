
import { useState, useCallback, useEffect } from "react";
import { DateTime } from "luxon";
import { getMachines } from "../api";

const MIN10_IN_MS = 60 * 1000 * 10;

interface Machine {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: Date;
  onlineStatusChanged: Date;
  stockLevel: boolean[];
  totalSlots: number;
  companyName: string;
  phoneNumber: string;
}

export const useMachines = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<any[]>([]);

  const makeMachineStockLevel = useCallback((machine: any) => {
    let levels = [];
    for (let i = 1; i < machine.num_of_prod + 1; i++) {
      let lvl = machine['p' + i];
      levels.push(lvl === 1);
    }
    return levels;
  }, []);

  const repackMachines = useCallback((machine: any) => {
    const repacked = {
      id: machine.machine_id,
      name: machine.machine_name,
      location: machine.machine_name,
      isOnline: true,
      lastSeen: DateTime.fromFormat(
        machine.sale_date,
        "dd.MM.yyyy HH:mm:ss"
      ).toJSDate(),
      onlineStatusChanged: DateTime.fromFormat(
        machine.online_status_changed,
        "dd.MM.yyyy HH:mm:ss"
      ).toJSDate(),
      stockLevel: makeMachineStockLevel(machine),
      totalSlots: machine.num_of_prod,
      companyName: machine.username,
      phoneNumber: machine.phone_number,
    };

    let lastSeenTimeOffset = repacked.lastSeen.getTime() + MIN10_IN_MS;
    repacked.isOnline = new Date(lastSeenTimeOffset) > new Date();

    return repacked;
  }, [makeMachineStockLevel]);

  const filterMachines = useCallback((machineList: any[], query: string) => {
    const filtered = machineList.filter(
      (machine) =>
        machine.name.toLowerCase().includes(query.toLowerCase()) ||
        machine.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      if (filteredMachines.length > 0) return;

      try {
        const data = await getMachines();
        const repackedMachines = data.map((machine: any) =>
          repackMachines(machine)
        );

        setMachines(repackedMachines);
        setFilteredMachines(repackedMachines);
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };

    fetchMachines();
  }, [repackMachines, filteredMachines.length]);

  return {
    machines,
    filteredMachines,
    filterMachines
  };
};
