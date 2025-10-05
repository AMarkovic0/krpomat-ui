import axios from 'axios';
import { HOST, getAuthConfig } from './config';
import { TOKEN } from '../utils';
import { handle401 } from './auth';

export const getMachines = async () => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!),
    url: HOST + '/Machines'
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    handle401(error);
    return [];
  }
};

export const addMachine = async (machine_id: string, machine_name: string, username?: string, num_of_prod?: number, phone?: string) => {
  const token = localStorage.getItem(TOKEN());
  const actualUsername = username ?? localStorage.getItem("username");

  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/AddMachine',
    data: {
      id: +machine_id,
      machine_name,
      username: actualUsername,
      num_of_prod: +num_of_prod!,
      phone_number: phone
    }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
};

export const editMachine = async (machine_id: string, machine_name: string, num_of_prod: number, phone: string) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/EditMachineName',
    data: {
      id: +machine_id,
      machine_name,
      num_of_prod: +num_of_prod,
      phone_number: phone
    }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
};

export const deleteMachine = async (machine_id: string) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/DeleteMachine/' + machine_id
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
};

export const updateMachineSlots = async (machine_id: string, slots: Record<number, string>) => {
  const token = localStorage.getItem(TOKEN());
  
  // Convert slot assignments to the format expected by the API
  // slots is { slotIndex: productKey }
  const slotData = Object.entries(slots).map(([slotIndex, productKey]) => ({
    slot: parseInt(slotIndex) + 1, // Slots are 1-indexed on the server
    product_key: productKey === 'none' ? null : productKey
  }));

  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/UpdateMachineSlots',
    data: {
      machine_id: +machine_id,
      slots: slotData
    }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to update machine slots' };
  }
};

export const getMachineSlots = async (machine_id: string) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!),
    url: HOST + '/GetMachineSlots/' + machine_id
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    handle401(error);
    return { error: error.response?.data?.message || 'Failed to fetch machine slots' };
  }
};
