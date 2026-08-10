"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFetch } from "@/lib/admin/client";

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

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminSubmissionsPage() {
  const [tab, setTab] = useState<Tab>("resources");
  const [loading, setLoading] = useState(true);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [assessmentSubmissions, setAssessmentSubmissions] = useState<AssessmentSubmission[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  const load = useCallback(async (activeTab: Tab) => {
    setLoading(true);
    if (activeTab === "resources") {
      const res = await adminFetch<{ requests: ResourceRequest[] }>("/api/admin/resource-requests");
      if (res.success) setResourceRequests(res.data.requests);
      else toast.error(res.error.message);
    } else if (activeTab === "assessments") {
      const res = await adminFetch<{ submissions: AssessmentSubmission[] }>("/api/admin/assessment-submissions");
      if (res.success) setAssessmentSubmissions(res.data.submissions);
      else toast.error(res.error.message);
    } else {
      const res = await adminFetch<{ submissions: ContactSubmission[] }>("/api/admin/contact-submissions");
      if (res.success) setContactSubmissions(res.data.submissions);
      else toast.error(res.error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "resources", label: "Resource requests" },
    { id: "assessments", label: "Assessment submissions" },
    { id: "contact", label: "Contact form" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="mt-1 text-muted-foreground">Read-only view of form submissions from the public site.</p>
      </div>

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
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : tab === "resources" ? (
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
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : tab === "assessments" ? (
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
    </div>
  );
}
