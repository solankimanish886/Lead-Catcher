import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useWidget, useCreateWidget, useUpdateWidget } from "@/hooks/use-widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft, Copy, Sliders, Layout, Settings, Code as CodeIcon, Check, Activity, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WidgetField } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [publishedForm, setPublishedForm] = useState<{ formId: string } | null>(null);

  const [name, setName] = useState("");
  const [headingText, setHeadingText] = useState("Contact Us");
  const [primaryColor, setPrimaryColor] = useState("#00ED64"); // Default brand green
  const [fields, setFields] = useState<WidgetField[]>([
    { key: "name", label: "Full Name", type: "text", required: true },
    { key: "email", label: "Email Address", type: "email", required: true },
  ]);

  useEffect(() => {
    if (existingWidget && isEditing) {
      setName(existingWidget.name);
      setHeadingText(existingWidget.headingText || "");
      setPrimaryColor(existingWidget.primaryColor || "#00ED64");
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

  const handleSave = () => {
    if (!name) return toast({ title: "Name required", variant: "destructive" });

    const data = {
      name,
      headingText,
      primaryColor,
      fields,
    };

    if (isEditing && widgetId) {
      updateWidget({ id: widgetId, data }, {
        onSuccess: (updated) => {
          setPublishedForm(updated);
          setShowSuccessModal(true);
        }
      });
    } else {
      createWidget(data, {
        onSuccess: (created) => {
          setPublishedForm(created);
          setShowSuccessModal(true);
        }
      });
    }
  };

  const embedCode = isEditing
    ? `<iframe src="${window.location.origin}/embed/${widgetId}" width="100%" height="600" frameborder="0"></iframe>`
    : "Save widget to generate embed code";

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Copied!", description: "Embed code copied to clipboard." });
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
                            onValueChange={(val: any) => updateField(index, { type: val })}
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
                              <SelectItem value="number" className="font-bold">Number</SelectItem>
                              <SelectItem value="file_upload" className="font-bold">File Upload</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Options Builder for Choice-based types */}
                      {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                        <div className="space-y-3 bg-mongodb-light-slate/10 p-4 rounded-xl border border-mongodb-border-slate/20">
                          <Label className="text-[10px] font-black text-mongodb-deep-slate uppercase tracking-wider px-1">Options</Label>
                          <div className="space-y-2">
                            {(field.options || ['Option 1', 'Option 2']).map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    const newOptions = [...(field.options || ['Option 1', 'Option 2'])];
                                    newOptions[optIndex] = e.target.value;
                                    updateField(index, { options: newOptions });
                                  }}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="h-10 rounded-lg border-mongodb-border-slate/40 text-sm font-medium"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-mongodb-error/60 hover:text-mongodb-error hover:bg-mongodb-error/5 shrink-0"
                                  onClick={() => {
                                    const newOptions = (field.options || ['Option 1', 'Option 2']).filter((_, i) => i !== optIndex);
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
                              const currentOptions = field.options || ['Option 1', 'Option 2'];
                              updateField(index, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Deployment Bundle */}
        {isEditing && (
          <Card className="border-mongodb-border-slate/100 shadow-xl shadow-mongodb-deep-slate/10 overflow-hidden rounded-2xl bg-mongodb-deep-slate text-white mt-12">
            <CardHeader className="bg-white/5 border-b border-white/5 py-4 px-6">
              <div className="flex items-center gap-2">
                <CodeIcon className="w-4 h-4 text-mongodb-green" />
                <h3 className="text-xs font-black uppercase tracking-widest text-mongodb-green">Deployment Bundle</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-white/50 font-medium leading-relaxed">Embed this specialized interface on any domain to start capturing leads instantly.</p>
              <div className="flex flex-col md:flex-row gap-3 bg-black/20 p-4 rounded-xl border border-white/5 group relative">
                <code className="flex-1 block text-[10px] font-mono break-all text-mongodb-green/90 leading-relaxed selection:bg-mongodb-green/20">
                  {embedCode}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyEmbed}
                  className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border-0 font-bold gap-2 self-end md:self-auto"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Preview Panel (Right) */}
      <div className="w-full lg:w-1/2 bg-mongodb-light-slate/40 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center relative overflow-y-auto">
        <div className="lg:absolute lg:top-8 lg:left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-mongodb-green-dark bg-white px-3 py-1.5 rounded-full border border-mongodb-border-slate/40 shadow-sm leading-none mb-8 lg:mb-0">
          <Activity className="w-3.5 h-3.5 fill-mongodb-green animate-pulse" />
          Live Render Environment
        </div>

        <motion.div
          layout
          className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-10 border border-mongodb-border-slate/40 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-mongodb-green" style={{ backgroundColor: primaryColor }} />

          <h2 className="text-3xl font-black mb-10 text-center text-mongodb-deep-slate tracking-tight leading-tight">
            {headingText}
          </h2>

          <div className="space-y-6">
            {fields.map((field, i) => (
              <div key={i} className="space-y-2">
                <Label className="text-[11px] font-black text-mongodb-deep-slate/60 uppercase tracking-widest px-1">
                  {field.label} {field.required && <span className="text-mongodb-error">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={`Type ${field.label.toLowerCase()}...`}
                    className="flex min-h-[100px] w-full rounded-2xl border border-mongodb-border-slate/60 bg-white px-4 py-3 text-sm font-medium transition-all focus:ring-4 outline-none"
                    style={{ '--tw-ring-color': `${primaryColor}20`, borderColor: `${primaryColor}40` } as any}
                  />
                ) : field.type === 'dropdown' ? (
                  <Select disabled>
                    <SelectTrigger className="h-12 rounded-2xl border-mongodb-border-slate/60 font-medium">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent><SelectItem value="opt1">Option 1</SelectItem></SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="h-12 rounded-2xl border-mongodb-border-slate/60 font-medium transition-all focus:ring-4"
                    style={{ '--tw-ring-color': `${primaryColor}20`, border: `1px solid ${primaryColor}40` } as any}
                  />
                )}
              </div>
            ))}

            <Button
              className="w-full h-14 mt-6 rounded-2xl text-white font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px -10px ${primaryColor}30` }}
            >
              Send Message
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-mongodb-deep-slate border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 bg-mongodb-green/10 rounded-2xl flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-mongodb-green" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">🎉 Form Published!</h3>
                  <p className="text-white/50 text-sm font-medium">Your Lead Catcher interface is live and ready to collect responses.</p>
                </div>

                <div className="space-y-6">
                  {/* Public URL */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-mongodb-green uppercase tracking-[0.2em] px-1">Form URL</Label>
                    <div className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl group transition-all hover:border-white/20">
                      <Input
                        readOnly
                        value={`${window.location.origin}/f/${publishedForm.formId}`}
                        className="bg-transparent border-0 text-white font-mono text-xs focus:ring-0"
                      />
                      <Button
                        size="sm"
                        className="bg-mongodb-green text-mongodb-deep-slate font-black hover:scale-105 transition-transform"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/f/${publishedForm.formId}`);
                          toast({ title: "Copied!", description: "Public URL copied to clipboard." });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Embed Code */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-mongodb-green uppercase tracking-[0.2em] px-1">Embed Code</Label>
                    <div className="relative group p-2 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20">
                      <textarea
                        readOnly
                        rows={3}
                        value={`<iframe src="${window.location.origin}/f/${publishedForm.formId}" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`}
                        className="w-full bg-transparent border-0 text-white/70 font-mono text-[10px] focus:ring-0 p-3 resize-none custom-scrollbar"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 text-white/30 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          navigator.clipboard.writeText(`<iframe src="${window.location.origin}/f/${publishedForm.formId}" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`);
                          toast({ title: "Copied!", description: "Embed code copied to clipboard." });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <a
                    href={`/f/${publishedForm.formId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-mongodb-green text-mongodb-deep-slate font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-mongodb-green/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Form in New Tab
                  </a>
                  <Button
                    variant="ghost"
                    className="text-white/40 hover:text-white hover:bg-white/5 font-bold"
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
  );
}
