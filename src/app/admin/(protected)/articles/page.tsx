"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
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

type Article = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  sortOrder: number;
  publishedAt: string | null;
};

const emptyForm = {
  slug: "",
  title: "",
  description: "",
  content: "",
  coverImage: "",
  published: true,
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<{ articles: Article[] }>("/api/admin/articles");
    if (res.success) setArticles(res.data.articles);
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

  function openEdit(article: Article) {
    setEditing(article);
    setForm({
      slug: article.slug,
      title: article.title,
      description: article.description ?? "",
      content: article.content,
      coverImage: article.coverImage ?? "",
      published: article.published,
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
      content: form.content,
      coverImage: form.coverImage || null,
      published: form.published,
    };

    const res = editing
      ? await adminFetch(`/api/admin/articles/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            content: payload.content,
            coverImage: payload.coverImage,
            published: payload.published,
          }),
        })
      : await adminFetch("/api/admin/articles", { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Article updated" : "Article created");
    setDialogOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/admin/articles/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Article deleted");
    setDeleteTarget(null);
    await load();
  }

  async function reorder(articleId: string, direction: "up" | "down") {
    const ids = articles.map((a) => a.id);
    const next = swapIds(ids, articleId, direction);
    if (!next) return;

    const res = await adminFetch("/api/admin/articles/reorder", {
      method: "POST",
      body: JSON.stringify({ ids: next }),
    });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    setArticles(res.data.articles);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="mt-1 text-muted-foreground">Create, edit, publish, and reorder blog posts.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> New article
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-44">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article, index) => (
            <TableRow key={article.id}>
              <TableCell>
                <ReorderButtons
                  onUp={() => void reorder(article.id, "up")}
                  onDown={() => void reorder(article.id, "down")}
                  disableUp={index === 0}
                  disableDown={index === articles.length - 1}
                />
              </TableCell>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell className="text-muted-foreground">{article.slug}</TableCell>
              <TableCell>
                <Badge variant={article.published ? "success" : "muted"}>
                  {article.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {article.published && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/articles/${article.slug}`} target="_blank">
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(article)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(article)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit article" : "New article"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
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
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Description (excerpt)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover image path</Label>
              <Input
                placeholder="/images/example.webp"
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={16}
                className="font-mono text-sm"
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
            <Button onClick={() => void save()} disabled={saving || !form.title || !form.content}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete article?</DialogTitle>
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
