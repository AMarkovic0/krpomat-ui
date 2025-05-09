
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getUsers, addUser, editUsername, editPassword } from "@/api/users";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]),
});

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "user",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      try {
        setIsLoading(true);
        const data = await getUsers();
        if (Array.isArray(data)) {
          // Map API data to our component's expected format
          const formattedUsers = data.map((user: any) => ({
            id: user.id || String(Date.now() + Math.random()),
            email: user.username,
            role: user.username === "admin" ? "admin" : "user",
          }));
          setUsers(formattedUsers);
        } else {
          toast({
            variant: "destructive",
            title: "Error fetching users",
            description: "Could not fetch users data",
          });
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, toast]);

  const handleEdit = (user: typeof users[0]) => {
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      password: "",
    });
  };

  const handleSave = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    
    try {
      // If email changed, update username
      if (user.email !== editForm.email) {
        const usernameResult = await editUsername(user.email, editForm.email);
        if (usernameResult.error) {
          throw new Error(usernameResult.error);
        }
      }
      
      // If password provided, update password
      if (editForm.password) {
        const passwordResult = await editPassword(editForm.email, editForm.password);
        if (passwordResult.error) {
          throw new Error(passwordResult.error);
        }
      }
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                email: editForm.email,
              }
            : u
        )
      );
      
      setEditingId(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user",
      });
    }
  };

  const onCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    try {
      const result = await addUser(values.email, values.password);
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add the new user to the list
      const newUser = {
        id: result.id || String(Date.now()),
        email: values.email,
        role: values.role,
      };
      
      setUsers([...users, newUser]);
      setIsCreateDialogOpen(false);
      form.reset();
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateUser)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Create User</Button>
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {editingId === user.id ? (
                      <Input
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    ) : (
                      user.email
                    )}
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="New password (optional)"
                          value={editForm.password}
                          onChange={(e) =>
                            setEditForm({ ...editForm, password: e.target.value })
                          }
                        />
                        <Button onClick={() => handleSave(user.id)}>Save</Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
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

export default Users;
