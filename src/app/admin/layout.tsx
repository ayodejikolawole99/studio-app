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
import { Users, Ticket, BarChart3, Settings, LayoutDashboard, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/staff', label: 'Staff Management', icon: Users },
    { href: '/admin/tickets', label: 'Ticket Management', icon: Ticket },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A'; // Anonymous
    return name.split(' ').map(n => n[0]).join('');
  }

  if (isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Authenticating...</p>
        </div>
    );
  }

  // Once loading is complete, if there's still no user, redirect to login.
  if (!user) {
    // Using useEffect to handle redirection in a client component
    // after the initial render cycle.
    React.useEffect(() => {
        router.push('/login');
    }, [router]);
    
    // Render a loading/redirecting state
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }

  const userName = user.displayName || user.email || 'Anonymous User';
  const userEmail = user.email || `uid: ${user.uid}`;

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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="justify-start gap-2 p-2 h-auto w-full">
                                  <Avatar className="h-8 w-8">
                                      <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                                  </Avatar>
                                  <div className="text-left group-data-[collapsible=icon]:hidden">
                                      <p className="font-medium text-sm">{userName}</p>
                                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                                  </div>
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent side="right" align="start">
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Profile</DropdownMenuItem>
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={handleLogout}>
                            Log out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </SidebarFooter>
              </SidebarContent>
          </Sidebar>
          <SidebarInset>
              <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 md:px-6">
                  <SidebarTrigger className="md:hidden" />
                  <div className="flex-1">
                      {/* Header content can go here */}
                  </div>
                  <Button variant="ghost" size="icon">
                      <Settings />
                      <span className="sr-only">Settings</span>
                  </Button>
              </header>
              <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </SidebarInset>
      </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // FirebaseProvider is now in the root layout, so it's available here.
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
