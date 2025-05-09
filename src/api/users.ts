import axios from 'axios';
import { HOST, getAuthConfig } from './config';
import { TOKEN } from '../utils';
import { handle401 } from './auth';

export const getUsers = async () => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!),
    url: HOST + '/Users'
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    handle401(error);
    return [];
  }
};

export const addUser = async (name: string, pass: string) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/AddUser',
    data: { username: name, password: pass }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
};

export const editUsername = async (old_uname: string, new_uname: string) => {
  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/EditUsername',
    data: { old_username: old_uname, new_username: new_uname }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
};

export const editPassword = async (uname: string, new_pass: string) => {
  if (localStorage.getItem("username") !== "admin") {
    return {};
  }

  const token = localStorage.getItem(TOKEN());
  const config = {
    ...getAuthConfig(token!, 'post'),
    url: HOST + '/EditPassword',
    data: { username: uname, password: new_pass }
  };

  try {
    const { data } = await axios.request(config);
    return data;
  } catch (error) {
    return error;
  }
};
