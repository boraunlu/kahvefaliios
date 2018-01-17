import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
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

import firebase from 'firebase';
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
import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';
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
  return falcisayisi*20+dk
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
            this.popupSosyal.show()
          }
          else {
            Alert.alert("Çok Hızlısın :)","Sosyal Pano'da fal paylaşabilmeniz için öncelikle Ana Sayfa'da bulunan fallardan birine baktırmanız gerekmektedir")
          }
        }


  }




  componentDidMount() {
    this.props.navigation.setParams({ showpopup: this.showpopup  })
    fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: Backend.getUid(),
      })
    })
    .then((response) => response.json())
     .then((responseJson) => {

        this.setState({tek:responseJson.tek});
        var sosyals=Array.from(responseJson.sosyals)
        this.props.socialStore.setSocials(sosyals)

        /*

        this.props.socialStore.setCommenteds(commenteds)*/
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

  renderTek = () => {
    if(this.state.tek){
      var tek = this.state.tek
      var profile_pic=null
      tek.profile_pic?profile_pic={uri:tek.profile_pic}:tek.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
      return(
        <View style={{height:70,marginBottom:10,flexDirection:'row'}}>

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
          <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,0.8)',width:70,alignItems:'center',justifyContent:'center',borderColor:'gray',borderWidth:1,height:70}} onPress={() => {this.props.navigation.navigate('Leader')}}>
            <Icon name="trophy" color={'darkgoldenrod'} size={30} />
            <Text style={{textAlign:'center',fontSize:12}}>Puan Tablosu</Text>
          </TouchableOpacity>

        </View>
      )
    }
    else{
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
        else if (falPuan>175&&falPuan<301) {
          seviye = 5
          limit = 125
          gosterilenpuan=falPuan-175
          unvan = "Fal Profesörü"
          kolor='rgb(249,50,12)'
        }
        return(
          <View style={{flexDirection:'row',height:70,marginBottom:10}}>
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
  }

  renderSosyaller = () => {

    if(this.props.socialStore.socials){
      var sosyaller = this.props.socialStore.socials
      if(sosyaller.length>0){
        return (

           sosyaller.map(function (sosyal,index) {

             var profile_pic=null
             sosyal.profile_pic?profile_pic={uri:sosyal.profile_pic}:sosyal.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
             return (
               <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToFal(sosyal,index)}}>
                <View style={{flexDirection:'row',height:60,}}>

                <Image source={profile_pic} onError={(error) => {this.replaceAvatar(index)}} style={styles.falciAvatar}></Image>

                  <View style={{padding:10,flex:1}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
                      {sosyal.question}
                     </Text>
                     <Text style={{fontWeight:'normal',fontSize:14}}>
                       {sosyal.name} - <Text style={{color:'gray'}}>
                        {capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}
                       </Text>
                      </Text>

                  </View>
                  <View style={{padding:15,justifyContent:'center',width:70,borderColor:'teal'}}>

                    <Text style={{textAlign:'center',color:'black'}}>{sosyal.comments?sosyal.comments.length>5?<Text><Text style={{fontSize:16}}>🔥</Text> ({sosyal.comments.length})</Text>:"("+sosyal.comments.length+")":0}</Text>
                  </View>
                </View>

               </TouchableOpacity>
               );
           }, this)
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

  renderCommenteds = () => {

    if(this.props.socialStore.commenteds){
      var sosyaller = this.props.socialStore.commenteds
      if(sosyaller.length>0){
        return (

           sosyaller.map(function (sosyal,index) {

             var profile_pic=null
             sosyal.profile_pic?profile_pic={uri:sosyal.profile_pic}:sosyal.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
             return (
               <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToFal(sosyal,index)}}>
                <View style={{flexDirection:'row',height:60,}}>

                <Image source={profile_pic} onError={(error) => {this.replaceAvatar(index)}} style={styles.falciAvatar}></Image>

                  <View style={{padding:10,flex:1}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
                      {sosyal.question}
                     </Text>
                     <Text style={{fontWeight:'normal',fontSize:14}}>
                       {sosyal.name} - <Text style={{color:'gray'}}>
                        {capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}
                       </Text>
                      </Text>

                  </View>
                  <View style={{padding:15,justifyContent:'center',width:70,borderColor:'teal'}}>
                    <Text style={{textAlign:'center',color:'black'}}>{sosyal.comments?sosyal.comments.length>5?<Text><Text style={{fontSize:16}}>🔥</Text> ({sosyal.comments.length})</Text>:"("+sosyal.comments.length+")":0}</Text>
                  </View>
                </View>

               </TouchableOpacity>
               );
           }, this)
        )
      }
      else if(sosyaller.length==0){
        return(
        <Text>Yorumladığın fal bulunmuyor</Text>)
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

  renderphoto1 = () => {
    if(this.state.falPhotos[0]){
      return (
        <View style={{width:50,height:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} >

         <Image source={{uri:this.state.falPhotos[0]}} style={{ height: 50,borderRadius:5,width:50,alignSelf:'center'}}></Image>
         </View>
        );
    }
    else {
      return(
      <TouchableHighlight style={{height:50,width:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Icon name="plus" color={'black'} size={36} /></TouchableHighlight>
      )
    }
  }
  renderphoto2 = () => {
    if(this.state.falPhotos[1]){
      return (
        <View style={{width:50,height:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} >

         <Image source={{uri:this.state.falPhotos[1]}} style={{ height: 50,borderRadius:5,width:50,alignSelf:'center'}}></Image>
         </View>
        );
    }
    else {
      return(
        <TouchableHighlight style={{height:50,width:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Icon name="plus" color={'black'} size={36} /></TouchableHighlight>
      )
    }
  }
  renderphoto3 = () => {
    if(this.state.falPhotos[2]){
      return (
        <View style={{width:50,height:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} >

         <Image source={{uri:this.state.falPhotos[2]}} style={{ height: 50,borderRadius:5,width:50,alignSelf:'center'}}></Image>
         </View>
        );
    }
    else {
      return(
        <TouchableHighlight style={{height:50,width:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Icon name="plus" color={'black'} size={36} /></TouchableHighlight>
      )
    }
  }

  changePhoto = () => {
    const options = ['Çekilmiş Fotoğraflarından Seç', 'Yeni Fotoğraf Çek', 'İptal'];
    const cancelButtonIndex = options.length - 1;
    ActionSheetIOS.showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          this.setPickerVisible(true);
          break;
        case 1:
          Camera.checkVideoAuthorizationStatus().then((response) => {if(response==true){this.setCameraVisible(true)}})
          break;
        default:
      }
    });

  }

  sendSosyal = () => {
    if(this.state.sosyalInput.length<20){

      Alert.alert("Kısa soru","Lütfen sorunla ilgili bize biraz daha detay ver. Biz bizeyiz burada :)")
    }
    else{
      if(this.state.sosyalInput.length>200){
        Alert.alert("Uzun soru","Lütfen sorunu daha kısa bir şekilde ifade et, herkes okusun :).")
      }
      else{
        if(this.state.falPhotos.length>1){
          this.setState({spinnerVisible:true})

          Backend.uploadImages(this.state.falPhotos).then((urls) => {

            this.setState({spinnerVisible:false})


              if(this.props.userStore.userCredit<100){
                this.paySosyal(urls)
              }
              else{
                Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn)
                Backend.addCredits(-100)
                this.props.userStore.increment(-100)
                this.popupSosyal.dismiss()
                Keyboard.dismiss()
                this.setState({sosyalInput:'',falPhotos:[]})

                fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    uid: Backend.getUid(),
                  })
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({tek:responseJson.tek});
                    this.props.socialStore.setSocials(responseJson.sosyals)
                 })
                 setTimeout(()=>{Alert.alert("Teşekkürler","Falınız diğer falseverlerle paylaşıldı. Sosyal sayfasında falınıza gelen yorumlarını takip edebilirsiniz!")},950)
              }

          })
          .catch(error => {
            console.log(error)
            this.setState({spinnerVisible:false,sosyalInput:JSON.stringify(error.error)})
            Alert.alert("Lütfen tekrar dener misin? Fotoğraflar yüklenirken bir sorun oluştu. ")
          })

        }
        else {
            Alert.alert("En az 2 adet fotoğraf yüklemeniz gerekiyor ")
        }

      }
    }
  }

  selectImages = (images) => {
    this.setImages(images);
  }

  setImages = (images) => {
    this._images = images;
  }

  getImages = () => {
    return this._images;
  }

  setPhoto = (path) => {
    this.setState({cameraVisible:false,spinnerVisible:false})
    var images = this.state.falPhotos
    images.push(path)
    this.setState({falPhotos:images})
  }

  setPickerVisible = (visible = false) => {
    this.setState({pickerVisible: visible});
  }

  setCameraVisible = (visible = false) => {
    this.setState({cameraVisible: visible});
  }


  renderNavBar = () => {
    return (
      <NavBar style={{
        statusBar: {
          backgroundColor: '#FFF',
          height:30
        },
        navBar: {
          backgroundColor: '#FFF',

        },
      }}>
        <NavButton onPress={() => {
          this.setPickerVisible(false);
        }}>
          <NavButtonText style={{
            color: '#000',
            fontSize:26
          }}>
            {'<'}
          </NavButtonText>
        </NavButton>
        <NavTitle style={{
          color: '#000',
        }}>
          {'Fotoğraflarım'}
        </NavTitle>
        <NavButton onPress={() => {
          if(this._images.length==0){
            alert("Lütfen önce fotoğraf seçin")
          }
          else{
            this.setPickerVisible(false);

            const images = this.getImages().map((image) => {
              return {
                image: image.uri,
              };
            });
            this.setFromPicker(images);
            this.setImages([]);
          }
        }}>
          <NavButtonText style={{
            color: '#000',
          }}>
            {'Gönder'}
          </NavButtonText>
        </NavButton>
      </NavBar>
    );
  }

  setFromPicker = (images) => {
    var falPhotos = this.state.falPhotos
    for (var i = 0; i < images.length; i++) {
      falPhotos.push(images[i].image)
    }

    this.setState({falPhotos:falPhotos})
  }

  paySosyal = (urls) => {
    //this.setState({spinnerVisible:true})
    var products = [
       'com.grepsi.kahvefaliios.100',
    ];
    InAppUtils.loadProducts(products, (error, products) => {
      if(error){this.setState({spinnerVisible:false})}
      else{

        var identifier = 'com.grepsi.kahvefaliios.100'
        InAppUtils.purchaseProduct(identifier, (error, response) => {
          this.setState({spinnerVisible:false})
           // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
           if(error){

           }
           else{
             if(response && response.productIdentifier) {
               Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn)
               this.popupSosyal.dismiss()
               this.setState({modalVisible:false,inputVisible:false})
               Keyboard.dismiss()

               this.setState({sosyalInput:'',falPhotos:[]})

               fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
                 method: 'POST',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                   uid: Backend.getUid(),
                 })
               })
               .then((response) => response.json())
               .then((responseJson) => {
                   this.setState({tek:responseJson.tek});
                   this.props.socialStore.setSocials(responseJson.sosyals)


                })
                setTimeout(()=>{Alert.alert("Teşekkürler","Falınız diğer falseverlerle paylaşıldı. Sosyal sayfasında falınıza gelen yorumlarını takip edebilirsiniz!")},950)

             }
           }
        });
      }
    });
  }

  _onRefresh() {
    this.setState({refreshing: true});
    fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: Backend.getUid(),
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
        this.setState({tek:responseJson.tek});
        var sosyals=Array.from(responseJson.sosyals)
        this.props.socialStore.setSocials(sosyals)

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
  }

  render() {


    return (

      <Image source={require('../static/images/Aurora.jpg')} style={styles.container}>
        <Spinner visible={this.state.spinnerVisible} textContent={"Fotoğraflarınız yükleniyor..."} textStyle={{color: '#DDD'}} />
        <View style={{flex:1,width:'100%'}}>
          <View style={{padding:Dimensions.get('window').height/70,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:0,alignSelf:'stretch'}}>
            <View>
              <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
              </Image>

            </View>
            <View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.6)',padding:10,width:Dimensions.get('window').width-85}}>
              <Text style={{fontSize:13,color:'white'}}>
                Bu sayfada diğer falseverlerden gelen falları okuyabilir, bu fallara yorum yapıp beğeni kazanabilirsin.
              </Text>

            </View>
          </View>
            {this.renderTek()}

            <ScrollableTabView
              style={{paddingTop:50,height:40}}
             renderTabBar={()=><DefaultTabBar  activeTextColor='white' inactiveTextColor='lightgray' tabStyle={{height:40}} underlineStyle={{backgroundColor:'white'}} backgroundColor='teal' />}
             tabBarPosition='overlayTop'
             >
               <ScrollView

               refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh.bind(this)}

                    progressViewOffset={50}
                  />
                }
                tabLabel='Yorum Bekleyenler'>
                {this.renderSosyaller()}
               </ScrollView>
               <ScrollView tabLabel='Yorumladıklarınız'>
                {this.renderCommenteds()}
               </ScrollView>
             </ScrollableTabView>
        </View>
        <PopupDialog

          ref={(popupDialog) => { this.popupSosyal2 = popupDialog; }}

          width={'80%'}
          height={'60%'}
          dialogStyle={{marginTop:-150}}
          overlayOpacity={0.75}
        >
          <View style={{flex:1,backgroundColor:'#36797f',alignItems:'center'}} >

              <Image source={require('../static/images/karilar.png')} style={{height:60,resizeMode:'contain',marginTop:10}}/>
              <Text style={styles.faltypeyazipopup}>
                Falımı nasıl paylaşabilirim?
              </Text>
              <Text style={styles.faltypeyazikucukpopup}>
                Ana sayfa üzerinden falcılarımızla yaptığınız sohbetin bitiminde çıkan <Text style={{fontWeight:'bold',fontSize:15}}>"Falseverlere Sor"</Text> seçeneğini kullanarak falınızın burada yayınlanmasını sağlayabilirsiniz.  {"\n"}
              </Text>
                <Image style={{height:140,resizeMode:'contain',alignSelf:'center'}} source={require('../static/images/sosyalreklam1.png')}/>
          </View>
        </PopupDialog>
        <PopupDialog

          ref={(popupDialog) => { this.popupSosyal = popupDialog; }}
          dialogStyle={this.state.keyboardVisible?styles.marginKeyboardVisible:styles.marginKeyboardNotVisible}
          width={0.8}
          height={0.75}
          overlayOpacity={0.75}
        >
          <View style={{flex:1,backgroundColor:'#36797f',alignItems:'center',paddingBottom:40}} >

              <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>

                    <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      100
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
              </View>
              <Image source={require('../static/images/karilar.png')} style={{height:60,resizeMode:'contain',marginTop:10}}/>
              <Text style={styles.faltypeyazipopup}>
                Siz sorun, diğer falseverlerimiz cevaplasın!
              </Text>
              <Text style={styles.faltypeyazikucukpopup}>
                Birlikten kuvvet doğar! Falınızı, aklınızdaki soru ile birlikte 3 gün boyunca Sosyal Panomuzda yayınlayıp, diğer falseverlerin yorumuna sunalım.   {"\n"}
              </Text>
              <TextInput
                editable={true}
                multiline={true}
                value={this.state.sosyalInput}
                onChangeText={(text) => this.setState({sosyalInput:text})}
                placeholder={"Sorunu yaz"}
                style={{height:60,width:'90%',borderColor: 'gray', borderWidth: 1,padding:3,backgroundColor:'white'}}
              />
              <View style={{flexDirection:'row',alignItems:'center',marginTop:10}}>
                <Text style={{color:'white'}}> Profil Fotoğrafım Görünebilir </Text>
                <Switch
                  onValueChange={(value) => this.setState({anonimSwitchIsOn: value})}
                  value={this.state.anonimSwitchIsOn} />
                  </View>
              <View style={{width:'100%',flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:120,paddingBottom:40,justifyContent:'space-around'}}>
              {
                this.renderphoto1()
              }
              {
                this.renderphoto2()
              }
              {
                this.renderphoto3()
              }

              </View>
              <View style={{position:'absolute',bottom:0,width:'100%'}}>

               <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                 <TouchableOpacity  onPress={() => {this.popupSosyal.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                   <Text style={{textAlign:'center'}}>İstemiyorum</Text>
                 </TouchableOpacity>
                 <TouchableOpacity  onPress={() => {this.sendSosyal();}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                   <Text style={{textAlign:'center',fontWeight:'bold'}}>GÖNDER</Text>
                 </TouchableOpacity>
               </View>
             </View>



          </View>
        </PopupDialog>

        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.pickerVisible}
          onRequestClose={() => {
            this.setPickerVisible(false);
          }}
        >
          {this.renderNavBar()}
          <CameraRollPicker
            maximum={3}
            imagesPerRow={3}
            callback={this.selectImages}
            selected={[]}
            emptyText={"Yükleniyor... \n \n Eğer çok uzun sürüyorsa uygulamamıza fotoğraflarına erişim izni vermemiş olabilirsiniz. Teşekkürler!"}
          />
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.cameraVisible}
          onRequestClose={() => {
            this.setCameraVisible(false);
          }}
        >
           <CameraPick
            sendCapturedImage={(image) => { this.setPhoto(image.path)}}
          />
        </Modal>
      </Image>

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

});
