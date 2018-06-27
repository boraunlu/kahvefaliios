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
    console.log(firebase.database().app.name);
    const { navigate } = this.props.navigation;

    var init = false;
    firebase.auth().onAuthStateChanged(function(user) {

      if (user) {

        if(!init){

          this._navigateTo('Greeting')
          init = true;

        }
          //this._navigateTo('Greeting')

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

             });
        //alert("hey");
      } else {

        this._navigateTo('Swipers')
        init = true;
      }
    }.bind(this));

    FCM.requestPermissions(); // for iOS
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
