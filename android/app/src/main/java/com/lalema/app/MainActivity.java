package com.lalema.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeTimerPlugin.class);
        super.onCreate(savedInstanceState);
        setStatusBarDarkText();
    }

    /** 状态栏文字/图标强制为深色（适配浅色背景） */
    private void setStatusBarDarkText() {
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            window.setStatusBarColor(Color.TRANSPARENT);
            if (window.getInsetsController() != null) {
                window.getInsetsController().setAppearanceLightStatusBars(true);
            }
        } else if (Build.VERSION.SDK_INT >= 23) {
            window.getDecorView().setSystemUiVisibility(
                window.getDecorView().getSystemUiVisibility() | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            );
        }
    }
}
