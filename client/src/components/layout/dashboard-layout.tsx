import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Phone,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ href, icon, children, isActive }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-primary/10"
        )}
      >
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
}

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Главная",
    },
    {
      href: "/calls",
      icon: <Phone className="h-4 w-4" />,
      label: "Звонки",
    },
    {
      href: "/contacts",
      icon: <Users className="h-4 w-4" />,
      label: "Контакты",
    },
    {
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Настройки",
    },
  ];

  return (
    <div>
      <div className="mb-2 px-3 text-sm font-medium text-muted-foreground">
        Навигация
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={location === item.href}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Sidebar() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 px-3 py-2 mb-8">
        <Phone className="h-6 w-6" />
        <span className="font-semibold">AI Caller</span>
      </div>

      <Navigation />

      <div className="mt-auto pt-4 border-t">
        <div className="px-3 py-2 mb-2">
          <div className="font-medium">{user?.username}</div>
          <div className="text-sm text-muted-foreground">
            {user?.companyName}
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px,1fr]">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="hidden lg:block border-r">
          <Sidebar />
        </aside>
      )}

      <main className="p-6 lg:p-8">{children}</main>
    </div>
  );
}