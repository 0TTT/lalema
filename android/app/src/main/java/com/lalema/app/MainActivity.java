package com.lalema.app;

import android.os.Bundle;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

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
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(true);
    }
}
