import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useLead, useUpdateLead, useAddNote } from "@/hooks/use-leads";
import { useTeam } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, User, Mail, Phone, Calendar, Send } from "lucide-react";
import { format } from "date-fns";
import type { LeadStatus } from "@shared/schema";

export default function LeadDetail() {
  const [match, params] = useRoute("/leads/:id");
  const leadId = params?.id ? parseInt(params.id) : 0;
  
  const { data: lead, isLoading } = useLead(leadId);
  const { data: team } = useTeam();
  const { mutate: updateLead } = useUpdateLead();
  const { mutate: addNote, isPending: isAddingNote } = useAddNote();
  
  const [noteContent, setNoteContent] = useState("");

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!lead) return <div className="p-8">Lead not found</div>;

  const handleStatusChange = (status: LeadStatus) => {
    updateLead({ id: leadId, data: { status } });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateLead({ id: leadId, data: { assignedTo: parseInt(assigneeId) } });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNote({ leadId, content: noteContent }, {
        onSuccess: () => setNoteContent("")
    });
  };

  // Safe parsing of form responses
  const formResponses = lead.formResponses as Record<string, string>;

  return (
    <div className="p-8 space-y-8 h-screen overflow-y-auto">
      <Link href="/leads">
        <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between gap-6 border-b pb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{lead.name || "Anonymous Lead"}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {lead.email}</span>
                {lead.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {lead.phone}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(lead.createdAt!), "MMM d, yyyy")}</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={lead.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Won</SelectItem>
                        <SelectItem value="closed_lost">Lost</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                <Select value={lead.assignedTo?.toString()} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">Unassigned</SelectItem>
                        {team?.map(member => (
                            <SelectItem key={member.id} value={member.id.toString()}>{member.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 h-full">
        {/* Left Column: Details */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Form Submission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(formResponses).map(([key, value]) => (
                        <div key={key} className="border-b pb-2 last:border-0">
                            <h4 className="text-sm font-medium text-muted-foreground capitalize mb-1">{key.replace(/_/g, ' ')}</h4>
                            <p className="text-sm">{String(value)}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Notes & Activity */}
        <div className="md:col-span-2 space-y-6">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Notes & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-6">
                    <div className="flex gap-4">
                        <Textarea 
                            placeholder="Add a note..." 
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <Button className="self-end" onClick={handleAddNote} disabled={isAddingNote}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-2">
                        {lead.notes?.length === 0 && <div className="text-center text-muted-foreground text-sm">No notes yet.</div>}
                        
                        {lead.notes?.map((note) => (
                            <div key={note.id} className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">User {note.authorId}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(note.createdAt!), "MMM d, h:mm a")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{note.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
