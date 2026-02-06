import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { WidgetField } from "@shared/schema";

export default function EmbedForm() {
  const [match, params] = useRoute("/embed/:id");
  const widgetId = params?.id ? parseInt(params.id) : 0;
  
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: widget, isLoading } = useQuery({
    queryKey: [api.public.getWidget.path, widgetId],
    queryFn: async () => {
      const res = await fetch(api.public.getWidget.path.replace(":id", String(widgetId)));
      if (!res.ok) throw new Error("Widget not found");
      return api.public.getWidget.responses[200].parse(await res.json());
    },
    enabled: !!widgetId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(api.public.submitLead.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetId, formResponses: data }),
      });
      if (!res.ok) throw new Error("Submission failed");
      return res.json();
    },
    onSuccess: () => setIsSuccess(true),
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!widget) return <div className="p-4 text-center text-red-500">Widget not found.</div>;

  const fields = widget.fields as WidgetField[];
  const primaryColor = widget.primaryColor || "#000000";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formState);
  };

  if (isSuccess) {
    return (
        <div className="flex h-screen flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="h-16 w-16 mb-4" style={{ color: primaryColor }} />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">Your information has been received.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>{widget.headingText}</h2>
            </div>

            {fields.map((field, i) => (
                <div key={i} className="space-y-2">
                    <Label className="font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                        <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required={field.required}
                            onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                        />
                    ) : field.type === 'dropdown' ? (
                         <Select onValueChange={(val) => setFormState({ ...formState, [field.key]: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {(field.options || []).map((opt, idx) => (
                                    <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input 
                            type={field.type} 
                            required={field.required}
                            onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                        />
                    )}
                </div>
            ))}

            <Button 
                type="submit" 
                className="w-full text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
                disabled={submitMutation.isPending}
            >
                {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
        </form>
    </div>
  );
}
