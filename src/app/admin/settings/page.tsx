import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Globe2,
  KeyRound,
  Mail,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_VERSION } from "@/lib/app-info";

export const metadata: Metadata = {
  title: "Admin Settings | CineHub",
  description: "Operational settings and deployment readiness for CineHub admin",
};

type SettingItem = {
  label: string;
  value: string;
  configured: boolean;
  secret?: boolean;
  detail?: string;
};

type SettingGroup = {
  title: string;
  description: string;
  icon: typeof Settings;
  items: SettingItem[];
};

function envValue(name: string) {
  return process.env[name]?.trim() || "";
}

function configured(name: string) {
  return Boolean(envValue(name));
}

function masked(value: string, secret?: boolean) {
  if (!value) return "Missing";
  if (!secret) return value;
  if (value.length <= 8) return "Configured";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

const appUrl =
  envValue("NEXT_PUBLIC_APP_URL") ||
  (envValue("VERCEL_URL") ? `https://${envValue("VERCEL_URL")}` : "");

const settingGroups: SettingGroup[] = [
  {
    title: "Application",
    description: "Public app identity and production URL used by metadata and SEO.",
    icon: Globe2,
    items: [
      {
        label: "App version",
        value: APP_VERSION,
        configured: true,
        detail: "Shown in the admin header, footer, README, and release notes.",
      },
      {
        label: "NEXT_PUBLIC_APP_URL",
        value: appUrl,
        configured: Boolean(appUrl),
        detail: "Should match the real Vercel production domain.",
      },
      {
        label: "NEXT_PUBLIC_APP_NAME",
        value: envValue("NEXT_PUBLIC_APP_NAME") || "CineHub",
        configured: true,
      },
    ],
  },
  {
    title: "Firebase client",
    description: "Browser-side Firebase config required for login, register, Google auth, and user data.",
    icon: KeyRound,
    items: [
      { label: "API key", value: envValue("NEXT_PUBLIC_FIREBASE_API_KEY"), configured: configured("NEXT_PUBLIC_FIREBASE_API_KEY"), secret: true },
      { label: "Auth domain", value: envValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"), configured: configured("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") },
      { label: "Project ID", value: envValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID"), configured: configured("NEXT_PUBLIC_FIREBASE_PROJECT_ID") },
      { label: "App ID", value: envValue("NEXT_PUBLIC_FIREBASE_APP_ID"), configured: configured("NEXT_PUBLIC_FIREBASE_APP_ID"), secret: true },
    ],
  },
  {
    title: "Firebase admin",
    description: "Server-side credentials used by protected API routes and admin pages.",
    icon: ShieldCheck,
    items: [
      { label: "Admin project ID", value: envValue("FIREBASE_ADMIN_PROJECT_ID"), configured: configured("FIREBASE_ADMIN_PROJECT_ID") },
      { label: "Client email", value: envValue("FIREBASE_CLIENT_EMAIL"), configured: configured("FIREBASE_CLIENT_EMAIL"), secret: true },
      { label: "Private key", value: envValue("FIREBASE_PRIVATE_KEY"), configured: configured("FIREBASE_PRIVATE_KEY"), secret: true },
    ],
  },
  {
    title: "Movie data",
    description: "TMDB integration used by home, explore, search, detail, and watch pages.",
    icon: Database,
    items: [
      { label: "TMDB API key", value: envValue("NEXT_PUBLIC_TMDB_API_KEY"), configured: configured("NEXT_PUBLIC_TMDB_API_KEY"), secret: true },
      { label: "TMDB base URL", value: envValue("NEXT_PUBLIC_TMDB_BASE_URL"), configured: configured("NEXT_PUBLIC_TMDB_BASE_URL") },
      { label: "Image base URL", value: envValue("NEXT_PUBLIC_TMDB_IMAGE_BASE_URL"), configured: configured("NEXT_PUBLIC_TMDB_IMAGE_BASE_URL") },
    ],
  },
  {
    title: "Contact email",
    description: "SMTP settings for the contact form and admin contact replies.",
    icon: Mail,
    items: [
      { label: "SMTP host", value: envValue("SMTP_HOST"), configured: configured("SMTP_HOST") },
      { label: "SMTP port", value: envValue("SMTP_PORT"), configured: configured("SMTP_PORT") },
      { label: "SMTP user", value: envValue("SMTP_USER"), configured: configured("SMTP_USER"), secret: true },
      { label: "SMTP password", value: envValue("SMTP_PASS"), configured: configured("SMTP_PASS"), secret: true },
      { label: "Contact inbox", value: envValue("CONTACT_TO_EMAIL"), configured: configured("CONTACT_TO_EMAIL"), secret: true },
    ],
  },
];

const operations = [
  {
    title: "Firebase authorized domains",
    detail: "Add the Vercel production domain in Firebase Authentication settings.",
    ready: Boolean(appUrl),
  },
  {
    title: "Source report triage",
    detail: "Review open and reviewing reports before changing source priority.",
    ready: true,
  },
  {
    title: "Admin route protection",
    detail: "Admin layout verifies session cookies and redirects non-admin users.",
    ready: true,
  },
  {
    title: "SEO publishing",
    detail: "Metadata, sitemap, and robots routes are generated by Next.js.",
    ready: true,
  },
];

const quickLinks = [
  { label: "Analytics", href: "/admin/analytics", icon: SlidersHorizontal },
  { label: "Source Reports", href: "/admin/source-reports", icon: AlertTriangle },
  { label: "Users", href: "/admin/users", icon: ShieldCheck },
  { label: "Contact Messages", href: "/admin/contact-messages", icon: Mail },
];

function readiness() {
  const allItems = settingGroups.flatMap((group) => group.items);
  const configuredItems = allItems.filter((item) => item.configured).length;

  return {
    total: allItems.length,
    configured: configuredItems,
    score: Math.round((configuredItems / allItems.length) * 100),
    missing: allItems.length - configuredItems,
  };
}

function StatusBadge({ configured: isConfigured }: { configured: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isConfigured
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
      }
    >
      {isConfigured ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {isConfigured ? "Ready" : "Missing"}
    </Badge>
  );
}

export default function AdminSettingsPage() {
  const status = readiness();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl md:p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Settings className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Admin Settings
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                  A deployment and operations checklist for CineHub. Sensitive
                  values are masked, and settings are managed through local env
                  files or Vercel environment variables.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                CineHub v{APP_VERSION}
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                Read-only production config
              </Badge>
            </div>
          </div>

          <Card className="border-primary/25 bg-primary/10 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">Readiness</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {status.configured}/{status.total} required values configured
                  </p>
                </div>
                <Server className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-5 text-5xl font-bold text-white">{status.score}%</div>
              <p className="mt-2 text-sm text-slate-400">
                {status.missing
                  ? `${status.missing} setting(s) still need attention.`
                  : "All tracked settings look ready."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.href}
              asChild
              variant="outline"
              className="min-h-16 justify-between border-slate-800 bg-slate-950/75 px-5 text-left text-slate-200 hover:bg-slate-900"
            >
              <Link href={link.href}>
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  {link.label}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {settingGroups.map((group) => {
          const Icon = group.icon;
          const readyCount = group.items.filter((item) => item.configured).length;

          return (
            <Card key={group.title} className="border-slate-800 bg-slate-950/75 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{group.title}</CardTitle>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                    {readyCount}/{group.items.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={`${group.title}-${item.label}`}
                    className="rounded-xl border border-slate-800 bg-slate-900/45 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="mt-1 break-all text-sm text-slate-400">
                          {masked(item.value, item.secret)}
                        </p>
                        {item.detail && (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {item.detail}
                          </p>
                        )}
                      </div>
                      <StatusBadge configured={item.configured} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/75 p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Operations checklist</h2>
            <p className="mt-1 text-sm text-slate-400">
              Practical items to verify before and after every production deploy.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
            Admin workflow
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {operations.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-900/45 p-4"
            >
              <div className="flex items-start gap-3">
                {item.ready ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" />
                )}
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
