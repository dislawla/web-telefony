import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { BackButton } from "@/components/ui/back-button";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold">Добро пожаловать, {user.username}!</h1>
          <p className="text-muted-foreground">
            Вы вошли в систему как {user.companyName}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 