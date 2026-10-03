"use client";

type Row = { email: string; name: string | null; status: string; createdAt: string };

/**
 * Client-side CSV download of the subscriber list. The rows are already on the
 * page (passed from the server component), so this just serialises and triggers
 * a download — no extra request.
 */
export function SubscribersExport({ rows }: { rows: Row[] }) {
  function download() {
    const header = ["email", "name", "status", "subscribed_on"];
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [r.email, r.name ?? "", r.status, r.createdAt?.slice(0, 10) ?? ""].map(esc).join(","),
    );
    const csv = [header.join(","), ...lines].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coralstone-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      disabled={rows.length === 0}
      className="rounded-full border border-line-strong px-3 py-1.5 text-sm font-medium text-primary hover:border-accent hover:text-accent disabled:opacity-50"
    >
      Export CSV
    </button>
  );
}
