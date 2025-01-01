import { useState } from "react";
import { mockUsers } from "@/contexts/AuthContext";
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
import { useToast } from "@/components/ui/use-toast";

const Users = () => {
  const [users, setUsers] = useState(mockUsers);
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
  });

  const handleEdit = (user: typeof users[0]) => {
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      password: "",
    });
  };

  const handleSave = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              email: editForm.email,
              ...(editForm.password ? { password: editForm.password } : {}),
            }
          : user
      )
    );
    setEditingId(null);
    toast({
      title: "Success",
      description: "User updated successfully",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
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
            {users.map((user) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;