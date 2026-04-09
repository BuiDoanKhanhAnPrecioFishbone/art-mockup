import { emailLogs, emailLogRecipients } from "@/shared/fixtures/email-logs";
import { notFound } from "next/navigation";
import Link from "next/link";
import LogDetailClient from "./_components/LogDetailClient";

export default async function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const log = emailLogs.find((l) => l.id === id);
  if (!log) notFound();

  const recipients = emailLogRecipients.filter((r) => r.logId === id);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <header className="border-b border-gray-200 bg-white px-8 py-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
          <Link href="/flows/email-management" className="hover:text-gray-600 transition-colors">Email Management</Link>
          <span>/</span>
          <Link href="/flows/email-management?tab=logs" className="hover:text-gray-600 transition-colors">Logs</Link>
          <span>/</span>
          <span className="text-gray-600 max-w-xs truncate">{log.name}</span>
        </div>
        <h1 className="text-base font-semibold text-gray-900 line-clamp-1">{log.name}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Sent by {log.sentBy} on{" "}
          {new Date(log.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          {" "}· Template: {log.templateName}
        </p>
      </header>

      <LogDetailClient log={log} recipients={recipients} />
    </div>
  );
}
