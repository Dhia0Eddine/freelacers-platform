import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { serviceService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Service {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  photo?: string;
}

export default function AdminServicesPage() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Service>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  const fetchServices = () => {
    serviceService.getAllServices().then(setServices).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setForm(service);
    setPreviewUrl(service.photo ? (service.photo.startsWith("http") ? service.photo : `${API_URL}${service.photo}`) : null);
    setImageFile(null);
  };

  const handleDelete = async (id: number) => {
    await serviceService.deleteService(String(id));
    fetchServices();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    if (form.name) formData.append("name", form.name);
    if (form.description) formData.append("description", form.description);
    if (form.category_id) formData.append("category_id", String(form.category_id));
    if (imageFile) formData.append("photo", imageFile);

    if (editingId) {
      await fetch(`${API_URL}/services/${editingId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: formData,
      });
    } else {
      await fetch(`${API_URL}/services/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: formData,
      });
    }
    setEditingId(null);
    setForm({});
    setImageFile(null);
    setPreviewUrl(null);
    fetchServices();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Services</h1>
      <div className="mb-4 flex gap-2 items-center">
        <Input
          placeholder="Service Name"
          value={form.name || ""}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <Input
          placeholder="Description"
          value={form.description || ""}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <Input
          placeholder="Category ID"
          type="number"
          value={form.category_id || ""}
          onChange={e => setForm(f => ({ ...f, category_id: Number(e.target.value) }))}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block"
        />
        {previewUrl && (
          <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" />
        )}
        <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
        {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm({}); setImageFile(null); setPreviewUrl(null); }}>Cancel</Button>}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>Loading...</TableCell>
            </TableRow>
          ) : services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>No services found.</TableCell>
            </TableRow>
          ) : (
            services.map(service => (
              <TableRow key={service.id}>
                <TableCell>{service.id}</TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.category_id}</TableCell>
                <TableCell>
                  {service.photo && (
                    <img
                      src={service.photo.startsWith("http") ? service.photo : `${API_URL}${service.photo}`}
                      alt=""
                      className="h-8 w-8 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>Edit</Button>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(service.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
