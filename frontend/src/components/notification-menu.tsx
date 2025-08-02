import { useState, useEffect } from "react"
import { BellIcon, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNotifications } from "@/hooks/useNotifications"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  )
}

function getIconForNotificationType(type: string) {
  switch (type) {
    case "request":
      return "📋"
    case "quote":
      return "💰"
    case "booking":
      return "📅"
    case "review":
      return "⭐"
    default:
      return "🔔"
  }
}

export default function NotificationMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  // Refetch notifications when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  const handleNotificationClick = async (id: number, link?: string) => {
    await markAsRead(id)

    if (link) {
      navigate(link)
    }

    setOpen(false)
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await markAllAsRead()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground relative size-8 rounded-full shadow-none"
          aria-label={t("notifications") || "Notifications"}
        >
          <BellIcon size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex items-center justify-center size-5 p-0 text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1 max-h-[420px] overflow-hidden flex flex-col">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2 sticky top-0 bg-background z-10">
          <div className="text-sm font-semibold">
            {t("notifications") || "Notifications"}
          </div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline"
              onClick={handleMarkAllAsRead}
            >
              {t("mark_all_as_read") || "Mark all as read"}
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="bg-border -mx-1 my-1 h-px"
        ></div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            // Loading skeleton
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 p-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            // Notification list
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors cursor-pointer"
                onClick={() =>
                  handleNotificationClick(notification.id, notification.link)
                }
              >
                <div className="relative flex items-start gap-2">
                  <div className="flex-shrink-0 size-8 flex items-center justify-center bg-muted rounded-full">
                    {getIconForNotificationType(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-foreground/90 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="absolute end-0 self-center">
                      <span className="sr-only">Unread</span>
                      <Dot className="text-primary" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>{t("no_notifications") || "No notifications yet"}</p>
              <p className="text-xs max-w-[200px] mt-1">
                {t("notifications_will_appear_here") ||
                  "Notifications about your activity will appear here"}
              </p>
            </div>
          )}
        </div>

        {notifications.length > 5 && (
          <div className="p-2 border-t mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => navigate("/notifications")}
            >
              {t("view_all_notifications") || "View all notifications"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
