import { useWidgets, useCreateWidget, useDeleteWidget } from "@/hooks/use-widgets";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Code2, Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function WidgetsPage() {
  const { data: widgets, isLoading } = useWidgets();
  const { mutate: deleteWidget } = useDeleteWidget();

  if (isLoading) return <div className="p-8">Loading widgets...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Widgets</h1>
          <p className="text-muted-foreground mt-1">Create and manage your lead capture forms.</p>
        </div>
        <Link href="/widgets/new">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Create Widget
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {widgets?.map((widget) => (
          <Card key={widget.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>{widget.name}</CardTitle>
              <CardDescription>Created {format(new Date(widget.createdAt!), "MMM d, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                <div className="text-sm font-medium">Fields:</div>
                <div className="flex flex-wrap gap-1">
                  {(widget.fields as any[]).map((field, i) => (
                    <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                      {field.label}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex gap-2">
              <Link href={`/widgets/${widget.id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Widget?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the widget and break any embedded forms. Existing leads will remain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteWidget(widget.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}

        {widgets?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
            <Code2 className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No widgets yet</h3>
            <p className="mb-4">Create your first widget to start collecting leads.</p>
            <Link href="/widgets/new">
                <Button>Create Widget</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
