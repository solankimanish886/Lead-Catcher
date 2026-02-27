import { useState } from "react";
import { Link } from "wouter";
import { useLeads } from "@/hooks/use-leads";
import { useTeam } from "@/hooks/use-team";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function LeadsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: leads, isLoading } = useLeads({ status: filterStatus, search });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Won</SelectItem>
              <SelectItem value="closed_lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : leads?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No leads found.</TableCell></TableRow>
            ) : (
              leads?.map((lead: any) => (
                <TableRow key={lead.id} className="hover:bg-muted/50 cursor-pointer group">
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="group-hover:underline decoration-primary underline-offset-4">
                      {lead.name || "Anonymous"}
                    </Link>
                  </TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.widgetName || "Unknown"}</TableCell>
                  <TableCell><StatusBadge status={lead.status} /></TableCell>
                  <TableCell>
                    {lead.assigneeName ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                          {lead.assigneeName.charAt(0)}
                        </div>
                        <span className="text-sm">{lead.assigneeName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {format(new Date(lead.createdAt!), "MMM d")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
