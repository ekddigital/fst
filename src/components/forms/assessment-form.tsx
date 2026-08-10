"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { assessmentSchema, type AssessmentInput } from "@/lib/validations/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const SAMPLE_QUESTIONS = [
  {
    id: "q1",
    question: "What is a teacher?",
    options: [
      "A person who helps you learn",
      "A person who drives a car",
      "A person who cooks food",
      "A person who sells cars",
    ],
  },
  {
    id: "q2",
    question: 'What does "happy" mean?',
    options: ["Feeling good and smiling", "Feeling sleepy", "Feeling cold", "Feeling hungry"],
  },
  {
    id: "q3",
    question: "Which word is a color?",
    options: ["Blue", "Run", "Table", "Quickly"],
  },
] as const;

export function AssessmentForm() {
  const form = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { studentName: "", parentEmail: "", answers: {} },
  });

  const answers = form.watch("answers");
  const submitting = form.formState.isSubmitting;
  const answersError = form.formState.errors.answers?.message;

  async function onSubmit(data: AssessmentInput) {
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormFieldErrors(form, json);
        toast.error(messageFromApiJson(json));
        return;
      }
      toast.success("Assessment submitted! Teacher Joe will follow up with guidance.");
      form.reset({ studentName: "", parentEmail: "", answers: {} });
    } catch {
      toast.error("Could not submit assessment. Check your connection and try again.");
    }
  }

  function selectAnswer(questionId: string, value: string) {
    form.setValue("answers", { ...form.getValues("answers"), [questionId]: value }, { shouldValidate: true });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student name</FormLabel>
                <FormControl>
                  <Input placeholder="Student's first name" {...field} />
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
                <FormLabel>Parent email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="parent@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Sample questions</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Answer these sample questions to help us understand your child&apos;s starting level.
            </p>
          </div>

          {answersError && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-base text-destructive">
              {String(answersError)}
            </p>
          )}

          {SAMPLE_QUESTIONS.map((q, index) => (
            <Card
              key={q.id}
              className={cn(
                "transition-shadow hover:shadow-md",
                answers[q.id] ? "border-primary/30" : undefined,
              )}
            >
              <CardHeader>
                <CardTitle className="text-xl">
                  Question {index + 1}: {q.question}
                </CardTitle>
                <CardDescription>Select the best answer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                      answers[q.id] === option
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/40",
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => selectAnswer(q.id, option)}
                      className="size-5 accent-primary"
                    />
                    <span className="text-lg">{option}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="submit" disabled={submitting} size="lg">
          {submitting && <Loader2 className="animate-spin" aria-hidden />}
          Submit assessment
        </Button>
      </form>
    </Form>
  );
}
