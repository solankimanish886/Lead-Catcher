import { useState } from "react";
import { Link } from "wouter";
import { useLeads } from "@/hooks/use-leads";
import { useTeam } from "@/hooks/use-team";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Users as UsersIcon, ChevronRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: leads, isLoading } = useLeads({ status: filterStatus, search });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-mongodb-green-dark mb-2">
            <UsersIcon className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Audience Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-mongodb-deep-slate tracking-tight">Leads</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mongodb-slate-text" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 focus:border-mongodb-green transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px] h-11 rounded-xl border-mongodb-border-slate/60 bg-white font-bold text-mongodb-deep-slate">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-mongodb-border-slate/40 shadow-xl">
              <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
              <SelectItem value="new" className="font-medium">New</SelectItem>
              <SelectItem value="contacted" className="font-medium">Contacted</SelectItem>
              <SelectItem value="qualified" className="font-medium">Qualified</SelectItem>
              <SelectItem value="converted" className="font-medium">Won</SelectItem>
              <SelectItem value="closed_lost" className="font-medium">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-mongodb-border-slate/40 bg-white shadow-xl shadow-mongodb-deep-slate/5 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-mongodb-light-slate/30">
            <TableRow className="border-mongodb-border-slate/30 hover:bg-transparent">
              <TableHead className="py-4 font-black text-mongodb-slate-text uppercase text-[10px] tracking-widest pl-6">Lead Information</TableHead>
              <TableHead className="py-4 font-black text-mongodb-slate-text uppercase text-[10px] tracking-widest">Source Widget</TableHead>
              <TableHead className="py-4 font-black text-mongodb-slate-text uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="py-4 font-black text-mongodb-slate-text uppercase text-[10px] tracking-widest">Assignment</TableHead>
              <TableHead className="py-4 font-black text-mongodb-slate-text uppercase text-[10px] tracking-widest text-right pr-6">Capture Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-mongodb-slate-text font-medium italic">Scanning pipeline for leads...</TableCell></TableRow>
            ) : leads?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-mongodb-slate-text font-medium">No leads match your current filters.</TableCell></TableRow>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {leads?.map((lead: any) => (
                  <motion.tr
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, y: -20, backgroundColor: "#00ED6420" }}
                    animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      backgroundColor: { duration: 1.5 },
                      default: { duration: 0.4, ease: "easeOut" }
                    }}
                    className="border-mongodb-border-slate/20 hover:bg-mongodb-light-slate/40 transition-colors group cursor-pointer relative"
                  >
                    <TableCell className="py-4 pl-6 relative">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-mongodb-green/10 flex items-center justify-center text-mongodb-green-dark font-bold group-hover:bg-mongodb-green group-hover:text-mongodb-deep-slate transition-all shadow-sm">
                          {(lead.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/leads/${lead.id}`} className="block text-sm font-bold text-mongodb-deep-slate hover:text-mongodb-green-dark transition-colors">
                            {lead.name || "Anonymous"}
                          </Link>
                          <p className="text-xs text-mongodb-slate-text font-medium">{lead.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-mongodb-light-slate border border-mongodb-border-slate/40 text-[11px] font-bold text-mongodb-deep-slate">
                        <MessageSquare className="w-3 h-3 text-mongodb-green-dark" />
                        {lead.widgetName || "General Form"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4"><StatusBadge status={lead.status} /></TableCell>
                    <TableCell className="py-4">
                      {lead.assigneeName ? (
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-mongodb-deep-slate flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white shadow-sm">
                            {lead.assigneeName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-mongodb-deep-slate">{lead.assigneeName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-mongodb-slate-text uppercase opacity-40">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-mongodb-deep-slate">
                          {lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : 'Just now'}
                        </span>
                        <span className="text-[10px] text-mongodb-slate-text font-medium uppercase tracking-tighter">
                          {lead.createdAt ? format(new Date(lead.createdAt), "h:mm a") : ''}
                        </span>
                      </div>
                    </TableCell>
                    <td className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <ChevronRight className="w-4 h-4 text-mongodb-green-dark" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
