package com.lalema.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * 如厕计时前台服务。
 *
 * 上流体云的关键：使用 Chronometer 机制（setUsesChronometer + setWhen + setShowWhen），
 * 计时跳动由系统时钟（SystemUI）自动重绘，严禁每秒 notify()。
 */
public class TimerService extends Service {
    public static final String ACTION_STOP = "com.lalema.app.action.STOP";
    public static final String ACTION_PAUSE = "com.lalema.app.action.PAUSE";
    public static final String ACTION_RESUME = "com.lalema.app.action.RESUME";

    private static final String CHANNEL_ID = "timer_channel";
    private static final int NOTIF_ID = 1001;

    private long startAt = System.currentTimeMillis();
    private boolean paused = false;
    private long pausedElapsedMs = 0;

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
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }
        String action = intent.getAction();
        if (ACTION_STOP.equals(action)) {
            long s = startAt;
            stopForeground(true);
            stopSelf();
            if (NativeTimerPlugin.instance != null) {
                NativeTimerPlugin.instance.notifyFinished(s);
            }
            return START_NOT_STICKY;
        }
        if (ACTION_PAUSE.equals(action)) {
            paused = true;
            pausedElapsedMs = intent.getLongExtra("elapsedMs", 0);
            notifyNow();
            return START_NOT_STICKY;
        }
        if (ACTION_RESUME.equals(action)) {
            paused = false;
            startAt = intent.getLongExtra("anchor", System.currentTimeMillis());
            notifyNow();
            return START_NOT_STICKY;
        }
        // 默认：开始计时
        paused = false;
        startAt = intent.getLongExtra("startAt", System.currentTimeMillis());
        startForegroundCompat();
        return START_NOT_STICKY;
    }

    private void startForegroundCompat() {
        Notification n = buildNotification();
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

    private Notification buildNotification() {
        Intent stopIntent = new Intent(this, TimerService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(
            this, 1, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent openIntent = new Intent(this, MainActivity.class);
        PendingIntent openPi = PendingIntent.getActivity(
            this, 2, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("正在记录…")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setContentIntent(openPi)
            .addAction(0, "结束", stopPi);

        if (paused) {
            // 暂停：冻结 Chronometer，显示定格时间
            b.setContentText("已暂停 · " + format(pausedElapsedMs / 1000));
            b.setUsesChronometer(false);
            b.setShowWhen(false);
        } else {
            // 运行：交给系统 Chronometer 自动计时，流体云据此识别并上浮
            b.setContentText("上厕所中");
            b.setUsesChronometer(true);
            b.setChronometerCountDown(false);
            b.setWhen(startAt);
            b.setShowWhen(true);
        }
        return b.build();
    }

    private void notifyNow() {
        NotificationManagerCompat.from(this).notify(NOTIF_ID, buildNotification());
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
