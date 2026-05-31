import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch } from '@/store';
import { mockLogin } from '@/store/slices/authSlice';

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePasswordToggle();
    }
  };

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      await dispatch(mockLogin({
        username: values.email,
        password: values.password,
      })).unwrap();

      if (values.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(typeof err === 'string' ? err : "Authentication failed. Please check your credentials and try again, or contact support if the issue persists.");
    } finally {
      setIsLoading(false);
    }
  }

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-4 rounded-xl border"
            style={{ borderColor: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' }}
          >
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)] text-sm font-medium">
                Email Address
              </FormLabel>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="you@company.com"
                    className="pl-10 text-sm border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-0 rounded-xl h-12"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-xs mt-1" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-[var(--text-primary)] text-sm font-medium">
                  Password
                </FormLabel>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded-md touch-action-manipulation"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    spellCheck={false}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 text-sm border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-0 rounded-xl h-12"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={handlePasswordToggle}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded-md p-0.5 transition-colors touch-action-manipulation"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <FormMessage className="text-xs mt-1" />
            </FormItem>
          )}
        />

        {/* Remember Me */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[var(--primary)] rounded-full data-[state=unchecked]:bg-[var(--border)]"
                />
              </FormControl>
              <FormLabel className="text-[var(--text-secondary)] text-sm cursor-pointer select-none">
                Remember me for 30 days
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          aria-live="polite"
          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-all hover:opacity-90 touch-action-manipulation"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className={`h-4 w-4 ${prefersReducedMotion ? '' : 'animate-spin'}`} aria-hidden="true" />
              <span>Signing in…</span>
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Modern Branding */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="space-y-8">
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-3">
              <div className="p-4 bg-[var(--primary)]/10 rounded-2xl">
                <ShieldCheck className="h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold text-[var(--text-primary)]">SentinelScan</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
                Secure Your
                <br />
                <span className="text-[var(--primary)]">Infrastructure</span>
              </h1>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-lg">
                Advanced vulnerability management platform for modern enterprises. 
                Monitor, analyze, and remediate threats with confidence.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="flex items-start gap-3 p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]">
                <div className="mt-1 p-2 bg-[var(--success)]/10 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-[var(--success)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Real-time Monitoring</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">24/7 threat detection</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]">
                <div className="mt-1 p-2 bg-[var(--info)]/10 rounded-xl">
                  <svg className="h-5 w-5 text-[var(--info)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m18 0a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Global Coverage</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Multi-cloud & on-prem</p>
                </div>
              </div>
            </div>

             {/* Stats */}
             <div className="flex items-center gap-8 pt-4">
               <div>
                 <p className="text-3xl font-bold text-[var(--text-primary)] font-[tabular-nums]">47</p>
                 <p className="text-xs text-[var(--text-muted)] font-medium">Assets Monitored</p>
               </div>
               <div className="w-px h-12 bg-[var(--border)]" />
               <div>
                 <p className="text-3xl font-bold text-[var(--danger)] font-[tabular-nums]">3</p>
                 <p className="text-xs text-[var(--text-muted)] font-medium">Critical Issues</p>
               </div>
               <div className="w-px h-12 bg-[var(--border)]" />
               <div>
                 <p className="text-3xl font-bold text-[var(--warning)] font-[tabular-nums]">12</p>
                 <p className="text-xs text-[var(--text-muted)] font-medium">High Priority</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="relative">
          {/* Decorative gradient */}
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--info)]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Mobile Logo (shown only on mobile) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                  <ShieldCheck className="h-8 w-8 text-[var(--primary)]" aria-hidden="true" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Welcome Back</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Sign in to your SentinelScan account
              </p>
            </div>

            {/* Desktop Header (hidden on mobile) */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">Welcome Back</h2>
              <p className="mt-2 text-[var(--text-secondary)]">
                Sign in to your SentinelScan account
              </p>
            </div>

            {/* Login Card - Modern & Clean */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-3xl p-10 shadow-2xl">
              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mb-8 pb-8 border-b border-[var(--border)]">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  Secure Encrypted Connection
                </span>
              </div>

              <LoginForm />
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
              © 2026 SentinelScan. Built for professional security audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
