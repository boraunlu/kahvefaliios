import React from 'react';
import {
  StyleSheet,
  Text,
  ImageBackground,
  View,
  Image,
    FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Button,
  TextInput,
  Keyboard,
  Switch,
  Alert,
  TouchableHighlight,
  Modal,
  RefreshControl,
  AppState
} from 'react-native';
import PropTypes from 'prop-types';
import axios from 'axios';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';
//import Marquee from '@remobile/react-native-marquee';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
  if(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  else {
    return ""
  }

}

function replaceGecenHafta(str) {
    str=str.replace("geçen ","")
    str=str.replace("bugün ","")
    return str
}

function generatefalcisayisi(){
  var saat = moment().hour()
  var gun = 2
  if(moment().weekday()>4){gun=4}
  var dk = moment().minute()%6
  var falcisayisi= 5
  if(saat>7&&saat<11){
    falcisayisi=4+gun
  }
  if(saat>10&&saat<16){
    falcisayisi=5+gun
  }
  if(saat>15&&saat<21){
    falcisayisi=6+gun
  }
  if(saat>20&&saat<25){
    falcisayisi=7+gun
  }
  if(saat<3){
    falcisayisi=4+gun
  }
  if(saat>2&&saat<8){
    falcisayisi=2+gun
  }
  return falcisayisi*40+dk+dk*4
}

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("socialStore")
@inject("userStore")
@observer
export default class Social extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sosyaller:null,
      tek:null,
      sosyalInput:'',
      anonimSwitchIsOn:true,
      falPhotos:[],
      keyboardVisible:false,
      pickerVisible: false,
      cameraVisible: false,
      spinnerVisible:false,
      refreshing: false,
      marquee:"",
      appState: AppState.currentState
  };
}

  static navigationOptions = ({ navigation }) => ({
      title: 'Sosyal',
      tabBarIcon: ({ tintColor }) => (
        <Icon name="group" color={tintColor} size={22} />
      ),
      headerRight:<TouchableOpacity style={{flexDirection:"row",alignItems:"center"}} onPress={() => {navigation.state.params.showpopup()}}><Text style={{textDecorationLine:"underline",textDecorationColor:"black",textDecorationStyle:"solid",padding:5,fontFamily: "SourceSansPro-Regular",
      fontSize: 13,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "center",
      color: "#000000"}}>Puan Tablosu</Text><Image style={{marginRight:10,height:18,width:18}}source={require("../static/images/sosyal/group.png")}></Image></TouchableOpacity>,

      headerLeft:<TouchableOpacity style={{flexDirection:"row",alignItems:"center",marginLeft:7}} onPress={() => {navigation.state.params.toOduller()}}><Text style={{textDecorationLine:"underline",textDecorationColor:"black",textDecorationStyle:"solid",padding:5,fontFamily: "SourceSansPro-Regular",
      fontSize: 13,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "center",
      color: "#000000"}}>🎁 Ödüller</Text></TouchableOpacity>,


    })



  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
  }

  navigateToTekFal = () => {
    if(this.props.socialStore.lastFalType=='sosyal'){
      this.props.navigation.navigate('SocialFal',{fal:this.props.socialStore.tek})
    }
    else {
      if(this.props.socialStore.tek.comments.length>0){
        this.props.navigation.navigate('GunlukFal',{fal:this.props.socialStore.tek})
      }
      else {
        Alert.alert("Falınız kısa süre içinde yorumlanacak :)")
      }

    }
  }

  showpopup = () => {

        this.props.navigation.navigate('Leader')

  }
  toOduller = () => {

        this.props.navigation.navigate('FalPuan')

  }




  componentDidMount() {

    AppState.addEventListener('change', this._handleAppStateChange);
    this.props.navigation.setParams({ showpopup: this.showpopup ,toOduller:this.toOduller })

    Backend.getSocials().then((socials)=>{
      this.props.socialStore.setSocials(socials)
    })
    Backend.getCommenteds().then((socials)=>{
      this.props.socialStore.setCommenteds(socials)
    })


     this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
     this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

  }

   componentWillUnmount() {


   this.keyboardDidShowListener.remove();
   this.keyboardDidHideListener.remove();
   AppState.removeEventListener('change', this._handleAppStateChange);

   }

   _handleAppStateChange = (nextAppState) => {
     if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
       this._onRefresh()
     }
     this.setState({appState: nextAppState});

   }

  _keyboardDidShow = (event) => {
    var height= event.endCoordinates.height
    this.setState({keyboardHeight: height,keyboardVisible:true});

  }

  _keyboardDidHide = () =>  {
   // alert('Keyboard Hidden');
   this.setState({keyboardVisible:false})
  }
  navigateToFalPaylas = (type) => {
    this.props.navigation.navigate('FalPaylas',{type:type})
  }


  replaceAvatar = (index) => {

    var sosyals = this.props.socialStore.socials
    sosyals[index].profile_pic=null
    this.props.socialStore.setSocials(sosyals)
  }

  deleteTek = () => {
    if(this.props.socialStore.tek){
      Alert.alert(
        'Fal Silimi',
        'Falını silmek istediğinden emin misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            var tek = this.props.socialStore.tek
            Backend.deleteSosyal(tek._id)
            this.props.socialStore.setTek(null)
          }},
        ],
      )

    }
  }




    renderTek = () => {
      if(this.props.socialStore.tek){
        var tek = this.props.socialStore.tek
        var bakildi= false
        if(tek.comments.length>0){bakildi=true; var lastComment=tek.comments[tek.comments.length-1];}

          return(
            <View style={{marginLeft:0,marginRight:0,marginTop:10}}>
              <View style={{backgroundColor:'transparent',marginBottom:10,paddingLeft:10}}><Text style={{fontFamily:'SourceSansPro-Bold',textAlign:'left',color:'white',fontWeight:'bold',fontSize:14}}>Son Falın</Text></View>
              <TouchableOpacity style={{  height: 58,borderRadius: 0,backgroundColor: "rgba(250, 249, 255, 0.6)"}} onPress={() => {this.navigateToTekFal()}}>
               <View style={{flexDirection:'row',justifyContent:'space-between',height:60}}>
                <View>
                  <Image source={{uri:tek.photos[0]}} style={styles.kahveAvatar}></Image>
                </View>

                   {bakildi?
                     <View style={{padding:10,flex:2,justifyContent:'center'}}>
                     <Text style={{fontFamily:'SourceSansPro-SemiBold',fontSize:15,color:'rgb(36, 20, 102)'}}>
                       {lastComment.name}
                      </Text>
                      <Text style={{fontFamily:'SourceSansPro-Regular',fontSize:14,color:'rgb(36, 20, 102)'}} numberOfLines={1} ellipsizeMode={'tail'}>
                      {capitalizeFirstLetter(lastComment.comment)}
                     </Text>
                     </View>
                     :
                      <View style={{padding:10,flex:2,justifyContent:'center'}}>
                     <Text style={{fontFamily:'SourceSansPro-SemiBold',fontSize:16,color:'rgb(36, 20, 102)'}}>
                       Yorum bekleniyor...
                      </Text>
                       </View>
                   }

                   <View style={{padding:15,justifyContent:'center',alignItems:'center'}}>
                    {tek.unread==0
                      ?
                      <Icon name="angle-right" color={'gray'} size={20}/>
                      :
                      <View style={{height:26,width:31,justifyContent:'center',paddingTop:0}}>
                        <Image source={require('../static/images/anasayfa/noun965432Cc.png')} style={{height:26,width:31,justifyContent:'center'}}/>
                        <Text style={{fontSize:14,backgroundColor:'transparent',color:'white',fontWeight:'bold',fontFamily:'SourceSansPro-Regular',textAlign:'center',position:'absolute',top:2,right:12}}>{tek.unread}</Text>
                      </View>
                    }
                   </View>
               </View>
              </TouchableOpacity>
            </View>
          )
      }else {
        return(
          <View style={{backgroundColor:'transparent',padding:20,height:90}}>
            <TouchableOpacity  onPress={() => {this.navigateToFalPaylas(1);}} style={{flex:1,alignItems:'center',flexDirection:'row',height:55,borderRadius:4,backgroundColor:'rgb( 236 ,196 ,75)',justifyContent:'center'}}>
              <Text style={{fontSize:18,fontFamily:'SourceSansPro-Bold',textAlign:'center',color:'white'}}>FAL PAYLAŞ     </Text>
               <Image source={require('../static/images/fincan.png')} style={{ height: 20,width:20,alignSelf:'center'}}></Image>
            </TouchableOpacity>
          </View>
        )
      }
    }



    renderSosyaller = () => {

          if(this.props.socialStore.socials){
            var sosyaller = this.props.socialStore.socials
            if(sosyaller.length>0){
              return (
                <FlatList
                  data={sosyaller}
                  keyExtractor={this._keyExtractor}
                  refreshing={this.state.refreshing}
                  onRefresh={()=>{this._onRefresh()}}
                  tabLabel='Yorum Bekleyenler'
                  renderItem={({item,index}) => this.renderItem(item,index)}
                />

              )
            }
            else if(sosyaller.length==0){
              return(
              <ActivityIndicator
                animating={true}
                style={[styles.centering, {height: 80}]}
                size="large"
              />)
            }
          }
          else{
            return(
              <ActivityIndicator
                animating={true}
                style={[styles.centering, {height: 80}]}
                size="large"
              />
            )
          }
    }
    renderItem = (item,index) => {



        var profile_pic=null
        item.profile_pic?profile_pic={uri:item.profile_pic}:item.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
        return (
          <TouchableOpacity key={index}  style={{backgroundColor: '#ffffff',width:'100%',borderColor:'rgb(166, 158, 171)',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToFal(item,index)}}>
            {item.status==3?<View style={[styles.triangleCorner]}></View>:null}
            {item.status==3?<Text style={{position:'absolute',top:3}}>🌟</Text>:null}
           <View style={{flexDirection:'row',height:80,paddingTop:10}}>

           <Image source={profile_pic} onError={(error) => {this.replaceAvatar(index)}} style={styles.falciAvatar}></Image>

             <View style={{padding:10,flex:1}}>

               <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5 , fontFamily: "SourceSansPro-Regular",
      fontSize: 15,
      fontWeight: "600",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "left",
      color: "#241466"}}>
                 {item.question}
                </Text>
                <Text style={{  fontFamily: "SourceSansPro-Regular",
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "left",
      color: "#241466"}}>
                  {item.name} - <Text style={{fontFamily: "SourceSansPro-Regular",
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "center",
      color: "#948b99"}}>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(item.time).calendar()))}
                  </Text>
                 </Text>

             </View>
             <View style={{paddingRight:10,alignItems:'center',justifyContent:'flex-end',width:80,borderColor:'rgb(215,215,215)',flexDirection:'row'}}>
                {item.poll1?item.poll1.length>0?<Icon style={{position:'absolute',left:0,top:28}} name="pie-chart" color={'#E72564'} size={16} />:null:null}
                <Text style={{fontFamily: "SourceSansPro-Bold",
      fontSize: 15,
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "right",flexDirection:"row",
      color: "#241466"}}>{item.comments?item.comments.length>5?<Text> <Text style={{fontSize:16}}>🔥</Text> ({item.comments.length})</Text>:"("+item.comments.length+")":0}</Text>
             </View>
           </View>

          </TouchableOpacity>
          );
      }

  _keyExtractor = (item, index) => index.toString();


  renderCommenteds = () => {

    if(this.props.socialStore.commenteds){
      var sosyaller = this.props.socialStore.commenteds
      if(sosyaller.length>0){
        return (
          <FlatList
            data={sosyaller}
            keyExtractor={this._keyExtractor}
            refreshing={this.state.refreshing}
            onRefresh={()=>{this._onRefresh()}}
            tabLabel='Yorumladıklarınız'
            renderItem={({item,index}) => this.renderItem(item,index)}
          />


        )
      }
      else if(sosyaller.length==0){
        return(
          <Text style={{textAlign:'center',padding:10,backgroundColor:'white'}}>Son 2 gün içinde yorum yaptığın fal bulunmuyor. Haydi hemen fallara yorum yap ve falpuanları toplamaya başla 😉</Text>)
      }
    }
    else{
      return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      )
    }
  }


  _onRefresh = () => {
    this.setState({refreshing: true});

    Backend.getSocials().then((socials)=>{
      this.props.socialStore.setSocials(socials)
      this.setState({refreshing: false});
    })
    Backend.getCommenteds().then((socials)=>{
      this.props.socialStore.setCommenteds(socials)
    })

  }

  render() {


    return (

      <ImageBackground source={require('../static/images/background.png')} style={styles.container}>

        <Spinner visible={this.state.spinnerVisible} textContent={"Fotoğraflarınız yükleniyor..."} textStyle={{color: '#DDD'}} />
        <View style={{flex:1,width:'100%'}}>

            {this.renderTek()}

              <View style={{flex:1}}>
        <ScrollableTabView
          style={{flex:1,alignItems:'center',borderWidth:0, paddingTop:0,borderColor: 'rgb( 236, 196, 75)',justifyContent:'center'}}
          tabBarActiveTextColor='rgb(250, 249, 255)'
          tabBarBackgroundColor='#241466'
          tabBarInactiveTextColor='rgb( 118, 109, 151)'
          tabBarUnderlineStyle={{backgroundColor:'rgb( 236, 196, 75)', borderColor: 'rgb( 236, 196, 75)'}}
          tabBarTextStyle={{fontFamily:'SourceSansPro-Bold'}}
         >
           <View      style={{flex:1}}     tabLabel='YORUM BEKLEYENLER' >
            {this.renderSosyaller()}
          </View>
           <View     style={{flex:1}}      tabLabel='YORUMLADIKLARINIZ'>
            {this.renderCommenteds()}
          </View>
         </ScrollableTabView>
            </View>
        </View>
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',

  },
  falciAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:20,
  },
  kahveAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:4,
  },
    centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  faltypeyazi:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22
  },
  faltypeyazipopup:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:18,marginTop:15
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
  },
  faltypeyazikucukpopup:{
    color:'white',fontSize:14,margin:5,textAlign:'center',marginTop:15
  },
  faltypeyazikucukpopup2:{
    flex:1,color:'white',fontSize:14,padding:15,fontWeight:'bold',alignSelf:'stretch',textAlign:'center'
  },
  marginKeyboardVisible:{
    marginTop:-500
  },
  marginKeyboardNotVisible:{
    marginTop:-100
  },
  coin:{
    height:15,
    width:15,
    marginLeft:5,
  },
  label: {
    fontSize: 12,
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  },
  marqueeContainer:{

    height:40,
    justifyContent:'center',
    paddingVertical:5,
    backgroundColor:'rgba(0, 0, 0, 0.6)',

  },
  marquee: {

      fontSize: 16,
      color:'white',
      backgroundColor: 'transparent',
      overflow: 'hidden',
  },
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 36,
    borderTopWidth: 36,
    borderRightColor: 'transparent',
    borderTopColor: 'rgb( 236 ,196 ,75)',
    position:'absolute',
    top:0,
    left:0
  },

});
