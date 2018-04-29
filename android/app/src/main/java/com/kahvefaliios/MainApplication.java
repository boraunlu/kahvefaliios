package com.kahvefaliios;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactlibrary.googlesignin.RNGoogleSignInPackage;
import org.reactnative.camera.RNCameraPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.sbugert.rnadmob.RNAdMobPackage;
import com.beefe.picker.PickerViewPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.bugsnag.BugsnagReactNative;
import com.microsoft.codepush.react.CodePush;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNGoogleSignInPackage(),
            new RNCameraPackage(),
            new ImageResizerPackage(),
            new FIRMessagingPackage(),
            new RNAdMobPackage(),
            new PickerViewPackage(),
            new VectorIconsPackage(),
            BugsnagReactNative.getPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new RNFetchBlobPackage(),
            new RNSoundPackage(),
            new ReactVideoPackage(),
            new RCTCameraPackage(),
            new FBSDKPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
