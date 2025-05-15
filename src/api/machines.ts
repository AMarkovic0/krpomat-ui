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

export const getOnlineStateHistory = async () => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!),
    url: HOST + '/OnlineStateHistory'
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
}
