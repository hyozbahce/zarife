import * as React from "react"
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Settings,
  Users,
  GraduationCap,
  Sparkles,
  ChevronRight,
  LogOut,
  BarChart3,
  School,
  Languages,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface NavItem {
  titleKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: { titleKey: string; url: string }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const navMain: NavItem[] = [
    {
      titleKey: "nav.dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      titleKey: "nav.contentLab",
      url: "#",
      icon: Sparkles,
      roles: ["PlatformAdmin", "SchoolAdmin"],
      children: [
        { titleKey: "nav.aiStoryGenerator", url: "/ai/generate" },
        { titleKey: "nav.storyBuilder", url: "/stories/new" },
        { titleKey: "nav.assetLibrary", url: "/assets" },
      ],
    },
    {
      titleKey: "nav.library",
      url: "/library",
      icon: Library,
    },
    {
      titleKey: "nav.analytics",
      url: "/analytics",
      icon: BarChart3,
      roles: ["PlatformAdmin", "SchoolAdmin", "Teacher"],
    },
  ];

  const schoolNav: NavItem[] = [
    {
      titleKey: "nav.teacherHub",
      url: "/school/teacher",
      icon: GraduationCap,
      roles: ["Teacher", "SchoolAdmin"],
    },
    {
      titleKey: "nav.classes",
      url: "/school/classes",
      icon: GraduationCap,
      roles: ["PlatformAdmin", "SchoolAdmin", "Teacher"],
    },
    {
      titleKey: "nav.students",
      url: "/school/students",
      icon: Users,
      roles: ["PlatformAdmin", "SchoolAdmin", "Teacher"],
    },
  ];

  const managementNav: NavItem[] = [
    {
      titleKey: "nav.schools",
      url: "/management/schools",
      icon: School,
      roles: ["PlatformAdmin"],
    },
    {
      titleKey: "nav.users",
      url: "/management/users",
      icon: Users,
      roles: ["PlatformAdmin", "SchoolAdmin"],
    },
    {
      titleKey: "nav.settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  const userDisplayName = user?.email.split('@')[0] || "User";
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  const filterByRole = (items: NavItem[]) =>
    items.filter(item => !item.roles || (user?.role && item.roles.includes(user.role)));

  const isActive = (url: string) => location.pathname === url || location.pathname.startsWith(url + '/');

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('brand.name')}</span>
                  <span className="truncate text-xs">{t('brand.tagline')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.platform')}</SidebarGroupLabel>
          <SidebarMenu>
            {filterByRole(navMain).map((item) => (
              <SidebarMenuItem key={item.titleKey}>
                {item.children ? (
                   <div className="group/menu-item relative">
                     <SidebarMenuButton tooltip={t(item.titleKey)} isActive={item.children.some(c => isActive(c.url))}>
                        {item.icon && <item.icon />}
                        <span>{t(item.titleKey)}</span>
                        <ChevronRight className="ml-auto transition-transform group-hover/menu-item:rotate-90" />
                     </SidebarMenuButton>
                     <div className="hidden group-hover/menu-item:block pl-4">
                        <SidebarMenuSub>
                          {item.children.map((sub) => (
                            <SidebarMenuSubItem key={sub.titleKey}>
                              <SidebarMenuSubButton asChild isActive={isActive(sub.url)}>
                                <Link to={sub.url}>
                                  <span>{t(sub.titleKey)}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                     </div>
                   </div>
                ) : (
                   <SidebarMenuButton asChild tooltip={t(item.titleKey)} isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {filterByRole(schoolNav).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('nav.school')}</SidebarGroupLabel>
            <SidebarMenu>
              {filterByRole(schoolNav).map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)} isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{t('nav.management')}</SidebarGroupLabel>
          <SidebarMenu>
            {filterByRole(managementNav).map((item) => (
              <SidebarMenuItem key={item.titleKey}>
                <SidebarMenuButton asChild tooltip={t(item.titleKey)} isActive={isActive(item.url)}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{t(item.titleKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-2"
              onClick={toggleLanguage}
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs">{i18n.language === 'tr' ? 'TR' : 'EN'}</span>
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userDisplayName}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userDisplayName}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('actions.logOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
