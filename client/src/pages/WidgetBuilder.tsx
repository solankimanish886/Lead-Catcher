import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useWidget, useCreateWidget, useUpdateWidget } from "@/hooks/use-widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import {
  Plus, Trash2, Save, ArrowLeft, Copy, Sliders, Layout,
  Settings, Code as CodeIcon, Check, Activity, X,
  ExternalLink, Calendar as CalendarIcon, FileUp, Lock, Circle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WidgetField } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneInputWithCountry } from "@/components/ui/phone-input";
import { getAppUrl } from "@/lib/env";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

export default function WidgetBuilder() {
  const [match, params] = useRoute("/widgets/:id/edit");
  const isEditing = !!match;
  const widgetId = params?.id ? parseInt(params.id) : null;

  const { data: existingWidget, isLoading } = useWidget(widgetId || 0);
  const { mutate: createWidget } = useCreateWidget();
  const { mutate: updateWidget } = useUpdateWidget();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedForm, setPublishedForm] = useState<any | null>(null);

  const appUrl = getAppUrl();

  const [name, setName] = useState("");
  const [headingText, setHeadingText] = useState("Contact Us");
  const [ctaText, setCtaText] = useState("Send Message");
  const [primaryColor, setPrimaryColor] = useState("#00ED64"); // Default brand green
  const [status, setStatus] = useState<"active" | "inactive" | "draft">("active");
  const [fields, setFields] = useState<WidgetField[]>([
    { key: "name", label: "Full Name", type: "text", required: true },
    { key: "email", label: "Email Address", type: "email", required: true },
  ]);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});
  const [typeChangeIndex, setTypeChangeIndex] = useState<number | null>(null);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [showTypeWarning, setShowTypeWarning] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingWidget && isEditing) {
      setName(existingWidget.name);
      setHeadingText(existingWidget.headingText || "");
      setCtaText(existingWidget.ctaText || "Send Message");
      setPrimaryColor(existingWidget.primaryColor || "#00ED64");
      setStatus((existingWidget.status as any) || "active");
      setFields((existingWidget.fields as WidgetField[]) || []);
    }
  }, [existingWidget, isEditing]);

  const addField = () => {
    setFields([
      ...fields,
      {
        key: `field_${Date.now()}`,
        label: "New Field",
        type: "text",
        required: false
      }
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<WidgetField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleTypeChangeRequest = (index: number, newType: string) => {
    const field = fields[index];
    const isProtected =
      field.type === 'email' ||
      field.type === 'phone' ||
      field.label.toLowerCase().includes('email') ||
      field.label.toLowerCase().includes('phone');

    if (isProtected && newType !== field.type) {
      setTypeChangeIndex(index);
      setPendingType(newType);
      setShowTypeWarning(true);
    } else {
      updateField(index, { type: newType as any });
    }
  };

  const confirmTypeChange = () => {
    if (typeChangeIndex !== null && pendingType) {
      updateField(typeChangeIndex, { type: pendingType as any });
      setShowTypeWarning(false);
      setTypeChangeIndex(null);
      setPendingType(null);
    }
  };

  const validateField = (field: WidgetField, value: any) => {
    let error = "";
    const name = field.label;

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
      if (error) newErrors[field.key] = error;
      else delete newErrors[field.key];
      return newErrors;
    });

    return !error;
  };

  const handlePreviewSubmit = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = previewResponses[field.key];
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
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (isValid) {
      toast({ title: "Preview: Ready to Submit", description: "All validation constraints met." });
    } else {
      toast({ title: "Validation Error", description: "Please correct the highlighted fields.", variant: "destructive" });
    }
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
        setPreviewResponses(prev => ({ ...prev, [(e.target as any).name]: stripped }));
      }
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '.', '-', 'Enter'];
    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (!name) return toast({ title: "Name required", variant: "destructive" });

    const data = {
      name,
      headingText,
      ctaText,
      primaryColor,
      status,
      fields,
    };

    if (isEditing && widgetId) {
      updateWidget({ id: widgetId, data }, {
        onSuccess: (updated) => {
          setPublishedForm(updated);
          if (status === 'active') {
            setShowSuccessModal(true);
          } else {
            toast({
              title: status === 'draft' ? "Saved as Draft" : "Saved",
              description: status === 'draft'
                ? "Form saved as draft. Set status to Active to publish."
                : "Form saved. This form is currently inactive and not publicly accessible."
            });
          }
        }
      });
    } else {
      createWidget(data, {
        onSuccess: (created) => {
          setPublishedForm(created);
          if (status === 'active') {
            setShowSuccessModal(true);
          } else {
            toast({
              title: status === 'draft' ? "Created as Draft" : "Created",
              description: status === 'draft'
                ? "Form created as draft. Set status to Active to publish."
                : "Form created. This form is currently inactive and not publicly accessible."
            });
          }
        }
      });
    }
  };

  const embedUrl = existingWidget?.formId
    ? `${appUrl}/f/${existingWidget.formId}`
    : `${appUrl}/f/undefined`;

  const embedCode = isEditing && existingWidget?.formId
    ? `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`
    : "Save widget to generate embed code";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  if (isEditing && isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white">
      {/* Configuration Panel (Left) */}
      <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-mongodb-border-slate/40 bg-white overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/widgets")} className="w-11 h-11 rounded-xl border border-mongodb-border-slate/40 hover:bg-mongodb-light-slate">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-mongodb-green-dark mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-mongodb-slate-text">Architect</span>
              </div>
              <h1 className="text-3xl font-black text-mongodb-deep-slate tracking-tight leading-none">{isEditing ? "Edit Form" : "New Form"}</h1>
            </div>
          </div>
          <Button onClick={handleSave} className="h-12 px-8 rounded-xl bg-mongodb-green text-mongodb-deep-slate font-black shadow-xl shadow-mongodb-green/20 hover:scale-105 active:scale-95 transition-all gap-2">
            <Save className="h-4 w-4" /> Save Form
          </Button>
        </div>

        {/* Core Settings */}
        <Card className="border-mongodb-border-slate/40 shadow-lg shadow-mongodb-deep-slate/5 rounded-2xl overflow-hidden">
          <CardHeader className="bg-mongodb-light-slate/10 border-b border-mongodb-border-slate/20 py-4 px-6">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-mongodb-green-dark" />
              <h3 className="text-xs font-black uppercase tracking-widest text-mongodb-slate-text">Core Settings</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Internal Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Internal name for your records..."
                className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Form Title</Label>
                <Input
                  value={headingText}
                  onChange={(e) => setHeadingText(e.target.value)}
                  placeholder="e.g. Get a Custom Quote"
                  className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-medium"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-black text-mongodb-deep-slate uppercase tracking-wider">Button Label</Label>
                  <span className={cn(
                    "text-[9px] font-bold uppercase",
                    ctaText.length >= 40 ? "text-mongodb-error" : "text-mongodb-slate-text opacity-40"
                  )}>
                    {ctaText.length}/40
                  </span>
                </div>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value.slice(0, 40))}
                  placeholder="e.g. Send Message"
                  className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-medium"
                />
                {ctaText.length === 0 && (
                  <p className="text-[9px] font-bold text-mongodb-slate-text italic px-1">Using default: Send Message</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[11px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Primary Brand Color</Label>
              <div className="flex gap-2">
                <div
                  className="w-11 h-11 rounded-xl border border-mongodb-border-slate/60 overflow-hidden shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-full opacity-0 cursor-pointer scale-150"
                  />
                </div>
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#HEX"
                  className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[11px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Form Status</Label>
              <div className="flex gap-2 p-1.5 bg-mongodb-light-slate/20 rounded-2xl border border-mongodb-border-slate/40">
                {(["active", "inactive", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center border border-transparent",
                      status === s
                        ? (s === 'active' ? "bg-mongodb-green text-mongodb-deep-slate shadow-md" : s === 'draft' ? "bg-amber-500 text-white shadow-md" : "bg-slate-400 text-white shadow-md")
                        : (s === 'active' ? "text-mongodb-green hover:bg-mongodb-green/5" : s === 'draft' ? "text-amber-500 hover:bg-amber-500/5" : "text-mongodb-slate-text/60 hover:bg-slate-100")
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      status === s ? "bg-white" : (s === 'active' ? "bg-mongodb-green" : s === 'draft' ? "bg-amber-500" : "bg-mongodb-slate-text/40")
                    )} />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capture Schema */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-mongodb-green-dark" />
              <h2 className="text-xl font-black text-mongodb-deep-slate tracking-tight">Form Fields</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addField} className="rounded-xl border-mongodb-green/30 text-mongodb-green-dark font-black hover:bg-mongodb-green/10 shadow-sm gap-2 px-4">
              <Plus className="h-4 w-4" /> Add Field
            </Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => (
                <motion.div
                  key={field.key || index}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="relative group border-mongodb-border-slate/40 shadow-md shadow-mongodb-deep-slate/5 overflow-hidden rounded-2xl">
                    <CardContent className="pt-8 pb-6 px-6 grid gap-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-mongodb-error/60 hover:text-mongodb-error hover:bg-mongodb-error/5 rounded-lg"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            className="h-11 rounded-xl border-mongodb-border-slate/60 focus:ring-mongodb-green/20 font-medium"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Input Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(val: any) => handleTypeChangeRequest(index, val)}
                          >
                            <SelectTrigger className="rounded-xl border-mongodb-border-slate/60 font-bold text-mongodb-deep-slate h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-mongodb-border-slate/100 shadow-2xl">
                              <SelectItem value="text" className="font-bold">Single Text</SelectItem>
                              <SelectItem value="email" className="font-bold">Email</SelectItem>
                              <SelectItem value="phone" className="font-bold">Phone</SelectItem>
                              <SelectItem value="textarea" className="font-bold">Multiline Text</SelectItem>
                              <SelectItem value="dropdown" className="font-bold">Dropdown</SelectItem>
                              <SelectItem value="radio" className="font-bold">Radio Button</SelectItem>
                              <SelectItem value="checkbox" className="font-bold">Checkbox</SelectItem>
                              <SelectItem value="date" className="font-bold">Date Picker</SelectItem>
                              <SelectItem value="date_time" className="font-bold">Date & Time</SelectItem>
                              <SelectItem value="number" className="font-bold">Number</SelectItem>
                              <SelectItem value="file_upload" className="font-bold">File Upload</SelectItem>
                              <SelectItem value="status" className="font-bold text-mongodb-green">Status Pills</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Options Builder for Choice-based types */}
                      {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox' || field.type === 'status') && (
                        <div className="space-y-3 bg-mongodb-light-slate/10 p-4 rounded-xl border border-mongodb-border-slate/20">
                          <Label className="text-[10px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Options {field.type === 'status' && "(with colors)"}</Label>
                          <div className="space-y-2">
                            {(field.options || (field.type === 'status'
                              ? [{ label: 'Active', color: '#00ED64' }, { label: 'Pending', color: '#F9D800' }, { label: 'Inactive', color: '#6B8F8F' }]
                              : ['Option 1', 'Option 2'])).map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  {field.type === 'status' ? (
                                    <>
                                      <div
                                        className="w-8 h-10 rounded-lg border border-mongodb-border-slate/40 shrink-0 relative overflow-hidden"
                                        style={{ backgroundColor: typeof opt === 'object' ? opt.color : '#cccccc' }}
                                      >
                                        <input
                                          type="color"
                                          className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                          value={typeof opt === 'object' ? opt.color : '#cccccc'}
                                          onChange={(e) => {
                                            const newOptions = [...(field.options || [])];
                                            newOptions[optIndex] = { ...newOptions[optIndex], color: e.target.value };
                                            updateField(index, { options: newOptions });
                                          }}
                                        />
                                      </div>
                                      <Input
                                        value={typeof opt === 'object' ? opt.label : opt}
                                        onChange={(e) => {
                                          const newOptions = [...(field.options || [])];
                                          newOptions[optIndex] = { ...newOptions[optIndex], label: e.target.value };
                                          updateField(index, { options: newOptions });
                                        }}
                                        placeholder={`Status Label`}
                                        className="h-10 rounded-lg border-mongodb-border-slate/40 text-sm font-medium"
                                      />
                                    </>
                                  ) : (
                                    <Input
                                      value={opt}
                                      onChange={(e) => {
                                        const newOptions = [...(field.options || [])];
                                        newOptions[optIndex] = e.target.value;
                                        updateField(index, { options: newOptions });
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="h-10 rounded-lg border-mongodb-border-slate/40 text-sm font-medium"
                                    />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-mongodb-error/60 hover:text-mongodb-error hover:bg-mongodb-error/5 shrink-0"
                                    onClick={() => {
                                      const current = field.options || [];
                                      const newOptions = current.filter((_, i) => i !== optIndex);
                                      updateField(index, { options: newOptions });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-mongodb-green-dark font-bold text-xs hover:bg-mongodb-green/5 gap-2 px-2"
                            onClick={() => {
                              const currentOptions = field.options || (field.type === 'status'
                                ? [{ label: 'Active', color: '#00ED64' }, { label: 'Pending', color: '#F9D800' }, { label: 'Inactive', color: '#6B8F8F' }]
                                : ['Option 1', 'Option 2']);
                              const newOpt = field.type === 'status' ? { label: `New Status`, color: '#6B8F8F' } : `Option ${currentOptions.length + 1}`;
                              updateField(index, { options: [...currentOptions, newOpt] });
                            }}
                          >
                            <Plus className="h-3 w-3" /> Add Option
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-3 bg-mongodb-light-slate/20 p-4 rounded-xl border border-mongodb-border-slate/20 transition-colors">
                        <Switch
                          id={`req-${index}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(index, { required: checked })}
                          className="data-[state=checked]:bg-mongodb-green"
                        />
                        <Label htmlFor={`req-${index}`} className="text-xs font-bold text-mongodb-deep-slate cursor-pointer select-none">Required field</Label>
                      </div>

                      {/* Metadata Settings */}
                      {field.type === 'number' && (
                        <div className="grid grid-cols-3 gap-4 bg-mongodb-light-slate/10 p-4 rounded-xl border border-mongodb-border-slate/20">
                          <div className="grid gap-2">
                            <Label className="text-[9px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Min</Label>
                            <Input
                              type="number"
                              value={field.min ?? ""}
                              onChange={(e) => updateField(index, { min: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="h-9 rounded-lg border-mongodb-border-slate/40 text-xs font-bold"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[9px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Max</Label>
                            <Input
                              type="number"
                              value={field.max ?? ""}
                              onChange={(e) => updateField(index, { max: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="h-9 rounded-lg border-mongodb-border-slate/40 text-xs font-bold"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[9px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Step</Label>
                            <Input
                              type="number"
                              value={field.step ?? ""}
                              onChange={(e) => updateField(index, { step: e.target.value ? parseFloat(e.target.value) : undefined })}
                              className="h-9 rounded-lg border-mongodb-border-slate/40 text-xs font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {field.type === 'file_upload' && (
                        <div className="grid grid-cols-2 gap-4 bg-mongodb-light-slate/10 p-4 rounded-xl border border-mongodb-border-slate/20">
                          <div className="grid gap-2">
                            <Label className="text-[9px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Accepted Types</Label>
                            <Input
                              value={field.accept ?? ".pdf,.jpg,.png"}
                              onChange={(e) => updateField(index, { accept: e.target.value })}
                              placeholder=".pdf,.jpg"
                              className="h-9 rounded-lg border-mongodb-border-slate/40 text-xs font-bold"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[9px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Max Size (MB)</Label>
                            <Input
                              type="number"
                              value={field.maxSize ?? ""}
                              onChange={(e) => updateField(index, { maxSize: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="h-9 rounded-lg border-mongodb-border-slate/40 text-xs font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Deployment Bundle */}
        {isEditing && (
          <Card className="border-mongodb-border-slate/100 shadow-xl shadow-mongodb-deep-slate/10 overflow-hidden rounded-2xl bg-mongodb-deep-slate text-white mt-12 transition-all">
            <CardHeader className="bg-white/5 border-b border-white/5 py-4 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CodeIcon className="w-4 h-4 text-mongodb-green" />
                <h3 className="text-xs font-black uppercase tracking-widest text-mongodb-green">Deployment Bundle</h3>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                status === 'active' ? "bg-mongodb-green/20 text-mongodb-green" : "bg-white/10 text-white/40"
              )}>
                <Circle className={cn("w-2 h-2 fill-current", status === 'active' && "animate-pulse")} />
                {status === 'active' ? "Live" : "Not Live"}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {status !== 'active' ? (
                <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/80">Interface Locked</p>
                    <p className="text-[10px] text-white/40 font-medium max-w-[200px] mx-auto">Publish your form by setting status to <span className="text-mongodb-green">Active</span> to generate deployment codes.</p>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="link" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl h-11 mb-6">
                    <TabsTrigger value="link" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-mongodb-green data-[state=active]:text-mongodb-deep-slate">Direct Link</TabsTrigger>
                    <TabsTrigger value="embed" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-mongodb-green data-[state=active]:text-mongodb-deep-slate">iFrame Embed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="link" className="space-y-4">
                    <p className="text-xs text-white/50 font-medium leading-relaxed">Share this direct URL with your clients or include it in marketing campaigns.</p>
                    <div className="flex gap-2 bg-black/20 p-2 rounded-xl border border-white/5 group relative">
                      <Input
                        readOnly
                        value={embedUrl}
                        className="bg-transparent border-0 text-white font-mono text-xs focus:ring-0 h-10"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyToClipboard(embedUrl, "Public URL")}
                          className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border-0 font-bold gap-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(embedUrl, '_blank')}
                          className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border-0 font-bold gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="embed" className="space-y-4">
                    <p className="text-xs text-white/50 font-medium leading-relaxed">Paste this code into your website's HTML to display the form seamlessly.</p>
                    <div className="space-y-3">
                      <div className="relative group bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                        <pre className="p-4 text-[10px] font-mono text-mongodb-green/90 overflow-x-auto whitespace-pre custom-scrollbar">
                          {embedCode}
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 text-white/30 hover:text-white hover:bg-white/10"
                          onClick={() => copyToClipboard(embedCode, "Embed code")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Preview Panel (Right) */}
      <div className="w-full lg:w-1/2 bg-mongodb-light-slate/40 flex flex-col items-center justify-start relative overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 z-10 w-full flex justify-center pt-8 pb-4 px-8 bg-mongodb-light-slate/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-mongodb-green-dark bg-white px-3 py-1.5 rounded-full border border-mongodb-border-slate/40 shadow-sm leading-none">
            <Activity className="w-3.5 h-3.5 fill-mongodb-green animate-pulse" />
            Live Render Environment
          </div>
        </div>

        <div className="w-full flex flex-col items-center px-8 md:px-12 lg:px-16 pb-16">
          <motion.div
            layout
            className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-10 border border-mongodb-border-slate/40 relative overflow-visible"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-[2.5rem] bg-mongodb-green" style={{ backgroundColor: primaryColor }} />

            {status !== 'active' && (
              <div className={cn(
                "absolute top-1.5 left-0 w-full py-2 px-4 text-center text-[10px] font-black uppercase tracking-widest text-white z-10",
                status === 'draft' ? "bg-amber-500/90" : "bg-red-500/90"
              )}>
                <Activity className="w-3 h-3 inline-block mr-1.5 -mt-0.5 animate-pulse" />
                Interface Internal: {status} State
              </div>
            )}

            <h2 className={cn(
              "text-3xl font-black mb-10 text-center text-mongodb-deep-slate tracking-tight leading-tight",
              status !== 'active' && "mt-6"
            )}>
              {headingText}
            </h2>

            <div className="space-y-6">
              {fields.map((field, i) => (
                <div key={i} className="space-y-2">
                  <Label className="text-[11px] font-black text-mongodb-deep-slate/60 uppercase tracking-widest px-1">
                    {field.label} {field.required && <span className="text-mongodb-error">*</span>}
                  </Label>

                  {(() => {
                    const placeholder = field.type === 'email' ? 'Enter email address...' :
                      field.type === 'phone' ? 'Enter phone number...' :
                        `Enter ${field.label.toLowerCase()}...`;

                    const inputStyles = {
                      '--tw-ring-color': `${primaryColor}20`,
                      border: `1px solid ${primaryColor}40`
                    } as any;

                    switch (field.type) {
                      case 'textarea':
                        return (
                          <div className="space-y-1.5">
                            <Textarea
                              placeholder={`Type your ${field.label.toLowerCase()}...`}
                              value={previewResponses[field.key] || ""}
                              onChange={(e) => {
                                setPreviewResponses({ ...previewResponses, [field.key]: e.target.value });
                                if (errors[field.key]) validateField(field, e.target.value);
                              }}
                              onBlur={(e) => validateField(field, e.target.value)}
                              className={cn(
                                "min-h-[100px] rounded-2xl border-mongodb-border-slate/60 bg-white px-4 py-3 text-sm font-medium transition-all focus:ring-4 outline-none",
                                errors[field.key] && "border-mongodb-error focus:ring-mongodb-error/10"
                              )}
                              style={inputStyles}
                            />
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'dropdown':
                        const dropdownOptions = (field.options || []).filter(opt => String(opt).trim() !== "");
                        return (
                          <div className="space-y-1.5">
                            <Select
                              value={previewResponses[field.key]}
                              onValueChange={(val) => {
                                setPreviewResponses({ ...previewResponses, [field.key]: val });
                                if (errors[field.key]) {
                                  const newErrors = { ...errors };
                                  delete newErrors[field.key];
                                  setErrors(newErrors);
                                }
                              }}
                            >
                              <SelectTrigger className="h-12 rounded-2xl border-mongodb-border-slate/60 font-medium bg-white" style={inputStyles}>
                                <SelectValue placeholder={dropdownOptions.length > 0 ? "Select an option..." : "No options added yet"} />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl shadow-xl border-mongodb-border-slate/100">
                                {dropdownOptions.map((opt, idx) => (
                                  <SelectItem key={idx} value={String(opt)} className="font-medium py-3">{String(opt)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'radio':
                        const radioOptions = (field.options || []).filter(opt => String(opt).trim() !== "");
                        if (radioOptions.length === 0) {
                          return <p className="text-[10px] font-bold text-mongodb-slate-text/40 italic px-2">No options added yet</p>;
                        }
                        return (
                          <div className="space-y-1.5">
                            <RadioGroup
                              value={previewResponses[field.key]}
                              onValueChange={(val) => {
                                setPreviewResponses({ ...previewResponses, [field.key]: val });
                                validateField(field, val);
                              }}
                              className="grid gap-3 pt-1"
                            >
                              {radioOptions.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-mongodb-light-slate/20 p-3 rounded-xl border border-mongodb-border-slate/20 transition-all hover:bg-white cursor-pointer">
                                  <RadioGroupItem value={String(opt)} id={`preview-${i}-${idx}`} />
                                  <Label htmlFor={`preview-${i}-${idx}`} className="text-xs font-bold text-mongodb-deep-slate cursor-pointer flex-1">{String(opt)}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'checkbox':
                        const checkboxOptions = (field.options || []).filter(opt => String(opt).trim() !== "");
                        if (checkboxOptions.length === 0) {
                          return <p className="text-[10px] font-bold text-mongodb-slate-text/40 italic px-2">No options added yet</p>;
                        }
                        return (
                          <div className="space-y-1.5">
                            <div className="grid gap-3 pt-1">
                              {checkboxOptions.map((opt, idx) => {
                                const current = previewResponses[field.key] || [];
                                const isChecked = current.includes(String(opt));
                                return (
                                  <div key={idx} className="flex items-center gap-3 bg-mongodb-light-slate/20 p-3 rounded-xl border border-mongodb-border-slate/20 transition-all hover:bg-white cursor-pointer">
                                    <Checkbox
                                      id={`preview-cb-${i}-${idx}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...current, String(opt)]
                                          : current.filter((v: string) => v !== String(opt));
                                        setPreviewResponses({ ...previewResponses, [field.key]: updated });
                                        validateField(field, updated);
                                      }}
                                    />
                                    <Label htmlFor={`preview-cb-${i}-${idx}`} className="text-xs font-bold text-mongodb-deep-slate cursor-pointer flex-1">{String(opt)}</Label>
                                  </div>
                                );
                              })}
                            </div>
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
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
                                    "w-full h-12 justify-start text-left font-medium rounded-2xl border-mongodb-border-slate/60 bg-white px-4 text-sm",
                                    !previewResponses[field.key] && "text-mongodb-slate-text/40",
                                    errors[field.key] && "border-mongodb-error"
                                  )}
                                  style={inputStyles}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                  <span>
                                    {previewResponses[field.key]
                                      ? format(new Date(previewResponses[field.key]), field.type === 'date_time' ? "PPP p" : "PPP")
                                      : `Select ${field.type === 'date_time' ? 'date & time' : 'date'}...`}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl" align="start">
                                <Calendar
                                  mode="single"
                                  selected={previewResponses[field.key] ? new Date(previewResponses[field.key]) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      const baseDate = previewResponses[field.key] ? new Date(previewResponses[field.key]) : new Date();
                                      date.setHours(baseDate.getHours(), baseDate.getMinutes());
                                      const iso = date.toISOString();
                                      setPreviewResponses({ ...previewResponses, [field.key]: iso });
                                      validateField(field, iso);
                                    }
                                  }}
                                  initialFocus
                                />
                                {field.type === 'date_time' && (
                                  <div className="p-4 border-t border-mongodb-border-slate/10 flex items-center justify-between bg-mongodb-light-slate/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text/60">Select Time</span>
                                    <input
                                      type="time"
                                      className="text-xs font-bold text-mongodb-deep-slate bg-mongodb-light-slate/20 px-2 py-1 rounded-md outline-none focus:ring-2 focus:ring-mongodb-green/20"
                                      onChange={(e) => {
                                        const date = previewResponses[field.key] ? new Date(previewResponses[field.key]) : new Date();
                                        const [hours, minutes] = e.target.value.split(':');
                                        date.setHours(parseInt(hours), parseInt(minutes));
                                        const iso = date.toISOString();
                                        setPreviewResponses({ ...previewResponses, [field.key]: iso });
                                        validateField(field, iso);
                                      }}
                                    />
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'number':
                        return (
                          <div className="space-y-1.5">
                            <Input
                              type="number"
                              name={field.key}
                              placeholder={placeholder}
                              value={previewResponses[field.key] || ""}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              onKeyDown={handleNumberKeyDown}
                              onPaste={handlePhonePaste}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPreviewResponses({ ...previewResponses, [field.key]: val });
                                if (errors[field.key]) validateField(field, val);
                              }}
                              onBlur={(e) => validateField(field, e.target.value)}
                              className={cn(
                                "h-12 rounded-2xl border-mongodb-border-slate/60 font-medium transition-all focus:ring-4 bg-white",
                                errors[field.key] && "border-mongodb-error focus:ring-mongodb-error/10"
                              )}
                              style={inputStyles}
                            />
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'file_upload':
                        return (
                          <div className="space-y-1.5">
                            <div className="relative">
                              <input
                                type="file"
                                id={`preview-file-${i}`}
                                className="hidden"
                                accept={field.accept || ".pdf,.jpg,.png,.docx"}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (field.maxSize && file.size > field.maxSize * 1024 * 1024) {
                                      toast({ title: "File too large", description: `Maximum size is ${field.maxSize}MB`, variant: "destructive" });
                                      return;
                                    }
                                    setPreviewResponses({ ...previewResponses, [field.key]: file.name });
                                    validateField(field, file.name);
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`preview-file-${i}`}
                                className={cn(
                                  "border-2 border-dashed border-mongodb-border-slate/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-mongodb-light-slate/10 group transition-colors cursor-pointer hover:bg-mongodb-light-slate/20",
                                  errors[field.key] && "border-mongodb-error bg-mongodb-error/5"
                                )}
                                style={{ borderColor: errors[field.key] ? undefined : `${primaryColor}30` }}
                              >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-mongodb-border-slate/20 transition-transform group-hover:scale-110">
                                  <FileUp className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: errors[field.key] ? '#EF4444' : primaryColor }} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-mongodb-slate-text/60 text-center px-4">
                                  {previewResponses[field.key] || "Click to upload or drag & drop"}
                                </p>
                              </Label>
                            </div>
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'status':
                        const statusOptions = (field.options || [
                          { label: 'Active', color: '#00ED64' },
                          { label: 'Pending', color: '#F9D800' },
                          { label: 'Inactive', color: '#6B8F8F' }
                        ]);
                        return (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-2 pt-1">
                              {statusOptions.map((opt: any, idx) => {
                                const label = typeof opt === 'object' ? opt.label : opt;
                                const color = typeof opt === 'object' ? opt.color : '#cccccc';
                                const isSelected = previewResponses[field.key] === label;

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setPreviewResponses({ ...previewResponses, [field.key]: label });
                                      validateField(field, label);
                                    }}
                                    className={cn(
                                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                                      isSelected
                                        ? "text-white shadow-lg scale-105"
                                        : "bg-transparent hover:bg-mongodb-light-slate/10"
                                    )}
                                    style={{
                                      backgroundColor: isSelected ? color : 'transparent',
                                      borderColor: color,
                                      color: isSelected ? 'white' : color,
                                      boxShadow: isSelected ? `0 4px 12px ${color}30` : 'none'
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      case 'phone':
                        return (
                          <div className="space-y-1.5">
                            <PhoneInputWithCountry
                              value={previewResponses[field.key] || ""}
                              onChange={(val) => {
                                setPreviewResponses({ ...previewResponses, [field.key]: val });
                                if (errors[field.key]) validateField(field, val);
                              }}
                              error={!!errors[field.key]}
                            />
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );

                      default:
                        return (
                          <div className="space-y-1.5">
                            <Input
                              type={field.type}
                              name={field.key}
                              placeholder={placeholder}
                              value={previewResponses[field.key] || ""}
                              onKeyDown={field.type === 'phone' ? handlePhoneKeyDown : undefined}
                              onPaste={field.type === 'phone' ? handlePhonePaste : undefined}
                              onChange={(e) => {
                                setPreviewResponses({ ...previewResponses, [field.key]: e.target.value });
                                if (errors[field.key]) validateField(field, e.target.value);
                              }}
                              onBlur={(e) => validateField(field, e.target.value)}
                              className={cn(
                                "h-12 rounded-2xl border-mongodb-border-slate/60 font-medium transition-all focus:ring-4 bg-white",
                                errors[field.key] && "border-mongodb-error focus:ring-mongodb-error/10"
                              )}
                              style={inputStyles}
                            />
                            {errors[field.key] && (
                              <p className="text-[10px] font-bold text-mongodb-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors[field.key]}
                              </p>
                            )}
                          </div>
                        );
                    }
                  })()}
                </div>
              ))}

              <Button
                onClick={handlePreviewSubmit}
                className="w-full h-14 mt-6 rounded-2xl text-white font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px -10px ${primaryColor}30` }}
              >
                {ctaText || "Send Message"}
              </Button>
            </div>

            <div className="mt-10 pt-8 border-t border-mongodb-border-slate/20 text-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-mongodb-slate-text">
                <div className="w-4 h-4 bg-mongodb-green/10 rounded-md flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-mongodb-green-dark" />
                </div>
                Powered by Lead Catcher AI
              </div>
            </div>
          </motion.div>

          <p className="mt-10 text-[10px] font-black text-mongodb-slate-text/40 uppercase tracking-[0.3em]">Client-Side Interface Preview</p>
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && publishedForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-mongodb-deep-slate/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-lg bg-mongodb-deep-slate border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 md:p-10 space-y-8">
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                      className="mx-auto w-16 h-16 bg-mongodb-green/10 rounded-2xl flex items-center justify-center mb-4"
                    >
                      <Check className="w-8 h-8 text-mongodb-green" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white tracking-tight">🎉 Form Published!</h3>
                    <p className="text-white/50 text-sm font-medium">Your Lead Catcher interface is live and ready to collect responses.</p>
                  </div>

                  <div className="space-y-6">
                    <Tabs defaultValue="link" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-full h-12 p-1 mb-6">
                        <TabsTrigger value="link" className="text-[10px] font-black uppercase tracking-widest rounded-full data-[state=active]:bg-mongodb-green data-[state=active]:text-mongodb-deep-slate py-3 transition-all duration-200">Direct Link</TabsTrigger>
                        <TabsTrigger value="embed" className="text-[10px] font-black uppercase tracking-widest rounded-full data-[state=active]:bg-mongodb-green data-[state=active]:text-mongodb-deep-slate py-3 transition-all duration-200 hover:bg-white/5">iFrame Embed</TabsTrigger>
                      </TabsList>

                      <TabsContent value="link" className="space-y-4">
                        <div className="flex gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl group transition-all hover:border-white/20">
                          <Input
                            readOnly
                            value={`${appUrl}/f/${publishedForm.formId}`}
                            className="bg-transparent border-0 text-white font-mono text-xs focus:ring-0 flex-1 px-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className={cn(
                                "min-w-20 bg-mongodb-green text-mongodb-deep-slate font-black transition-all duration-200",
                                copyFeedback === 'link' ? "scale-95 opacity-90" : "hover:scale-105"
                              )}
                              onClick={() => copyToClipboard(`${appUrl}/f/${publishedForm.formId}`, "link")}
                            >
                              {copyFeedback === 'link' ? "Copied!" : "Copy"}
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/10 text-white font-black hover:bg-white/20 transition-all px-3"
                                    onClick={() => window.open(`${appUrl}/f/${publishedForm.formId}`, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-mongodb-deep-slate text-white border-white/10 font-bold">
                                  Open in new tab
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="embed" className="space-y-4">
                        <div className="relative group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                          <pre className="p-4 text-[10px] font-mono text-mongodb-green/90 overflow-x-auto whitespace-nowrap custom-scrollbar">
                            {`<iframe src="${appUrl}/f/${publishedForm.formId}" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`}
                          </pre>
                          <Button
                            size="sm"
                            className={cn(
                              "absolute top-2 right-2 min-w-20 bg-mongodb-green text-mongodb-deep-slate font-black transition-all duration-200",
                              copyFeedback === 'embed' ? "scale-95 opacity-90" : "hover:scale-105"
                            )}
                            onClick={() => copyToClipboard(`<iframe src="${appUrl}/f/${publishedForm.formId}" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`, "embed")}
                          >
                            {copyFeedback === 'embed' ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <a
                      href={`/f/${publishedForm.formId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-mongodb-green text-mongodb-deep-slate font-black text-sm hover:bg-[#00C855] active:scale-[0.98] transition-all shadow-xl shadow-mongodb-green/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Form in New Tab
                    </a>
                    <Button
                      variant="ghost"
                      className="text-white/40 hover:text-mongodb-green hover:underline hover:bg-transparent font-bold transition-all"
                      onClick={() => {
                        setShowSuccessModal(false);
                        setLocation("/widgets");
                      }}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Type Warning Modal */}
        <Dialog open={showTypeWarning} onOpenChange={setShowTypeWarning}>
          <DialogContent className="rounded-[2rem] border-mongodb-border-slate/40 shadow-2xl p-0 overflow-hidden max-w-sm">
            <div className="bg-mongodb-deep-slate p-8 text-white relative text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-amber-500" />
              </div>
              <DialogTitle className="text-xl font-black mb-2 text-white">Change Input Type?</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                Changing the input type of a protected field (<span className="text-amber-500 font-bold">{typeChangeIndex !== null && fields[typeChangeIndex]?.label}</span>) may affect how data is collected and validated.
              </DialogDescription>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <Button
                onClick={confirmTypeChange}
                className="w-full h-12 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all"
              >
                Confirm Change
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTypeWarning(false);
                  setTypeChangeIndex(null);
                  setPendingType(null);
                }}
                className="text-xs font-bold text-mongodb-slate-text"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <style dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 237, 100, 0.2);
        }
      `}} />
      </div>
    </div>
  );
}
