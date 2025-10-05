import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { getProducts, type Product } from "../api/products";
import { updateMachineSlots } from "../api/machines";
import { toast } from "@/hooks/use-toast";

interface VendingMachineProductsProps {
  id: string;
  totalSlots: number;
}

export function VendingMachineProducts({
  id,
  totalSlots,
}: VendingMachineProductsProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Convert product IDs to product keys for the API
      const slotsWithKeys: Record<number, string> = {};
      Object.entries(selectedProducts).forEach(([slotIndex, productId]) => {
        if (productId && productId !== 'none') {
          const product = products.find(p => String(p.id) === productId);
          if (product) {
            slotsWithKeys[parseInt(slotIndex)] = product.key;
          }
        } else {
          slotsWithKeys[parseInt(slotIndex)] = 'none';
        }
      });

      const result = await updateMachineSlots(id, slotsWithKeys);
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Products updated successfully",
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Error saving products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save products",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductKey = (slotIndex: number): string => {
    const productId = selectedProducts[slotIndex];
    if (!productId || productId === "none") return "No product";
    
    const product = products.find(p => String(p.id) === productId);
    return product?.key || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-12 h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Package className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Machine Products</DialogTitle>
          <DialogDescription>
            Assign products to each slot. Product keys are displayed for reference.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading products...</div>
          ) : (
            Array.from({ length: totalSlots }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Slot {index + 1}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Key: {getProductKey(index)}
                  </span>
                </div>
                <Select
                  value={selectedProducts[index] || "none"}
                  onValueChange={(value) => 
                    setSelectedProducts(prev => ({ ...prev, [index]: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="none" value="none">No product</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={String(product.id)} value={String(product.id)}>
                        {product.name} - ${product.price} (Key: {product.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Products"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}