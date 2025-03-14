import DashboardLayout from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Messengers() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Мессенджеры</h1>
          <p className="text-muted-foreground">
            Управление интеграциями с мессенджерами и лидами
          </p>
        </div>

        <Tabs defaultValue="messengers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messengers">Мессенджеры</TabsTrigger>
            <TabsTrigger value="leads">Лиды</TabsTrigger>
          </TabsList>

          <TabsContent value="messengers">
            <Card>
              <CardHeader>
                <CardTitle>Интеграции с мессенджерами</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Здесь будут настройки интеграций с мессенджерами</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Управление лидами</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Здесь будет список лидов и управление ими</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}