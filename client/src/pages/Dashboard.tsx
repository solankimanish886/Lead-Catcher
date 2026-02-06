import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Filter, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "wouter";

const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#22c55e', '#6b7280'];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats) return null;

  const pieData = Object.entries(stats.leadsByStatus).map(([name, value]) => ({ name, value }));
  const barData = Object.entries(stats.leadsByWidget).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Overview of your agency performance
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} trend="+12% from last month" />
        <StatCard title="New Leads" value={stats.leadsByStatus['new'] || 0} icon={Filter} trend="Needs attention" />
        <StatCard title="Conversion Rate" value={`${calculateConversion(stats)}%`} icon={TrendingUp} trend="Average for sector" />
        <StatCard title="Avg Response Time" value="2.4h" icon={Clock} trend="-15 mins" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
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
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {stats.recentLeads.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No leads yet.</div>
            ) : (
                stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center">
                    <div className="ml-4 space-y-1 flex-1">
                    <Link href={`/leads/${lead.id}`} className="text-sm font-medium leading-none hover:underline underline-offset-4 cursor-pointer">
                        {lead.name || "Anonymous Lead"}
                    </Link>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <StatusBadge status={lead.status} />
                        <span className="text-sm text-muted-foreground w-24 text-right">
                            {formatDistanceToNow(new Date(lead.createdAt!), { addSuffix: true })}
                        </span>
                    </div>
                </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend: string }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend}</p>
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
