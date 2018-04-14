import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Button,
  TextInput,
  ActionSheetIOS,
  Keyboard,
  Modal,
  Alert,
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Picker from 'react-native-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import ProfilePicker from '../components/ProfilePicker';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import ImageResizer from 'react-native-image-resizer';
import ProgressBar from 'react-native-progress/Bar';


import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';


@inject("userStore")
@observer
export default class FalseverProfil extends React.Component {
  constructor(props) {
    super(props);
    this._images = [];
    this.state = {

      profPhoto:'https://www.peerspace.com/web-templates/assets/images/no_avatar_placeholder.png',
      userName:null,
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!',
      email:'',
      kendi:'',
      radioValue:0,
      pickerVisible: false,
      cameraVisible: false,
      spinnerVisible:false,
      bio:this.props.userStore.bio
  };
}

  static navigationOptions = {
      title: 'Profilin',
      tabBarLabel: 'Profil',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="user" color={tintColor} size={25} />
       ),
    };



  componentDidMount() {

    var user = firebase.auth().currentUser;

    if(user.photoURL){

      this.setState({profPhoto:user.photoURL})

    }
    if(user.displayName){
        this.setState({userName:user.displayName})
    }

    /*
    fetch('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
      })
    })
    .then((response) => response.json())
     .then((responseJson) => {
       //alert(JSON.stringify(responseJson));
          this.setState({userData:responseJson});
         //alert(JSON.stringify(responseJson))

     })*/
  }


  componentWillUnmount() {


  }



  render() {


    if(this.state.profinfo){
      var infoText=""
      this.state.profinfo.age?infoText=infoText+this.state.profinfo.age+" yaşında":null
      this.state.profinfo.iliski?infoText=infoText+", "+this.state.profinfo.iliski:null
      this.state.profinfo.meslek?infoText=infoText+", "+this.state.profinfo.meslek:null
      var falPuan =this.state.profinfo.falPuan
      var seviye = 1
      var limit =20
      var gosterilenpuan=falPuan
      var unvan = "Yeni Falsever"
      var kolor='rgb(209,142,12)'
      if (falPuan>20&&falPuan<51){
        seviye = 2
        limit = 30
        gosterilenpuan=falPuan-20
        unvan = "Falsever"
        kolor='rgb(60,179,113)'
      }else if (falPuan>50&&falPuan<101) {
        seviye = 3
        limit = 50
        gosterilenpuan=falPuan-50
        unvan = "Deneyimli Falsever"
        kolor='rgb(114,0,218)'
      }else if (falPuan>100&&falPuan<176) {
        seviye = 4
        limit = 75
        gosterilenpuan=falPuan-100
        unvan = "Fal Uzmanı"
        kolor='rgb(0,185,241)'
      }
      else if (falPuan>175) {
        seviye = 5
        limit = 12500
        gosterilenpuan=falPuan
        unvan = "Fal Profesörü"
        kolor='rgb(249,50,12)'
      }
      return(
      <View>
        <ImageBackground style={{backgroundColor:'transparent',alignSelf:'center',height:94,width:94,paddingTop:7}} source={require('../static/images/cerceve.png')}>
          <Image style={{backgroundColor:'transparent',alignSelf:'center',height:80,width:80, borderRadius:40}} source={this.state.profinfo.profile_pic}></Image>
        </ImageBackground>
        <Text style={{alignSelf:'center',marginBottom:5,fontWeight:'bold',color:'black',fontSize:18}}>{this.state.profinfo.name}</Text>
        <Text style={{alignSelf:'center'}}>{infoText}</Text>
        {this.state.profinfo.city? <Text style={{position:'absolute',right:10,fontSize:14}}>{"📍 "+this.state.profinfo.city}</Text>:null}
        {this.state.profinfo.bio? <Text style={{alignSelf:'center',marginTop:10,fontStyle:'italic',color:'darkslategray',fontSize:14}}>{'"'+this.state.profinfo.bio+'"'}</Text>:null}
        <View style={{alignSelf:'center',alignItems:'center',marginTop:20,flexDirection:'row'}}>
          <Text style={{fontSize:16,color:kolor,fontWeight:'bold'}}>{unvan}</Text>
        </View>
        <View style={{alignSelf:'center',alignItems:'center',marginTop:10,marginBottom:15}}>
          <View style={{justifyContent:'center'}}>
            <View style={{position:'absolute',zIndex: 3,left:-40,justifyContent:'center',height:30,width:30,borderRadius:15,backgroundColor:kolor}}><Text style={{fontSize:18,backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>{seviye}</Text></View>
            <View style={{height:24,width:200,borderWidth:3,borderColor:kolor}}>
              <View style={{height:21,width:200*(gosterilenpuan/limit),backgroundColor:kolor}}>
              </View>
            </View>
          </View>
          <Text style={{}}>{gosterilenpuan+"/"+limit+" FalPuan"}</Text>
        </View>
        {this.state.profinfo.sosyal? this.renderKendiFali(this.state.profinfo.sosyal):<Text style={{textAlign:'center',marginTop:30,fontStyle:'italic'}}>Yorum bekleyen falı bulunmamaktadır.</Text>}
        <TouchableOpacity style={{height:30,borderRadius:4,width:'60%',backgroundColor:'teal',flexDirection:'row',alignSelf:'center',marginTop:10,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.startChat(this.state.profinfo,seviye)}}>
            <Icon name="paper-plane" color={'white'} size={18} />
          <Text style={{color:'white',fontSize:16,fontWeight:'bold'}}> Özel Mesaj</Text>

          <Text style={{color:'white',fontSize:12}}>{"     "+seviye*10}</Text>
          <Image source={require('../static/images/coins.png')} style={{width:12, height: 12,marginLeft:3}}/>
        </TouchableOpacity>
      </View>

    )
    }
    else {
      return(<ActivityIndicator/>)
    };
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    paddingRight:10,
    paddingLeft:10,


  },
  pickerContainer: {
    borderColor:'white',
    borderTopWidth:2,
    backgroundColor:'transparent',
    padding:10,
    backgroundColor:'white',
    flex:1,
    width:'100%',

  },
  picker:{
    borderWidth:2,borderColor:'teal',flexDirection:'row',justifyContent:'space-between',padding:10,marginBottom:10,alignItems:'center',backgroundColor:'#f1f1f1',width:'100%',height:30,borderRadius:5
  },
  nameinput:{
    fontSize:14,fontWeight:'bold',backgroundColor:'transparent',color:'dimgray',justifyContent:'space-between',alignItems:'center',backgroundColor:'#f9f9fb',width:'70%',height:30
  },
  pickerText:{
    fontWeight:'bold',backgroundColor:'transparent',color:'dimgray'
  },
  inputwrap:{
    flexDirection:'row',justifyContent:'space-between',paddingLeft:10,paddingRight:10,marginBottom:10,alignItems:'center',backgroundColor:'#f9f9fb',width:'100%',height:30,borderRadius:5
  },

});
