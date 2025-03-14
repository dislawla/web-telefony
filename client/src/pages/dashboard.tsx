import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { CallStats } from "@/components/analytics/call-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Plus } from "lucide-react";
import { Call, Contact } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const {
    data: calls,
    isLoading: isLoadingCalls,
  } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const {
    data: contacts,
    isLoading: isLoadingContacts,
  } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  if (isLoadingCalls || isLoadingContacts) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Главная</h1>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </DashboardLayout>
    );
  }

  const recentContacts = contacts?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Главная</h1>
          <Link href="/contacts">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить контакт
            </Button>
          </Link>
        </div>

        <CallStats calls={calls || []} />

        <Card>
          <CardHeader>
            <CardTitle>Последние контакты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Контактов пока нет. Добавьте контакты, чтобы начать звонки.
                </div>
              ) : (
                recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.phone}
                      </div>
                    </div>
                    <Link href={`/calls?contact=${contact.id}`}>
                      <Button variant="secondary" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}