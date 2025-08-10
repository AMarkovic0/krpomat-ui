import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportConfigDialog } from "./ExportConfigDialog";
import { useToast } from "@/hooks/use-toast";

export const ExportSalesButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExportSuccess = () => {
    toast({
      title: "Export Successful",
      description: "Sales data has been downloaded as CSV file.",
    });
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Export All Sales
      </Button>

      <ExportConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onExport={handleExportSuccess}
      />
    </>
  );
};
