
import axios from 'axios';
import { HOST, getAuthConfig } from './config';
import { TOKEN } from '../utils';

export const login = async (username: string, password: string) => {
  try {
    const { data } = await axios.post(HOST + "/login", { username, password });
    return data;
  } catch (error) {
    localStorage.setItem("isAuth", "false");
    return {};
  }
};

export const refresh = async (username: string, token: string) => {
  try {
    const { data } = await axios.post(HOST + "/refresh", { username, token });
    return data;
  } catch (error) {
    return {};
  }
};

export function handle401(error: any) {
  if (!error?.response) return;

  if (error.response.status === 401) {
    const usr = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.setItem("isAuth", "false");
      // Don't use refreshPage() here - let React Router handle this
      window.location.href = "/login"; // This is safe as we're doing a full redirect
    } else {
      refresh(usr!, token!);
    }
  }
}
