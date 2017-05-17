import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  NetInfo,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Platform,
  Image,
} from 'react-native';



import { NavigationActions } from 'react-navigation'
import firebase from 'firebase';
import Backend from '../Backend';
import { Client } from 'bugsnag-react-native';

const bugsnag = new Client();

import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

  };
}

  static navigationOptions = {
      header:null
    };

    _navigateTo = (routeName: string) => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName,params: {title:"homedan"} })]
        })
        this.props.navigation.dispatch(resetAction)
      }

  componentDidMount() {
    const { navigate } = this.props.navigation;
   var init = false;
    firebase.auth().onAuthStateChanged(function(user) {

      if (user) {


        if(!init){
          this._navigateTo('Greeting')
          init = !init;
        }
          //this._navigateTo('Greeting')
          FCM.requestPermissions(); // for iOS
             FCM.getFCMToken().then(token => {

                 fetch('https://eventfluxbot.herokuapp.com/webhook/saveNotiToken', {
                   method: 'POST',
                   headers: {
                     'Accept': 'application/json',
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({
                     uid: user.uid,
                     token: token
                   })
                 })
                 // store fcm token in your server
             });
             this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
               //alert(JSON.stringify(notif))
                 // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
                 if(notif.local_notification){
                   //this is a local notification
                 }
                 if(notif.opened_from_tray){
                   //app is open/resumed because user clicked banner
                 }

                 if(Platform.OS ==='ios'){
                   //optional
                   //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
                   //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
                   //notif._notificationType is available for iOS platfrom
                   switch(notif._notificationType){
                     case NotificationType.Remote:
                       notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                       break;
                     case NotificationType.NotificationResponse:
                       notif.finish();
                       break;
                     case NotificationType.WillPresent:
                       notif.finish(WillPresentNotificationResult.None) //other types available: WillPresentNotificationResult.None
                       break;
                   }
                 }
             });
             this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
                 console.log(token)
                 fetch('https://eventfluxbot.herokuapp.com/webhook/saveNotiToken', {
                   method: 'POST',
                   headers: {
                     'Accept': 'application/json',
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({
                     uid: user.uid,
                     token: token
                   })
                 })
             });
        //alert("hey");
      } else {

        this._navigateTo('Login')
        init = !init;
      }
    }.bind(this));

    NetInfo.isConnected.fetch().then(isConnected => {
      //alert('First, is ' + (isConnected ? 'online' : 'offline'));
    });
    function handleFirstConnectivityChange(isConnected) {
      //alert('Then, is ' + (isConnected ? 'online' : 'offline'));
      NetInfo.isConnected.removeEventListener(
        'change',
        handleFirstConnectivityChange
      );
    }
    NetInfo.isConnected.addEventListener(
      'change',
      handleFirstConnectivityChange
    );
  }
componentWillUnmount() {

}

  render() {
    return (
      <Image source={require('../static/images/splashscreenfinal.jpg')} style={styles.container}>
      </Image>
    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
});
