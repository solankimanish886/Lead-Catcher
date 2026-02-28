import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useLead, useUpdateLead, useAddNote } from "@/hooks/use-leads";
import { useTeam } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, User, Mail, Phone, Calendar, Send, MessageSquare, Briefcase, Clock, Activity } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { LeadStatus } from "@shared/schema";
import { motion } from "framer-motion";

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10"
        >
            <div className="flex items-center gap-4">
                <Link href="/leads">
                    <Button variant="outline" size="sm" className="rounded-xl border-mongodb-border-slate/60 hover:bg-mongodb-light-slate text-mongodb-deep-slate font-bold gap-2 shadow-sm">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </Link>
                <div className="h-6 w-px bg-mongodb-border-slate/30" />
                <div className="flex items-center gap-2 text-mongodb-slate-text font-black text-[10px] uppercase tracking-[0.2em]">
                    <User className="w-3.5 h-3.5" />
                    Lead Details
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-mongodb-border-slate/30">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-mongodb-green flex items-center justify-center text-mongodb-deep-slate font-black text-2xl md:text-3xl shadow-xl shadow-mongodb-green/20">
                            {(lead.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-mongodb-deep-slate tracking-tight mb-2">{lead.name || "Anonymous Lead"}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-mongodb-slate-text">
                                <span className="flex items-center gap-1.5 font-bold text-xs md:text-sm bg-mongodb-light-slate/50 px-2.5 py-1.5 rounded-lg border border-mongodb-border-slate/30">
                                    <Mail className="h-3.5 w-3.5 text-mongodb-green-dark" /> {lead.email}
                                </span>
                                {lead.phone && (
                                    <span className="flex items-center gap-1.5 font-bold text-xs md:text-sm bg-mongodb-light-slate/50 px-2.5 py-1.5 rounded-lg border border-mongodb-border-slate/30">
                                        <Phone className="h-3.5 w-3.5 text-mongodb-green-dark" /> {lead.phone}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 font-bold text-xs md:text-sm bg-mongodb-light-slate/50 px-2.5 py-1.5 rounded-lg border border-mongodb-border-slate/30">
                                    <Calendar className="h-3.5 w-3.5 text-mongodb-green-dark" />
                                    Captured {format(new Date(lead.createdAt!), "MMM d, yyyy")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-mongodb-border-slate/40 shadow-lg shadow-mongodb-deep-slate/5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-mongodb-slate-text uppercase tracking-widest px-1">Lead Status</label>
                        <Select value={lead.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[160px] h-10 rounded-xl border-mongodb-border-slate/60 font-bold text-mongodb-deep-slate focus:ring-mongodb-green/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-mongodb-border-slate/40 shadow-xl">
                                <SelectItem value="new" className="font-bold">New</SelectItem>
                                <SelectItem value="contacted" className="font-bold">Contacted</SelectItem>
                                <SelectItem value="qualified" className="font-bold">Qualified</SelectItem>
                                <SelectItem value="converted" className="font-bold text-mongodb-green-dark">Won</SelectItem>
                                <SelectItem value="closed_lost" className="font-bold text-mongodb-error">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-mongodb-slate-text uppercase tracking-widest px-1">Assigned Agent</label>
                        <Select value={lead.assignedTo?.toString()} onValueChange={handleAssigneeChange}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl border-mongodb-border-slate/60 font-bold text-mongodb-deep-slate focus:ring-mongodb-green/20">
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-mongodb-border-slate/40 shadow-xl">
                                <SelectItem value="null" className="font-bold opacity-50 italic">Unassigned</SelectItem>
                                {team?.map(member => (
                                    <SelectItem key={member.id} value={member.id.toString()} className="font-bold">{member.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
                {/* Left Column: Details */}
                <div className="space-y-8">
                    <Card className="border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-mongodb-light-slate/30 border-b border-mongodb-border-slate/30 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-mongodb-green-dark" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text">Payload</span>
                            </div>
                            <CardTitle className="text-xl font-black text-mongodb-deep-slate">Form Submission</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {Object.entries(formResponses).map(([key, value]) => (
                                <div key={key} className="space-y-1.5 p-3 rounded-xl bg-mongodb-light-slate/30 border border-mongodb-border-slate/20">
                                    <h4 className="text-[10px] font-black text-mongodb-slate-text uppercase tracking-widest">{key.replace(/_/g, ' ')}</h4>
                                    <p className="text-sm font-bold text-mongodb-deep-slate">{String(value)}</p>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-mongodb-border-slate/30">
                                <div className="flex items-center justify-between text-xs text-mongodb-slate-text font-bold uppercase tracking-wider">
                                    <span>Source Widget</span>
                                    <span className="text-mongodb-green-dark">{lead.widgetName || "General Form"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Notes & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="flex flex-col border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 rounded-3xl overflow-hidden min-h-[600px]">
                        <CardHeader className="bg-mongodb-light-slate/30 border-b border-mongodb-border-slate/30 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-mongodb-green-dark" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text">Collaboration</span>
                            </div>
                            <CardTitle className="text-xl font-black text-mongodb-deep-slate">Intelligence & Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex-1 flex flex-col gap-10">
                            <div className="relative">
                                <Textarea
                                    placeholder="Type an internal note about this lead..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    className="min-h-[120px] rounded-2xl border-mongodb-border-slate/60 p-4 focus:ring-mongodb-green/20 focus:border-mongodb-green transition-all pb-14 text-mongodb-deep-slate font-medium"
                                />
                                <div className="absolute right-3 bottom-3">
                                    <Button
                                        className="h-10 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-lg shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all gap-2"
                                        onClick={handleAddNote}
                                        disabled={isAddingNote || !noteContent.trim()}
                                    >
                                        {isAddingNote ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Post Note
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-8 flex-1">
                                <div className="flex items-center gap-2 text-xs font-black text-mongodb-slate-text uppercase tracking-widest border-b border-mongodb-border-slate/30 pb-3">
                                    Timeline Events
                                </div>

                                <div className="space-y-8">
                                    {lead.notes?.length === 0 ? (
                                        <div className="text-center py-20 text-mongodb-slate-text font-bold italic opacity-40">
                                            No activity records found for this lead.
                                        </div>
                                    ) : (
                                        lead.notes?.map((note) => (
                                            <div key={note.id} className="flex gap-4 group">
                                                <div className="h-10 w-10 rounded-xl bg-mongodb-light-slate border border-mongodb-border-slate/40 flex items-center justify-center text-mongodb-green-dark font-black text-xs shrink-0 shadow-sm">
                                                    {(note.authorName || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-2 flex-1 pt-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-sm text-mongodb-deep-slate">{note.authorName || "Team Member"}</span>
                                                            <div className="w-1 h-1 bg-mongodb-border-slate/60 rounded-full" />
                                                            <span className="text-[11px] font-bold text-mongodb-green-dark bg-mongodb-green/5 px-2 py-0.5 rounded-full border border-mongodb-green/10">Team Agent</span>
                                                        </div>
                                                        <span className="text-[11px] font-bold text-mongodb-slate-text uppercase tracking-tighter opacity-70">
                                                            {formatDistanceToNow(new Date(note.createdAt!), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-mongodb-light-slate/30 border border-mongodb-border-slate/20 text-sm font-medium text-mongodb-deep-slate leading-relaxed shadow-sm">
                                                        {note.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
