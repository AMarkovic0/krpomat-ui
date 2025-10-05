import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { getProducts, addProduct, editProduct, deleteProduct, Product } from "@/api/products";
import { Trash2, Edit } from "lucide-react";

const createProductSchema = z.object({
  key: z.string().min(1, "Key is required"),
  name: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
});

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    key: "",
    price: 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      key: "",
      name: "",
      price: 0,
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAdmin) return;

      try {
        setIsLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isAdmin, toast]);

  const handleEdit = (product: Product) => {
    setEditingId(product.key);
    setEditForm({
      name: product.name,
      key: product.key,
      price: product.price,
    });
  };

  const handleSave = async (id: string) => {
    try {
      const result = await editProduct(editForm.name, id, editForm.price);
      if (result.error) {
        throw new Error(result.error);
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.key === id
            ? {
                ...p,
                name: editForm.name,
                key: editForm.key,
                price: editForm.price,
              }
            : p
        )
      );

      setEditingId(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteProduct(id);
      if (result.error) {
        throw new Error(result.error);
      }

      setProducts((prev) => prev.filter((p) => p.key !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product",
      });
    }
  };

  const onCreateProduct = async (values: z.infer<typeof createProductSchema>) => {
    try {
      const name = values.name || `Product_${values.key}`;
      const result = await addProduct(name, values.key, values.price);

      if (result.error) {
        throw new Error(result.error);
      }

      const newProduct: Product = {
        id: values.key,
        name,
        key: values.key,
        price: values.price,
      };

      setProducts([...products, newProduct]);
      setIsCreateDialogOpen(false);
      form.reset();

      toast({
        title: "Success",
        description: "Product created successfully",
      });
    } catch (error) {
      console.error("Failed to create product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create product",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateProduct)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Product key (required)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Leave empty to auto-generate: Product_<KEY>"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Create Product</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.key}>
                  <TableCell>
                    {product.key}
                  </TableCell>
                  <TableCell>
                    {editingId === product.key ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      product.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.key ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: parseFloat(e.target.value) || 0
                          })
                        }
                      />
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.key ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product.key)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
