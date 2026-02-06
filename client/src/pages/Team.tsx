import { useState } from "react";
import { useTeam, useInviteMember } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Mail, Shield, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage who has access to your agency.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleInvite}>
                <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                    Add a new sales rep to your agency. They will be able to view and manage leads.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Temporary Password</Label>
                        <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                </div>
                <DialogFooter>
                <Button type="submit" disabled={isPending}>Send Invite</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {team?.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                    {member.role === 'owner' ? <ShieldCheck className="h-3 w-3 text-primary" /> : <Shield className="h-3 w-3" />}
                    <span className="capitalize">{member.role}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
