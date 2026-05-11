"use client";

/** Essay answer panel — wireframe node 2435:75870. Auto-sizing
 *  textarea; height grows with content. */
export function EssayAnswer({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const rows = Math.max(8, (value.match(/\n/g)?.length ?? 0) + 4);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Autosize height based on content lines"
      rows={rows}
      className="block w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
    />
  );
}
