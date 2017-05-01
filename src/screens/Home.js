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




export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

  };
}

  static navigationOptions = {
      headerVisible:false
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

        //alert("hey");
      } else {

        this._navigateTo('Login')
        // No user is signed in.
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
