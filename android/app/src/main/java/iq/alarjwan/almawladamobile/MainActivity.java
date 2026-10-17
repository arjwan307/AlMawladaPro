package iq.alarjwan.almawladamobile;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.widget.*;
import android.view.*;
import android.content.*;
import android.net.Uri;
public class MainActivity extends Activity {
 WebView web; LinearLayout root; EditText address;
 @Override public void onCreate(Bundle b){super.onCreate(b);root=new LinearLayout(this);root.setOrientation(1);root.setPadding(16,16,16,16);setContentView(root);
 address=new EditText(this);address.setSingleLine(true);address.setHint("http://100.x.y.z:3187/mobile/connect?key=...");address.setText(getPreferences(0).getString("url",""));root.addView(address);
 Button connect=new Button(this);connect.setText("اتصال آمن بالمولدة برو");root.addView(connect);
 TextView note=new TextView(this);note.setText("يتطلب اتصال VPN خاصاً بالكمبيوتر. لا تضع عنواناً عاماً أو رمزاً من شخص غير موثوق.");root.addView(note);
 web=new WebView(this);root.addView(web,new LinearLayout.LayoutParams(-1,0,1));WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);
 web.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView view,String url){return !allowed(url);}});
 connect.setOnClickListener(v->{String u=address.getText().toString().trim();if(!allowed(u)){Toast.makeText(this,"يُسمح بعنوان Tailscale الخاص فقط (100.64.0.0/10)",Toast.LENGTH_LONG).show();return;}getPreferences(0).edit().putString("url",u).apply();web.loadUrl(u);});
 }
 boolean allowed(String u){try{Uri uri=Uri.parse(u);String host=uri.getHost();if(host==null||!"http".equals(uri.getScheme())||uri.getPort()!=3187)return false;String[] a=host.split("\\.");if(a.length!=4)return false;int x=Integer.parseInt(a[0]),y=Integer.parseInt(a[1]);return x==100&&y>=64&&y<=127;}catch(Exception e){return false;}}
 @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
}
