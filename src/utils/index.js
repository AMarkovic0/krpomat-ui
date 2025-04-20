
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

// We'll remove the refreshPage function as it's causing security issues
// and replace it with a better approach using React Router

export function TOKEN() { return "booolassw"; };

export function dateToIso(date) {
  let sdate = date.split(" ");
  return sdate[0].split(".").reverse().join("-") + (sdate[1] ? (" " + sdate[1]) : "");
}

export function isProd() {
  return (process.env.NODE_ENV === "production");
}
