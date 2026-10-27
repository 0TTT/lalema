package com.lalema.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * 如厕计时前台服务：进入后台后仍在通知栏实时显示计时，并可通过「结束」按钮结束。
 */
public class TimerService extends Service {
    public static final String ACTION_STOP = "com.lalema.app.action.STOP";
    private static final String CHANNEL_ID = "timer_channel";
    private static final int NOTIF_ID = 1001;

    private long startAt = System.currentTimeMillis();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            updateNotification();
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "如厕计时", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(ch);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            long s = startAt;
            handler.removeCallbacks(tick);
            stopForeground(true);
            stopSelf();
            if (NativeTimerPlugin.instance != null) {
                NativeTimerPlugin.instance.notifyFinished(s);
            }
            return START_NOT_STICKY;
        }
        if (intent != null) {
            startAt = intent.getLongExtra("startAt", System.currentTimeMillis());
        }
        startForegroundCompat();
        updateNotification();
        handler.removeCallbacks(tick);
        handler.postDelayed(tick, 1000);
        return START_STICKY;
    }

    private void startForegroundCompat() {
        Notification n = buildNotification("00:00");
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIF_ID, n);
        }
    }

    private String format(long sec) {
        long h = sec / 3600;
        long m = (sec % 3600) / 60;
        long s = sec % 60;
        if (h > 0) return String.format("%d:%02d:%02d", h, m, s);
        return String.format("%02d:%02d", m, s);
    }

    private Notification buildNotification(String text) {
        Intent stopIntent = new Intent(this, TimerService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(
            this, 1, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent openIntent = new Intent(this, MainActivity.class);
        PendingIntent openPi = PendingIntent.getActivity(
            this, 2, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("正在记录…")
            .setContentText("计时 " + text)
            .setContentIntent(openPi)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addAction(0, "结束", stopPi)
            .build();
    }

    private void updateNotification() {
        long elapsed = Math.max(0, (System.currentTimeMillis() - startAt) / 1000);
        NotificationManagerCompat.from(this).notify(NOTIF_ID, buildNotification(format(elapsed)));
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(tick);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
