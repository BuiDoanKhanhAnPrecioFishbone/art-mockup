"use client";

import { useState } from "react";
import { Button } from "@/shared/ui";
import { Sparkles, Loader2 } from "lucide-react";

interface AIAutoExtractButtonProps {
  onExtracted: (skills: Array<{ name: string; category: string }>) => void;
}

export function AIAutoExtractButton({ onExtracted }: AIAutoExtractButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/skill-library/ai-extract", { method: "POST" });
      const data = await res.json();
      // Simulate processing delay
      setTimeout(() => {
        onExtracted(data.skills || []);
        setLoading(false);
      }, 500);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Sparkles size={16} />
      )}
      {loading ? "Extracting..." : "AI Auto-extract"}
    </Button>
  );
}
