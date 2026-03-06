import { useWidgets, useCreateWidget, useDeleteWidget } from "@/hooks/use-widgets";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Code2, Trash2, Edit, MessageSquare, Layers, Clock, Zap } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export default function WidgetsPage() {
  const { data: widgets, isLoading } = useWidgets();
  const { mutate: deleteWidget } = useDeleteWidget();

  if (isLoading) return <div className="p-8">Loading widgets...</div>;

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
            <Layers className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Asset Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-mongodb-deep-slate tracking-tight">Lead Forms</h1>
          <p className="text-sm md:text-base text-mongodb-slate-text font-medium mt-1">Deploy high-conversion capture forms across your domain.</p>
        </div>
        <Link href="/widgets/new">
          <Button className="h-12 px-6 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all gap-2">
            <Plus className="h-5 w-5" />
            New Form
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {widgets?.map((widget) => {
          const fields = widget.fields as any[];
          const displayedFields = fields.slice(0, 3);
          const remainingFieldsCount = fields.length - 3;

          const statusColors = {
            active: "#00ED64",
            draft: "#F5A623",
            inactive: "#9CA3AF",
          }[widget.status as "active" | "draft" | "inactive"] || "#00ED64";

          return (
            <motion.div
              key={widget.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="group relative border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 hover:shadow-2xl hover:border-mongodb-green/60 transition-all rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md hover:-translate-y-1">
                {/* Status Color Strip */}
                <div
                  className="h-2 w-full absolute top-0 left-0"
                  style={{ backgroundColor: statusColors }}
                />

                <CardHeader className="p-8 pb-4 flex flex-row items-center gap-6 relative">
                  <div className="h-16 w-16 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110 duration-500 bg-mongodb-green/10 flex items-center justify-center text-mongodb-green-dark relative">
                    <MessageSquare className="w-8 h-8" />
                    {widget.status === 'active' && (
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm animate-pulse"
                        style={{ backgroundColor: statusColors }}
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black text-mongodb-deep-slate group-hover:text-mongodb-deep-slate transition-colors line-clamp-1">
                      {widget.name}
                    </CardTitle>
                    <p className="text-[10px] font-black bg-mongodb-light-slate text-mongodb-slate-text/60 px-2 py-0.5 rounded-md uppercase tracking-tighter italic inline-block">
                      CTA: "{widget.ctaText || "Send Message"}"
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-4 space-y-4">
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text opacity-60 px-1">Form Fields</div>
                    <div className="flex flex-wrap gap-2">
                      {displayedFields.map((field, i) => (
                        <span key={i} className="px-3 py-1 bg-mongodb-light-slate/50 border border-mongodb-border-slate/20 text-mongodb-deep-slate rounded-lg text-xs font-bold shadow-sm">
                          {field.label}
                        </span>
                      ))}
                      {remainingFieldsCount > 0 && (
                        <span className="px-3 py-1 bg-white border border-mongodb-border-slate/10 text-mongodb-slate-text/40 rounded-lg text-[10px] font-black italic">
                          +{remainingFieldsCount} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <div className="mx-8 h-px bg-mongodb-border-slate/20" />

                <CardFooter className="px-8 py-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-mongodb-slate-text opacity-60">
                      <Clock className="w-3.5 h-3.5" />
                      Init: {format(new Date(widget.createdAt!), "MMM d, yyyy")}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5",
                      widget.status === 'inactive' ? "text-mongodb-slate-text/60" :
                        widget.status === 'draft' ? "text-amber-600" : "text-mongodb-green-dark"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        widget.status === 'active' ? "bg-mongodb-green animate-pulse" :
                          widget.status === 'draft' ? "bg-amber-500" : "bg-slate-400"
                      )} />
                      {widget.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <Link href={`/widgets/${widget.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-mongodb-border-slate/60 bg-white font-black text-mongodb-deep-slate hover:bg-mongodb-light-slate gap-2 transition-all shadow-sm"
                      >
                        <Edit className="h-4 w-4 text-mongodb-green-dark" />
                        Configure
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-mongodb-error hover:bg-mongodb-error/10 hover:text-mongodb-error transition-all border border-transparent hover:border-mongodb-error/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem] border-mongodb-border-slate/40 shadow-2xl p-0 overflow-hidden max-w-md">
                        <div className="bg-mongodb-deep-slate p-8 text-white relative text-center">
                          <div className="absolute top-0 left-0 w-full h-1 bg-mongodb-error" />
                          <div className="mx-auto w-12 h-12 bg-mongodb-error/10 rounded-2xl flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-mongodb-error" />
                          </div>
                          <AlertDialogTitle className="text-2xl font-black mb-2 text-white">Delete Form?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60 font-medium">
                            You are about to permanently delete <span className="text-white font-bold">"{widget.name}"</span>. This action will sever all active embeds and cannot be reversed.
                          </AlertDialogDescription>
                        </div>
                        <div className="p-8 flex flex-col gap-3">
                          <AlertDialogAction
                            onClick={() => deleteWidget(widget.id)}
                            className="w-full h-12 rounded-xl bg-mongodb-error text-white font-black hover:bg-mongodb-error/100 transition-all shadow-xl shadow-mongodb-error/20"
                          >
                            Force Delete
                          </AlertDialogAction>
                          <AlertDialogCancel className="h-12 rounded-xl border-mongodb-border-slate/60 font-bold">Hold on</AlertDialogCancel>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}

        {widgets?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-mongodb-border-slate/40 rounded-3xl bg-mongodb-light-slate/20 transition-all hover:bg-mongodb-light-slate/30 group">
            <EmptyState
              title="No Active Forms"
              description="Deploy your first lead capture form and start scaling your conversion pipeline today."
            />
            <div className="mt-2">
              <Link href="/widgets/new">
                <Button className="h-12 px-8 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all">
                  Initialize First Form
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

