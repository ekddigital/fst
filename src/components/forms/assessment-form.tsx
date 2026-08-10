"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { createAssessmentSchema, normalizeAssessmentPayload, type AssessmentInput } from "@/lib/validations/forms";
import type { AssessmentWithQuestions } from "@/lib/data/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { messageFromApiJson, setFormFieldErrors } from "@/lib/forms/api-errors";
import { cn } from "@/lib/utils";

type AssessmentFormProps = {
  assessment: AssessmentWithQuestions;
};

type SubmitResult = {
  score: number;
  maxScore: number;
};

function scoreLabel(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.8) return "Strong foundation — ready for more advanced practice";
  if (pct >= 0.5) return "Developing skills — some areas need improvement";
  return "Beginner level — focus on building basic skills";
}

export function AssessmentForm({ assessment }: AssessmentFormProps) {
  const questions = assessment.questions;
  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const schema = useMemo(() => createAssessmentSchema(questionIds), [questionIds]);

  const [step, setStep] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const form = useForm<AssessmentInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      assessmentId: assessment.id,
      studentName: "",
      parentEmail: "",
      age: "",
      answers: {},
    },
  });

  const answers = form.watch("answers");
  const submitting = form.formState.isSubmitting;
  const currentQuestion = questions[step];
  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;
  const sections = useMemo(() => [...new Set(questions.map((q) => q.section))], [questions]);

  async function onSubmit(data: AssessmentInput) {
    setSubmitState("idle");
    setSubmitError(null);

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizeAssessmentPayload(data)),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormFieldErrors(form, json);
        const message = messageFromApiJson(json);
        setSubmitState("error");
        setSubmitError(message);
        toast.error(message);
        return;
      }
      const score = json.data?.score ?? 0;
      const maxScore = json.data?.maxScore ?? questions.length;
      setResult({ score, maxScore });
      setSubmitState("success");
      toast.success("Assessment submitted!");
    } catch {
      const message = "Could not submit assessment. Check your connection and try again.";
      setSubmitState("error");
      setSubmitError(message);
      toast.error(message);
    }
  }

  function selectAnswer(questionId: string, value: string) {
    form.setValue("answers", { ...form.getValues("answers"), [questionId]: value }, { shouldValidate: true });
  }

  function goNext() {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }

  function goPrev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (submitState === "success" && result) {
    return (
      <Card className="border-primary/30 bg-primary/5 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-primary" aria-hidden />
            <div>
              <CardTitle className="text-2xl">Great job!</CardTitle>
              <CardDescription className="text-base">
                Your assessment has been submitted successfully.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-lg">
          <p>
            <strong>Score:</strong> {result.score} / {result.maxScore}
          </p>
          <p className="text-muted-foreground">{scoreLabel(result.score, result.maxScore)}</p>
          <p>
            Teacher Joe will review the responses and can recommend the best next steps for your child. Consider
            booking a free trial lesson to discuss results in person.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Book a free trial lesson</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <input type="hidden" {...form.register("assessmentId")} />

        {submitState === "error" && submitError && (
          <Alert variant="destructive">
            <AlertTitle>Could not submit assessment</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Student information</CardTitle>
            <CardDescription>Enter your child&apos;s details before starting the quiz.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student name</FormLabel>
                  <FormControl>
                    <Input placeholder="Student's first name" className="h-12 text-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parent email <span className="font-normal text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="parent@example.com" className="h-12 text-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Age <span className="font-normal text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min={3} max={18} placeholder="8" className="h-12 text-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Question {step + 1} of {totalSteps}
              {currentQuestion && (
                <span className="ml-2 rounded-full bg-primary/10 px-3 py-0.5 text-primary">
                  {currentQuestion.section}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              {sections.map((section) => (
                <span
                  key={section}
                  className={cn(
                    "hidden rounded-md px-2 py-1 text-xs sm:inline",
                    currentQuestion?.section === section
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentQuestion && (
          <Card
            className={cn(
              "transition-shadow",
              answers[currentQuestion.id] ? "border-primary/30 shadow-md" : undefined,
            )}
          >
            <CardHeader>
              <CardTitle className="text-xl leading-snug">{currentQuestion.prompt}</CardTitle>
              <CardDescription>Select the best answer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(currentQuestion.options ?? []).map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                    answers[currentQuestion.id] === option
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/40",
                  )}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => selectAnswer(currentQuestion.id, option)}
                    className="size-5 accent-primary"
                  />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        )}

        {form.formState.errors.answers?.message && (
          <Alert variant="destructive">
            <AlertDescription>{String(form.formState.errors.answers.message)}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="lg" onClick={goPrev} disabled={step === 0}>
            <ArrowLeft aria-hidden />
            Previous
          </Button>

          {step < totalSteps - 1 ? (
            <Button
              type="button"
              size="lg"
              onClick={goNext}
              disabled={!answers[currentQuestion?.id ?? ""]}
            >
              Next
              <ArrowRight aria-hidden />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting || !answers[currentQuestion?.id ?? ""]} size="lg">
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Submit assessment
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
