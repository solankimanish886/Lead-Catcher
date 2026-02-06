import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useWidget, useCreateWidget, useUpdateWidget } from "@/hooks/use-widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WidgetField } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function WidgetBuilder() {
  const [match, params] = useRoute("/widgets/:id/edit");
  const isEditing = !!match;
  const widgetId = params?.id ? parseInt(params.id) : null;
  
  const { data: existingWidget, isLoading } = useWidget(widgetId || 0);
  const { mutate: createWidget } = useCreateWidget();
  const { mutate: updateWidget } = useUpdateWidget();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [headingText, setHeadingText] = useState("Contact Us");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [fields, setFields] = useState<WidgetField[]>([
    { key: "name", label: "Full Name", type: "text", required: true },
    { key: "email", label: "Email Address", type: "email", required: true },
  ]);

  useEffect(() => {
    if (existingWidget && isEditing) {
      setName(existingWidget.name);
      setHeadingText(existingWidget.headingText || "");
      setPrimaryColor(existingWidget.primaryColor || "#3b82f6");
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
        onSuccess: () => setLocation("/widgets")
      });
    } else {
      createWidget(data, {
        onSuccess: () => setLocation("/widgets")
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
    <div className="flex h-screen overflow-hidden">
      {/* Configuration Panel */}
      <div className="w-1/2 border-r bg-background overflow-y-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/widgets")}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{isEditing ? "Edit Widget" : "New Widget"}</h1>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Widget Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Contact Form" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Heading Text</Label>
              <Input value={headingText} onChange={(e) => setHeadingText(e.target.value)} placeholder="Form Header" />
            </div>
            <div className="grid gap-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="w-12 h-10 p-1"
                />
                <Input 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Form Fields</h2>
            <Button variant="outline" size="sm" onClick={addField}>
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={index} className="relative group">
                <CardContent className="pt-6 grid gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={() => removeField(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Label</Label>
                            <Input 
                                value={field.label} 
                                onChange={(e) => updateField(index, { label: e.target.value })} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select 
                                value={field.type} 
                                onValueChange={(val: any) => updateField(index, { type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="textarea">Long Text</SelectItem>
                                    <SelectItem value="dropdown">Dropdown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Switch 
                            id={`req-${index}`}
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(index, { required: checked })}
                        />
                        <Label htmlFor={`req-${index}`}>Required</Label>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isEditing && (
            <div className="space-y-2 pt-6 border-t">
                <Label>Embed Code</Label>
                <div className="flex gap-2">
                    <code className="flex-1 block p-3 bg-muted rounded-md text-xs font-mono break-all">
                        {embedCode}
                    </code>
                    <Button size="icon" variant="outline" onClick={copyEmbed}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}

        <div className="pt-4 flex justify-end">
            <Button size="lg" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save Widget
            </Button>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="w-1/2 bg-muted/30 p-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8 border" style={{ borderColor: primaryColor }}>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: primaryColor }}>{headingText}</h2>
            <div className="space-y-4">
                {fields.map((field, i) => (
                    <div key={i} className="space-y-1">
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        ) : field.type === 'dropdown' ? (
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent><SelectItem value="opt1">Option 1</SelectItem></SelectContent>
                            </Select>
                        ) : (
                            <Input type={field.type} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                        )}
                    </div>
                ))}
                <Button className="w-full mt-4" style={{ backgroundColor: primaryColor }}>Submit</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
