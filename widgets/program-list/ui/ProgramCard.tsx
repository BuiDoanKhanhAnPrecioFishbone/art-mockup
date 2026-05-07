"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Program } from "@/entities/program";

const monthShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = `${monthShort[start.getMonth()]} ${start.getDate()}${
    sameYear ? "" : `, ${start.getFullYear()}`
  }`;
  const endStr = `${monthShort[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return `${startStr} - ${endStr}`;
}

interface ProgramCardProps {
  program: Program;
  /** Whole-card click → opens program detail (Settings tab by default). */
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMarkClosed: (id: string) => void;
  onDelete: (id: string) => void;
  onViewApplicants: (id: string) => void;
}

export function ProgramCard({
  program,
  onOpen,
  onEdit,
  onDuplicate,
  onMarkClosed,
  onDelete,
  onViewApplicants,
}: ProgramCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickAway(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [menuOpen]);

  const isActive = program.status === "active";
  const isClosed = program.status === "closed";
  const isDraft = program.status === "draft";

  const statusBadge = isActive
    ? { text: "Active", classes: "bg-green-100 text-green-700" }
    : isClosed
      ? { text: "Closed", classes: "bg-gray-100 text-gray-600" }
      : { text: "Draft", classes: "bg-amber-100 text-amber-700" };

  const newCount = program.newApplicantCount ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(program.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(program.id);
        }
      }}
      className="group flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-300"
    >
      {/* Header row: status badge + menu */}
      <div className="mb-3 flex items-start justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            statusBadge.classes
          )}
        >
          {statusBadge.text}
        </span>
        <div
          ref={menuRef}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Open program menu"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(program.id);
                }}
              >
                Edit Program
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(program.id);
                }}
              >
                Duplicate
              </MenuItem>
              {isActive && (
                <MenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    onMarkClosed(program.id);
                  }}
                >
                  Mark as Closed
                </MenuItem>
              )}
              <MenuItem
                tone="danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(program.id);
                }}
              >
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1 line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
        {program.title}
      </h3>

      {/* Position • Level */}
      <p className="mb-4 text-sm text-gray-500">
        {program.position} <span className="text-gray-300">•</span>{" "}
        <span className="text-gray-600">{program.level}</span>
      </p>

      <div className="mt-auto space-y-3">
        {/* Date range */}
        <p className="text-sm text-gray-600">
          {formatDateRange(program.startDate, program.endDate)}
        </p>

        {/* Headcount + applicants action */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Headcount: <span className="font-medium text-gray-900">{program.headcount}</span>
          </span>
          <div className="relative">
            {/* Floating "+N NEW" pill — pinned to the top-right corner of
             *  the View Applicants button so the eye reads "there's
             *  something new to look at over here". */}
            {newCount > 0 && (
              <span
                className="pointer-events-none absolute -right-2 -top-3.5 z-10 inline-flex items-center rounded-md bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white"
                title={`${newCount} new applicant${newCount > 1 ? "s" : ""} added in the last 7 days`}
              >
                +{newCount} NEW
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewApplicants(program.id);
              }}
              disabled={isDraft}
              title={
                isDraft
                  ? "Publish the program first to see applicants."
                  : "Open the Pipelines tab"
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                program.applicantCount > 0
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                isDraft && "cursor-not-allowed opacity-50"
              )}
            >
              View {program.applicantCount} Applicant
              {program.applicantCount === 1 ? "" : "s"} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full px-3 py-2 text-left text-sm transition-colors",
        tone === "danger"
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}
