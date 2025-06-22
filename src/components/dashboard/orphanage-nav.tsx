"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/db/utils"
import { Icons } from "@/components/icons"

export function OrphanageNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  const items = [
    {
      href: "/dashboard/orphanage",
      label: "Overview",
      icon: "dashboard",
    },
    {
      href: "/dashboard/orphanage/children",
      label: "Children",
      icon: "users",
    },
    {
      href: "/dashboard/orphanage/courses",
      label: "Courses",
      icon: "book",
    },
    {
      href: "/dashboard/orphanage/volunteers",
      label: "Volunteers",
      icon: "handHeart",
    },
    {
      href: "/dashboard/orphanage/activities",
      label: "Activities",
      icon: "calendar",
    },
  ]

  return (
    <nav
      className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}
      {...props}
    >
      {items.map((item) => {
        const Icon = Icons[item.icon as keyof typeof Icons]
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-muted/50",
              "transition-colors"
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
