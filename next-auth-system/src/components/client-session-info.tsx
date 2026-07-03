"use client";

import { useSession, signOut } from "next-auth/react";
import { User, LogOut, RefreshCw } from "lucide-react";

export function ClientSessionInfo() {
  const { data: session, status, update } = useSession();

  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <User size={16} /> Client-Side Session (useSession)
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
            status === "authenticated"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          }`}
        >
          {status}
        </span>
      </div>

      {status === "loading" ? (
        <p className="text-xs text-gray-500 animate-pulse">Retrieving client-side context...</p>
      ) : session ? (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <span className="text-gray-500 font-medium">Session ID:</span>
            <span className="col-span-2 text-gray-300 font-mono break-all">{session.user?.id}</span>

            <span className="text-gray-500 font-medium">Active Name:</span>
            <span className="col-span-2 text-gray-300 font-semibold">{session.user?.name || "N/A"}</span>

            <span className="text-gray-500 font-medium">Email Address:</span>
            <span className="col-span-2 text-gray-300 font-mono">{session.user?.email || "N/A"}</span>

            <span className="text-gray-500 font-medium">Phone Number:</span>
            <span className="col-span-2 text-gray-300 font-mono">{(session.user as any).phone || "N/A"}</span>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => update()}
              className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-gray-300 hover:text-white"
            >
              <RefreshCw size={12} /> Sync Session
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold rounded-lg border border-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-red-400"
            >
              <LogOut size={12} /> End Session
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">No active client-side session context detected.</p>
      )}
    </div>
  );
}
