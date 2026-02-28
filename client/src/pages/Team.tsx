import { useState } from "react";
import { useTeam, useInviteMember } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Mail, Shield, ShieldCheck, Users, Search, MoreHorizontal, UserCheck, Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function TeamPage() {
  const { data: team, isLoading } = useTeam();
  const { mutate: inviteMember, isPending } = useInviteMember();
  const [open, setOpen] = useState(false);

  // Invite Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMember({ name, email, password }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setEmail("");
        setPassword("");
      }
    });
  };

  if (isLoading) return <div className="p-8">Loading team...</div>;

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
            <Users className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Agency Personnel</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-mongodb-deep-slate tracking-tight">Team Intelligence</h1>
          <p className="text-sm md:text-base text-mongodb-slate-text font-medium mt-1">Manage executive access and distribution rights.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all gap-2">
              <UserPlus className="h-5 w-5" />
              Onboard Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] border-mongodb-border-slate/40 shadow-2xl p-0 overflow-hidden max-w-md">
            <form onSubmit={handleInvite}>
              <div className="bg-mongodb-deep-slate p-8 text-white relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-mongodb-green" />
                <DialogTitle className="text-2xl font-black mb-2 text-mongodb-green">Authorize New Agent</DialogTitle>
                <DialogDescription className="text-white/60 font-medium">
                  Grant administrative access to your agency ecosystem.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Full Legal Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Corporate Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="agent@agency.com" className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text px-1">Initial Access Key</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold" />
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {isPending ? "Issuing Credentials..." : "Issue Access Credentials"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {team?.map((member) => (
          <Card key={member.id} className="group border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 hover:shadow-2xl hover:border-mongodb-green/30 transition-all rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-4 flex flex-row items-center gap-5 relative">
              <div className="absolute top-6 right-6">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4 text-mongodb-slate-text" />
                </Button>
              </div>
              <Avatar className="h-16 w-16 rounded-2xl border-2 border-mongodb-border-slate/20 group-hover:border-mongodb-green transition-colors shadow-sm">
                <AvatarFallback className="bg-mongodb-light-slate text-mongodb-deep-slate font-black text-2xl">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-lg md:text-xl font-black text-mongodb-deep-slate group-hover:text-mongodb-green-dark transition-colors">{member.name}</CardTitle>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-mongodb-light-slate border border-mongodb-border-slate/20">
                  {member.role === 'owner' ? <ShieldCheck className="h-3 w-3 text-mongodb-green-dark" /> : <UserCheck className="h-3 w-3 text-mongodb-slate-text" />}
                  <span className="text-[10px] font-black uppercase tracking-tighter text-mongodb-deep-slate">{member.role}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-mongodb-light-slate/30 border border-mongodb-border-slate/20 group-hover:bg-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-mongodb-green/10 flex items-center justify-center text-mongodb-green-dark">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-mongodb-slate-text">Email Address</span>
                  <span className="text-sm font-bold text-mongodb-deep-slate truncate max-w-[180px]">{member.email}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text opacity-40">
              <span>Joined {new Date().getFullYear()}</span>
              <span>Active</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
