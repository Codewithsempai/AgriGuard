import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { NotificationItem } from '../types';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

export const Notifications: React.FC = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    api.getNotifications()
      .then(setNotifications)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_notifications')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பண்ணை பணிகள், தாமதமான நடவடிக்கைகள் மற்றும் பாதுகாப்பு எச்சரிக்கைகள்'
              : 'Alerts regarding overdue crop activities, irrigation schedules, and weather warnings.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-xs self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            <span>{t('btn_mark_all_read')}</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4.5 transition glass-card flex items-start justify-between gap-4 ${
                item.is_read
                  ? 'border-slate-200/80 bg-white opacity-70 dark:border-slate-800 dark:bg-slate-900'
                  : 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-xl p-2 shrink-0 ${
                  item.title.toLowerCase().includes('overdue')
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${item.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {item.created_at?.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
              </div>

              {!item.is_read && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold shrink-0"
                  title={t('btn_mark_read')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={language === 'ta' ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No notifications'}
          description={language === 'ta' ? 'உங்கள் பண்ணை பணிகள் சரியான நேரத்தில் உள்ளன!' : 'You are all caught up! No overdue activities or warnings.'}
        />
      )}
    </div>
  );
};
