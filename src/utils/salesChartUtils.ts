
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
  // Group sales by date
  const groupedByDate: { [key: string]: any } = {};
  
  salesData.forEach(sale => {
    const saleDate = sale.sale_date || sale.date;
    if (!saleDate) return;
    
    // Parse the date (assuming format like "1.1.2024 10:30:00")
    const [datePart] = saleDate.split(' ');
    const [day, month, year] = datePart.split('.');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dateKey = formatFn(date, 'MMM dd');
    
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: dateKey,
        ...Array.from({ length: numSlots }, (_, i) => ({ [`slot${i + 1}`]: 0 })).reduce((acc, slot) => ({ ...acc, ...slot }), {})
      };
    }
    
    // Add sale to appropriate slot
    const slotNumber = sale.slot_number || 1;
    if (slotNumber >= 1 && slotNumber <= numSlots) {
      groupedByDate[dateKey][`slot${slotNumber}`] += 1;
    }
  });
  
  // Convert to array and sort by date
  return Object.values(groupedByDate).sort((a: any, b: any) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};
