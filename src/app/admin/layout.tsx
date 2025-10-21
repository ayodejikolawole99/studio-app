'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Users, Ticket, BarChart3, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/staff', label: 'Staff Management', icon: Users },
    { href: '/admin/tickets', label: 'Ticket Management', icon: Ticket },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
      <SidebarProvider>
          <Sidebar>
              <SidebarContent>
                  <SidebarHeader>
                      <div className="flex items-center gap-2">
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg" width={150} height={30} alt="Logo" className='m-4'/>
                      </div>
                  </SidebarHeader>

                  <SidebarMenu className="flex-grow">
                      {navItems
                        .map((item) => (
                          <SidebarMenuItem key={item.href}>
                              <Link href={item.href}>
                                  <SidebarMenuButton 
                                      isActive={pathname === item.href}
                                      tooltip={item.label}
                                  >
                                      <item.icon />
                                      <span>{item.label}</span>
                                  </SidebarMenuButton>
                              </Link>
                          </SidebarMenuItem>
                      ))}
                  </SidebarMenu>

                  <SidebarFooter>
                  </SidebarFooter>
              </SidebarContent>
          </Sidebar>
          <SidebarInset>
              <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 md:px-6">
                  <SidebarTrigger className="md:hidden" />
                  <div className="flex-1">
                  </div>
              </header>
              <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </SidebarInset>
      </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
