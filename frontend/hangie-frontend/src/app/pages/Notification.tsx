import NotificationCard from "@/components/notifications/NotificationCard";
import { useNotification } from "@/contexts/NotificationContext";
import React, { useEffect, useMemo, useState } from "react";

const Notification = () => {
  const { currentNotifications, markAllAsRead } = useNotification();
  console.log(currentNotifications);
  useEffect(() => {
    if (currentNotifications?.unread?.length > 0) {
      markAllAsRead();
    }
  }, []); // Eseguito solo una volta al montaggio della pagina
  const allNotifications = useMemo(() => {
    const combined = [
      ...(currentNotifications?.unread || []),
      ...(currentNotifications?.read || []),
    ];

    // Ordiniamo per data
    return combined.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [currentNotifications]); // <--- Dipendenza fondamentale
  return (
    <div>
      <div>
        <h1>Tutte le notifiche</h1>
        <div className="space-y-2 overflow-y-auto">
          {allNotifications.length > 0 ? (
            allNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.message_id || index}
                {...notification}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">
              Nessuna notifica presente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
