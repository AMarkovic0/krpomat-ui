import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown, Download } from "lucide-react";
import { getSales } from "@/api/sales";
import { startOfDay, format } from "date-fns";

interface Column {
  key: string;
  label: string;
  selected: boolean;
}

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
}

export const ExportConfigDialog = ({ open, onOpenChange, onExport }: ExportConfigDialogProps) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open && columns.length === 0) {
      loadSampleData();
    }
  }, [open]);

  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      const salesData = await getSales({
        start_date: format(new Date(), "dd.MM.yyyy."),
        end_date: format(new Date(), "dd.MM.yyyy.")
      });

      if (salesData && salesData.length > 0) {
        const sampleRecord = salesData[0];
        const availableColumns = Object.keys(sampleRecord)
          .filter(key => !isExcludedColumn(key))
          .map(key => ({
            key,
            label: formatColumnLabel(key),
            selected: true
          }));
        setColumns(availableColumns);
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
      // Fallback to common columns if API fails
      setColumns([
        { key: 'id', label: 'ID', selected: true },
        { key: 'machine_id', label: 'Machine ID', selected: true },
        { key: 'product_name', label: 'Product Name', selected: true },
        { key: 'amount', label: 'Amount', selected: true },
        { key: 'date', label: 'Date', selected: true },
      ]);
    }
    setIsLoading(false);
  };

  const isExcludedColumn = (key: string): boolean => {
    const excludedColumns = ['online_status_changed', 'phone_number', 'phone'];
    return excludedColumns.some(excluded => 
      key.toLowerCase().includes(excluded.toLowerCase())
    );
  };

  const formatColumnLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleColumnToggle = (index: number) => {
    setColumns(prev => prev.map((col, i) => 
      i === index ? { ...col, selected: !col.selected } : col
    ));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === columns.length - 1)) {
      return;
    }

    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    setColumns(newColumns);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const selectedColumns = columns.filter(col => col.selected).map(col => col.key);
      await exportConfiguredCSV(selectedColumns);
      onExport();
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(false);
  };

  const exportConfiguredCSV = async (selectedColumns: string[]) => {
    const salesData = await getSales({
      start_date: "01.01.1970.",
      end_date: format(startOfDay(new Date()), "dd.MM.yyyy.")
    });

    if (!salesData || salesData.length === 0) {
      throw new Error('No sales data available');
    }

    // Filter and reorder data based on selected columns
    const filteredData = salesData.map(row => {
      const filteredRow: any = {};
      selectedColumns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });

    const csvContent = convertToCSV(filteredData, selectedColumns);
    downloadCSV(csvContent, 'sales-data-' + format(new Date(), "dd-MM-yyyy-HHmmss") + '.csv');
  };

  const convertToCSV = (data: any[], headers: string[]): string => {
    if (!data.length) return '';

    // Create CSV header row with custom labels
    const csvHeaders = headers.map(header => {
      const column = columns.find(col => col.key === header);
      return column ? column.label : header;
    }).join(',');

    // Create CSV data rows
    const csvRows = data.map(obj =>
      headers.map(header => {
        const value = obj[header];
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

  const selectedCount = columns.filter(col => col.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure CSV Export</DialogTitle>
          <DialogDescription>
            Select which columns to include and arrange their order.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading columns...
            </div>
          ) : (
            columns.map((column, index) => (
              <div key={column.key} className="flex items-center gap-2 p-2 border rounded">
                <Checkbox
                  checked={column.selected}
                  onCheckedChange={() => handleColumnToggle(index)}
                />
                <span className="flex-1 text-sm">{column.label}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(index, 'down')}
                    disabled={index === columns.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">
              {selectedCount} column{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={selectedCount === 0 || isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};