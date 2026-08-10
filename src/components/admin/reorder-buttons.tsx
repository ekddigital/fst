"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReorderButtonsProps = {
  onUp: () => void;
  onDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
};

export function ReorderButtons({ onUp, onDown, disableUp, disableDown }: ReorderButtonsProps) {
  return (
    <div className="flex gap-1">
      <Button type="button" variant="outline" size="sm" onClick={onUp} disabled={disableUp} aria-label="Move up">
        <ChevronUp className="size-4" />
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onDown} disabled={disableDown} aria-label="Move down">
        <ChevronDown className="size-4" />
      </Button>
    </div>
  );
}
