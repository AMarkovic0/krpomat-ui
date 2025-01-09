import * as React from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

//export function Copyright() {
//  return (
//    <Typography variant="body2" color="text.secondary">
//      {'Copyright © '}
//      <Link color="inherit" href="https://app.krpomat.rs/">
//        KRPOMAT RS
//      </Link>{' '}
//      {new Date().getFullYear()}
//      {'.'}
//    </Typography>
//  );
//}

export function refreshPage() {
  window.location.reload();
}

export function TOKEN() { return "booolassw"; };

export function dateToIso(date) {
  let sdate = date.split(" ");
  return sdate[0].split(".").reverse().join("-") + (sdate[1] ? (" " + sdate[1]) : "");
}

export function isProd() {
  return (process.env.NODE_ENV === "production");
}
