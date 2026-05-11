"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/shared/lib/cn";

// Quill touches `document` on import — load it client-only via dynamic
// import so Next's SSR step doesn't blow up.
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-32 animate-pulse rounded-md border border-gray-200 bg-gray-50" />
  ),
});

const TOOLBAR = {
  container: [
    [{ header: [false, 2, 3] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "blockquote", "code-block"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

// Quill 2.x: ordered + bullet are both values of the `list` format —
// don't list "bullet" separately or you get "Cannot register 'bullet'
// specified in 'formats' config." at runtime.
const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "link",
  "blockquote",
  "code-block",
  "color",
  "background",
  "align",
];

/** Quill rich-text editor wrapped with the project's input styling.
 *  Stores the value as HTML (Quill's native shape). Pass `readOnly`
 *  to render the same chrome but disable editing — used by the
 *  Program Settings tab when the user isn't in Edit mode. */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  minHeight = 120,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** Minimum editor body height in px (default 120). */
  minHeight?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "art-rich-text-editor overflow-hidden rounded-md border border-gray-300 bg-white text-sm",
        readOnly && "bg-gray-50",
        className
      )}
      style={
        {
          // Custom prop the global CSS hooks into to set the
          // editor's body height.
          ["--art-rte-min-height" as string]: `${minHeight}px`,
        } as React.CSSProperties
      }
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(html) => onChange(html)}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={readOnly ? { toolbar: false } : { toolbar: TOOLBAR }}
        formats={FORMATS}
      />
    </div>
  );
}
