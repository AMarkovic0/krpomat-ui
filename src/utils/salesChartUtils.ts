
export const processDataByMachine = (
  data: any[], 
  selectedMachine: string | null, 
  searchQuery: string, 
  selectedMachineData: any
) => {
  if (selectedMachine && selectedMachineData) {
    // Filter for specific machine
    return data.filter(sale => sale.machine_id === selectedMachine);
  }
  
  if (searchQuery) {
    // Filter by search query - this would need machine data to match names
    // For now, return all data as we don't have machine names in sales data
    return data;
  }
  
  // Return all data
  return data;
};

export const processDataByDate = (
  salesData: any[], 
  dateRange: any, 
  numSlots: number, 
  formatFn: (date: Date, format: string) => string
) => {
  // Initialize all dates in the range first
  const groupedByDate: { [key: string]: any } = {};
  
  if (dateRange?.from) {
    const startDate = new Date(dateRange.from);
    const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();
    
    // Create entries for all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = formatFn(currentDate, 'dd MMM');
      groupedByDate[dateKey] = {
        date: dateKey,
        sortDate: new Date(currentDate), // Keep the actual date for sorting
        ...Array.from({ length: numSlots }, (_, i) => ({ [`slot${i + 1}`]: 0 })).reduce((acc, slot) => ({ ...acc, ...slot }), {})
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  // Now populate with actual sales data
  salesData.forEach(sale => {
    const saleDate = sale.sale_date || sale.date;
    if (!saleDate) return;
    
    // Parse the date (assuming format like "1.1.2024 10:30:00")
    const [datePart] = saleDate.split(' ');
    const [day, month, year] = datePart.split('.');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Use a more readable date format for labels
    const dateKey = formatFn(date, 'dd MMM');
    
    // Only add sales if we have an entry for this date (within range)
    if (groupedByDate[dateKey]) {
      // Add sale to appropriate slot
      const slotNumber = sale.slot_number || 1;
      if (slotNumber >= 1 && slotNumber <= numSlots) {
        groupedByDate[dateKey][`slot${slotNumber}`] += 1;
      }
    }
  });
  
  // Convert to array and sort by actual date (oldest to newest)
  return Object.values(groupedByDate)
    .sort((a: any, b: any) => a.sortDate.getTime() - b.sortDate.getTime())
    .map(({ sortDate, ...rest }) => rest); // Remove sortDate from final result
};
