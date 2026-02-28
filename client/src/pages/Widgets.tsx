import { useWidgets, useCreateWidget, useDeleteWidget } from "@/hooks/use-widgets";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Code2, Trash2, Edit, MessageSquare, Layers, Clock, Zap } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
        {widgets?.map((widget) => (
          <Card key={widget.id} className="flex flex-col border-mongodb-border-slate/40 shadow-xl shadow-mongodb-deep-slate/5 hover:shadow-2xl hover:border-mongodb-green/30 transition-all group overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-mongodb-light-slate/30 border-b border-mongodb-border-slate/20 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-mongodb-green/10 flex items-center justify-center text-mongodb-green-dark font-black shadow-sm group-hover:bg-mongodb-green group-hover:text-mongodb-deep-slate transition-all">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-mongodb-green text-[10px] font-black text-mongodb-deep-slate uppercase tracking-tighter shadow-sm">
                  <Zap className="w-3 h-3fill-current" />
                  Active
                </div>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black text-mongodb-deep-slate group-hover:text-mongodb-green-dark transition-colors">{widget.name}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                Init: {format(new Date(widget.createdAt!), "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text opacity-70">Form Fields</div>
                <div className="flex flex-wrap gap-2">
                  {(widget.fields as any[]).map((field, i) => (
                    <span key={i} className="px-3 py-1 bg-mongodb-light-slate border border-mongodb-border-slate/40 text-mongodb-deep-slate rounded-lg text-xs font-bold shadow-sm">
                      {field.label}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-mongodb-light-slate/10 border-t border-mongodb-border-slate/20 p-4 flex gap-3">
              <Link href={`/widgets/${widget.id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full h-10 rounded-xl border-mongodb-border-slate/60 bg-white font-black text-mongodb-deep-slate hover:bg-mongodb-light-slate gap-2 transition-all">
                  <Edit className="h-4 w-4 text-mongodb-green-dark" />
                  Configure
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-mongodb-error hover:bg-mongodb-error/10 hover:text-mongodb-error transition-all">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-mongodb-border-slate/40 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black text-mongodb-deep-slate">Delete Form?</AlertDialogTitle>
                    <AlertDialogDescription className="text-mongodb-slate-text font-medium text-base">
                      You are about to permanently delete <span className="text-mongodb-deep-slate font-bold">"{widget.name}"</span>. This action will sever all active embeds and cannot be reversed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-4 gap-3">
                    <AlertDialogCancel className="rounded-xl border-mongodb-border-slate/60 font-bold h-11">Hold on</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteWidget(widget.id)}
                      className="rounded-xl bg-mongodb-error text-white font-black h-11 hover:bg-mongodb-error/90 shadow-lg shadow-mongodb-error/20"
                    >
                      Force Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}

        {widgets?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-mongodb-border-slate/40 rounded-3xl bg-mongodb-light-slate/20 transition-all hover:bg-mongodb-light-slate/30 group">
            <div className="w-16 h-16 rounded-2xl bg-mongodb-light-slate border border-mongodb-border-slate/40 flex items-center justify-center text-mongodb-slate-text mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Code2 className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-2xl font-black text-mongodb-deep-slate mb-2">No Active Forms</h3>
            <p className="text-mongodb-slate-text font-medium mb-8 max-w-sm text-center">Deploy your first lead capture form and start scaling your conversion pipeline today.</p>
            <Link href="/widgets/new">
              <Button className="h-12 px-8 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all">
                Initialize First Form
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
