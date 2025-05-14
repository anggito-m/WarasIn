"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Smile,
  BookOpen,
  MessageSquare,
  Share2,
  BarChart2,
  LogOut,
} from "lucide-react";

const menuItems = [
  { id: "resource-hub", label: "Resource Hub", icon: Share2, url: "/main" },
  {
    id: "mood-analyzer",
    label: "Mood Analyzer",
    icon: Smile,
    url: "/main/mood-analyzer",
  },
  {
    id: "smart-journal",
    label: "Smart Journal",
    icon: BookOpen,
    url: "/main/smart-journal",
  },
  {
    id: "anonym-chatbot",
    label: "Anonym Chatbot",
    icon: MessageSquare,
    url: "/main/anonym-chatbot",
  },
  {
    id: "monitoring",
    label: "Monitoring, report, & Visualization",
    icon: BarChart2,
    url: "/main/monitoring",
  },
];

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const router = useRouter();
  // Fungsi untuk menentukan item aktif dengan lebih akurat
  const getActiveItem = () => {
    // Cari exact match terlebih dahulu
    const exactMatch = menuItems.find((item) => pathname === item.url);
    if (exactMatch) return exactMatch.id;

    // Jika tidak ada exact match, cari partial match
    const partialMatch = menuItems.find(
      (item) => item.url !== "/main" && pathname.startsWith(item.url)
    );

    return partialMatch?.id || "resource-hub";
  };

  const activeItem = getActiveItem();

  const handleLogout = () => {
    // Tambahkan logika logout di sini
    console.log("User logged out");
    // Contoh: redirect ke halaman login
    router.push("/");
  };

  return (
    <Sidebar
      className="w-64 bg-muted bg-blue-600 text-white"
      collapsible="icon"
      {...props}
    >
      <SidebarContent>
        <div className="p-4 flex justify-center items-center">
          <Image
            src="/logo-white.svg"
            alt="Warasin Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xl px-4 text-white">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild isActive={activeItem === item.id}>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeItem === item.id
                          ? "bg-white text-blue-600" // Ganti dengan style active yang lebih jelas
                          : "hover:bg-blue-700 text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t border-blue-500">
        <SidebarFooter>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
