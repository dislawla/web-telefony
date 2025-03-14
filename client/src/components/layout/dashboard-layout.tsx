import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Phone,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";

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

function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-full p-4">
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 mb-8",
        collapsed && "justify-center"
      )}>
        <Phone className="h-6 w-6" />
        {!collapsed && <span className="font-semibold">AI Caller</span>}
      </div>

      <Navigation />

      <div className="mt-auto pt-4 border-t">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <div className="font-medium">{user?.username}</div>
            <div className="text-sm text-muted-foreground">
              {user?.companyName}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Выйти</span>}
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      {isMobile ? (
        <>
          <Sheet>
            <div className="flex items-center gap-4 px-6 py-4 border-b lg:hidden">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <div className="font-semibold">AI Caller</div>
            </div>
            <SheetContent side="left" className="p-0 w-[280px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <main className="p-6">{children}</main>
        </>
      ) : (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={20}
            minSize={isCollapsed ? 5 : 15}
            maxSize={30}
            className="border-r relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-[-12px] top-4 z-10"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Sidebar collapsed={isCollapsed} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <main className="p-8">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}