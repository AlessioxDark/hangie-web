import NotificationCard from "@/components/notifications/NotificationCard";
import { useNotification } from "@/contexts/NotificationContext";
import React from "react";

const Notification = () => {
  const { currentNotifications } = useNotification();
  console.log(currentNotifications);
  return (
    <div>
      {currentNotifications.map((notification) => {
        return <NotificationCard {...notification} />;
      })}
    </div>
  );
};

export default Notification;
