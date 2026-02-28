import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api, buildUrl } from "@shared/routes";
import { Widget, WidgetField } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Mail, Phone, User, Calendar, FileUp, Hash } from "lucide-react";

export default function PublicForm() {
    const [, params] = useRoute("/f/:id");
    const formId = params?.id;
    const { toast } = useToast();
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);

    const { data: form, isLoading, error } = useQuery<Widget>({
        queryKey: [api.public.getForm.path, formId],
        queryFn: async () => {
            const res = await fetch(buildUrl(api.public.getForm.path, { id: formId! }));
            if (!res.ok) throw new Error("Form not found");
            return res.json();
        },
        enabled: !!formId,
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(api.public.submitLead.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to submit");
            return res.json();
        },
        onSuccess: () => {
            setSubmitted(true);
            toast({ title: "Inquiry Sent!", description: "Your response has been successfully captured." });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-mongodb-light-slate/30">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-mongodb-green/20 rounded-full" />
                <p className="text-mongodb-deep-slate/40 font-black text-xs uppercase tracking-widest">Loading Lead Catcher...</p>
            </div>
        </div>
    );

    if (error || !form) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-mongodb-deep-slate tracking-tight">404</h1>
                <p className="text-mongodb-slate-text font-medium">This Lead Catcher interface does not exist or has been deactivated.</p>
                <Button variant="outline" className="rounded-xl border-mongodb-border-slate/60" onClick={() => window.location.href = "/"}>Back Home</Button>
            </div>
        </div>
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            widgetId: form.id,
            formResponses: responses,
        });
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mongodb-light-slate/30 p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-mongodb-border-slate/40 text-center space-y-6"
                >
                    <div className="mx-auto w-20 h-20 bg-mongodb-green rounded-3xl flex items-center justify-center shadow-xl shadow-mongodb-green/20">
                        <Check className="w-10 h-10 text-mongodb-deep-slate" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-mongodb-deep-slate tracking-tight">Inquiry Received!</h2>
                        <p className="text-mongodb-slate-text font-medium">Thank you for your interest. A representative will contact you shortly.</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-mongodb-green-dark font-black text-xs uppercase tracking-widest hover:bg-mongodb-green/5"
                        onClick={() => setSubmitted(false)}
                    >
                        Submit Another Inquiry
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mongodb-light-slate/30 flex items-center justify-center p-4 md:p-8 lg:p-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-mongodb-border-slate/40 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: form.primaryColor }} />

                <div className="p-10 md:p-14 space-y-10">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black text-mongodb-deep-slate tracking-tight leading-tight">
                            {form.headingText || "Get in Touch"}
                        </h1>
                        <p className="text-mongodb-slate-text/60 font-medium text-sm">Please fill out the form below to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {(form.fields as WidgetField[]).map((field, i) => (
                            <div key={i} className="space-y-2.5">
                                <Label className="text-[11px] font-black text-mongodb-deep-slate/80 uppercase tracking-[0.15em] px-1 flex items-center gap-2">
                                    {field.label} {field.required && <span className="text-mongodb-error">*</span>}
                                </Label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        required={field.required}
                                        placeholder={`Type your ${field.label.toLowerCase()}...`}
                                        className="flex min-h-[120px] w-full rounded-2xl border border-mongodb-border-slate/60 bg-white px-5 py-4 text-sm font-medium transition-all focus:ring-4 outline-none resize-none"
                                        style={{ '--tw-ring-color': `${form.primaryColor}20`, borderColor: `${form.primaryColor}40` } as any}
                                        onChange={(e) => setResponses({ ...responses, [field.label]: e.target.value })}
                                    />
                                ) : field.type === 'dropdown' ? (
                                    <Select
                                        onValueChange={(val) => setResponses({ ...responses, [field.label]: val })}
                                        required={field.required}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-mongodb-border-slate/60 font-bold text-mongodb-deep-slate px-5">
                                            <SelectValue placeholder="Select an option..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-2xl border-mongodb-border-slate/100">
                                            {(field.options || []).map((opt) => (
                                                <SelectItem key={opt} value={opt} className="font-bold py-3">{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : field.type === 'radio' ? (
                                    <RadioGroup
                                        onValueChange={(val) => setResponses({ ...responses, [field.label]: val })}
                                        required={field.required}
                                        className="grid gap-3 pt-1"
                                    >
                                        {(field.options || []).map((opt) => (
                                            <div key={opt} className="flex items-center gap-3 bg-mongodb-light-slate/20 p-4 rounded-2xl border border-mongodb-border-slate/20 transition-all hover:bg-white cursor-pointer group">
                                                <RadioGroupItem value={opt} id={`${field.key}-${opt}`} className="text-mongodb-green" />
                                                <Label htmlFor={`${field.key}-${opt}`} className="text-sm font-bold text-mongodb-deep-slate cursor-pointer flex-1">{opt}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : field.type === 'checkbox' ? (
                                    <div className="grid gap-3 pt-1">
                                        {(field.options || []).map((opt) => (
                                            <div key={opt} className="flex items-center gap-3 bg-mongodb-light-slate/20 p-4 rounded-2xl border border-mongodb-border-slate/20 transition-all hover:bg-white cursor-pointer group">
                                                <Checkbox
                                                    id={`${field.key}-${opt}`}
                                                    onCheckedChange={(checked) => {
                                                        const current = responses[field.label] || [];
                                                        const updated = checked
                                                            ? [...current, opt]
                                                            : current.filter((v: string) => v !== opt);
                                                        setResponses({ ...responses, [field.label]: updated });
                                                    }}
                                                    className="data-[state=checked]:bg-mongodb-green border-mongodb-border-slate/60"
                                                />
                                                <Label htmlFor={`${field.key}-${opt}`} className="text-sm font-bold text-mongodb-deep-slate cursor-pointer flex-1">{opt}</Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <Input
                                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'file_upload' ? 'file' : field.type === 'email' ? 'email' : 'text'}
                                            required={field.required}
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                            className="h-14 rounded-2xl border-mongodb-border-slate/60 bg-white px-5 font-bold text-mongodb-deep-slate transition-all focus:ring-4 placeholder:text-mongodb-slate-text/30"
                                            style={{ '--tw-ring-color': `${form.primaryColor}20`, borderColor: `${form.primaryColor}40` } as any}
                                            onChange={(e) => setResponses({ ...responses, [field.label]: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full h-16 mt-4 rounded-2xl text-white font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            style={{ backgroundColor: form.primaryColor, boxShadow: `0 24px 48px -12px ${form.primaryColor}40` }}
                        >
                            {mutation.isPending ? "Submitting..." : "Send Secure Message"}
                        </Button>
                    </form>

                    <div className="pt-8 border-t border-mongodb-border-slate/20 text-center">
                        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-mongodb-slate-text/40">
                            Powered by
                            <span className="text-mongodb-deep-slate">Lead Catcher</span>
                            <div className="w-1 h-1 rounded-full bg-mongodb-green/40" />
                            Agency Suite
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
