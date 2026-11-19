"use client";
import { Skeleton } from "./ui/Skeleton";
export default function ContactCenterSkeleton({ mode = "messages" }) {
  const rows = mode === "page" ? 4 : mode === "list" ? 4 : 3;
  return <div className={`df-support-skeleton df-support-skeleton-${mode}`} role="status" aria-label="Loading content">
    {Array.from({ length: rows }, (_, index) => <div className="df-support-skeleton-row" key={index}>
      {mode === "messages" && <Skeleton variant="circle" width="40px" height="40px" />}
      <div className="df-support-skeleton-lines"><Skeleton variant="rect" width={index % 2 ? "42%" : "58%"} height="12px" /><Skeleton variant="rect" width="100%" height={mode === "list" ? "10px" : "15px"} />{mode !== "list" && <Skeleton variant="rect" width="76%" height="11px" />}</div>
    </div>)}
    <span className="sr-only">Loading…</span>
  </div>;
}
