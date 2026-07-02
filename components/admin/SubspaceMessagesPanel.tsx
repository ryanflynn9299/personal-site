import { getContactMessages } from "@/lib/services/directus";
import { MessageSquare, Inbox } from "lucide-react";

function formatMessageDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncateMessage(text: string, maxLength = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function SubspaceMessagesPanel() {
  const { status, messages, total } = await getContactMessages({
    limit: 12,
    status: "new",
  });

  const hasMessages = status === "success" && messages.length > 0;

  return (
    <div className="flex-1 flex flex-col gap-4 border border-white/10 rounded-2xl bg-slate-800/40 backdrop-blur-md overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
            Subspace Messages
          </h3>
        </div>
        {status === "success" && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {total ?? messages.length} new
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {status === "error" && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <Inbox className="h-8 w-8 text-slate-600" aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
              Directus Offline
            </p>
            <p className="max-w-[220px] text-[10px] leading-relaxed text-slate-500">
              Contact messages could not be loaded. Check Directus connection
              and the <code className="text-slate-400">contact_messages</code>{" "}
              collection.
            </p>
          </div>
        )}

        {status === "success" && !hasMessages && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <Inbox className="h-8 w-8 text-slate-600" aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              No Incoming Signals
            </p>
            <p className="max-w-[220px] text-[10px] leading-relaxed text-slate-500">
              New contact form submissions will appear here when Directus is
              connected.
            </p>
          </div>
        )}

        {hasMessages && (
          <ul className="space-y-3" aria-label="New contact messages">
            {messages.map((message) => (
              <li
                key={message.id}
                className="rounded-xl border border-white/5 bg-slate-900/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200">
                      {message.name}
                    </p>
                    <p className="truncate text-[10px] text-sky-400/80">
                      {message.email}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-[9px] font-mono uppercase tracking-wide text-slate-600"
                    dateTime={message.created_at}
                  >
                    {formatMessageDate(message.created_at)}
                  </time>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  {truncateMessage(message.message)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
