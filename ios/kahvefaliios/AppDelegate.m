/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <CodePush/CodePush.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import "RNFIRMessaging.h"
#import <BugsnagReactNative/BugsnagReactNative.h>
#import "RNFirebaseLinks.h"

@implementation AppDelegate


  - (void)applicationDidBecomeActive:(UIApplication *)application {
    [FBSDKAppEvents activateApp];
  }

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;


#ifdef DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
    jsCodeLocation = [CodePush bundleURL];
#endif


  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"kahvefaliios"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];


  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  [FIROptions defaultOptions].deepLinkURLScheme = @"com.grepsi.kahvefaliios";
  [FIRApp configure];
  [BugsnagReactNative start];
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  return YES;
}
 - (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
 {
     [RNFIRMessaging willPresentNotification:notification withCompletionHandler:completionHandler];
   }

 - (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler
 {
   [RNFIRMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
   }
/*
  - (BOOL)application:(UIApplication *)application
              openURL:(NSURL *)url
    sourceApplication:(NSString *)sourceApplication
           annotation:(id)annotation {

    return [[FBSDKApplicationDelegate sharedInstance] application:application
                                                          openURL:url
                                                sourceApplication:sourceApplication
                                                       annotation:annotation
            ];
  }

    - (BOOL)application:(UIApplication *)application
                openURL:(NSURL *)url
                options:(NSDictionary<NSString *, id> *)options {
      return [[RNFirebaseLinks instance] application:application openURL:url options:options];
    }*/

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey] annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
  
  if (!handled) {
    handled = [[RNFirebaseLinks instance] application:application openURL:url options:options];
  }
  
  return handled;
}

    - (BOOL)application:(UIApplication *)application
    continueUserActivity:(NSUserActivity *)userActivity
     restorationHandler:(void (^)(NSArray *))restorationHandler {
      return [[RNFirebaseLinks instance] application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
    }

@end
