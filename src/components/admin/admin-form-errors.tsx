import { Alert, AlertDescription } from "@/components/ui/alert";

const FIELD_LABELS: Record<string, string> = {
  slug: "Slug",
  title: "Title",
  description: "Description",
  content: "Content",
  categoryId: "Category",
  videoUrl: "Video URL",
  body: "Body",
  amount: "Amount",
  password: "Password",
};

function labelForField(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function AdminFormErrors({ errors }: { errors?: Record<string, string[]> }) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertDescription>
        <ul className="list-inside list-disc space-y-1 text-sm">
          {Object.entries(errors).map(([field, messages]) => (
            <li key={field}>
              <span className="font-medium">{labelForField(field)}:</span> {messages[0]}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
