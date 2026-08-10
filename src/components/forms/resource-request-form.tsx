"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { resourceRequestSchema, normalizeResourceRequestPayload, type ResourceRequestInput } from "@/lib/validations/forms";
import type { RequestableResource } from "@/lib/data/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { messageFromApiJson, setFormFieldErrors } from "@/lib/forms/api-errors";

type ResourceRequestFormProps = {
  resources: RequestableResource[];
};

export function ResourceRequestForm({ resources }: ResourceRequestFormProps) {
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const form = useForm<ResourceRequestInput>({
    resolver: zodResolver(resourceRequestSchema),
    defaultValues: { fullName: "", email: "", wechatId: "", resourceSlug: "" },
  });

  const submitting = form.formState.isSubmitting;

  async function onSubmit(data: ResourceRequestInput) {
    setSubmitState("idle");
    setSubmitError(null);

    try {
      const res = await fetch("/api/resource-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizeResourceRequestPayload(data)),
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
      setSuccessEmail(data.email);
      setSubmitState("success");
      toast.success(`Teacher Joe will send your resource to ${data.email}`);
      form.reset({ fullName: "", email: "", wechatId: "", resourceSlug: "" });
    } catch {
      const message = "Could not submit your request. Check your connection and try again.";
      setSubmitState("error");
      setSubmitError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Resource Request Form</CardTitle>
        <CardDescription className="text-base">
          Select the English resource that best matches your learning goals. Teacher Joe will send it to you after you
          submit your request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {submitState === "success" && successEmail && (
              <Alert variant="success">
                <CheckCircle2 className="size-5" aria-hidden />
                <AlertTitle>Request received</AlertTitle>
                <AlertDescription>
                  Teacher Joe will send your resource to {successEmail}.
                </AlertDescription>
              </Alert>
            )}

            {submitState === "error" && submitError && (
              <Alert variant="destructive">
                <AlertTitle>Could not submit request</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="Your full name" className="h-12 text-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-12 text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>We will send your requested English resource to this email address.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wechatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    WeChat ID <span className="font-normal text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your WeChat ID" className="h-12 text-lg" {...field} />
                  </FormControl>
                  <FormDescription>Optional — provide your WeChat ID if you prefer contact there.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select resource</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-lg shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="">Choose a resource…</option>
                      {resources.map((resource) => (
                        <option key={resource.slug} value={resource.slug}>
                          {resource.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto">
              {submitting ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
              Submit request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
