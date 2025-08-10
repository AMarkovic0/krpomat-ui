import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportSalesDataToCSV } from "@/utils/csvExport";
import { useToast } from "@/hooks/use-toast";

export const ExportSalesButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();



  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSalesDataToCSV();
      toast({
        title: "Export Successful",
        description: "Sales data has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export sales data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export All Sales"}
    </Button>
  );
};
