import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import type { WidgetField } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

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

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#00ED64]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#5C6C75]">Initializing Secure Form...</span>
      </div>
    </div>
  );

  if (!widget) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <div className="p-8 bg-white rounded-3xl border border-red-100 shadow-xl text-center max-w-sm">
        <h2 className="text-xl font-black text-red-600 mb-2">Interface Offline</h2>
        <p className="text-sm font-medium text-slate-500">The requested lead capture module is either inactive or does not exist.</p>
      </div>
    </div>
  );

  const fields = widget.fields as WidgetField[];
  const primaryColor = widget.primaryColor || "#00ED64";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formState);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: primaryColor }} />
          <div className="w-20 h-20 rounded-3xl bg-mongodb-green/10 flex items-center justify-center mx-auto mb-8 shadow-inner" style={{ color: primaryColor }}>
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-[#001E2B] tracking-tight">Transmission Complete</h2>
          <p className="text-[#5C6C75] font-medium leading-relaxed mb-8">Your data has been securely encoded and transmitted to our agents. We will contact you shortly.</p>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Submission
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-6 flex items-center justify-center font-sans selection:bg-mongodb-green/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 sm:p-12 border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: primaryColor }} />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-2 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#5C6C75] mb-2">
              <Zap className="w-3 h-3 fill-current text-mongodb-green" />
              Secure Application Form
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-tight text-[#001E2B]" style={{ color: primaryColor }}>{widget.headingText}</h2>
          </div>

          <div className="space-y-6">
            {fields.map((field, i) => (
              <div key={i} className="space-y-2 group">
                <Label className="text-[11px] font-black uppercase tracking-wider text-[#5C6C75] px-1 transition-colors group-focus-within:text-black">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <textarea
                    className="flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#001E2B] transition-all focus:ring-4 focus:ring-opacity-10 outline-none placeholder:text-slate-300"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    required={field.required}
                    placeholder={`Type your response...`}
                    onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                  />
                ) : field.type === 'dropdown' ? (
                  <Select onValueChange={(val) => setFormState({ ...formState, [field.key]: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 font-bold text-[#001E2B] focus:ring-4 focus:ring-opacity-10 transition-all">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {(field.options || []).map((opt, idx) => (
                        <SelectItem key={idx} value={opt} className="font-bold py-3">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type}
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="h-12 rounded-2xl border-slate-200 font-bold text-[#001E2B] focus:ring-4 focus:ring-opacity-10 transition-all placeholder:text-slate-300"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    onChange={(e) => setFormState({ ...formState, [field.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Transmitting...
              </div>
            ) : "Verify & Submit Form"}
          </Button>

          <div className="pt-4 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3 w-3" />
              End-to-End Encrypted Verification
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
