"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ButtonLoadingContent } from "@/components/ui/loading-inline";

export function ContactForm() {
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const submitting = form.formState.isSubmitting;

  async function onSubmit(data: ContactInput) {
    setSubmitState("idle");
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      setSubmitState("success");
      toast.success("Message sent! Teacher Joe will reply soon.");
      form.reset();
    } catch {
      const message = "Could not send message. Check your connection and try again.";
      setSubmitState("error");
      setSubmitError(message);
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="content-fade-in space-y-6" noValidate>
        {submitState === "success" && (
          <Alert variant="success">
            <CheckCircle2 className="size-5" aria-hidden />
            <AlertTitle>Message sent</AlertTitle>
            <AlertDescription>
              Thank you! Teacher Joe will get back to you within 1–2 business days.
            </AlertDescription>
          </Alert>
        )}

        {submitState === "error" && submitError && (
          <Alert variant="destructive">
            <AlertTitle>Could not send message</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Your full name" {...field} />
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
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Tell us about your goals or ask a question…" {...field} />
              </FormControl>
              <FormDescription>At least 10 characters. We typically reply within 1–2 business days.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto">
          <ButtonLoadingContent
            loading={submitting}
            loadingText="Sending…"
            idleIcon={<Send aria-hidden />}
            idleText="Send message"
          />
        </Button>
      </form>
    </Form>
  );
}
