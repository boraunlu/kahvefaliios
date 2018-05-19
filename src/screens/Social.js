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
  ActionSheetIOS,
  RefreshControl
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
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
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

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}

function generatefalcisayisi() {
  var saat = moment().hour()
  var gun = moment().day()%3
  var dk = moment().minute()%10
  var falcisayisi= 5
  if(saat>7&&saat<11){
    falcisayisi=4+gun
  }
  if(saat>10&&saat<16){
    falcisayisi=6+gun
  }
  if(saat>15&&saat<22){
    falcisayisi=8+gun
  }
  if(saat>21&&saat<25){
    falcisayisi=5+gun
  }
  if(saat<4){
    falcisayisi=2+gun
  }
  if(saat>3&&saat<8){
    falcisayisi=1+gun
  }
  return falcisayisi*30+dk
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
      marquee:""
  };
}

  static navigationOptions = ({ navigation }) => ({
      title: 'Sosyal',
      tabBarIcon: ({ tintColor }) => (
        <Icon name="group" color={tintColor} size={22} />
      ),
      headerRight:<View style={{paddingRight:5}}><Button color={'teal'} title={"+ Fal Paylaş"} onPress={() => {navigation.state.params.showpopup()}}/></View>,
      headerLeft:<View style={{flexDirection:'row',alignItems:'center',paddingLeft:5}}><Text>{"   ("+generatefalcisayisi()+") Online"}</Text><View style={{backgroundColor:'#00FF00',height:12,width:12,borderRadius:6,marginLeft:5}}></View></View>  ,

    })



  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
  }

  showpopup = () => {
    if(this.props.userStore.user){
      if(this.props.userStore.user.timesUsed>0){
        //this.popupSosyal.show()
        this.props.navigation.navigate('FalPaylas',{falType:10})
      }
      else {
        Alert.alert("Çok Hızlısın :)","Sosyal Pano'da fal paylaşabilmeniz için öncelikle Ana Sayfa'da bulunan fallardan birine baktırmanız gerekmektedir")
      }
    }
  }




  componentDidMount() {
    this.props.navigation.setParams({ showpopup: this.showpopup  })
    var marquees=["Artık diğer falseverlere özel mesaj atabilirsiniz!","Beğenmediğiniz yorumları 👎 tuşuna basarak işaretleyebilirsiniz.","Rahatsız edici yorumlar yapan kullanıcıların hesabı kapatılacaktır.","Siz de sağ üstteki '+ Fal Paylaş' butonuna basarak falınızı burada paylaşabilirsiniz!","Beğendiğiniz yorumları ❤️'lemeyi unutmayın :)","Profilinize sizi en iyi anlatan cümleyi yazmayı unutmayın!","Şehir bilginizi profil sayfanızdan girebilirsiniz."]
    var marquee=''
    for (var i = 0; i < marquees.length; i++) {
      marquee=marquee+"  ||  "+marquees[i]
    }
    this.setState({marquee:marquee})

    axios.post('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
      uid: Backend.getUid(),
    })
    .then( (response) => {

      var responseJson=response.data
      this.props.socialStore.setTek(responseJson.tek)
      var sosyals=Array.from(responseJson.sosyals)
      this.props.socialStore.setSocials(sosyals)
      /*
      var commenteds=Array.from(responseJson.commenteds)
      this.props.socialStore.setCommenteds(commenteds)
      */

      var commenteds=[]
      var id = Backend.getUid()
      for (var i = 0; i < sosyals.length; i++) {
        var sosyal = sosyals[i]
        var comments=sosyal.comments
        if(comments.length>0){

          for (var x = 0; x < comments.length; x++) {
            if(comments[x].fireID==id){
              commenteds.push(sosyal)
              break;
            }
          }
        }
      }
      this.props.socialStore.setCommenteds(commenteds)
    })
    .catch(function (error) {

    });

     this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
     this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

   componentWillUnmount() {


   this.keyboardDidShowListener.remove();
   this.keyboardDidHideListener.remove();

   }

  _keyboardDidShow = (event) => {
    var height= event.endCoordinates.height
    this.setState({keyboardHeight: height,keyboardVisible:true});

  }

  _keyboardDidHide = () =>  {
   // alert('Keyboard Hidden');
   this.setState({keyboardVisible:false})
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

  renderInfo = () => {
    if(this.props.userStore.user){
      var falPuan =this.props.userStore.user.falPuan
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
        <View style={{flexDirection:'row',height:70,marginBottom:0}}>
          <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,0.8)',height:70,flex:1,borderColor:'gray',borderBottomWidth:1,borderTopWidth:1}} onPress={() => {this.props.navigation.navigate('FalPuan')}}>
            <View style={{alignSelf:'center',alignItems:'center',marginTop:5,flexDirection:'row'}}>
              <Text style={{fontSize:14,color:kolor,fontWeight:'bold'}}>{unvan}</Text>
              <Icon style={{position:'absolute',right:-30}} name="question-circle" color={'lightgray'} size={20} />
            </View>
            <View style={{alignSelf:'center',alignItems:'center',marginTop:5,marginBottom:15}}>
              <View style={{justifyContent:'center'}}>
                <View style={{position:'absolute',zIndex: 3,left:-40,justifyContent:'center',height:30,width:30,borderRadius:15,backgroundColor:kolor}}><Text style={{fontSize:18,backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>{seviye}</Text></View>
                <View style={{height:18,width:200,borderWidth:3,borderColor:kolor}}>
                  <View style={{height:15,width:200*(gosterilenpuan/limit),backgroundColor:kolor}}>
                  </View>
                </View>

              </View>
              <Text style={{}}>{gosterilenpuan+"/"+limit+" FalPuan"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,0.8)',width:70,alignItems:'center',justifyContent:'center',borderColor:'gray',borderWidth:1,height:70}} onPress={() => {this.props.navigation.navigate('Leader')}}>
            <Icon name="trophy" color={'darkgoldenrod'} size={30} />
            <Text style={{textAlign:'center',fontSize:12}}>Puan Tablosu</Text>
          </TouchableOpacity>
        </View>
      )
    }
    else{
      return(null)
    }
  }

  renderTek = () => {
    if(this.props.socialStore.tek){
      var tek = this.props.socialStore.tek
      var profile_pic=null
      tek.profile_pic?profile_pic={uri:tek.profile_pic}:tek.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
      return(
        <View style={{height:70,marginBottom:0,flexDirection:'row'}}>

          <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,0.8)',borderColor:'gray',flex:1,borderBottomWidth:1,borderTopWidth:1,height:70}} onPress={() => {this.navigateToFal(tek)}}>
           <View style={{flexDirection:'row',height:70}}>

           <Image source={profile_pic} style={styles.falciAvatar}></Image>
             <View style={{padding:10,flex:1}}>

               <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:16}}>
                 {tek.question}
                </Text>
                <Text style={{fontWeight:'normal',fontSize:14}}>
                  {tek.name} - <Text style={{color:'gray'}}>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(tek.time).calendar()))}
                  </Text>
                 </Text>

             </View>
             <View style={{padding:15,justifyContent:'center',width:60,borderColor:'teal'}}>
               <Text style={{color:'black'}}>({tek.comments?tek.comments.length:0})</Text>
             </View>
           </View>

          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,0.8)',width:70,alignItems:'center',justifyContent:'center',borderColor:'gray',borderWidth:1,height:70}} onPress={() => {this.deleteTek()}}>
            <Icon name="trash-o" color={'darkgray'} size={30} />

          </TouchableOpacity>

        </View>
      )
    }
    else{
      return(null)
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
        <TouchableOpacity key={index}  style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToFal(item,index)}}>
         <View style={{flexDirection:'row',height:60,}}>

         <Image source={profile_pic} onError={(error) => {this.replaceAvatar(index)}} style={styles.falciAvatar}></Image>

           <View style={{padding:10,flex:1}}>

             <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
               {item.question}
              </Text>
              <Text style={{fontWeight:'normal',fontSize:14}}>
                {item.name} - <Text style={{color:'gray'}}>
                 {capitalizeFirstLetter(replaceGecenHafta(moment(item.time).calendar()))}
                </Text>
               </Text>

           </View>
           <View style={{paddingRight:10,paddingLeft:20,alignItems:'center',justifyContent:'center',width:60,borderColor:'teal',flexDirection:'row'}}>
              {item.poll1?item.poll1.length>0?<Icon style={{position:'absolute',left:0,top:24}} name="pie-chart" color={'#E72564'} size={16} />:null:null}
              <Text style={{textAlign:'center',color:'black'}}>{item.commentsNew?item.commentsNew.length>5?<Text><Text style={{fontSize:16}}>🔥</Text> ({item.commentsNew.length})</Text>:"("+item.commentsNew.length+")":0}</Text>
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

    axios.post('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
      uid: Backend.getUid(),
    })
    .then( (response) => {

      var responseJson=response.data
      var sosyals=Array.from(responseJson.sosyals)
      this.props.socialStore.setSocials(sosyals)
      this.props.socialStore.setTek(responseJson.tek)

      var commenteds=[]
      var id = Backend.getUid()
      for (var i = 0; i < sosyals.length; i++) {
        var sosyal = sosyals[i]
        var comments=sosyal.comments
        if(comments.length>0){

          for (var x = 0; x < comments.length; x++) {
            if(comments[x].fireID==id){
              commenteds.push(sosyal)
              break;
            }
          }
        }
      }
      this.props.socialStore.setCommenteds(commenteds)
      this.setState({refreshing: false});
    })
    .catch(function (error) {

    });

  }

  render() {


    return (

      <ImageBackground source={require('../static/images/Aurora.jpg')} style={styles.container}>

        <Spinner visible={this.state.spinnerVisible} textContent={"Fotoğraflarınız yükleniyor..."} textStyle={{color: '#DDD'}} />
        <View style={{flex:1,width:'100%'}}>


            {this.renderInfo()}

            {this.renderTek()}

              <View style={{flex:1}}>
          <ScrollableTabView
            style={{paddingTop:50,flex:1}}
           renderTabBar={()=><DefaultTabBar  activeTextColor='white' inactiveTextColor='lightgray' tabStyle={{height:40}} underlineStyle={{backgroundColor:'white'}} backgroundColor='teal' />}
           tabBarPosition='overlayTop'
           >
           <View         tabLabel='Yorum Bekleyenler' >
            {this.renderSosyaller()}
          </View>
           <View         tabLabel='Yorumladıklarınız'>
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
  }

});
