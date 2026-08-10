"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
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
import { adminFetch } from "@/lib/admin/client";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ButtonLoadingContent } from "@/components/ui/loading-inline";

type PromotionPlacement = "HOME_BANNER" | "TOP_BAR" | "ANNOUNCEMENT";

type Promotion = {
  id: string;
  title: string;
  body: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  placement: PromotionPlacement;
  createdAt: string;
};

const PLACEMENT_LABELS: Record<PromotionPlacement, string> = {
  HOME_BANNER: "Homepage banner",
  TOP_BAR: "Top bar",
  ANNOUNCEMENT: "Announcement box",
};

const emptyForm = {
  title: "",
  body: "",
  active: true,
  startDate: "",
  endDate: "",
  placement: "HOME_BANNER" as PromotionPlacement,
};

export default function AdminPromotionsPage() {
  const searchParams = useSearchParams();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<{ promotions: Promotion[] }>("/api/admin/promotions");
    if (res.success) setPromotions(res.data.promotions);
    else toast.error(res.error.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setForm(emptyForm);
      setDialogOpen(true);
    }
  }, [searchParams]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(promo: Promotion) {
    setEditing(promo);
    setForm({
      title: promo.title,
      body: promo.body,
      active: promo.active,
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : "",
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : "",
      placement: promo.placement,
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      title: form.title,
      body: form.body,
      active: form.active,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      placement: form.placement,
    };

    const res = editing
      ? await adminFetch(`/api/admin/promotions/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await adminFetch("/api/admin/promotions", { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Promotion updated" : "Promotion created");
    setDialogOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/admin/promotions/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Promotion deleted");
    setDeleteTarget(null);
    await load();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Promotions & Adverts" breadcrumbs={[{ label: "Promotions" }]} />
        <LoadingScreen message="Loading promotions…" variant="section" gradient={false} className="min-h-[200px]" />
        <AdminTableSkeleton rows={4} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Promotions & Adverts"
        description="Create banners and announcements shown on the public website. Great for special offers, trial lesson promos, or exam season reminders."
        breadcrumbs={[{ label: "Promotions" }]}
        actions={
          <Button onClick={openCreate} size="lg">
            <Plus className="size-4" /> New promotion
          </Button>
        }
      />

      {promotions.length === 0 ? (
        <AdminEmptyState
          icon={Megaphone}
          title="No promotions yet"
          description="Create your first promotion to show a banner or announcement on the website."
          actionLabel="Create your first promotion"
          onAction={openCreate}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>
                  <p className="font-medium">{promo.title}</p>
                  <p className="max-w-md truncate text-sm text-muted-foreground">{promo.body}</p>
                </TableCell>
                <TableCell>{PLACEMENT_LABELS[promo.placement]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {promo.startDate || promo.endDate
                    ? `${promo.startDate ? new Date(promo.startDate).toLocaleDateString() : "Any time"} – ${promo.endDate ? new Date(promo.endDate).toLocaleDateString() : "No end"}`
                    : "Always on"}
                </TableCell>
                <TableCell>
                  <Badge variant={promo.active ? "success" : "muted"}>{promo.active ? "Active" : "Off"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(promo)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(promo)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit promotion" : "New promotion"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Free trial lesson this month"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Short headline shown to visitors</p>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={3}
                placeholder="Describe the offer or announcement"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Where to show it</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.placement}
                onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value as PromotionPlacement }))}
              >
                {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date (optional)</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End date (optional)</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Show on website
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || !form.title || !form.body}>
              <ButtonLoadingContent loading={saving} loadingText="Saving…" idleText="Save" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this promotion?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove &ldquo;{deleteTarget?.title}&rdquo; permanently? It will no longer appear on the site.
          </p>
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
