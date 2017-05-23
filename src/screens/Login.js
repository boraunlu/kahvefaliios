import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Modal,
  Dimensions
} from 'react-native';



import Icon from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video'

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
  LoginManager,
} = FBSDK;


import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'


export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageVisibility:0
  };
  this.navigateto = this.navigateto.bind(this);
  this._navigateTo = this._navigateTo.bind(this);
}

  static navigationOptions = {
      header:null
    };

  onVideoLoadError = () => {
    this.setState({imageVisibility:1})
  }

  onPickerChange = (key: string, value: string) => {
      const newState = {};
      newState[key] = value;
      this.setState(newState);
    };

  newLogin = () => {

    LoginManager.logInWithReadPermissions(['public_profile']).then(
      function(result) {
        if (result.isCancelled) {

        } else {
          if(result.grantedPermissions){

            AccessToken.getCurrentAccessToken().then(
              (data) => {
                // Build Firebase credential with the Facebook access token.
                var token=data.accessToken;
                var credential = firebase.auth.FacebookAuthProvider.credential(token);

                // Sign in with credential from the Google user.
                firebase.auth().signInWithCredential(credential).then(function(user){

                  fetch('https://eventfluxbot.herokuapp.com/webhook/appsignin', {
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
                  .then((response) => this._navigateTo('Swipers'))

                }.bind(this))
                .catch(function(error) {
                  // Handle Errors here.
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  // The email of the user's account used.
                  var email = error.email;
                  // The firebase.auth.AuthCredential type that was used.
                  var credential = error.credential;
                  // ...

                });
              }
            )
          }
        }
      }.bind(this),
      function(error) {

      }
    );
  }

  navigateto = (destination) => {
    const { navigate } = this.props.navigation;
    navigate(destination)
  }

  _navigateTo = (routeName: string,params) => {
      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName,params: params })]
      })
      this.props.navigation.dispatch(resetAction)
    }

  componentDidMount() {

  }

  render() {

    return (

      <View style={{flex:1}}>

        <Video
         repeat
         resizeMode='cover'
         source={require('../static/appfinalvideo.mp4')}
         style={styles.backgroundVideo}
         onError={() => {this.onVideoLoadError()}}
       />

            <View style={{paddingTop:10,paddingBottom:10,backgroundColor:'transparent'}}>
              <Text style={{paddingTop:40,color:'white',fontSize:40,textAlign:'center',fontFamily:'Courgette'}}>
                Kahve Falı Sohbeti
              </Text>
              <Text style={{color:'white',textAlign:'center'}}>
                Bambaşka bir fal deneyimi
                </Text>
          </View>
         <View style={{marginTop:(Dimensions.get('window').height)/5,paddingTop:(Dimensions.get('window').height)/4,paddingRight:Dimensions.get('window').width/6,paddingLeft:Dimensions.get('window').width/6}}>
           <Icon.Button name="facebook"  style={styles.fbloginbutton} backgroundColor="#3b5998" onPress={()=>{this.newLogin()}}>
             <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>Facebook ile giriş yap</Text>
           </Icon.Button>

          </View>

      </View>


    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column-reverse',
    paddingBottom:Dimensions.get('window').height/8,
    alignSelf: 'stretch',
    width: null,
    padding:5,
  },
  fbloginbutton:{
    justifyContent:'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
