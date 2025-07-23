import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  const fetchCategories = () => {
    api.get("/categories/").then(res => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm(cat);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  const handleSave = async () => {
    if (editingId) {
      await api.put(`/categories/${editingId}`, form);
    } else {
      await api.post("/categories/", form);
    }
    setEditingId(null);
    setForm({});
    fetchCategories();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Go Back
      </Button>
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Category Name"
          value={form.name || ""}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <Input
          placeholder="Description"
          value={form.description || ""}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
        {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm({}); }}>Cancel</Button>}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}>Loading...</TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No categories found.</TableCell>
            </TableRow>
          ) : (
            categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>Edit</Button>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(cat.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
