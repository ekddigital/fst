"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Inbox, Mail } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFetch } from "@/lib/admin/client";
import { formatAdminErrorMessage } from "@/lib/admin/api-feedback";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import { LoadingScreen } from "@/components/ui/loading-screen";
import type { PaginationMeta } from "@/lib/data/pagination";

type Tab = "resources" | "assessments" | "contact";

type ResourceRequest = {
  id: string;
  fullName: string;
  email: string;
  wechatId: string | null;
  resourceSlug: string;
  resourceTitle: string;
  status: string;
  createdAt: string;
};

type AssessmentSubmission = {
  id: string;
  studentName: string;
  parentEmail: string | null;
  age: number | null;
  score: number | null;
  maxScore: number | null;
  createdAt: string;
  assessment: { title: string; slug: string };
};

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const RESOURCE_STATUS = ["PENDING", "SENT", "CLOSED"] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminSubmissionsPage() {
  const [tab, setTab] = useState<Tab>("resources");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [assessmentSubmissions, setAssessmentSubmissions] = useState<AssessmentSubmission[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  const load = useCallback(async (activeTab: Tab, pageNum: number) => {
    setLoading(true);
    const qs = `?page=${pageNum}&pageSize=20`;
    if (activeTab === "resources") {
      const res = await adminFetch<{ requests: ResourceRequest[]; pagination: PaginationMeta }>(
        `/api/admin/resource-requests${qs}`,
      );
      if (res.success) {
        setResourceRequests(res.data.requests);
        setPagination(res.data.pagination);
      } else toast.error(formatAdminErrorMessage(res.error, res.requestId));
    } else if (activeTab === "assessments") {
      const res = await adminFetch<{ submissions: AssessmentSubmission[]; pagination: PaginationMeta }>(
        `/api/admin/assessment-submissions${qs}`,
      );
      if (res.success) {
        setAssessmentSubmissions(res.data.submissions);
        setPagination(res.data.pagination);
      } else toast.error(formatAdminErrorMessage(res.error, res.requestId));
    } else {
      const res = await adminFetch<{ submissions: ContactSubmission[]; pagination: PaginationMeta }>(
        `/api/admin/contact-submissions${qs}`,
      );
      if (res.success) {
        setContactSubmissions(res.data.submissions);
        setPagination(res.data.pagination);
      } else toast.error(formatAdminErrorMessage(res.error, res.requestId));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    void load(tab, page);
  }, [tab, page, load]);

  async function updateRequestStatus(id: string, status: (typeof RESOURCE_STATUS)[number]) {
    const res = await adminFetch(`/api/admin/resource-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.success) {
      toast.error(formatAdminErrorMessage(res.error, res.requestId));
      return;
    }
    toast.success("Status updated");
    await load(tab, page);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "resources", label: "Resource requests" },
    { id: "assessments", label: "Assessment submissions" },
    { id: "contact", label: "Contact form" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Submissions"
        description="Messages from parents — resource requests, assessment results, and contact form enquiries."
        breadcrumbs={[{ label: "Submissions" }]}
      />

      <div className="flex gap-2 border-b pb-2">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingScreen message="Loading submissions…" variant="section" gradient={false} className="min-h-[160px]" />
          <AdminTableSkeleton rows={6} columns={5} />
        </div>
      ) : tab === "resources" ? (
        <>
          {resourceRequests.length === 0 ? (
            <AdminEmptyState
              icon={Inbox}
              title="No resource requests yet"
              description="When parents request downloadable resources from the site, they will appear here."
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resourceRequests.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs">{formatDate(row.createdAt)}</TableCell>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.resourceTitle}</TableCell>
                  <TableCell>
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={row.status}
                      onChange={(e) =>
                        void updateRequestStatus(row.id, e.target.value as (typeof RESOURCE_STATUS)[number])
                      }
                    >
                      {RESOURCE_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : tab === "assessments" ? (
        <>
          {assessmentSubmissions.length === 0 ? (
            <AdminEmptyState
              icon={ClipboardList}
              title="No assessment submissions yet"
              description="When students complete an assessment on the site, their results will show up here."
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Parent email</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessmentSubmissions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs">{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    {row.studentName}
                    {row.age != null && <span className="text-muted-foreground"> ({row.age})</span>}
                  </TableCell>
                  <TableCell>{row.parentEmail ?? "—"}</TableCell>
                  <TableCell>{row.assessment.title}</TableCell>
                  <TableCell>
                    {row.score != null && row.maxScore != null ? `${row.score}/${row.maxScore}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : (
        <>
          {contactSubmissions.length === 0 ? (
            <AdminEmptyState
              icon={Mail}
              title="No contact messages yet"
              description="When parents send a message through the contact form, it will appear here."
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactSubmissions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs">{formatDate(row.createdAt)}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell className="max-w-md truncate">{row.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
