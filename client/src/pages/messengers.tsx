import DashboardLayout from "@/components/layout/dashboard-layout";

export default function Messengers() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Мессенджеры</h1>
          <p className="text-muted-foreground">
            Управление интеграциями с мессенджерами
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
