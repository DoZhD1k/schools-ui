import { AuthProvider } from "@/contexts/auth-context";
import DisabledNav from "@/utils/disableNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DisabledNav />
      <main className="pt-20">{children}</main>
    </AuthProvider>
  );
}
