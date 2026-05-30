import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Card components removed - using custom industrial design
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTicket } from '@/hooks/useTicket';
import { useAuditLog } from '@/hooks/useAuditLog';
import { SLA_DAYS, TicketPriority } from '@/types/ticket';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const createTicketSchema = z.object({
  vulnerabilityId: z.string().min(1, 'Vulnerability ID required'),
  scanId: z.string().min(1, 'Scan ID required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['critical', 'high', 'medium', 'low'] as const),
  assignedTo: z.string().optional(),
  assignedTeam: z.string().optional(),
  dueDate: z.date().optional(),
  remediation: z.string().optional(),
  cveId: z.string().optional(),
  cvssScore: z.number().min(0).max(10).optional(),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

export function CreateTicket(): ReactNode {
  const navigate = useNavigate();
  const { createTicket } = useTicket();
  const { info } = useAuditLog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      vulnerabilityId: 'vuln-' + Date.now(),
      scanId: 'scan-' + Date.now(),
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      assignedTeam: '',
      remediation: '',
      cveId: '',
    },
  });

  const onSubmit = async (data: CreateTicketForm) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const dueDate = data.dueDate || new Date();
      if (!data.dueDate) {
        dueDate.setDate(dueDate.getDate() + SLA_DAYS[data.priority as TicketPriority]);
      }

      const ticketData = {
        vulnerabilityId: data.vulnerabilityId,
        scanId: data.scanId,
        title: data.title,
        description: data.description,
        status: 'open' as const,
        priority: data.priority,
        assignedTo: data.assignedTo || '',
        createdBy: 'current-user',
        dueDate: dueDate.toISOString(),
        remediation: data.remediation || '',
        cveId: data.cveId,
        cvssScore: data.cvssScore,
      };

      await createTicket(ticketData);

      // Log audit action
      info('security', 'CREATE_TICKET', {
        resource: 'ticket',
        resourceId: data.vulnerabilityId,
        details: `Created ticket for vulnerability ${data.vulnerabilityId} with priority ${data.priority}`,
      });

      navigate('/dashboard/tickets');
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Industrial Header */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-slate-900 pb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="font-mono text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          BACK
        </Button>
        <div className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">
          Ticket Management System
        </div>
      </div>

      {/* Main Form Card - Industrial Style */}
      <div className="border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        {/* Card Header */}
        <div className="border-b-2 border-slate-900 px-6 py-4 bg-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 border-2 border-slate-900">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-wider text-slate-900">
                CREATE NEW TICKET
              </h1>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                Vulnerability remediation tracking
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-300">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600">
                    Basic Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Ticket Title *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Remediate CVE-2024-3094 on DB-Prod-01"
                            className="font-mono text-sm border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Description *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Steps to remediate, notes, references..."
                            className="font-mono text-sm border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors resize-none"
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Priority Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono text-xs border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-slate-300">
                            <SelectItem value="critical" className="font-mono text-xs focus:bg-red-50">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span className="font-bold">CRITICAL</span>
                                <span className="text-[10px] text-slate-500">(7 days SLA)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="high" className="font-mono text-xs focus:bg-orange-50">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                <span className="font-bold">HIGH</span>
                                <span className="text-[10px] text-slate-500">(30 days SLA)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="medium" className="font-mono text-xs focus:bg-amber-50">
                              <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-amber-500" />
                                <span className="font-bold">MEDIUM</span>
                                <span className="text-[10px] text-slate-500">(90 days SLA)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="low" className="font-mono text-xs focus:bg-emerald-50">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                <span className="font-bold">LOW</span>
                                <span className="text-[10px] text-slate-500">(180 days SLA)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Due Date (Optional)
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'font-mono text-xs w-full justify-start text-left border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors',
                                  !field.value && 'text-slate-400'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[340px] p-0 border-2 border-slate-300" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: Date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                               className="bg-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Assignment */}
              <div className="space-y-4 pt-6 border-t-2 border-slate-300">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-300">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-mono text-xs font-bold">
                    2
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600">
                    Assignment
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignedTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Assign to Team
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono text-xs border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-slate-300">
                            <SelectItem value="security" className="font-mono text-xs">Security Team</SelectItem>
                            <SelectItem value="infra" className="font-mono text-xs">Infrastructure Team</SelectItem>
                            <SelectItem value="devops" className="font-mono text-xs">DevOps</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Or Assign to User (Optional)
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono text-xs border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-slate-300">
                            <SelectItem value="user-1" className="font-mono text-xs">Admin User</SelectItem>
                            <SelectItem value="user-2" className="font-mono text-xs">Security Analyst</SelectItem>
                            <SelectItem value="user-3" className="font-mono text-xs">Developer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 3: Vulnerability Context */}
              <div className="space-y-4 pt-6 border-t-2 border-slate-300">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-300">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-mono text-xs font-bold">
                    3
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600">
                    Vulnerability Context
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cveId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          CVE ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., CVE-2024-3094"
                            className="font-mono text-xs border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvssScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          CVSS Score
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="0.0"
                            className="font-mono text-xs border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="remediation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Remediation Steps
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="How to fix this vulnerability..."
                            className="font-mono text-sm border-2 border-slate-300 bg-slate-50 focus:border-indigo-600 transition-colors resize-none"
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t-2 border-slate-300">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                   className="font-mono font-bold tracking-wider text-xs bg-indigo-600 text-white border-2 border-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2"
                >
                  {isSubmitting ? 'CREATING...' : 'CREATE TICKET'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="font-mono text-xs border-2 border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
