"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFetch, slugify, swapIds } from "@/lib/admin/client";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ButtonLoadingContent } from "@/components/ui/loading-inline";

type Category = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  published: boolean;
  _count?: { resources: number };
};

const emptyForm = { slug: "", title: "", description: "", published: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<{ categories: Category[] }>("/api/admin/categories");
    if (res.success) setCategories(res.data.categories);
    else toast.error(res.error.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      slug: category.slug,
      title: category.title,
      description: category.description ?? "",
      published: category.published,
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    const payload = {
      slug,
      title: form.title,
      description: form.description || null,
      published: form.published,
    };

    const res = editing
      ? await adminFetch(`/api/admin/categories/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title: payload.title, description: payload.description, published: payload.published }),
        })
      : await adminFetch("/api/admin/categories", { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Category updated" : "Category created");
    setDialogOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Category deleted");
    setDeleteTarget(null);
    await load();
  }

  async function reorder(categoryId: string, direction: "up" | "down") {
    const ids = categories.map((c) => c.id);
    const next = swapIds(ids, categoryId, direction);
    if (!next) return;

    const res = await adminFetch<{ categories: Category[] }>("/api/admin/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ ids: next }),
    });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    setCategories(res.data.categories);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingScreen message="Loading categories…" variant="section" gradient={false} className="min-h-[200px]" />
        <AdminTableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-1 text-muted-foreground">Organize resources into sections on the public page.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add category
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Resources</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id}>
              <TableCell>
                <ReorderButtons
                  onUp={() => void reorder(category.id, "up")}
                  onDown={() => void reorder(category.id, "down")}
                  disableUp={index === 0}
                  disableDown={index === categories.length - 1}
                />
              </TableCell>
              <TableCell className="font-medium">{category.title}</TableCell>
              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
              <TableCell>{category._count?.resources ?? 0}</TableCell>
              <TableCell>
                <Badge variant={category.published ? "success" : "muted"}>
                  {category.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(category)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editing ? f.slug : slugify(e.target.value),
                  }))
                }
              />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || !form.title}>
              <ButtonLoadingContent loading={saving} loadingText="Saving…" idleText="Save" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will also delete all resources in &ldquo;{deleteTarget?.title}&rdquo;.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-destructive hover:bg-destructive/90" onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
