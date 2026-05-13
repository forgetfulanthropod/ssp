"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scale, KanbanSquare, LayoutDashboard, PlusCircle, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/board", label: "Requests Board", icon: KanbanSquare },
    { href: "/intake", label: "New Request", icon: PlusCircle },
  ]

  return (
    <div className="w-64 border-r bg-muted/30 p-4 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <Scale className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">LegalForge</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex items-center justify-between border-t pt-4 px-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            AL
          </div>
          <div className="text-sm font-medium">Alex (Legal)</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
