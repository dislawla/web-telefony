import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Phone,
  Users,
  Settings,
  LogOut,
  Menu,
  User,
  Building,
  Database,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ href, icon, children, isActive }: NavLinkProps) {
  return (
    <Link href={href}>
      <button
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full text-left",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-primary/10"
        )}
      >
        {icon}
        <span>{children}</span>
      </button>
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
      href: "/messengers",
      icon: <MessageCircle className="h-4 w-4" />,
      label: "Мессенджеры",
    },
  ];

  const settingsItems = [
    {
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Обзор настроек",
    },
    {
      href: "/settings/telephony",
      icon: <Phone className="h-4 w-4" />,
      label: "Телефония",
    },
    {
      href: "/settings/database",
      icon: <Database className="h-4 w-4" />,
      label: "База данных",
    },
    {
      href: "/settings/crm",
      icon: <Building className="h-4 w-4" />,
      label: "CRM",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full text-left",
                location.startsWith("/settings")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-48">
            {settingsItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <DropdownMenuItem className="cursor-pointer">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
}

function UserMenu() {
  const { user, logoutMutation } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          <span>{user?.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="right">
        <DropdownMenuLabel>Мой профиль</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Просмотр профиля
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem disabled>
          {user?.companyName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar() {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-6">
        <UserMenu />
      </div>

      <div>
        <Navigation />
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
            minSize={15}
            maxSize={30}
            className="border-r"
          >
            <Sidebar />
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