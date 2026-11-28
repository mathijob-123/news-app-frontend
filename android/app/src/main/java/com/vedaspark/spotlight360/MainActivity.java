package com.vedaspark.spotlight360;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Switch immediately from splash screen theme to regular theme
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);

        try {
            Window window = getWindow();

            // Clear translucent status bar to prevent webview from rendering behind status bar
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

            // Clean solid white status bar & navigation bar
            window.setStatusBarColor(Color.WHITE);
            window.setNavigationBarColor(Color.WHITE);

            // Dark icons for status bar and navigation bar
            WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(window, window.getDecorView());
            if (insetsController != null) {
                insetsController.setAppearanceLightStatusBars(true);
                insetsController.setAppearanceLightNavigationBars(true);
            }

            // Enforce decor fits system windows so app never renders underneath status bar on ANY phone
            WindowCompat.setDecorFitsSystemWindows(window, true);

            // Apply insets listener to ensure root content is strictly within safe display boundaries
            View contentView = findViewById(android.R.id.content);
            if (contentView != null) {
                contentView.setFitsSystemWindows(true);
                ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                    Insets insets = windowInsets.getInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                    );
                    v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
                    return windowInsets;
                });
                ViewCompat.requestApplyInsets(contentView);
            }

            // Webview settings, fitsSystemWindows, media and storage optimization
            configureWebViewMediaSettings(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        configureWebViewMediaSettings(false);
    }

    private void configureWebViewMediaSettings(boolean applyInsets) {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                View webView = this.bridge.getWebView();
                if (applyInsets) {
                    webView.setFitsSystemWindows(true);
                }
                WebSettings settings = this.bridge.getWebView().getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setAllowFileAccess(true);
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
