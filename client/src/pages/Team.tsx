import { useState, useMemo } from "react";
import { useTeam, useInviteMember, useUpdateMember, useDeleteMember } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  UserPlus, Mail, Shield, ShieldCheck, Users, Search, MoreHorizontal,
  UserCheck, Activity, Calendar, Filter, Edit2, UserX, Trash2, CheckCircle2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const { data: team, isLoading } = useTeam();
  const { mutate: inviteMember, isPending: isInviting } = useInviteMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();
  const { mutate: deleteMember } = useDeleteMember();
  const { toast } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const filteredTeam = useMemo(() => {
    if (!team) return [];
    return team.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [team, searchQuery, roleFilter]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteErrors({});

    const newErrors: Record<string, string> = {};
    if (!inviteName.trim()) newErrors.name = "This field is required";
    if (!inviteEmail.trim()) newErrors.email = "This field is required";
    if (!invitePassword.trim()) newErrors.password = "This field is required";

    if (Object.keys(newErrors).length > 0) {
      setInviteErrors(newErrors);
      return;
    }

    inviteMember({ name: inviteName, email: inviteEmail, password: invitePassword }, {
      onSuccess: () => {
        setInviteOpen(false);
        setInviteName("");
        setInviteEmail("");
        setInvitePassword("");
        toast({ title: "Success", description: "Team member invited successfully!" });
      },
      onError: (error: any) => {
        if (error.message?.includes("User already exists")) {
          setInviteErrors({ email: "This email is already part of your team" });
        }
      }
    });
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditStatus(member.status || "active");
    setEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMember({
      id: editingMember.id,
      data: {
        name: editName,
        email: editEmail,
        role: editRole,
        status: editStatus
      }
    }, {
      onSuccess: () => {
        setEditOpen(false);
        setEditingMember(null);
      }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#00ED64';
      case 'agent': return '#4ECDC4';
      default: return '#888888';
    }
  };

  if (isLoading) return <div className="p-8">Loading team...</div>;

  const isOwner = currentUser?.role === 'owner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-mongodb-green-dark mb-2">
            <Users className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Agency Personnel Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-mongodb-deep-slate tracking-tight">Team Intelligence</h1>
            <span className="bg-mongodb-light-slate text-mongodb-slate-text px-3 py-1 rounded-full text-sm font-black border border-mongodb-border-slate/40">
              {team?.length || 0}
            </span>
          </div>
          <p className="text-sm md:text-base text-mongodb-slate-text font-medium mt-1">Manage your team members and their access levels (User Type).</p>
        </div>

        {isOwner && (
          <Dialog open={inviteOpen} onOpenChange={(v) => {
            setInviteOpen(v);
            if (!v) {
              setInviteErrors({});
              setInviteName("");
              setInviteEmail("");
              setInvitePassword("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all gap-2">
                <UserPlus className="h-5 w-5" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-mongodb-border-slate/40 shadow-2xl p-0 overflow-hidden max-w-md">
              <form onSubmit={handleInvite}>
                <div className="bg-mongodb-deep-slate p-8 text-white relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-mongodb-green" />
                  <DialogTitle className="text-2xl font-black mb-2 text-mongodb-green">Invite a New Team Member</DialogTitle>
                  <DialogDescription className="text-white/60 font-medium">
                    Add someone to your team and give them access to your workspace.
                  </DialogDescription>
                </div>
                <div className="p-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Full Name</Label>
                    <Input
                      id="name"
                      value={inviteName}
                      onChange={(e) => {
                        setInviteName(e.target.value);
                        if (inviteErrors.name) setInviteErrors(prev => ({ ...prev, name: "" }));
                      }}
                      placeholder="Enter their full name..."
                      className={cn(
                        "h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold",
                        inviteErrors.name && "border-mongodb-error/50 bg-mongodb-error/5"
                      )}
                    />
                    {inviteErrors.name && <p className="text-[10px] font-bold text-mongodb-error px-1">{inviteErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        if (inviteErrors.email) setInviteErrors(prev => ({ ...prev, email: "" }));
                      }}
                      placeholder="Enter their email address..."
                      className={cn(
                        "h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold",
                        inviteErrors.email && "border-mongodb-error/50 bg-mongodb-error/5"
                      )}
                    />
                    {inviteErrors.email ? (
                      <p className="text-[10px] font-bold text-mongodb-error px-1">{inviteErrors.email}</p>
                    ) : (
                      <p className="text-[10px] font-medium text-mongodb-slate-text/60 px-1 italic">An invitation will be sent to this address</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Initial Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={invitePassword}
                      onChange={(e) => {
                        setInvitePassword(e.target.value);
                        if (inviteErrors.password) setInviteErrors(prev => ({ ...prev, password: "" }));
                      }}
                      placeholder="Create a password for them..."
                      className={cn(
                        "h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold",
                        inviteErrors.password && "border-mongodb-error/50 bg-mongodb-error/5"
                      )}
                    />
                    {inviteErrors.password && <p className="text-[10px] font-bold text-mongodb-error px-1">{inviteErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">User Type</Label>
                    <div className="h-11 rounded-xl border border-mongodb-border-slate/60 bg-mongodb-light-slate/20 flex items-center px-4 font-bold text-mongodb-deep-slate gap-2">
                      <UserCheck className="w-4 h-4 text-mongodb-green-dark" />
                      Agent
                    </div>
                    <p className="text-[10px] font-medium text-mongodb-slate-text/60 px-1 italic">All invited members are set to Agent type by default</p>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button type="submit" disabled={isInviting} className="w-full h-12 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      {isInviting ? "Sending Invite..." : "Send Invite"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mongodb-slate-text group-focus-within:text-mongodb-green transition-colors" />
          <Input
            placeholder="Search team by name, email or type..."
            className="pl-11 h-12 rounded-2xl border-mongodb-border-slate/40 focus:ring-mongodb-green/20 font-bold shadow-sm bg-white/50 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-2xl border-mongodb-border-slate/40 font-bold bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-mongodb-slate-text" />
              <SelectValue placeholder="All Roles" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-mongodb-border-slate/40 shadow-xl">
            <SelectItem value="all" className="font-bold">All User Types</SelectItem>
            <SelectItem value="owner" className="font-bold">Owners</SelectItem>
            <SelectItem value="agent" className="font-bold">Agents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredTeam.map((member) => {
            const isSelf = currentUser?.id === member.id;
            const canManage = isOwner || isSelf;
            const roleColor = getRoleColor(member.role);

            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group relative border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 hover:shadow-2xl hover:border-mongodb-green/60 transition-all rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md hover:-translate-y-1">
                  {/* Role Color Strip */}
                  <div
                    className="h-2 w-full absolute top-0 left-0"
                    style={{ backgroundColor: roleColor }}
                  />

                  <CardHeader className="p-8 pb-4 flex flex-row items-center gap-6 relative">
                    {/* Action Menu - Conditional visibility */}
                    {(isOwner || isSelf) && (
                      <div className="absolute top-6 right-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-mongodb-light-slate text-mongodb-slate-text">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-mongodb-border-slate/40 shadow-2xl p-2 w-48">
                            <DropdownMenuItem
                              onClick={() => openEditModal(member)}
                              className="rounded-xl font-bold gap-3 p-3 focus:bg-mongodb-light-slate cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 text-mongodb-deep-slate" />
                              {isSelf ? "Edit Profile" : "Edit Member"}
                            </DropdownMenuItem>

                            {isOwner && !isSelf && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => updateMember({ id: member.id, data: { status: member.status === 'inactive' ? 'active' : 'inactive' } })}
                                  className="rounded-xl font-bold gap-3 p-3 focus:bg-mongodb-light-slate cursor-pointer"
                                >
                                  <UserX className="w-4 h-4 text-mongodb-slate-text" />
                                  {member.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-mongodb-border-slate/20" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
                                      deleteMember(member.id);
                                    }
                                  }}
                                  className="rounded-xl font-bold gap-3 p-3 focus:bg-mongodb-error/10 text-mongodb-error cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </DropdownMenuItem>
                              </>
                            )}

                            {isOwner && isSelf && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="opacity-40 select-none">
                                      <DropdownMenuSeparator className="bg-mongodb-border-slate/20" />
                                      <DropdownMenuItem disabled className="rounded-xl font-bold gap-3 p-3 select-none cursor-not-allowed">
                                        <Trash2 className="w-4 h-4" />
                                        Remove Member
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-mongodb-deep-slate text-white border-none rounded-lg font-bold">
                                    You cannot remove yourself
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    <Avatar className="h-16 w-16 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110 duration-500">
                      <AvatarFallback
                        className="text-white font-black text-2xl uppercase"
                        style={{ backgroundColor: roleColor }}
                      >
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <CardTitle className="text-xl font-black text-mongodb-deep-slate group-hover:text-mongodb-deep-slate transition-colors flex items-center gap-2">
                        {member.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        {isSelf && <span className="text-[9px] font-black bg-mongodb-green/20 text-mongodb-green-dark px-1.5 py-0.5 rounded-md uppercase tracking-tighter">You</span>}
                      </CardTitle>
                      {/* Role Pill */}
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{
                          backgroundColor: `${roleColor}15`,
                          color: roleColor,
                          border: `1px solid ${roleColor}30`
                        }}
                      >
                         {member.role === 'owner' ? <ShieldCheck className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                         {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                       </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-4 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-mongodb-light-slate/30 border border-mongodb-border-slate/20 group-hover:bg-white group-hover:border-mongodb-green/20 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-mongodb-green/10 flex items-center justify-center text-mongodb-green-dark">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[9px] font-black uppercase tracking-widest text-mongodb-slate-text opacity-60">Email Address</span>
                        <span className="text-xs font-bold text-mongodb-slate-text truncate">{member.email}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="mx-8 h-px bg-mongodb-border-slate/20" />

                  <CardFooter className="px-8 py-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-mongodb-slate-text opacity-60">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(member.createdAt).getFullYear()}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5",
                      member.status === 'inactive' ? "text-mongodb-slate-text/60" : "text-mongodb-green-dark"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                        member.status === 'inactive' ? "bg-mongodb-slate-text/40" : "bg-mongodb-green animate-pulse"
                      )} />
                      {member.status === 'inactive' ? 'Inactive' : 'Active'}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTeam.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-20">
            <EmptyState
              title="No intelligence matches"
              description="Adjust your search or filters to find team members."
            />
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[2rem] border-mongodb-border-slate/40 shadow-2xl p-0 overflow-hidden max-w-md">
          <form onSubmit={handleUpdate}>
            <div className="bg-mongodb-deep-slate p-8 text-white relative">
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: getRoleColor(editRole) }}
              />
              <DialogTitle className="text-2xl font-black mb-2 flex items-center gap-3">
                <Edit2 className="w-6 h-6 text-mongodb-green" />
                {editingMember?.id === currentUser?.id ? "Edit Your Profile" : "Edit User Intelligence"}
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                Modify user types and personnel data.
              </DialogDescription>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Full Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Work Email</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold"
                  required
                />
              </div>

              {isOwner && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">User Type</Label>
                    <Select value={editRole} onValueChange={setEditRole} disabled={true}>
                      <SelectTrigger className="h-11 rounded-xl border-mongodb-border-slate/60 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-mongodb-border-slate/40">
                        <SelectItem value="owner" className="font-bold">Owner</SelectItem>
                        <SelectItem value="agent" className="font-bold">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus} disabled={editingMember?.id === currentUser?.id}>
                      <SelectTrigger className="h-11 rounded-xl border-mongodb-border-slate/60 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-mongodb-border-slate/40">
                        <SelectItem value="active" className="font-bold text-mongodb-green-dark">Active</SelectItem>
                        <SelectItem value="inactive" className="font-bold text-mongodb-slate-text">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <Button type="submit" disabled={isUpdating} className="w-full h-12 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {isUpdating ? "Saving Staff Intelligence..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditOpen(false)}
                  className="text-xs font-bold text-mongodb-slate-text hover:text-mongodb-deep-slate"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
