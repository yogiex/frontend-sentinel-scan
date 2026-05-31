import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        size="sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back
      </Button>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Create New Ticket</CardTitle>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Vulnerability remediation tracking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] pb-2 border-b border-[var(--border)]">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Ticket Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Remediate CVE-2024-3094 on DB-Prod-01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Steps to remediate, notes, references..."
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critical">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span>Critical</span>
                                <span className="text-xs text-[var(--text-secondary)]">(7 days SLA)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="high">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                <span>High</span>
                                <span className="text-xs text-[var(--text-secondary)]">(30 days SLA)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-amber-500" />
                                <span>Medium</span>
                                <span className="text-xs text-[var(--text-secondary)]">(90 days SLA)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="low">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                <span>Low</span>
                                <span className="text-xs text-[var(--text-secondary)]">(180 days SLA)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-[var(--text-secondary)]'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[340px] p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: Date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Assignment */}
              <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] pb-2 border-b border-[var(--border)]">
                  Assignment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignedTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Team</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="security">Security Team</SelectItem>
                            <SelectItem value="infra">Infrastructure Team</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Or Assign to User (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user-1">Admin User</SelectItem>
                            <SelectItem value="user-2">Security Analyst</SelectItem>
                            <SelectItem value="user-3">Developer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 3: Vulnerability Context */}
              <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] pb-2 border-b border-[var(--border)]">
                  Vulnerability Context
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cveId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVE ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., CVE-2024-3094"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvssScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVSS Score</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="0.0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="remediation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Remediation Steps</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="How to fix this vulnerability..."
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-[var(--border)]">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
