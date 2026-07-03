import { auth } from "@/auth";
import { ClientSessionInfo } from "@/components/client-session-info";
import { ShieldAlert, Server, Smartphone, KeyRound, Calendar } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-200 p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-4xl mx-auto space-y-8 relative">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 tracking-tight">
              <ShieldAlert className="text-purple-400" /> Security Control Center
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Live authorization diagnostics showing secure token configurations.
            </p>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-gray-300">Session Secure</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Server-Side Session Box */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Server size={16} /> Server-Side Session (auth())
              </h3>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase tracking-wider">
                Node Runtime
              </span>
            </div>

            {session ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {session.user?.image ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                      <Image
                        src={session.user.image}
                        alt="User Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold">
                      {session.user?.name?.slice(0, 2).toUpperCase() || "US"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-bold text-sm">{session.user?.name}</h4>
                    <p className="text-xs text-gray-500 font-mono">{session.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <KeyRound size={12} /> ID:
                    </span>
                    <span className="col-span-2 text-gray-300 font-mono break-all">{session.user?.id}</span>

                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Smartphone size={12} /> Phone:
                    </span>
                    <span className="col-span-2 text-gray-300 font-mono">{(session.user as any).phone || "N/A"}</span>

                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Calendar size={12} /> Session Exp:
                    </span>
                    <span className="col-span-2 text-gray-300 font-mono">{new Date(session.expires).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No active server-side session context detected.</p>
            )}
          </div>

          {/* Client-Side Session Box */}
          <ClientSessionInfo />
        </div>

        {/* Diagnostic info footer */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-xs text-gray-400 space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-gray-400">Auth.js (NextAuth v5) Integration Specs</h4>
          <p className="leading-relaxed">
            This workspace utilizes NextAuth.js v5 Beta to manage sessions inside Next.js App Router.
            The middleware checks incoming requests edge-side and redirects to the <code className="text-blue-400 font-mono">/login</code> page if unauthenticated.
            Database actions and credentials parsing are performed inside standard Node.js server actions, preserving maximum performance and security guidelines.
          </p>
        </div>
      </main>
    </div>
  );
}
