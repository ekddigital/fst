"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
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

type BillStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

type Bill = {
  id: string;
  description: string;
  amount: string;
  status: BillStatus;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<BillStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

const STATUS_VARIANT: Record<BillStatus, "default" | "success" | "muted" | "outline"> = {
  PENDING: "outline",
  PAID: "success",
  OVERDUE: "default",
  CANCELLED: "muted",
};

const emptyForm = {
  description: "",
  amount: "",
  status: "PENDING" as BillStatus,
  dueDate: "",
  notes: "",
};

function formatMoney(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminBillsPage() {
  const searchParams = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bill | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<{ bills: Bill[] }>("/api/admin/bills");
    if (res.success) setBills(res.data.bills);
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

  function openEdit(bill: Bill) {
    setEditing(bill);
    setForm({
      description: bill.description,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate ? bill.dueDate.slice(0, 10) : "",
      notes: bill.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      description: form.description,
      amount: parseFloat(form.amount),
      status: form.status,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      notes: form.notes || null,
    };

    const res = editing
      ? await adminFetch(`/api/admin/bills/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await adminFetch("/api/admin/bills", { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Bill updated" : "Bill added");
    setDialogOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/admin/bills/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Bill deleted");
    setDeleteTarget(null);
    await load();
  }

  const pendingTotal = bills
    .filter((b) => b.status === "PENDING" || b.status === "OVERDUE")
    .reduce((sum, b) => sum + parseFloat(b.amount), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Bills & Invoices" breadcrumbs={[{ label: "Bills" }]} />
        <LoadingScreen message="Loading bills…" variant="section" gradient={false} className="min-h-[200px]" />
        <AdminTableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bills & Invoices"
        description="Track payments, expenses, and invoices. This is for your records only — not shown on the public website."
        breadcrumbs={[{ label: "Bills" }]}
        actions={
          <Button onClick={openCreate} size="lg">
            <Plus className="size-4" /> Add bill
          </Button>
        }
      />

      {bills.length > 0 && (
        <p className="text-base text-muted-foreground">
          Open bills total: <span className="font-semibold text-foreground">{formatMoney(pendingTotal)}</span>
        </p>
      )}

      {bills.length === 0 ? (
        <AdminEmptyState
          icon={Receipt}
          title="No bills yet"
          description="Add your first bill or invoice to start tracking payments and expenses."
          actionLabel="Add your first bill"
          onAction={openCreate}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  <p className="font-medium">{bill.description}</p>
                  {bill.notes && <p className="text-sm text-muted-foreground">{bill.notes}</p>}
                </TableCell>
                <TableCell>{formatMoney(bill.amount)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[bill.status]}>{STATUS_LABELS[bill.status]}</Badge>
                </TableCell>
                <TableCell>{formatDate(bill.dueDate)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(bill)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(bill)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit bill" : "Add bill"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g. Hosting renewal, student materials"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">What is this bill for?</p>
            </div>
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BillStatus }))}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Due date (optional)</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={3}
                placeholder="Any extra details for your records"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || !form.description || !form.amount}>
              <ButtonLoadingContent loading={saving} loadingText="Saving…" idleText="Save" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this bill?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove &ldquo;{deleteTarget?.description}&rdquo; permanently? This cannot be undone.
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
