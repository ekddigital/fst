"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ResourceType } from "@prisma/client";
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

type Category = { id: string; title: string; slug: string };
type Resource = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  type: ResourceType;
  videoUrl: string | null;
  pdfPath: string | null;
  externalUrl: string | null;
  articleSlug: string | null;
  subsection: string | null;
  sortOrder: number;
  published: boolean;
  requestable: boolean;
  category?: Category;
};

const RESOURCE_TYPES: ResourceType[] = ["VIDEO", "PDF", "ARTICLE", "EXTERNAL", "GUIDE"];
const SUBSECTIONS = ["", "KET", "PET", "IELTS"];

const emptyForm = {
  categoryId: "",
  slug: "",
  title: "",
  description: "",
  type: "VIDEO" as ResourceType,
  videoUrl: "",
  pdfPath: "",
  externalUrl: "",
  articleSlug: "",
  subsection: "",
  published: true,
  requestable: false,
};

export default function AdminResourcesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  const loadCategories = useCallback(async () => {
    const res = await adminFetch<{ categories: Category[] }>("/api/admin/categories");
    if (res.success) setCategories(res.data.categories);
  }, []);

  const loadResources = useCallback(async (categoryId?: string) => {
    const qs = categoryId ? `?categoryId=${categoryId}` : "";
    const res = await adminFetch<{ resources: Resource[] }>(`/api/admin/resources${qs}`);
    if (res.success) setResources(res.data.resources);
    else toast.error(res.error.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadResources(filterCategoryId || undefined);
  }, [filterCategoryId, loadResources]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: filterCategoryId || categories[0]?.id || "" });
    setDialogOpen(true);
  }

  function openEdit(resource: Resource) {
    setEditing(resource);
    setForm({
      categoryId: resource.categoryId,
      slug: resource.slug,
      title: resource.title,
      description: resource.description ?? "",
      type: resource.type,
      videoUrl: resource.videoUrl ?? "",
      pdfPath: resource.pdfPath ?? "",
      externalUrl: resource.externalUrl ?? "",
      articleSlug: resource.articleSlug ?? "",
      subsection: resource.subsection ?? "",
      published: resource.published,
      requestable: resource.requestable,
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      categoryId: form.categoryId,
      slug: form.slug || slugify(form.title),
      title: form.title,
      description: form.description || null,
      type: form.type,
      videoUrl: form.videoUrl || null,
      pdfPath: form.pdfPath || null,
      externalUrl: form.externalUrl || null,
      articleSlug: form.articleSlug || null,
      subsection: form.subsection || null,
      published: form.published,
      requestable: form.requestable,
    };

    const res = editing
      ? await adminFetch(`/api/admin/resources/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            type: payload.type,
            videoUrl: payload.videoUrl,
            pdfPath: payload.pdfPath,
            externalUrl: payload.externalUrl,
            articleSlug: payload.articleSlug,
            subsection: payload.subsection,
            published: payload.published,
            requestable: payload.requestable,
          }),
        })
      : await adminFetch("/api/admin/resources", { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Resource updated" : "Resource created");
    setDialogOpen(false);
    await loadResources(filterCategoryId || undefined);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/admin/resources/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Resource deleted");
    setDeleteTarget(null);
    await loadResources(filterCategoryId || undefined);
  }

  async function reorder(resourceId: string, direction: "up" | "down") {
    const categoryId = filterCategoryId || resources.find((r) => r.id === resourceId)?.categoryId;
    if (!categoryId) return;

    const inCategory = resources.filter((r) => r.categoryId === categoryId);
    const ids = inCategory.map((r) => r.id);
    const next = swapIds(ids, resourceId, direction);
    if (!next) return;

    const res = await adminFetch("/api/admin/resources/reorder", {
      method: "POST",
      body: JSON.stringify({ categoryId, ids: next }),
    });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    await loadResources(filterCategoryId || undefined);
  }

  const filtered = filterCategoryId ? resources.filter((r) => r.categoryId === filterCategoryId) : resources;

  if (loading && resources.length === 0) {
    return (
      <div className="space-y-6">
        <LoadingScreen message="Loading resources…" variant="section" gradient={false} className="min-h-[200px]" />
        <AdminTableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="mt-1 text-muted-foreground">Videos, PDFs, articles, and requestable materials.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add resource
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="filter">Category</Label>
        <select
          id="filter"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subsection</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((resource, index) => (
            <TableRow key={resource.id}>
              <TableCell>
                {filterCategoryId ? (
                  <ReorderButtons
                    onUp={() => void reorder(resource.id, "up")}
                    onDown={() => void reorder(resource.id, "down")}
                    disableUp={index === 0}
                    disableDown={index === filtered.length - 1}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">{resource.sortOrder}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">{resource.title}</div>
                <div className="text-xs text-muted-foreground">{resource.category?.title}</div>
              </TableCell>
              <TableCell>{resource.type}</TableCell>
              <TableCell>{resource.subsection ?? "—"}</TableCell>
              <TableCell className="space-x-1">
                <Badge variant={resource.published ? "success" : "muted"}>
                  {resource.published ? "Live" : "Draft"}
                </Badge>
                {resource.requestable && <Badge variant="secondary">Requestable</Badge>}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(resource)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(resource)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit resource" : "New resource"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Category</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.categoryId}
                disabled={Boolean(editing)}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input
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
              <div className="space-y-2 sm:col-span-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ResourceType }))}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Subsection (KET/PET/IELTS)</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.subsection}
                onChange={(e) => setForm((f) => ({ ...f, subsection: e.target.value }))}
              >
                {SUBSECTIONS.map((s) => (
                  <option key={s || "none"} value={s}>
                    {s || "None"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Video URL / path</Label>
              <Input
                placeholder="/videos/example.mp4 or https://..."
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>PDF path</Label>
              <Input
                placeholder="/other/document.pdf"
                value={form.pdfPath}
                onChange={(e) => setForm((f) => ({ ...f, pdfPath: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Place files in public/ or use an external URL in External URL.</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>External URL</Label>
              <Input value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Article slug</Label>
              <Input value={form.articleSlug} onChange={(e) => setForm((f) => ({ ...f, articleSlug: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.requestable}
                onChange={(e) => setForm((f) => ({ ...f, requestable: e.target.checked }))}
              />
              Requestable (resource request form)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || !form.title || !form.categoryId}>
              <ButtonLoadingContent loading={saving} loadingText="Saving…" idleText="Save" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete resource?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Remove &ldquo;{deleteTarget?.title}&rdquo; permanently?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button className="bg-destructive hover:bg-destructive/90" onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
