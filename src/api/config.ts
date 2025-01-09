export const isProd = () => process.env.NODE_ENV === "production";

const HOST_ADDRESS = isProd() ? "app.krpomat.rs" : "localhost";
const HOST_PORT = isProd() ? 443 : 5000;
const PROTOCOL = isProd() ? "https://" : "http://";
export const HOST = PROTOCOL + HOST_ADDRESS + ":" + HOST_PORT + "/api/v1";

export const getAuthConfig = (token: string, method: string = 'get') => ({
  method,
  maxBodyLength: Infinity,
  headers: {
    'Authorization': 'Bearer ' + token,
    'X-HTTP-Method-Override': 'GET',
    'Content-Type': 'application/json'
  }
});