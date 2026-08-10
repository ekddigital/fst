"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { QuestionType } from "@prisma/client";
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
import { adminFetch, slugify, swapIds } from "@/lib/admin/client";

type Assessment = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  targetAge: string | null;
  published: boolean;
  _count?: { questions: number; submissions: number };
};

type Question = {
  id: string;
  section: string;
  sortOrder: number;
  prompt: string;
  type: QuestionType;
  options: unknown;
  correctAnswer: string | null;
  points: number;
};

const QUESTION_TYPES: QuestionType[] = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"];

const emptyAssessment = { slug: "", title: "", description: "", targetAge: "", published: true };
const emptyQuestion = {
  section: "Vocabulary",
  prompt: "",
  type: "MULTIPLE_CHOICE" as QuestionType,
  optionsText: "",
  correctAnswer: "",
  points: 1,
};

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentDialog, setAssessmentDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [assessmentForm, setAssessmentForm] = useState(emptyAssessment);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [saving, setSaving] = useState(false);
  const [deleteAssessment, setDeleteAssessment] = useState<Assessment | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null);

  const loadAssessments = useCallback(async () => {
    const res = await adminFetch<{ assessments: Assessment[] }>("/api/admin/assessments");
    if (res.success) setAssessments(res.data.assessments);
    else toast.error(res.error.message);
    setLoading(false);
  }, []);

  const loadQuestions = useCallback(async (assessmentId: string) => {
    const res = await adminFetch<{ questions: Question[] }>(`/api/admin/assessments/${assessmentId}/questions`);
    if (res.success) setQuestions(res.data.questions);
    else toast.error(res.error.message);
  }, []);

  useEffect(() => {
    void loadAssessments();
  }, [loadAssessments]);

  async function toggleExpand(assessment: Assessment) {
    if (expandedId === assessment.id) {
      setExpandedId(null);
      setQuestions([]);
      return;
    }
    setExpandedId(assessment.id);
    await loadQuestions(assessment.id);
  }

  function openAssessmentCreate() {
    setEditingAssessment(null);
    setAssessmentForm(emptyAssessment);
    setAssessmentDialog(true);
  }

  function openAssessmentEdit(assessment: Assessment) {
    setEditingAssessment(assessment);
    setAssessmentForm({
      slug: assessment.slug,
      title: assessment.title,
      description: assessment.description ?? "",
      targetAge: assessment.targetAge ?? "",
      published: assessment.published,
    });
    setAssessmentDialog(true);
  }

  async function saveAssessment() {
    setSaving(true);
    const payload = {
      slug: assessmentForm.slug || slugify(assessmentForm.title),
      title: assessmentForm.title,
      description: assessmentForm.description || null,
      targetAge: assessmentForm.targetAge || null,
      published: assessmentForm.published,
    };

    const res = editingAssessment
      ? await adminFetch(`/api/admin/assessments/${editingAssessment.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            targetAge: payload.targetAge,
            published: payload.published,
          }),
        })
      : await adminFetch("/api/admin/assessments", { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editingAssessment ? "Assessment updated" : "Assessment created");
    setAssessmentDialog(false);
    await loadAssessments();
  }

  async function confirmDeleteAssessment() {
    if (!deleteAssessment) return;
    const res = await adminFetch(`/api/admin/assessments/${deleteAssessment.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Assessment deleted");
    setDeleteAssessment(null);
    if (expandedId === deleteAssessment.id) setExpandedId(null);
    await loadAssessments();
  }

  function openQuestionCreate() {
    if (!expandedId) return;
    setEditingQuestion(null);
    setQuestionForm(emptyQuestion);
    setQuestionDialog(true);
  }

  function openQuestionEdit(question: Question) {
    const options = Array.isArray(question.options)
      ? (question.options as string[]).join("\n")
      : "";
    setEditingQuestion(question);
    setQuestionForm({
      section: question.section,
      prompt: question.prompt,
      type: question.type,
      optionsText: options,
      correctAnswer: question.correctAnswer ?? "",
      points: question.points,
    });
    setQuestionDialog(true);
  }

  async function saveQuestion() {
    if (!expandedId) return;
    setSaving(true);
    const options = questionForm.optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      section: questionForm.section,
      prompt: questionForm.prompt,
      type: questionForm.type,
      options: questionForm.type === "MULTIPLE_CHOICE" ? options : null,
      correctAnswer: questionForm.correctAnswer || null,
      points: questionForm.points,
    };

    const res = editingQuestion
      ? await adminFetch(`/api/admin/assessments/${expandedId}/questions/${editingQuestion.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await adminFetch(`/api/admin/assessments/${expandedId}/questions`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editingQuestion ? "Question updated" : "Question added");
    setQuestionDialog(false);
    await loadQuestions(expandedId);
    await loadAssessments();
  }

  async function confirmDeleteQuestion() {
    if (!expandedId || !deleteQuestion) return;
    const res = await adminFetch(`/api/admin/assessments/${expandedId}/questions/${deleteQuestion.id}`, {
      method: "DELETE",
    });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Question deleted");
    setDeleteQuestion(null);
    await loadQuestions(expandedId);
    await loadAssessments();
  }

  async function reorderQuestion(questionId: string, direction: "up" | "down") {
    if (!expandedId) return;
    const ids = questions.map((q) => q.id);
    const next = swapIds(ids, questionId, direction);
    if (!next) return;

    const res = await adminFetch<{ questions: Question[] }>(
      `/api/admin/assessments/${expandedId}/questions/reorder`,
      {
        method: "POST",
        body: JSON.stringify({ ids: next }),
      },
    );
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    setQuestions(res.data.questions);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="mt-1 text-muted-foreground">Manage quizzes and questions for the student assessment page.</p>
        </div>
        <Button onClick={openAssessmentCreate}>
          <Plus className="size-4" /> Add assessment
        </Button>
      </div>

      <div className="space-y-3">
        {assessments.map((assessment) => {
          const expanded = expandedId === assessment.id;
          return (
            <div key={assessment.id} className="rounded-lg border bg-card">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button
                  type="button"
                  className="flex flex-1 items-center gap-2 text-left"
                  onClick={() => void toggleExpand(assessment)}
                >
                  {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  <span className="font-semibold">{assessment.title}</span>
                  <Badge variant={assessment.published ? "success" : "muted"}>
                    {assessment.published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {assessment._count?.questions ?? 0} questions · slug: {assessment.slug}
                  </span>
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openAssessmentEdit(assessment)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteAssessment(assessment)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="border-t px-4 pb-4">
                  <div className="mb-3 flex justify-end pt-3">
                    <Button size="sm" onClick={openQuestionCreate}>
                      <Plus className="size-4" /> Add question
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <div key={question.id} className="flex items-start gap-3 rounded-md border p-3">
                        <ReorderButtons
                          onUp={() => void reorderQuestion(question.id, "up")}
                          onDown={() => void reorderQuestion(question.id, "down")}
                          disableUp={index === 0}
                          disableDown={index === questions.length - 1}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-primary">{question.section}</p>
                          <p className="mt-1 text-sm">{question.prompt}</p>
                          {question.correctAnswer && (
                            <p className="mt-1 text-xs text-muted-foreground">Answer: {question.correctAnswer}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openQuestionEdit(question)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteQuestion(question)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {questions.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">No questions yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={assessmentDialog} onOpenChange={setAssessmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAssessment ? "Edit assessment" : "New assessment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={assessmentForm.title}
                onChange={(e) =>
                  setAssessmentForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editingAssessment ? f.slug : slugify(e.target.value),
                  }))
                }
              />
            </div>
            {!editingAssessment && (
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={assessmentForm.slug}
                  onChange={(e) => setAssessmentForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={assessmentForm.description}
                onChange={(e) => setAssessmentForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Target age</Label>
              <Input
                placeholder="6-10"
                value={assessmentForm.targetAge}
                onChange={(e) => setAssessmentForm((f) => ({ ...f, targetAge: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={assessmentForm.published}
                onChange={(e) => setAssessmentForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => void saveAssessment()} disabled={saving || !assessmentForm.title}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit question" : "New question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={questionForm.section}
                onChange={(e) => setQuestionForm((f) => ({ ...f, section: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                value={questionForm.prompt}
                onChange={(e) => setQuestionForm((f) => ({ ...f, prompt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={questionForm.type}
                onChange={(e) => setQuestionForm((f) => ({ ...f, type: e.target.value as QuestionType }))}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {questionForm.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                <Label>Options (one per line)</Label>
                <Textarea
                  rows={5}
                  value={questionForm.optionsText}
                  onChange={(e) => setQuestionForm((f) => ({ ...f, optionsText: e.target.value }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Correct answer</Label>
              <Input
                value={questionForm.correctAnswer}
                onChange={(e) => setQuestionForm((f) => ({ ...f, correctAnswer: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                min={1}
                value={questionForm.points}
                onChange={(e) => setQuestionForm((f) => ({ ...f, points: Number(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => void saveQuestion()} disabled={saving || !questionForm.prompt}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteAssessment)} onOpenChange={() => setDeleteAssessment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete assessment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">All questions will be removed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAssessment(null)}>
              Cancel
            </Button>
            <Button className="bg-destructive hover:bg-destructive/90" onClick={() => void confirmDeleteAssessment()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteQuestion)} onOpenChange={() => setDeleteQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete question?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuestion(null)}>
              Cancel
            </Button>
            <Button className="bg-destructive hover:bg-destructive/90" onClick={() => void confirmDeleteQuestion()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
