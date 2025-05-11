
// Remove the unused React and Material UI imports

export function TOKEN() { return "booolassw"; };

export function dateToIso(date) {
  if (!date) return "";
  
  try {
    // Check if it's already a Date object
    if (date instanceof Date) {
      return date.toISOString().split('T')[0] + " " + date.toTimeString().split(' ')[0];
    }
    
    // Check if it's a string in the format DD.MM.YYYY HH:MM:SS
    let sdate = date.split(" ");
    if (sdate.length >= 1 && sdate[0].includes('.')) {
      return sdate[0].split(".").reverse().join("-") + (sdate[1] ? (" " + sdate[1]) : "");
    }
    
    // Return the original value if we can't parse it
    return date;
  } catch (error) {
    console.error("Error in dateToIso:", error, date);
    return "";
  }
}

export function isProd() {
  return (process.env.NODE_ENV === "production");
}
