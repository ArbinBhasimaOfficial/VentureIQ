import DashboardShell from "@/components/dashboard/DashboardShell";
import { ThemeProvider } from "@/components/providers/theme-providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  );
}
