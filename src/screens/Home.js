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

import axios from 'axios';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation'
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import codePush from 'react-native-code-push'
import { Client } from 'bugsnag-react-native';

const bugsnag = new Client();

//import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';

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
    firebase.analytics().setAnalyticsCollectionEnabled(true)
    const { navigate } = this.props.navigation;

    var init = false;

    codePush.sync({ installMode: codePush.InstallMode.ON_NEXT_RESUME });
    firebase.auth().onAuthStateChanged(function(user) {

      if (user) {
        firebase.analytics().setUserId(user.uid)
        if(!init){

          this._navigateTo('Greeting')
          init = true;

        }
          //this._navigateTo('Greeting')
          firebase.messaging().getToken()
          .then(fcmToken => {
            if (fcmToken) {
              axios.post('https://eventfluxbot.herokuapp.com/webhook/saveNotiToken', {
                uid: user.uid,
                token: fcmToken
              })
              .then( (response) => {

              })
              .catch(function (error) {

              });
            } else {
              // user doesn't have a device token yet
            }
          });

          firebase.messaging().requestPermission()
            .then(() => {
              firebase.messaging().getToken()
              .then(fcmToken => {
                if (fcmToken) {
                  axios.post('https://eventfluxbot.herokuapp.com/webhook/saveNotiToken', {
                    uid: user.uid,
                    token: fcmToken
                  })
                  .then( (response) => {

                  })
                  .catch(function (error) {

                  });
                } else {
                  // user doesn't have a device token yet
                }
              });
            })
            .catch(error => {
              // User has rejected permissions
            });

          /*
             FCM.getFCMToken().then(token => {

               axios.post('https://eventfluxbot.herokuapp.com/webhook/saveNotiToken', {
                 uid: user.uid,
                 token: token
               })
               .then( (response) => {

               })
               .catch(function (error) {

               });

                 // store fcm token in your server
             });

             this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
                 //console.log(token)
                 axios.post('https://eventfluxbot.herokuapp.com/webhook/saveNotiToken', {
                   uid: user.uid,
                   token: token
                 })
                 .then( (response) => {

                 })
                 .catch(function (error) {

                 });

             });*/
        //alert("hey");
      } else {

        this._navigateTo('Swipers')
        init = true;
      }
    }.bind(this));

    // for iOS
  }
componentWillUnmount() {

}

  render() {
    return (
      <Image source={require('../static/images/background.png')} style={styles.container}>
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
