import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  Keyboard,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  View,
  Dimensions,
  Image,
  BackAndroid,
  ImageBackground,
  Animated,
  ScrollView,
    TouchableWithoutFeedback,
  Alert,
  Easing,
  ActivityIndicator,
} from 'react-native';

import axios from 'axios';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation'
//import Toast from 'react-native-root-toast';
import {GiftedChat, Actions,Bubble,Send,Composer,InputToolbar,Avatar,Message} from 'react-native-gifted-chat';
import CustomActions from '../components/CustomActions';

import Backend from '../Backend';
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import ChatModal from '../components/ChatModal';
import Elements from '../components/Elements';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}



@inject("userStore")
@observer
export default class ChatFalsever extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,
      modalVisible: false,
      modalElements:[],
      profinfo:null,
      initialLoaded:false,
      loadingVisible:false,
      quick_reply: null,
      buttons: null,
      falsever:this.props.navigation.state.params.falsever,
      inputVisible:true,

    };


    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderSend = this.renderSend.bind(this);
    this.renderComposer = this.renderComposer.bind(this);
    this.renderInputToolbar = this.renderInputToolbar.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);


    this._isAlright = null;
  }
  static navigationOptions = ({ navigation }) => ({

      headerTitle:<TouchableWithoutFeedback onPress={() => {navigation.state.params.showpopup()}} style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}><View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}><Image style={{height:30,width:30, borderRadius:15,marginRight:10}} source={{uri:navigation.state.params.falsever.avatar}}></Image><Text style={{fontWeight:'bold',fontSize:20}}>{navigation.state.params.falsever.name}</Text></View></TouchableWithoutFeedback>,

  })


  setModalVisibility(visible) {
    ////console.log(visible);
    this.setState(() => {
      return {
        modalVisible: visible,
      };
    });
  }

  showpopup = () => {
    //alert("asdf")
      this.showProfPopup(this.state.falsever.fireID,this.state.falsever.avatar)
  }


  navigateto = (route) => {
    const { navigate } = this.props.navigation;

    if(route=="Mesajlar"){
      const resetAction = NavigationActions.reset({
         index: 0,
         actions: [
           NavigationActions.navigate({ routeName: 'Greeting'})
         ]
       })
       this.props.navigation.dispatch(resetAction)
    }
    else{

      const { navigate } = this.props.navigation;
      navigate(route)
    }
  }
  setnavigation(route){

    if(route=="Greeting"){
      const resetAction = NavigationActions.reset({
         index: 0,
         actions: [
           NavigationActions.navigate({ routeName: 'Greeting'})
         ]
       })
       this.props.navigation.dispatch(resetAction)
    }
    else{
      BackAndroid.removeEventListener('hardwareBackPress', this.backhandler);
      const { navigate } = this.props.navigation;
      navigate(route)
    }

  }

  componentWillMount() {
    this._isMounted = true;
    Backend.refreshLastLoaded();
    this.setState(() => {
      return {
        messages: [],
      };
    });

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  }

  componentWillUnmount() {
    this._isMounted = false;
    //console.log("chatunmounted")
    this.keyboardDidShowListener.remove();

  }

  _keyboardDidShow = (event) => {
    var height= event.endCoordinates.height
    this.setState({keyboardHeight: height});

  }

  componentDidMount() {
    this.props.navigation.setParams({ showpopup: this.showpopup  })
    const { params } = this.props.navigation.state;
    var falseverref = firebase.database().ref('messages/'+Backend.getUid()+'/falsever/mesajlar/'+this.state.falsever.fireID);
    falseverref.on('child_added',function(snapshot,key){
        var mesaj=snapshot.val()
        if(key){
            mesaj._id=key
        }
        else {
          mesaj._id="asdf"
        }
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, mesaj),
          };
        });
    }.bind(this))


    if(params.first){
      /*
      let toast = Toast.show('2 gün boyunca bu falseverle sohbet edebilirsiniz!', {
        duration: Toast.durations.SHORT,
        position: 70,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
      let toast2 = Toast.show('Haydi durma, mesajını aşağıya yaz!', {
        duration: Toast.durations.LONG,
        delay: 3000,
        position: 0,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });*/
    }
    if(!params.falsever.read){
      this.props.userStore.increaseFalseverUnread(-1)
      var falseverbilgiref = firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler/'+this.state.falsever.fireID);
      var updates = {};
      updates['/read'] = true;
      falseverbilgiref.update(updates)
    }


  }

  showProfPopup = (fireid,profPhoto) =>{

    this.popupDialog.show()
    this.setState({profinfo:null})

    axios.post('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      uid: fireid,
    })
    .then( (response) => {
      var responseJson=response.data

      responseJson.profile_pic?responseJson.profile_pic={uri:responseJson.profile_pic}:profPhoto?responseJson.profile_pic={uri:profPhoto}:responseJson.gender=="female"?responseJson.profile_pic=require('../static/images/femaleAvatar.png'):responseJson.profile_pic=require('../static/images/maleAvatar.png')

      var meslek =''
      switch(responseJson.workStatus) {
        case 1:
            meslek='Çalışıyor';
            break;
        case 2:
            meslek='İş arıyor';
            break;
        case 3:
            meslek='Öğrenci';
            break;
        case 4:
            meslek='Çalışmıyor';
            break;
        case 5:
            meslek='Kamuda Çalışıyorum';
            break;
        case 6:
            meslek='Özel Sektör';
            break;
        case 7:
            meslek='Kendi İşim';
            break;
      }
      var iliski =''
      switch(responseJson.relStatus) {
          case "0":
              iliski='İlişkisi Yok';
              break;
          case "1":
              iliski='Sevgilisi Var';
              break;
          case "2":
              iliski='Evli';
              break;
          case "3":
              iliski='Nişanlı';
              break;
          case "4":
              iliski='Platonik';
              break;
          case "5":
              iliski='Ayrı Yaşıyor';
              break;
          case "6":
              iliski='Yeni Ayrılmış';
              break;
          case "7":
              iliski='Boşanmış';
              break;

      }
      responseJson.iliski=iliski
      responseJson.meslek=meslek
      //alert(responseJson.sosyal)
      this.setState({profinfo:responseJson});

    })
    .catch(function (error) {

    });

  }



  onLoadEarlier() {
    this.setState((previousState) => {
      return {
        isLoadingEarlier: true,
      };
    });

    setTimeout(() => {
      if (this._isMounted === true) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.prepend(previousState.messages, []),
            loadEarlier: false,
            isLoadingEarlier: false,
          };
        });
      }
    }, 1000); // simulating network
  }

  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
    axios.post('https://eventfluxbot.herokuapp.com/sendMail', {
      uid: Backend.getUid(),
      text: messages[0].text
    })

  }


  renderCustomActions(props) {

      return (
        <CustomActions
          {...props}
          ref={instance => { this.child = instance; }}
        />
      );

  }
  renderProfInfo = () => {
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
      </View>

    )
    }
    else {
      return(<ActivityIndicator/>)
    }

  }

  sendMessageToFalsever = (messages) => {

    Backend.sendMessageToFalsever(messages,this.state.falsever)

  }

  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
  }

  renderKendiFali = (kendiFali) =>{
    var sosyal=kendiFali
    return(
    <View>
      <Text style={{fontWeight:'bold',textAlign:'center',marginBottom:10,fontSize:16}}>Yorum Bekleyen Falı</Text>
      <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,1)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1,borderTopWidth:1}} onPress={() => {this.navigateToFal(sosyal)}}>
       <View style={{flexDirection:'row',height:60,}}>
         <View style={{padding:10,flex:1}}>

           <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
             {sosyal.question}
            </Text>
            <Text style={{fontWeight:'normal',fontSize:14}}>

               {capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}

             </Text>

         </View>
         <View style={{padding:15,justifyContent:'center',width:70,borderColor:'teal'}}>

           <Text style={{textAlign:'center',color:'black'}}>{sosyal.comments?sosyal.comments.length>5?<Text><Text style={{fontSize:16}}>🔥</Text> ({sosyal.comments.length})</Text>:"("+sosyal.comments.length+")":0}</Text>
         </View>
       </View>

      </TouchableOpacity>
    </View>
    )

  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderCustomView(props) {
    return (
      <CustomView
        {...props}
      />
    );
  }
  renderSend(props) {
    return (
      <Send
        {...props}
        label={'Gönder'}
      />
    );
  }
  renderComposer(props) {
    if(this.state.inputVisible){
      return (
        <Composer
          {...props}
          placeholder={'Mesajınızı yazın...'}
        />
      );
    }
    else{
      return null
    }

  }
  renderInputToolbar(props) {
    if(this.state.inputVisible){
      return (
        <InputToolbar
          {...props}
        />
      );
    }
    else{
      return null
    }

  }

  renderFooter(props) {

    return null;
  }

  render() {
    return (

        <ImageBackground source={require('../static/images/Aurora.jpg')}  style={styles.containerimage}>
          <GiftedChat
            messages={this.state.messages}

            onSend={(message) => {
              this.sendMessageToFalsever(message)
            }}
            locale={'tr'}
            loadEarlier={false}
            user={{
              _id: Backend.getUid(),
              name: Backend.getName(),
              avatar:Backend.getAvatar(),
            }}

            renderBubble={this.renderBubble}
            renderCustomView={this.renderCustomView}
            renderFooter={this.renderFooter}
            renderSend={this.renderSend}
            renderComposer={this.renderComposer}
            renderInputToolbar={this.renderInputToolbar}
            >

          </GiftedChat>
          <PopupDialog

           dialogStyle={{marginTop:-230}}
           width={0.9}
           height={430}
           ref={(popupDialog) => { this.popupDialog = popupDialog; }}
           >
             <View style={{flex:1}}>
               <ScrollView style={{padding:10,paddingTop:15}}>
                {this.renderProfInfo()}


               </ScrollView>
             </View>
           </PopupDialog>
        </ImageBackground>

    );
  }
}

const styles = StyleSheet.create({
  containerimage: {
    flex: 1,
    width:null,
    alignSelf:'stretch'
  },
  quickContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent:'space-around',
  },
  quickBubble:{
    borderRadius:10,
    borderWidth:2,
    borderColor:'#1194F7',
    padding:8,
    backgroundColor:'#1194F7',

  },
  quickText:{
    fontSize: 14,
    color: '#aaa',
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  footerText1: {
    fontSize: 14,
    color: 'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  container: {
    flex: 1,
    padding: 0,
    flexDirection: 'column-reverse'
  },
  innerContainer: {
    height: 300,
    alignSelf:'stretch',
    alignItems: 'center',
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
  },
  rowTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 5,
    flexGrow: 1,
    height: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 18,
    margin: 5,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 10,
  },
  pickerItem: {
    fontSize: 16,
  },
  centering: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 8,
},
});
