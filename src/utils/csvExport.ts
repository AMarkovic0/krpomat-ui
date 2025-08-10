import { getSales } from "@/api/sales";

export const exportSalesDataToCSV = async () => {
  try {
    // Get all sales data without date filters
    const salesData = await getSales({});
    
    if (!salesData || salesData.length === 0) {
      throw new Error('No sales data available');
    }

    // Convert data to CSV format
    const csvContent = convertToCSV(salesData);
    
    // Create and download the file
    downloadCSV(csvContent, 'sales-data-all-time.csv');
  } catch (error) {
    console.error('Error exporting sales data:', error);
    throw error;
  }
};

const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';

  // Get all unique keys from all objects
  const headers = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  );

  // Create CSV header row
  const csvHeaders = headers.join(',');

  // Create CSV data rows
  const csvRows = data.map(obj => 
    headers.map(header => {
      const value = obj[header];
      // Handle values that contain commas, quotes, or line breaks
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};