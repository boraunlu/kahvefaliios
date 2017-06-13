import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  View,
  Image,
  Modal,
  Dimensions,
  Picker,
  Animated,
  Button,
  Easing,
  Alert,
  Keyboard
} from 'react-native';



import Icon from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video'
//import Picker from 'react-native-picker'
import { Form,
  Separator,InputField, LinkField,
  SwitchField, PickerField,DatePickerField,TimePickerField
} from 'react-native-form-generator';


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
      imageVisibility:0,
      anonacik:false,
      gender:null,
      name:null,
      formData:{},
      keyboardOn:false,
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

    handleFormChange = (formData) => {
      /*
      formData will contain all the values of the form,
      in this example.

      formData = {
      first_name:"",
      last_name:"",
      gender: '',
      birthday: Date,
      has_accepted_conditions: bool
      }
      */

      this.setState({formData:formData})
      this.props.onFormChange && this.props.onFormChange(formData);
    }
    handleFormFocus = (e, component) => {
      //console.log(e, component);
    }


_keyboardDidShow = (event) => {

    this.setState({keyboardOn: true});

  }
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
  renderanongiris = () => {
    if (this.state.anonacik) {
            return (

          <View style={{flex: 1,marginTop:30,height:121}}>
            <View style={{height: 40,flexDirection:'row'}}>
              <View style={{paddingLeft:10,paddingRight:10,width:Dimensions.get('window').width/3,backgroundColor:'white',height:40,justifyContent:'center'}}><Text style={{fontSize:17}}>İsminiz</Text></View>
              <TextInput style={{height: 40, flexGrow:1,backgroundColor:'white'}}
                onChangeText={(text) => this.setState({name:text})}
                clearTextOnFocus={true}
                maxLength={20}
                placeholder={'İsminizi buraya yazabilirsiniz'}
                >
              </TextInput>

            </View>
            <View style={{height: 80,flexDirection:'row',borderTopWidth:2,borderColor:'gray'}}>
              <View style={{paddingLeft:10,paddingRight:10,height: 80,width:Dimensions.get('window').width/3,backgroundColor:'white',height:80,justifyContent:'center'}}><Text style={{fontSize:17}}>Cinsiyetiniz</Text></View>
              <View style={{flex: 1,flexGrow:1,height: 80,flexDirection:'row'}}>
                <TouchableHighlight style={this.state.gender=="male" ? styles.malesecili : styles.malesecilidegil} onPress={() => {this.setState({gender:"male"})}}><Image style={styles.cinsiyetfoto} source={require('../static/images/boy.png')}></Image>
                </TouchableHighlight>
                <TouchableHighlight style={this.state.gender=="female" ? styles.femalesecili : styles.femalesecilidegil} onPress={() => {this.setState({gender:"female"})}}><Image style={styles.cinsiyetfoto} source={require('../static/images/girl.png')}></Image>
                </TouchableHighlight>
              </View>
            </View>
            <Button
              onPress={() => {this.loginAnonly()}}
              title="Devam >"
              color="#808080"
            />
          </View>
            );
        } else {
            return (
            <TouchableOpacity onPress={() => {this.setState({anonacik:true})}} style={{marginTop:30,backgroundColor:'rgba(0, 0, 0, 0.5)',borderColor:'white',borderWidth:1,padding:5,borderRadius:5,marginRight:Dimensions.get('window').width/6,marginLeft:Dimensions.get('window').width/6}}>
             <Text style={{fontSize:17,color:'white',textAlign:'center',backgroundColor:'transparent',textDecorationLine:'underline'}}>Facebook hesabım yok</Text>
            </TouchableOpacity>
          );
        }
  }

  loginAnonly = () => {
    if(this.state.name==null||this.state.name.length<3){
      if(this.state.gender==null){
        Alert.alert('Kahve Falı Sohbeti','Lütfen ismini ve cinsiyetini girer misin?')
      }
      else{
        Alert.alert('Kahve Falı Sohbeti','Lütfen ismini girer misin?')
      }
    }
    else{
      if(this.state.gender==null){
        Alert.alert('Kahve Falı Sohbeti','Lütfen cinsiyetini girer misin?')
      }
      else{

        firebase.auth().signInAnonymously().then(function(user){
            alert(user.uid)
          user.updateProfile({
            displayName: this.state.name,
          })
          fetch('https://eventfluxbot.herokuapp.com/appapi/anonlogin', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              name: this.state.name,
              gender:this.state.gender
            })
          })
          .then((response) => this._navigateTo('Swipers'))
        }.bind(this)).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
      }
    }
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

      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
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

         <View style={ this.state.keyboardOn ? styles.keyboardAcik : styles.keyboardKapali }>
           <Icon.Button name="facebook"  style={styles.fbloginbutton} backgroundColor="#3b5998" onPress={()=>{this.newLogin()}}>
             <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>Facebook ile giriş yap</Text>
           </Icon.Button>




          </View>

          {this.renderanongiris()}
          <TouchableHighlight style={{width:Dimensions.get('window').width,alignItems:'center',position: 'absolute',bottom: 0}} onPress={() => {this.navigateto('Kimiz')}}><Text style={{textAlign:'center',textDecorationLine:'underline',fontSize:16,paddingBottom:10}}>Biz Kimiz?</Text></TouchableHighlight>
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
  keyboardAcik:{

    paddingTop:(Dimensions.get('window').height)/10,paddingRight:Dimensions.get('window').width/6,paddingLeft:Dimensions.get('window').width/6
  },
  keyboardKapali:{
    paddingTop:(Dimensions.get('window').height)/4,paddingRight:Dimensions.get('window').width/6,paddingLeft:Dimensions.get('window').width/6
  },
  malesecili:{
    height:80,
    flex:1,

    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'lemonchiffon'
  },
  malesecilidegil:{
    height:80,
    flex:1,
    borderRightWidth:1,
    borderColor:'gray',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'white'
  },
  femalesecili:{
    height:80,
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'lemonchiffon'
  },
  femalesecilidegil:{
    height:80,
    flex:1,
    borderLeftWidth:1,
    borderColor:'gray',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'white'
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  cinsiyetfoto:{
    height:60,
    width:60,
  }
});
