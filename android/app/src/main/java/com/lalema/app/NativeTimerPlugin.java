package com.lalema.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeTimer")
public class NativeTimerPlugin extends Plugin {
    public static NativeTimerPlugin instance;
    private static final int REQ_NOTIF = 2001;

    @Override
    public void load() {
        instance = this;
    }

    @PluginMethod
    public void start(PluginCall call) {
        long startAt = call.getLong("startAt", System.currentTimeMillis());
        Intent i = new Intent(getContext(), TimerService.class);
        i.putExtra("startAt", startAt);
        getContext().startForegroundService(i);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), TimerService.class));
        call.resolve();
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33) {
            if (getContext().checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                if (getActivity() != null) {
                    getActivity().requestPermissions(
                        new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF
                    );
                }
            }
        }
        call.resolve();
    }

    /** 由前台服务在用户点「结束」时回调，通知 JS 层 */
    public void notifyFinished(long startAt) {
        JSObject data = new JSObject();
        data.put("startAt", startAt);
        notifyListeners("finished", data);
    }
}
