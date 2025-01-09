import axios from 'axios';
import { HOST, getAuthConfig } from './config';
import { TOKEN } from '../utils';
import { handle401 } from './auth';

export const getSales = async (salesData: any) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/Sales',
    data: JSON.stringify(salesData)
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    handle401(error);
    return [];
  }
};