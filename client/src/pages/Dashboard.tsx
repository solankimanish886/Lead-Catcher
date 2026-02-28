import { useDashboardStats } from "@/hooks/use-dashboard";
import { useRealtime } from "@/hooks/use-realtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Filter, TrendingUp, Clock, ArrowUpRight, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLORS = ['#00ED64', '#00A2D5', '#FFB500', '#E03C31', '#5C6C75'];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats) return null;

  const pieData = Object.entries(stats.leadsByStatus).map(([name, value]) => ({ name, value }));
  const barData = Object.entries(stats.leadsByWidget).map(([name, value]) => ({ name, value }));

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
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Platform Overview</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-mongodb-deep-slate tracking-tight">Dashboard</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} trend="+12.5%" trendUp={true} />
        <StatCard title="New Leads" value={stats.leadsByStatus['new'] || 0} icon={Filter} trend="Action required" trendUp={false} />
        <StatCard title="Conversion" value={`${calculateConversion(stats)}%`} icon={TrendingUp} trend="+2.4%" trendUp={true} />
        <StatCard title="Response Time" value="2.4h" icon={Clock} trend="-15 min" trendUp={true} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5">
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Top Widgets</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#00ED64" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 overflow-hidden">
        <CardHeader className="bg-mongodb-light-slate/30 border-b border-mongodb-border-slate/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-mongodb-deep-slate">Recent Leads</CardTitle>
            <Link href="/leads">
              <Button variant="ghost" size="sm" className="text-mongodb-green-dark font-bold hover:bg-mongodb-green/10">
                View All Leads
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-mongodb-border-slate/30">
            {stats.recentLeads.length === 0 ? (
              <div className="text-center py-12 text-mongodb-slate-text font-medium">No leads captured yet.</div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {stats.recentLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, y: -20, backgroundColor: "#00ED6420" }}
                    animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      backgroundColor: { duration: 1.5 },
                      default: { duration: 0.4, ease: "easeOut" }
                    }}
                    className="flex items-center p-4 hover:bg-mongodb-light-slate/30 transition-colors group border-b border-mongodb-border-slate/30 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-mongodb-green/10 flex items-center justify-center text-mongodb-green-dark font-bold mr-4 group-hover:bg-mongodb-green group-hover:text-mongodb-deep-slate transition-all shadow-sm">
                      {(lead.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/leads/${lead.id}`} className="block text-sm font-bold text-mongodb-deep-slate hover:text-mongodb-green-dark transition-colors truncate">
                        {lead.name || "Anonymous Lead"}
                      </Link>
                      <p className="text-xs text-mongodb-slate-text font-medium truncate">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-6 ml-4">
                      <StatusBadge status={lead.status} />
                      <span className="text-xs text-mongodb-slate-text font-bold w-28 text-right hidden sm:block">
                        {lead.createdAt ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : 'just now'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div >
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: { title: string, value: string | number, icon: any, trend: string, trendUp: boolean }) {
  return (
    <Card className="border-mongodb-border-slate/40 shadow-lg shadow-mongodb-deep-slate/5 hover:shadow-xl hover:border-mongodb-green/30 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all">
        <Icon className="w-12 h-12 text-mongodb-deep-slate" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black text-mongodb-slate-text uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl lg:text-4xl font-black text-mongodb-deep-slate mb-1">{value}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-black",
            trendUp ? "bg-mongodb-green/10 text-mongodb-green-dark" : "bg-mongodb-error/10 text-mongodb-error"
          )}>
            {trendUp && <ArrowUpRight className="w-3 h-3" />}
            {trend}
          </div>
          <span className="text-[10px] font-bold text-mongodb-slate-text uppercase tracking-tight opacity-50">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateConversion(stats: any) {
  const total = stats.totalLeads || 1;
  const converted = stats.leadsByStatus['converted'] || 0;
  return Math.round((converted / total) * 100);
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[350px]" />
        <Skeleton className="col-span-3 h-[350px]" />
      </div>
    </div>
  );
}
