package com.olcanaskar.mylibrary;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView == null) {
            return;
        }

        // Keep the page above the Android navigation bar instead of letting the
        // bottom shelf render underneath the system buttons.
        webView.setBackgroundColor(Color.rgb(0x15, 0x0d, 0x06));
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets navigation = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars());
            view.setPadding(
                view.getPaddingLeft(),
                view.getPaddingTop(),
                view.getPaddingRight(),
                navigation.bottom
            );
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }
}
