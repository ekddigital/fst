"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { assessmentSchema, type AssessmentInput } from "@/lib/validations/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SAMPLE_QUESTIONS = [
  {
    id: "q1",
    question: 'What is a teacher?',
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
];

export function AssessmentForm() {
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { studentName: "", parentEmail: "", answers: {} },
  });

  async function onSubmit(data: AssessmentInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, answers }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not submit assessment. Please try again.");
        return;
      }
      toast.success("Assessment submitted! Teacher Joe will follow up with guidance.");
      reset();
      setAnswers({});
    } catch {
      toast.error("Could not submit assessment. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student name</Label>
          <Input id="studentName" aria-invalid={!!errors.studentName} {...register("studentName")} />
          {errors.studentName && (
            <p className="text-base text-destructive" role="alert">
              {errors.studentName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentEmail">Parent email</Label>
          <Input id="parentEmail" type="email" aria-invalid={!!errors.parentEmail} {...register("parentEmail")} />
          {errors.parentEmail && (
            <p className="text-base text-destructive" role="alert">
              {errors.parentEmail.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Sample questions</h2>
        <p className="text-lg text-muted-foreground">
          Answer these sample questions to help us understand your child&apos;s starting level. A full interactive quiz
          will be available soon.
        </p>
        {SAMPLE_QUESTIONS.map((q, index) => (
          <Card key={q.id}>
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
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
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
  );
}
