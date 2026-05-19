'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBanner({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/notifications/${userId}`);
        if (!res.ok) return; // Do not try to parse if the server returned an error (like 404 HTML)
        const data = await res.json();
        if (Array.isArray(data)) {
          const unread = data.filter(n => !n.is_read);
          setNotifications(unread);
          if (unread.length > 0) {
            window.dispatchEvent(new Event('refreshUserData'));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-md"
          >
            <div className="mt-0.5 text-red-400 shrink-0">
              <Bell size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-200">{notification.message}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase">Trust Score Alert</p>
            </div>
            <button 
              onClick={() => markAsRead(notification.id)}
              className="text-gray-400 hover:text-white shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
