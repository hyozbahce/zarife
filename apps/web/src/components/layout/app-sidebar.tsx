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
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useNavigate, Link, useLocation } from "react-router-dom"

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

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: { title: string; url: string }[];
}

const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Content Lab",
    url: "#",
    icon: Sparkles,
    roles: ["PlatformAdmin", "SchoolAdmin"],
    children: [
      { title: "Story Builder", url: "/stories/new" },
      { title: "Asset Library", url: "/assets" },
    ],
  },
  {
    title: "Library",
    url: "/library",
    icon: Library,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    roles: ["PlatformAdmin", "SchoolAdmin", "Teacher"],
  },
]

const schoolNav: NavItem[] = [
  {
    title: "Teacher Hub",
    url: "/school/teacher",
    icon: GraduationCap,
    roles: ["Teacher", "SchoolAdmin"],
  },
  {
    title: "Classes",
    url: "/school/classes",
    icon: GraduationCap,
    roles: ["PlatformAdmin", "SchoolAdmin", "Teacher"],
  },
  {
    title: "Students",
    url: "/school/students",
    icon: Users,
    roles: ["PlatformAdmin", "SchoolAdmin", "Teacher"],
  },
]

const managementNav: NavItem[] = [
  {
    title: "Schools",
    url: "/management/schools",
    icon: School,
    roles: ["PlatformAdmin"],
  },
  {
    title: "Users",
    url: "/management/users",
    icon: Users,
    roles: ["PlatformAdmin", "SchoolAdmin"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                  <span className="truncate font-semibold">Zarife</span>
                  <span className="truncate text-xs">Educational Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {filterByRole(navMain).map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.children ? (
                   <div className="group/menu-item relative">
                     <SidebarMenuButton tooltip={item.title} isActive={item.children.some(c => isActive(c.url))}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform group-hover/menu-item:rotate-90" />
                     </SidebarMenuButton>
                     <div className="hidden group-hover/menu-item:block pl-4">
                        <SidebarMenuSub>
                          {item.children.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(sub.url)}>
                                <Link to={sub.url}>
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                     </div>
                   </div>
                ) : (
                   <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {filterByRole(schoolNav).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>School</SidebarGroupLabel>
            <SidebarMenu>
              {filterByRole(schoolNav).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {filterByRole(managementNav).map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
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
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
