import axios from 'axios';

import { TOKEN, refreshPage, isProd } from '../utils';

const HOST_ADDRESS = isProd() ? "app.krpomat.rs" : "localhost";
const HOST_PORT = isProd() ? 443 : 5000;
const PROTOCOL = isProd() ? "https://" : "http://";
const HOST = PROTOCOL + HOST_ADDRESS + ":" + HOST_PORT + "/api/v1";

function handle401(error) {
  if (typeof error.response === 'undefined') {
    return;
  }

  if (error.response.status === 401) {
    const usr = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (token === null) {
        localStorage.setItem("isAuth", false);
        refreshPage();
    }

    refresh(usr, token);
  }
}

export const login = async (username, password) => {
  let resp = {};

  try {
    await axios.post(HOST + "/login", {
      'username' : username,
      'password' : password
    }).then((data) => { resp = data.data; });

    return resp;
  } catch (error) {
    localStorage.setItem("isAuth", false);
  }
}

export const refresh = async (username, token) => {
  let resp = {};

  try {
    await axios.post(HOST + "/refresh", {
      'username' : username,
      'token' : token
    }).then((data) => { resp = data.data; });

    return resp;
  } catch (error) {
  }
}

export const getSales = async (salesData) => {
  let token = localStorage.getItem(TOKEN());
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/Sales',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
    data: JSON.stringify(salesData)
  };
  let resp = [];

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    handle401(error);
  });

  return resp;
}

export const getMachines = async () => {
  let token = localStorage.getItem(TOKEN());
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: HOST + '/Machines',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
  };
  let resp = [];

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    handle401(error);
  });

  return resp;
}

export const addMachine = async (machine_id, machine_name, username, num_of_prod, phone) => {
  if (typeof username === 'undefined') {
    username = localStorage.getItem("username");
  }

  let token = localStorage.getItem(TOKEN());
  let data = {
    id: +machine_id,
    machine_name: machine_name,
    username: username,
    num_of_prod: +num_of_prod,
    phone_number: phone
  };
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/AddMachine',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
    data: data
  };
  let resp = {};

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    resp = error;
  });

  return resp;
}

export const editMachine = async (machine_id, machine_name, num_of_prod, phone) => {
  let token = localStorage.getItem(TOKEN());
  let data = {
    id: +machine_id,
    machine_name: machine_name,
    num_of_prod: +num_of_prod,
    phone_number: phone
  };
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/EditMachineName',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
    data: data
  };
  let resp = {};

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    resp = error;
  });

  return resp;
}

export const editUsername = async (old_uname, new_uname) => {
  let token = localStorage.getItem(TOKEN());
  let data = {
    old_username: old_uname,
    new_username: new_uname
  };
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/EditUsername',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
    data: data
  };
  let resp = {};

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    resp = error;
  });

  return resp;

}

export const editPassword = async (uname, new_pass) => {
  if (localStorage.getItem("username") !== "admin") {
    return {};
  }

  let token = localStorage.getItem(TOKEN());
  let data = {
    username: uname,
    password: new_pass
  };
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/EditPassword',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
    data: data
  };
  let resp = {};

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    resp = error;
  });

  return resp;

}

export const deleteMachine = async (machine_id) => {
  let token = localStorage.getItem(TOKEN());
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/DeleteMachine/' + machine_id.toString(),
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    }
  };
  let resp = {};

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    resp = error;
  });

  return resp;
}

export const addUser = async (name, pass) => {
  let token = localStorage.getItem(TOKEN());
  let data = {
    username: name,
    password: pass
  };
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: HOST + '/AddUser',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
    data: data
  };
  let resp = {};

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    resp = error;
  });

  return resp;
}

export const getUsers = async () => {
  let token = localStorage.getItem(TOKEN());
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: HOST + '/Users',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-HTTP-Method-Override' : 'GET'
    },
  };
  let resp = [];

  await axios.request(config)
  .then((response) => {
    resp = response.data;
  })
  .catch((error) => {
    handle401(error);
  });

  return resp;
}
