import axios from 'axios';
import { HOST, getAuthConfig } from './config';
import { TOKEN } from '../utils';
import { handle401 } from './auth';

export interface Product {
  id: string;
  name: string;
  key: string;
  price: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!),
    url: HOST + '/Products'
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    handle401(error);
    return [];
  }
};

export const addProduct = async (name: string, key: string, price: number) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/AddProduct',
    data: { name, key, price }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to add product' };
  }
};

export const editProduct = async (id: string, name: string, key: string, price: number) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'put'),
    url: HOST + '/EditProduct',
    data: { id, name, key, price }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to edit product' };
  }
};

export const deleteProduct = async (id: string) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'delete'),
    url: HOST + '/DeleteProduct',
    data: { id }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to delete product' };
  }
};