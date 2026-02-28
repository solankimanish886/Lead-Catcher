import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, MessageSquare, Briefcase, LogOut, Layout } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Activity } from "lucide-react";
import { useRealtime } from "@/hooks/use-realtime";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/widgets", label: "Forms", icon: MessageSquare }, // Updated Label
    { href: "/team", label: "Team", icon: Briefcase },
  ];

  if (!user) return null;

  const SidebarContent = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col h-full bg-mongodb-deep-slate text-white", className)}>
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <div className="w-10 h-10 bg-mongodb-green rounded-xl flex items-center justify-center shadow-lg shadow-mongodb-green/20 group-hover:scale-105 transition-transform duration-300">
            <Layout className="text-mongodb-deep-slate w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-[0.05em] leading-none uppercase">
                Lead Catcher
              </h1>
            </div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mt-1">Agency Suite</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 cursor-pointer group",
                  isActive
                    ? "bg-mongodb-green text-mongodb-deep-slate shadow-xl shadow-mongodb-green/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-mongodb-deep-slate" : "text-white/40 group-hover:text-white")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:border-white/10 group cursor-default">
          <div className="h-10 w-10 shrink-0 rounded-full bg-mongodb-green flex items-center justify-center text-sm font-black text-mongodb-deep-slate shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-black text-white">{user.name}</p>
            <p className="truncate text-[10px] text-white/40 font-bold uppercase tracking-tight">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-mongodb-error/70 hover:text-mongodb-error hover:bg-mongodb-error/5 transition-all group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-mongodb-border-slate/10 bg-mongodb-deep-slate sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-mongodb-green rounded-lg flex items-center justify-center shadow-md shadow-mongodb-green/10">
            <Layout className="text-mongodb-deep-slate w-5 h-5" />
          </div>
          <span className="text-base font-black text-white uppercase tracking-tight">Lead Catcher</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0 bg-mongodb-deep-slate">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-mongodb-deep-slate text-white shadow-2xl fixed top-0 left-0 border-r border-white/5">
        <SidebarContent />
      </aside>
    </>
  );
}
