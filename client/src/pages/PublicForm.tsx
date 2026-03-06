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
import { Check, Mail, Phone, User, Calendar as CalendarIcon, FileUp, Hash, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PhoneInputWithCountry } from "@/components/ui/phone-input";

export default function PublicForm() {
    const [, params] = useRoute("/f/:id");
    const formId = params?.id;
    const { toast } = useToast();
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
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

    if (error || !form || form.status !== 'active') return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="text-center space-y-4 max-w-sm">
                <div className="mx-auto w-16 h-16 bg-mongodb-light-slate/20 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-mongodb-deep-slate opacity-20" />
                </div>
                <h1 className="text-2xl font-black text-mongodb-deep-slate tracking-tight">Interface Unavailable</h1>
                <p className="text-mongodb-slate-text font-medium leading-relaxed">
                    {form?.status === 'draft'
                        ? "This Lead Catcher is currently in draft mode and is not yet accepting public submissions."
                        : "This Lead Catcher interface has been de-activated by the administrator."}
                </p>
                <div className="pt-4">
                    <Button variant="outline" className="rounded-xl border-mongodb-border-slate/60 font-bold" onClick={() => window.location.href = "/"}>Back to Dashboard</Button>
                </div>
            </div>
        </div>
    );

    const validateField = (field: WidgetField, value: any) => {
        let error = "";
        if (field.required) {
            if (field.type === 'checkbox') {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    error = "Please select at least one option";
                }
            } else if (field.type === 'dropdown' || field.type === 'radio' || field.type === 'date' || field.type === 'date_time' || field.type === 'file_upload') {
                if (!value) error = `Please select an option`;
            } else {
                if (!value || String(value).trim() === "") error = "This field is required";
            }
        }

        if (!error && value && String(value).trim() !== "") {
            if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) error = "Please enter a valid email address";
            } else if (field.type === 'phone') {
                const phoneRegex = /^[0-9+\-()\s]+$/;
                const parts = String(value).split(" ");
                const hasNumber = parts.length >= 2 && parts[1].trim().length > 0;
                if (!phoneRegex.test(value) || !hasNumber) error = "Please enter a valid phone number";
            }
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) newErrors[field.label] = error;
            else delete newErrors[field.label];
            return newErrors;
        });

        return !error;
    };

    const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '(', ')', '+', '-', ' '];
        if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handlePhonePaste = (e: React.ClipboardEvent) => {
        const pasteData = e.clipboardData.getData('text');
        if (!/^[0-9+\-()\s]+$/.test(pasteData)) {
            e.preventDefault();
            const stripped = pasteData.replace(/[^0-9+\-()\s]/g, '');
            if (stripped) {
                setResponses(prev => ({ ...prev, [(e.target as any).name]: stripped }));
            }
        }
    };

    const handleNumberKeyDown = (e: React.KeyboardEvent) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '.', '-', 'Enter'];
        if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let isValid = true;
        const newErrors: Record<string, string> = {};

        (form.fields as WidgetField[]).forEach(field => {
            const value = responses[field.label];
            let error = "";

            if (field.required) {
                if (field.type === 'checkbox') {
                    if (!value || (Array.isArray(value) && value.length === 0)) {
                        error = "Please select at least one option";
                    }
                } else if (field.type === 'dropdown' || field.type === 'radio' || field.type === 'date' || field.type === 'date_time' || field.type === 'file_upload') {
                    if (!value) error = `Please select an option`;
                } else {
                    if (!value || String(value).trim() === "") error = "This field is required";
                }
            }

            if (!error && value && String(value).trim() !== "") {
                if (field.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) error = "Please enter a valid email address";
                } else if (field.type === 'phone') {
                    const phoneRegex = /^[0-9+\-()\s]+$/;
                    if (!phoneRegex.test(value)) error = "Please enter a valid phone number";
                }
            }

            if (error) {
                newErrors[field.label] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (!isValid) {
            toast({ title: "Validation Error", description: "Please provide valid information for all required fields.", variant: "destructive" });
            return;
        }

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

                                {(() => {
                                    const placeholder = field.type === 'email' ? 'Enter email address...' :
                                        field.type === 'phone' ? 'Enter phone number...' :
                                            `Enter ${field.label.toLowerCase()}...`;

                                    const inputStyles = {
                                        '--tw-ring-color': `${form.primaryColor}20`,
                                        borderColor: `${form.primaryColor}40`
                                    } as any;

                                    switch (field.type) {
                                        case 'textarea':
                                            return (
                                                <div className="space-y-1.5">
                                                    <Textarea
                                                        placeholder={`Type your ${field.label.toLowerCase()}...`}
                                                        className={cn(
                                                            "min-h-[120px] rounded-2xl border-mongodb-border-slate/60 bg-white px-5 py-4 text-sm font-medium transition-all focus:ring-4 outline-none resize-none",
                                                            errors[field.label] && "border-mongodb-error focus:ring-mongodb-error/10"
                                                        )}
                                                        style={inputStyles}
                                                        onChange={(e) => {
                                                            setResponses({ ...responses, [field.label]: e.target.value });
                                                            if (errors[field.label]) validateField(field, e.target.value);
                                                        }}
                                                        onBlur={(e) => validateField(field, e.target.value)}
                                                    />
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'dropdown':
                                            const dropdownOptions = (field.options || []).filter(opt => String(opt).trim() !== "");
                                            return (
                                                <div className="space-y-1.5">
                                                    <Select
                                                        onValueChange={(val) => {
                                                            setResponses({ ...responses, [field.label]: val });
                                                            validateField(field, val);
                                                        }}
                                                    >
                                                        <SelectTrigger className={cn(
                                                            "h-14 rounded-2xl border-mongodb-border-slate/60 font-bold text-mongodb-deep-slate px-5 bg-white",
                                                            errors[field.label] && "border-mongodb-error"
                                                        )} style={inputStyles}>
                                                            <SelectValue placeholder="Select an option..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl shadow-2xl border-mongodb-border-slate/100">
                                                            {dropdownOptions.map((opt) => (
                                                                <SelectItem key={String(opt)} value={String(opt)} className="font-bold py-3">{String(opt)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'radio':
                                            const radioOptions = (field.options || []).filter(opt => String(opt).trim() !== "");
                                            return (
                                                <div className="space-y-1.5">
                                                    <RadioGroup
                                                        onValueChange={(val) => {
                                                            setResponses({ ...responses, [field.label]: val });
                                                            validateField(field, val);
                                                        }}
                                                        className="grid gap-3 pt-1"
                                                    >
                                                        {radioOptions.map((opt) => (
                                                            <div key={String(opt)} className="flex items-center gap-3 bg-mongodb-light-slate/20 p-4 rounded-2xl border border-mongodb-border-slate/20 transition-all hover:bg-white cursor-pointer group">
                                                                <RadioGroupItem value={String(opt)} id={`${field.key}-${String(opt)}`} className="text-mongodb-green" />
                                                                <Label htmlFor={`${field.key}-${String(opt)}`} className="text-sm font-bold text-mongodb-deep-slate cursor-pointer flex-1">{String(opt)}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'checkbox':
                                            const checkboxOptions = (field.options || []).filter(opt => String(opt).trim() !== "");
                                            return (
                                                <div className="space-y-1.5">
                                                    <div className="grid gap-3 pt-1">
                                                        {checkboxOptions.map((opt) => {
                                                            const current = responses[field.label] || [];
                                                            const isChecked = current.includes(String(opt));
                                                            return (
                                                                <div key={String(opt)} className="flex items-center gap-3 bg-mongodb-light-slate/20 p-4 rounded-2xl border border-mongodb-border-slate/20 transition-all hover:bg-white cursor-pointer group">
                                                                    <Checkbox
                                                                        id={`${field.key}-${String(opt)}`}
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => {
                                                                            const updated = checked
                                                                                ? [...current, String(opt)]
                                                                                : current.filter((v: string) => v !== String(opt));
                                                                            setResponses({ ...responses, [field.label]: updated });
                                                                            validateField(field, updated);
                                                                        }}
                                                                        className="data-[state=checked]:bg-mongodb-green border-mongodb-border-slate/60"
                                                                    />
                                                                    <Label htmlFor={`${field.key}-${String(opt)}`} className="text-sm font-bold text-mongodb-deep-slate cursor-pointer flex-1">{String(opt)}</Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'date':
                                        case 'date_time':
                                            return (
                                                <div className="space-y-1.5">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full h-14 justify-start text-left font-bold rounded-2xl border-mongodb-border-slate/60 bg-white px-5",
                                                                    !responses[field.label] && "text-mongodb-slate-text/30",
                                                                    errors[field.label] && "border-mongodb-error"
                                                                )}
                                                                style={inputStyles}
                                                            >
                                                                <CalendarIcon className="mr-2 h-5 w-5 opacity-50" />
                                                                {responses[field.label] ? format(new Date(responses[field.label]), field.type === 'date_time' ? "PPP p" : "PPP") : `Select ${field.type === 'date_time' ? 'date & time' : 'date'}...`}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={responses[field.label] ? new Date(responses[field.label]) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        const baseDate = responses[field.label] ? new Date(responses[field.label]) : new Date();
                                                                        date.setHours(baseDate.getHours(), baseDate.getMinutes());
                                                                        const iso = date.toISOString();
                                                                        setResponses({ ...responses, [field.label]: iso });
                                                                        validateField(field, iso);
                                                                    }
                                                                }}
                                                                initialFocus
                                                            />
                                                            {field.type === 'date_time' && (
                                                                <div className="p-4 border-t border-mongodb-border-slate/10 flex items-center justify-between bg-mongodb-light-slate/5">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text/60">Time Selection</span>
                                                                    <input
                                                                        type="time"
                                                                        className="text-sm font-bold text-mongodb-deep-slate bg-white px-3 py-1.5 rounded-xl border border-mongodb-border-slate/20 outline-none focus:ring-2 focus:ring-mongodb-green/20"
                                                                        onChange={(e) => {
                                                                            const date = responses[field.label] ? new Date(responses[field.label]) : new Date();
                                                                            const [hours, minutes] = e.target.value.split(':');
                                                                            date.setHours(parseInt(hours), parseInt(minutes));
                                                                            const iso = date.toISOString();
                                                                            setResponses({ ...responses, [field.label]: iso });
                                                                            validateField(field, iso);
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'number':
                                            return (
                                                <div className="space-y-1.5">
                                                    <div className="relative group">
                                                        <Input
                                                            type="number"
                                                            name={field.label}
                                                            placeholder={placeholder}
                                                            min={field.min}
                                                            max={field.max}
                                                            step={field.step}
                                                            onKeyDown={handleNumberKeyDown}
                                                            onPaste={handlePhonePaste}
                                                            className={cn(
                                                                "h-14 rounded-2xl border-mongodb-border-slate/60 bg-white px-5 font-bold text-mongodb-deep-slate transition-all focus:ring-4 placeholder:text-mongodb-slate-text/30",
                                                                errors[field.label] && "border-mongodb-error focus:ring-mongodb-error/10"
                                                            )}
                                                            style={inputStyles}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setResponses({ ...responses, [field.label]: val });
                                                                if (errors[field.label]) validateField(field, val);
                                                            }}
                                                            onBlur={(e) => validateField(field, e.target.value)}
                                                        />
                                                    </div>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'phone':
                                            return (
                                                <div className="space-y-1.5">
                                                    <PhoneInputWithCountry
                                                        value={responses[field.label] || ""}
                                                        onChange={(val) => {
                                                            setResponses({ ...responses, [field.label]: val });
                                                            if (errors[field.label]) validateField(field, val);
                                                        }}
                                                        error={!!errors[field.label]}
                                                        className="h-14 rounded-2xl"
                                                    />
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'file_upload':
                                            return (
                                                <div className="space-y-1.5">
                                                    <div className="relative group">
                                                        <input
                                                            type="file"
                                                            id={`file-${field.key}`}
                                                            className="hidden"
                                                            accept={field.accept || ".pdf,.jpg,.png,.docx"}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (field.maxSize && file.size > field.maxSize * 1024 * 1024) {
                                                                        toast({ title: "File too large", description: `Maximum size is ${field.maxSize}MB`, variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    setResponses({ ...responses, [field.label]: file.name });
                                                                    validateField(field, file.name);
                                                                }
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`file-${field.key}`}
                                                            className={cn(
                                                                "border-2 border-dashed border-mongodb-border-slate/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-mongodb-light-slate/10 cursor-pointer transition-all hover:bg-mongodb-light-slate/20 group",
                                                                errors[field.label] && "border-mongodb-error bg-mongodb-error/5"
                                                            )}
                                                            style={{ borderColor: errors[field.label] ? undefined : `${form.primaryColor}30` }}
                                                        >
                                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-mongodb-border-slate/20 transition-transform group-hover:scale-110">
                                                                <FileUp className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: errors[field.label] ? '#EF4444' : form.primaryColor }} />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-black uppercase tracking-widest text-mongodb-deep-slate">
                                                                    {responses[field.label] || "Click to upload files"}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-mongodb-slate-text/60 mt-1">PDF, JPG, PNG or DOCX</p>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'status':
                                            return (
                                                <div className="space-y-1.5">
                                                    <div className="flex flex-wrap gap-3 pt-1">
                                                        {(field.options || []).map((opt: any, idx) => {
                                                            const label = typeof opt === 'object' ? opt.label : opt;
                                                            const color = typeof opt === 'object' ? opt.color : '#6B8F8F';
                                                            const isSelected = responses[field.label] === label;

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setResponses({ ...responses, [field.label]: label });
                                                                        validateField(field, label);
                                                                    }}
                                                                    className={cn(
                                                                        "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
                                                                        isSelected ? "text-white shadow-xl scale-105" : "bg-transparent hover:bg-mongodb-light-slate/10"
                                                                    )}
                                                                    style={{
                                                                        backgroundColor: isSelected ? color : 'transparent',
                                                                        borderColor: color,
                                                                        color: isSelected ? 'white' : color,
                                                                        boxShadow: isSelected ? `0 10px 20px -5px ${color}50` : 'none'
                                                                    }}
                                                                >
                                                                    {label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        default:
                                            return (
                                                <div className="space-y-1.5">
                                                    <div className="relative group">
                                                        <Input
                                                            type={field.type}
                                                            name={field.label}
                                                            placeholder={placeholder}
                                                            className={cn(
                                                                "h-14 rounded-2xl border-mongodb-border-slate/60 bg-white px-5 font-bold text-mongodb-deep-slate transition-all focus:ring-4 placeholder:text-mongodb-slate-text/30",
                                                                errors[field.label] && "border-mongodb-error focus:ring-mongodb-error/10"
                                                            )}
                                                            style={inputStyles}
                                                            onKeyDown={field.type === 'phone' ? handlePhoneKeyDown : undefined}
                                                            onPaste={field.type === 'phone' ? handlePhonePaste : undefined}
                                                            onChange={(e) => {
                                                                setResponses({ ...responses, [field.label]: e.target.value });
                                                                if (errors[field.label]) validateField(field, e.target.value);
                                                            }}
                                                            onBlur={(e) => validateField(field, e.target.value)}
                                                        />
                                                    </div>
                                                    {errors[field.label] && (
                                                        <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {errors[field.label]}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                    }
                                })()}
                            </div>
                        ))}

                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full h-16 mt-4 rounded-2xl text-white font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            style={{ backgroundColor: form.primaryColor, boxShadow: `0 24px 48px -12px ${form.primaryColor}40` }}
                        >
                            {mutation.isPending ? "Submitting..." : (form.ctaText || "Send Secure Message")}
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
