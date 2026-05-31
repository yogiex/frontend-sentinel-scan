/**
 * SentinelScan New Scan Page
 * Path: src/pages/Dashboard/Scans/NewScan.tsx
 *
 * Comprehensive scan configuration with:
 * - Credentialed scanning (SSH key, username/password, API tokens)
 * - Schedule options (immediate or scheduled)
 * - Advanced stealth options
 * - Target validation
 * - frontend-design skill compliant
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { scanStore } from "@/lib/scan-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Shield, Scan, Settings, Key, Calendar, Clock, Cookie, Timer, Shuffle, FileText, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

const scanTypes = [
  { value: "basic", label: "Basic Network Scan", desc: "Standard vulnerability scan", icon: "🔍" },
  { value: "advanced", label: "Advanced Scan", desc: "Custom plugin selection", icon: "⚙️" },
  { value: "web", label: "Web Application Scan", desc: "OWASP Top10, SQLi, XSS", icon: "🌐" },
  { value: "credentialed", label: "Credentialed Patch Audit", desc: "Deep scan with credentials", icon: "🔐" },
  { value: "compliance", label: "Compliance Audit", desc: "CIS benchmarks, PCI-DSS", icon: "📋" },
  { value: "discovery", label: "Host Discovery", desc: "Network mapping, port scanning", icon: "📡" },
  { value: "ai-agentic", label: "AI-Agentic Anti-Pattern", desc: "Adaptive AI breaks traditional scan patterns", icon: "🤖" },
];

const scanProfiles = [
  { value: "quick", label: "Quick", desc: "Fast scan (~5 min)", time: "~5 min" },
  { value: "standard", label: "Standard", desc: "Balanced depth/speed", time: "~15 min" },
  { value: "full", label: "Full", desc: "Thorough analysis", time: "~45 min" },
  { value: "custom", label: "Custom", desc: "Manual selection", time: "Variable" },
];

const authTypes = [
  { value: "ssh-key", label: "SSH Key (Recommended)", icon: "🔑" },
  { value: "username-password", label: "Username/Password", icon: "👤" },
  { value: "api-token", label: "API Token", icon: "🎫" },
  { value: "certificate", label: "Client Certificate", icon: "📜" },
];

const userAgentOptions = [
  { value: "random", label: "Random", desc: "Rotate per request", icon: "🎲" },
  { value: "chrome", label: "Chrome", desc: "Latest Chrome", icon: "🌐" },
  { value: "firefox", label: "Firefox", desc: "Latest Firefox", icon: "🦊" },
  { value: "safari", label: "Safari", desc: "macOS Safari", icon: "🧭" },
  { value: "edge", label: "Edge", desc: "Windows Edge", icon: "🔷" },
  { value: "custom", label: "Custom", desc: "Define your own", icon: "✏️" },
];

const newScanSchema = z.object({
  target: z.string().min(1, "Target is required").refine(
    (val) => {
      // Accept IP, CIDR, hostname, URL
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
      const hostnameRegex = /^(?=.{1,253}$)[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?)+\.[a-zA-Z]{2,}$/;
      const urlRegex = /^https?:\/\/.+/;
      return ipRegex.test(val) || hostnameRegex.test(val) || urlRegex.test(val) || val === "localhost";
    },
    { message: "Invalid target format (use IP, CIDR, hostname, or URL)" }
  ),
  scanType: z.string().min(1, "Select scan type"),
  profile: z.string().min(1, "Select profile"),
  schedule: z.enum(["now", "schedule"]).default("now"),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),

  // Credential fields
  useCredentials: z.boolean().default(false),
  authType: z.enum(["ssh-key", "username-password", "api-token", "certificate"]).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  apiToken: z.string().optional(),
  certFile: z.string().optional(),
  keyValuePairs: z.array(z.object({ key: z.string(), value: z.string() })).default([]),

  // Stealth options
  userAgentMode: z.string().default("random"),
  customUserAgent: z.string().optional(),
  enableCookies: z.boolean().default(true),
  humanLikeDelay: z.boolean().default(true),
  delayMin: z.number().min(0).default(1),
  delayMax: z.number().min(1).default(5),
  randomizeOrder: z.boolean().default(true),

  // Additional
  description: z.string().max(500, "Description too long").optional(),

  // AI-Agentic Anti-Pattern fields
  aiAdaptability: z.enum(["conservative", "balanced", "aggressive"]).default("balanced"),
  randomizeAttackOrder: z.boolean().default(true),
  adaptivePayloads: z.boolean().default(true),
  mimicHumanBehavior: z.boolean().default(true),
  showAIReasoning: z.boolean().default(true),
});

type FormValues = z.infer<typeof newScanSchema>;

export function NewScan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("target");

    const form = useForm({
    resolver: zodResolver(newScanSchema),
    defaultValues: {
      target: "",
      scanType: "",
      profile: "",
      schedule: "now",
      scheduledDate: "",
      scheduledTime: "",
      useCredentials: false,
      authType: undefined,
      username: "",
      password: "",
      privateKey: "",
      apiToken: "",
      certFile: "",
      keyValuePairs: [],
      userAgentMode: "random",
      customUserAgent: "",
      enableCookies: true,
      humanLikeDelay: true,
      delayMin: 1,
      delayMax: 5,
      randomizeOrder: true,
      description: "",
      // AI-Agentic Anti-Pattern defaults
      aiAdaptability: "balanced",
      randomizeAttackOrder: true,
      adaptivePayloads: true,
      mimicHumanBehavior: true,
      showAIReasoning: true,
    } as FormValues,
  });

  const watchUseCredentials = form.watch("useCredentials");
  const watchAuthType = form.watch("authType");
  const watchScanType = form.watch("scanType");
  const watchSchedule = form.watch("schedule");

  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const [isRescan, setIsRescan] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    const original = scanStore.getScan(templateId);
    if (!original) return;
    setIsRescan(true);
    form.setValue("target", original.target);
    form.setValue("scanType", original.scanType);
    form.setValue("profile", original.profile);
    form.setValue("schedule", original.config.schedule);
    if (original.config.scheduledDate) form.setValue("scheduledDate", original.config.scheduledDate);
    if (original.config.scheduledTime) form.setValue("scheduledTime", original.config.scheduledTime);
    form.setValue("useCredentials", original.config.credentials);
    if (original.config.authType) form.setValue("authType", original.config.authType as any);
    form.setValue("userAgentMode", original.config.userAgentMode || "random");
    form.setValue("enableCookies", original.config.enableCookies ?? true);
    form.setValue("humanLikeDelay", original.config.humanLikeDelay ?? true);
    form.setValue("description", original.config.description || "");
    if (original.config.aiAdaptability) form.setValue("aiAdaptability", original.config.aiAdaptability);
    if (original.config.randomizeAttackOrder !== undefined) form.setValue("randomizeAttackOrder", original.config.randomizeAttackOrder);
    if (original.config.adaptivePayloads !== undefined) form.setValue("adaptivePayloads", original.config.adaptivePayloads);
    if (original.config.mimicHumanBehavior !== undefined) form.setValue("mimicHumanBehavior", original.config.mimicHumanBehavior);
    if (original.config.showAIReasoning !== undefined) form.setValue("showAIReasoning", original.config.showAIReasoning);
    setActiveTab("target");
  }, [templateId, form]);

   const onSubmit = (data: FormValues) => {
     // NEW: Create scan in store instead of just console.log
     const scan = scanStore.createScan({
        target: data.target,
        scanType: data.scanType,
        profile: data.profile,
        schedule: data.schedule,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
         useCredentials: data.useCredentials,
         authType: data.authType,
         userAgentMode: data.userAgentMode,
         enableCookies: data.enableCookies,
         humanLikeDelay: data.humanLikeDelay,
         description: data.description,
         createdBy: (() => { try { const u = JSON.parse(localStorage.getItem('sentinelscan_user') || '{}'); return u.id || 'admin'; } catch { return 'admin'; } })(),
         sourceScanId: isRescan ? (templateId ?? undefined) : undefined,
         // AI-Agentic Anti-Pattern fields
        aiAdaptability: data.aiAdaptability,
        randomizeAttackOrder: data.randomizeAttackOrder,
        adaptivePayloads: data.adaptivePayloads,
        mimicHumanBehavior: data.mimicHumanBehavior,
        showAIReasoning: data.showAIReasoning,
      });

    // Navigate to progress page instead of all scans
    navigate(`/dashboard/scans/${scan.id}/progress`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;20&quot; height=&quot;20&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;n&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;20&quot; height=&quot;20&quot; filter=&quot;url(%23n)&quot; opacity=&quot;0.03&quot;/%3E%3C/svg%3E')] opacity-50 pointer-events-none" />

      <div className="relative z-10 mx-auto px-6 py-12 space-y-10">
        {/* Header */}
         <div className="space-y-3 animate-[fadeIn_0.5s_ease-out]">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
               <Shield className="w-6 h-6" style={{ color: 'var(--primary)' }} />
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{isRescan ? 'Rescan' : 'New Scan'}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                  {isRescan ? 'Re-running scan with saved configuration' : 'Configure and launch a vulnerability scan'}
                </p>
             </div>
           </div>
           <div className="h-px w-full" style={{ background: 'linear-gradient(to right, rgba(79, 70, 229, 0.5), rgba(79, 70, 229, 0.3), transparent)' }} />
         </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Tab Navigation */}
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)' }}>
                  <TabsTrigger value="target" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]">
                    <Scan className="w-4 h-4 mr-2" />
                    Target
                  </TabsTrigger>
                  <TabsTrigger value="config" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]">
                    <Key className="w-4 h-4 mr-2" />
                    Authentication
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]">
                    <Shield className="w-4 h-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                  <TabsTrigger value="agentic" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI-Agentic
                  </TabsTrigger>
                </TabsList>

              {/* Tab 1: Target Configuration */}
               <TabsContent value="target" className="space-y-6 mt-6">
                 <Card className="group backdrop-blur-sm border transition-all duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                   <CardHeader>
                     <div className="flex items-center gap-2">
                       <Scan className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                       <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>Target Configuration</CardTitle>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <FormField
                       control={form.control}
                       name="target"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Target Address</FormLabel>
                           <FormControl>
                             <div className="relative">
                                <Input
                                  {...field}
                                  className="placeholder:opacity-50 focus:outline-none focus:ring-2 font-mono pl-10"
                                  style={{ 
                                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)'
                                  }}
                                  placeholder="192.168.1.0/24, example.com, or https://api.example.com"
                                />
                               <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                 <Scan className="w-4 h-4" />
                               </div>
                             </div>
                           </FormControl>
                           <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>
                             Supports IP addresses (192.168.1.1), CIDR (192.168.1.0/24), hostnames (example.com), or full URLs
                           </FormDescription>
                           <FormMessage style={{ color: 'var(--danger)' }} />
                         </FormItem>
                       )}
                     />

                     {/* Schedule Options */}
                     <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                       <FormField
                         control={form.control}
                         name="schedule"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Schedule</FormLabel>
                             <div className="flex gap-4">
                               <Button
                                 type="button"
                                 variant={field.value === "now" ? "default" : "outline"}
                                 className={field.value === "now" ? "" : "border text-slate-300"}
                                 style={field.value === "now" ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                 onClick={() => field.onChange("now")}
                               >
                                 <Clock className="w-4 h-4 mr-2" />
                                 Start Now
                               </Button>
                               <Button
                                 type="button"
                                 variant={field.value === "schedule" ? "default" : "outline"}
                                 className={field.value === "schedule" ? "" : "border text-slate-300"}
                                 style={field.value === "schedule" ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                 onClick={() => field.onChange("schedule")}
                               >
                                 <Calendar className="w-4 h-4 mr-2" />
                                 Schedule Later
                               </Button>
                             </div>
                           </FormItem>
                         )}
                       />

                       {watchSchedule === "schedule" && (
                         <div className="grid grid-cols-2 gap-4 animate-[fadeIn_0.3s_ease-out]">
                           <FormField
                             control={form.control}
                             name="scheduledDate"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Date</FormLabel>
                                 <FormControl>
                                   <Input
                                     {...field}
                                     type="date"
                                     style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                     min={new Date().toISOString().split('T')[0]}
                                   />
                                 </FormControl>
                                 <FormMessage style={{ color: 'var(--danger)' }} />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={form.control}
                             name="scheduledTime"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time</FormLabel>
                                 <FormControl>
                                   <Input
                                     {...field}
                                     type="time"
                                     style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                   />
                                 </FormControl>
                                 <FormMessage style={{ color: 'var(--danger)' }} />
                               </FormItem>
                             )}
                           />
                         </div>
                       )}
                     </div>

                     {/* Description */}
                     <FormField
                       control={form.control}
                       name="description"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                             <div className="flex items-center gap-2">
                               <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                               Description (Optional)
                             </div>
                           </FormLabel>
                           <FormControl>
                             <Textarea
                               {...field}
                               className="placeholder:opacity-50 min-h-[100px]"
                               style={{ 
                                 backgroundColor: 'rgba(79, 70, 229, 0.05)',
                                 border: '1px solid var(--border)',
                                 color: 'var(--text-primary)'
                               }}
                               placeholder="Add notes about this scan..."
                               maxLength={500}
                             />
                           </FormControl>
                           <FormDescription className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                             {field.value?.length || 0}/500 characters
                           </FormDescription>
                         </FormItem>
                       )}
                     />
                   </CardContent>
                 </Card>
               </TabsContent>

              {/* Tab 2: Scan Configuration */}
               <TabsContent value="config" className="space-y-6 mt-6">
                 <Card className="backdrop-blur-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                   <CardHeader>
                     <div className="flex items-center gap-2">
                       <Settings className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                       <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>Scan Configuration</CardTitle>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <FormField
                       control={form.control}
                       name="scanType"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Scan Type</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                 <SelectValue placeholder="Select scan type..." />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent className="" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                               {scanTypes.map(t => (
                                 <SelectItem key={t.value} value={t.value} className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                   <div className="flex items-center gap-3">
                                     <span className="text-lg">{t.icon}</span>
                                     <div>
                                       <div className="font-medium">{t.label}</div>
                                       <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
                                     </div>
                                   </div>
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage style={{ color: 'var(--danger)' }} />
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="profile"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Scan Profile</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                 <SelectValue placeholder="Select profile..." />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent className="" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                               {scanProfiles.map(p => (
                                 <SelectItem key={p.value} value={p.value} className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                   <div className="flex items-center justify-between w-full">
                                     <span className="font-medium">{p.label}</span>
                                     <span className="text-xs ml-8" style={{ color: 'var(--text-muted)' }}>{p.time}</span>
                                   </div>
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage style={{ color: 'var(--danger)' }} />
                         </FormItem>
                       )}
                     />

                     {/* Info box for credentialed scan */}
                     {watchScanType === "credentialed" && (
                       <div className="rounded-lg p-4 animate-[fadeIn_0.3s_ease-out]" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                         <div className="flex items-start gap-3">
                           <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary)' }} />
                           <div>
                             <h4 className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Credentialed Scan Selected</h4>
                             <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                               This scan type requires authentication credentials. Configure them in the Authentication tab.
                             </p>
                           </div>
                         </div>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>

              {/* Tab 3: Authentication */}
               <TabsContent value="auth" className="space-y-6 mt-6">
                 <Card className="backdrop-blur-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                   <CardHeader>
                     <div className="flex items-center gap-2">
                       <Key className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                       <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>Authentication</CardTitle>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <FormField
                       control={form.control}
                       name="useCredentials"
                       render={({ field }) => (
                         <FormItem className="flex items-center justify-between">
                           <div className="space-y-1">
                             <FormLabel className="font-medium" style={{ color: 'var(--text-secondary)' }}>Enable Authentication</FormLabel>
                             <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>
                               Use credentials for deeper scanning (patch audit, authenticated web scans)
                             </FormDescription>
                           </div>
                           <FormControl>
                             <Switch
                               checked={field.value}
                               onCheckedChange={field.onChange}
                             />
                           </FormControl>
                         </FormItem>
                       )}
                     />

                     {watchUseCredentials && (
                       <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                         <FormField
                           control={form.control}
                           name="authType"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Authentication Method</FormLabel>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                 <FormControl>
                                   <SelectTrigger className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                     <SelectValue placeholder="Select auth method..." />
                                   </SelectTrigger>
                                 </FormControl>
                                 <SelectContent className="" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                   {authTypes.map(a => (
                                     <SelectItem key={a.value} value={a.value} className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                       <div className="flex items-center gap-3">
                                         <span className="text-lg">{a.icon}</span>
                                         <span className="font-medium">{a.label}</span>
                                       </div>
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               <FormMessage style={{ color: 'var(--danger)' }} />
                             </FormItem>
                           )}
                         />

                         {/* SSH Key */}
                         {watchAuthType === "ssh-key" && (
                           <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                             <FormField
                               control={form.control}
                               name="username"
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Username</FormLabel>
                                   <FormControl>
                                     <Input {...field} className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="root" />
                                   </FormControl>
                                   <FormMessage style={{ color: 'var(--danger)' }} />
                                 </FormItem>
                               )}
                             />
                             <FormField
                               control={form.control}
                               name="privateKey"
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Private Key (PEM format)</FormLabel>
                                   <FormControl>
                                     <Textarea
                                       {...field}
                                       className="font-mono text-xs min-h-[120px]"
                                       style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                       placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                                     />
                                   </FormControl>
                                   <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                     Paste your SSH private key. Never share your private key with untrusted parties.
                                   </FormDescription>
                                   <FormMessage style={{ color: 'var(--danger)' }} />
                                 </FormItem>
                               )}
                             />
                           </div>
                         )}

                         {/* Username/Password */}
                         {watchAuthType === "username-password" && (
                           <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                             <FormField
                               control={form.control}
                               name="username"
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Username</FormLabel>
                                   <FormControl>
                                     <Input {...field} className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="admin" />
                                   </FormControl>
                                   <FormMessage style={{ color: 'var(--danger)' }} />
                                 </FormItem>
                               )}
                             />
                             <FormField
                               control={form.control}
                               name="password"
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Password</FormLabel>
                                   <FormControl>
                                     <Input {...field} type="password" className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="••••••••" />
                                   </FormControl>
                                   <FormMessage style={{ color: 'var(--danger)' }} />
                                 </FormItem>
                               )}
                             />
                           </div>
                         )}

                         {/* API Token */}
                         {watchAuthType === "api-token" && (
                           <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                             <FormField
                               control={form.control}
                               name="apiToken"
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Token</FormLabel>
                                   <FormControl>
                                     <Input {...field} type="password" className="font-mono" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="sk-..." />
                                   </FormControl>
                                   <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                     Token will be sent via Authorization header or configured header
                                   </FormDescription>
                                   <FormMessage style={{ color: 'var(--danger)' }} />
                                 </FormItem>
                               )}
                             />
                           </div>
                         )}

                         {/* Certificate */}
                         {watchAuthType === "certificate" && (
                           <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                             <FormField
                               control={form.control}
                               name="certFile"
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Certificate (PEM format)</FormLabel>
                                   <FormControl>
                                     <Textarea
                                         {...field}
                                         className="font-mono text-xs min-h-[100px]"
                                         style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                         placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                                     />
                                   </FormControl>
                                   <FormMessage style={{ color: 'var(--danger)' }} />
                                 </FormItem>
                               )}
                             />
                           </div>
                         )}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>

              {/* Tab 4: Advanced Options */}
               <TabsContent value="advanced" className="space-y-6 mt-6">
                 <Card className="backdrop-blur-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                   <CardHeader>
                     <div className="flex items-center gap-2">
                       <Shield className="w-5 h-5" style={{ color: 'var(--success)' }} />
                       <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>Advanced & Stealth Options</CardTitle>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     {/* User-Agent Strategy */}
                     <FormField
                       control={form.control}
                       name="userAgentMode"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>User-Agent Strategy</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                 <SelectValue placeholder="Select strategy..." />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent className="" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                               {userAgentOptions.map(u => (
                                 <SelectItem key={u.value} value={u.value} className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                   <div className="flex items-center gap-3">
                                     <span className="text-lg">{u.icon}</span>
                                     <div>
                                       <div className="font-medium">{u.label}</div>
                                       <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.desc}</div>
                                     </div>
                                   </div>
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage style={{ color: 'var(--danger)' }} />
                         </FormItem>
                       )}
                     />

                     {form.watch("userAgentMode") === "custom" && (
                       <FormField
                         control={form.control}
                         name="customUserAgent"
                         render={({ field }) => (
                           <FormItem className="animate-[fadeIn_0.3s_ease-out]">
                             <FormLabel className="text-sm" style={{ color: 'var(--text-secondary)' }}>Custom User-Agent</FormLabel>
                             <FormControl>
                               <Input {...field} className="font-mono text-sm" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="Mozilla/5.0..." />
                             </FormControl>
                             <FormMessage style={{ color: 'var(--danger)' }} />
                           </FormItem>
                         )}
                       />
                     )}

                     {/* Stealth Toggles */}
                     <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                       <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Stealth Settings</h4>

                       <FormField
                         control={form.control}
                         name="enableCookies"
                         render={({ field }) => (
                           <FormItem className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Cookie className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                               <div>
                                 <FormLabel style={{ color: 'var(--text-secondary)' }}>Enable Cookies</FormLabel>
                                 <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>Maintain session cookies across requests</FormDescription>
                               </div>
                             </div>
                             <FormControl>
                               <Switch checked={field.value} onCheckedChange={field.onChange} />
                             </FormControl>
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="humanLikeDelay"
                         render={({ field }) => (
                           <FormItem className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Timer className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                               <div>
                                 <FormLabel style={{ color: 'var(--text-secondary)' }}>Human-like Delays</FormLabel>
                                 <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>Add random delays between requests</FormDescription>
                               </div>
                             </div>
                             <FormControl>
                               <Switch checked={field.value} onCheckedChange={field.onChange} />
                             </FormControl>
                           </FormItem>
                         )}
                       />

                       {form.watch("humanLikeDelay") && (
                         <div className="grid grid-cols-2 gap-4 animate-[fadeIn_0.3s_ease-out] pl-6">
                           <FormField
                             control={form.control}
                             name="delayMin"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-xs" style={{ color: 'var(--text-secondary)' }}>Min Delay (seconds)</FormLabel>
                                 <FormControl>
                                   <Input
                                     {...field}
                                     type="number"
                                     min={0}
                                     onChange={(e) => field.onChange(Number(e.target.value))}
                                     style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                   />
                                 </FormControl>
                                 <FormMessage style={{ color: 'var(--danger)' }} />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={form.control}
                             name="delayMax"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max Delay (seconds)</FormLabel>
                                 <FormControl>
                                   <Input
                                     {...field}
                                     type="number"
                                     min={1}
                                     onChange={(e) => field.onChange(Number(e.target.value))}
                                     style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                   />
                                 </FormControl>
                                 <FormMessage style={{ color: 'var(--danger)' }} />
                               </FormItem>
                             )}
                           />
                         </div>
                       )}

                       <FormField
                         control={form.control}
                         name="randomizeOrder"
                         render={({ field }) => (
                           <FormItem className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Shuffle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                               <div>
                                 <FormLabel style={{ color: 'var(--text-secondary)' }}>Randomize Order</FormLabel>
                                 <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>Randomize scan order to avoid patterns</FormDescription>
                               </div>
                             </div>
                             <FormControl>
                               <Switch checked={field.value} onCheckedChange={field.onChange} />
                             </FormControl>
                           </FormItem>
                         )}
                       />
                     </div>
                   </CardContent>
                 </Card>
                </TabsContent>

               {/* Tab 5: AI-Agentic Anti-Pattern */}
                <TabsContent value="agentic" className="space-y-6 mt-6">
                  <Card className="backdrop-blur-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--primary)' }} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>AI-Agentic Anti-Pattern</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Explanation Box */}
                      <div className="rounded-xl p-5 animate-[fadeIn_0.3s_ease-out]" style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--primary)' }} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>Breaking Traditional Scan Patterns</h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              Traditional vulnerability assessments follow predictable patterns that defenders can detect and block. 
                              This AI-agentic approach adapts in real-time, choosing different attack vectors and sequences for each target.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Adaptability Level */}
                      <FormField
                        control={form.control}
                        name="aiAdaptability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0 6v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4" />
                                </svg>
                                AI Adaptability Level
                              </div>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "balanced"}>
                              <FormControl>
                                <SelectTrigger className="" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                  <SelectValue placeholder="Select adaptability level..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <SelectItem value="conservative" className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">🛡️</span>
                                    <div>
                                      <div className="font-medium">Conservative</div>
                                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Minimal pattern deviation, stable approach</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="balanced" className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">⚖️</span>
                                    <div>
                                      <div className="font-medium">Balanced</div>
                                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Smart adaptation based on responses</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="aggressive" className="cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">🚀</span>
                                    <div>
                                      <div className="font-medium">Aggressive</div>
                                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Maximum pattern breaking, creative attacks</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage style={{ color: 'var(--danger)' }} />
                          </FormItem>
                        )}
                      />

                      {/* Pattern Breaking Strategy */}
                      <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-2">
                            <Shuffle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            Pattern Breaking Strategy
                          </div>
                        </h4>

                        <FormField
                          control={form.control}
                          name="randomizeAttackOrder"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shuffle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                <div>
                                  <FormLabel style={{ color: 'var(--text-secondary)' }}>Randomize Attack Order</FormLabel>
                                  <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>Shuffle vulnerability test sequence each run</FormDescription>
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value || true} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="adaptivePayloads"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--warning)' }} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0 6v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4" />
                                </svg>
                                <div>
                                  <FormLabel style={{ color: 'var(--text-secondary)' }}>Adaptive Payloads</FormLabel>
                                  <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>AI generates context-aware payloads</FormDescription>
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value || true} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mimicHumanBehavior"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4" style={{ color: 'var(--success)' }} />
                                <div>
                                  <FormLabel style={{ color: 'var(--text-secondary)' }}>Mimic Human Behavior</FormLabel>
                                  <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>Variable timing, realistic browsing patterns</FormDescription>
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value || true} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* AI Reasoning Visibility */}
                      <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            AI Transparency
                          </div>
                        </h4>

                        <FormField
                          control={form.control}
                          name="showAIReasoning"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--info)' }} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <div>
                                  <FormLabel style={{ color: 'var(--text-secondary)' }}>Show AI Reasoning</FormLabel>
                                  <FormDescription className="text-xs" style={{ color: 'var(--text-muted)' }}>Display AI decision-making process during scan</FormDescription>
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value || true} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Info Box */}
                        <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--success)' }} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <h4 className="text-sm font-medium" style={{ color: 'var(--success)' }}>Anti-Pattern Benefits</h4>
                              <ul className="text-xs mt-1 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                <li>✓ Evades pattern-based detection systems</li>
                                <li>✓ Adapts to target's unique architecture</li>
                                <li>✓ Discovers non-standard vulnerabilities</li>
                                <li>✓ Reduces false negatives from predictable scanning</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
             </Tabs>

            {/* Actions */}
             <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border)' }}>
               <Button
                 type="button"
                 variant="ghost"
                 className="transition-colors"
                 style={{ color: 'var(--text-muted)' }}
                 onClick={() => navigate(-1)}
                 onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}
               >
                 <X className="w-4 h-4 mr-2" />
                 Cancel
               </Button>
               <div className="flex gap-3">
                  {activeTab !== "target" && (
                    <Button
                      type="button"
                      variant="outline"
                      className=""
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      onClick={() => {
                        const tabs = ["target", "config", "auth", "advanced", "agentic"];
                        const idx = tabs.indexOf(activeTab);
                        if (idx > 0) setActiveTab(tabs[idx - 1]);
                      }}
                    >
                      Previous
                    </Button>
                  )}
                  {activeTab !== "agentic" ? (
                    <Button
                      type="button"
                      className="text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'rgba(79, 70, 229, 0.8)' }}
                      onClick={() => {
                        const tabs = ["target", "config", "auth", "advanced", "agentic"];
                        const idx = tabs.indexOf(activeTab);
                        if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.8)' }}
                    >
                      Next
                    </Button>
                  ) : (
                   <Button
                     type="submit"
                     className="text-white px-8 py-2.5 rounded-xl shadow-lg font-medium transition-all duration-300"
                     style={{ 
                       background: 'linear-gradient(to right, var(--primary), rgba(79, 70, 229, 0.8))',
                       boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.25)'
                     }}
                     onMouseEnter={(e) => { 
                       e.currentTarget.style.background = 'linear-gradient(to right, rgba(79, 70, 229, 0.8), var(--primary))';
                       e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.4)';
                     }}
                     onMouseLeave={(e) => { 
                       e.currentTarget.style.background = 'linear-gradient(to right, var(--primary), rgba(79, 70, 229, 0.8))';
                       e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.25)';
                     }}
                   >
                     <Shield className="w-4 h-4 mr-2" />
                     Launch Scan
                   </Button>
                 )}
               </div>
             </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
