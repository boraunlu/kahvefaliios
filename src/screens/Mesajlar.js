import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  ScrollView,
  ImageBackground,
  Button,
  ActivityIndicator,
  TextInput,
  Alert,
  FlatList,
  Switch,
  AppState
} from 'react-native';
import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import axios from 'axios';
import NotificationIcon from '../components/NotificationIcon';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { NativeModules } from 'react-native'
import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';
const { InAppUtils } = NativeModules
require('../components/data/falcilar.js');
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(str) {
  str=str.replace("geçen ","")
  str=str.replace("bugün ","")
  return str
}

@inject("socialStore")
@inject("userStore")
@observer
export default class Mesajlar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: null,
      falsevers:null,
      aktifChat:null,
      lastBizden:null,
      sosyals:null,
      gunluks:null,
      notifications:null,
      appState: AppState.currentState
  };
}

  static navigationOptions = {
      title: 'Mesajların',
      tabBarLabel: 'Mesajlar',
       tabBarIcon: ({ tintColor }) => (

         <NotificationIcon tintColor={tintColor}/>
       ),
    };

    navigateto = (destination,falciNo) => {
      const { navigate } = this.props.navigation;
      navigate( destination,{falciNo:falciNo} )
    }
    navigateToSosyalFal = (sosyal) => {
      const { navigate } = this.props.navigation;
      navigate( 'SocialFal',{fal:sosyal} )
    }
    navigateToGunlukFal = (sosyal) => {
      if(sosyal.comments.length>0){
        const { navigate } = this.props.navigation;
        navigate( 'GunlukFal',{fal:sosyal} )
      }  else {
          Alert.alert("Falınız kısa süre içinde yorumlanacak :)")
        }
    }
    navigateToAktif = (falciNo) => {
      const { navigate } = this.props.navigation;


        Backend.setFalci(falciNo).then(() => {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:false,falciNo:falciNo}})
            ]
          })
          this.props.navigation.dispatch(resetAction)
        })

    }

    payChat = (creditNeeded,falsever) => {
      this.setState({spinnerVisible:true})
      var products = [
         'com.grepsi.kahvefaliios.chat50',
      ];

      InAppUtils.loadProducts(products, (error, products) => {
        if(error){this.setState({spinnerVisible:false})}
        else{

          var identifier = 'com.grepsi.kahvefaliios.chat50'
          InAppUtils.purchaseProduct(identifier, (error, response) => {
            this.setState({spinnerVisible:false})
             // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
             if(error){

             }
             else{
               if(response && response.productIdentifier) {
                 navigate( "ChatFalsever",{falsever:falsever,first:true} )
                 Backend.addCredits(50-creditNeeded)
                 Backend.startChat(falsever,creditNeeded)
                 this.props.userStore.increment(50-creditNeeded)
                 var bilgilerref= firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler/'+falsever.fireID);
                 bilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,name:falsever.name,avatar:falsever.avatar,text:" "})
               }
             }
          });
        }
      });
    }

    delete = (falciNo,index) => {

      Alert.alert(
        'Konuşmayı Sil',
        'Bu konuşmayı kalıcı olarak silmek istediğine emin misin?',
        [

          {text: 'Hayır', onPress: () => {}, style: 'cancel'},
          {text: 'Evet', onPress: () => {Backend.deleteThread(falciNo); this.removeThread(index)}},
        ],
      )

    }

    deleteFalsever = (falciNo,index) => {

      Alert.alert(
        'Konuşmayı Sil',
        'Bu konuşmayı kalıcı olarak silmek istediğine emin misin?',
        [

          {text: 'Hayır', onPress: () => {}, style: 'cancel'},
          {text: 'Evet', onPress: () => {Backend.deleteFalsever(falciNo);}},
        ],
      )

    }

    removeThread = (index) => {
      var newList = this.state.messages;
      newList.splice(index, 1);
      this.setState({messages:newList})
    }

  componentDidMount() {


    var falseverref = firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler');
    falseverref.on('value',function(dataSnapshot){
        var falsevers=dataSnapshot.val()
        var unreadCount=0
        var data = falsevers
        var output =[]
        var aktifFalsevers=[]
        for (var key in data) {
            data[key].fireID = key;
            output.push(data[key]);
            if(data[key].read==false){
              unreadCount=unreadCount+1

            }
            if(moment().diff(data[key].createdAt,'days')>2){
              data[key].timePassed=true
            }
            else {
              aktifFalsevers.push(data[key])
            }

        }
        output.sort(function(b, a){
            var keyA = new Date(a.createdAt),
                keyB = new Date(b.createdAt);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        })
        this.props.socialStore.setFalseverUnread(unreadCount)
        this.props.socialStore.setActiveFalsevers(aktifFalsevers)
        this.setState({falsevers:output})
    }.bind(this))
  }

  componentDidUpdate(prevProps,prevState) {

    /*
    if(this.props.userStore.isAgent==true&&this.state.agentCheck==false){
      this.setState({agentCheck:true})
      this.trackTickets();
      if(this.props.userStore.hasTicket){

      }
    }*/
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);

  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      axios.post('https://eventfluxbot.herokuapp.com/appapi/getAllFals', {
        uid: Backend.getUid(),
      })
      .then( (response) => {

        var responseJson=response.data
        //this.props.socialStore.setTek(responseJson.tek)
        var sosyals=Array.from(responseJson.sosyals)
        var gunluks=Array.from(responseJson.gunluks)
        console.log("sosyals "+sosyals)
        this.setState({gunluks:gunluks,sosyals:sosyals})

      })
      .catch(function (error) {
        console.log(error)
      });
    }
    this.setState({appState: nextAppState});

  }

  goToFalsever = (message) => {
    if(message.timePassed){
      Alert.alert(
        "Konuşma Süresi Doldu",
        "Bu falsever ile konuşman süreniz sona ermiştir. 20 Kredi kullanarak konuşmaya devam edebilirsiniz.",
        [
          {text: 'İstemiyorum', onPress: () => {}},
          {text: 'Tamam', onPress: () => {
            if(this.props.userStore.userCredit<20){
              this.payChat(20,message)
            }
            else {
              const { navigate } = this.props.navigation;

              navigate( "ChatFalsever",{falsever:message,first:true} )
              Backend.addCredits(-20)
              this.props.userStore.increment(-20)
              var bilgilerref= firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler/'+message.fireID);
              bilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,name:message.name,avatar:message.avatar,text:" "})
              Backend.startChat(message,20)
            }

          }},
        ],
      )

    }
    else {
        this.props.navigation.navigate('ChatFalsever',{falsever:message})
    }

  }
  renderAktif = () => {
    if(this.state.aktifChat==null){
      return null
    }
    else{
      return(
        <View>
        <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Canlı Sohbetin</Text></View>
        <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} onPress={() => {this.navigateToAktif(this.state.aktifChat.key)}}>
         <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
            <View>
            <Image source={{uri:falcilar[this.state.aktifChat.key].url}} style={styles.falciAvatar}></Image>
            <View style={{height:12,width:12,borderRadius:6,backgroundColor:'#00FF00',right:8,top:8,position:'absolute'}}></View>
           </View>
           <View style={{padding:10,flex:2}}>
             <Text style={{fontWeight:'bold',fontSize:16}}>
               {falcilar[this.state.aktifChat.key].name}
              </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'}>
              {capitalizeFirstLetter(this.props.userStore.aktifLastMessage)}
             </Text>
           </View>
           <View style={{padding:20}}>
            {this.props.userStore.aktifUnread==1  ?    <View style={{height:26,width:26,borderRadius:13,backgroundColor:'red',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>1</Text></View> :    <Icon name="angle-right" color={'gray'} size={20} />}

             </View>
         </View>

        </TouchableOpacity>
        </View>
      )
    }
  }

  renderBody = (props) => {
    if(this.state.messages==null){
      return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      )
    }
    else if (this.state.messages.length==0) {
      return(
        <Text style={{textAlign:'center',backgroundColor:'transparent'}}> Eski falın bulunmuyor </Text>
      )
    }
    else{
      var messages = this.state.messages
      return (

         messages.map(function (message,index) {
           return (
             <TouchableOpacity key={message.key} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'rgb(215,215,215)'}} onPress={() => {this.navigateto('ChatOld',message.key)}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
                <Image source={{uri:falcilar[message.key].url}} style={styles.falciAvatar}></Image>

                <View style={{padding:10,flex:2}}>
                  <Text style={{fontWeight:'bold',fontSize:16}}>
                    {falcilar[message.key].name}
                   </Text>
                   <Text>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(message.createdAt).calendar()))}
                  </Text>
                </View>



                <TouchableOpacity onPress={() => {this.delete(message.key,index)}} style={{padding:20,borderLeftWidth:1,borderColor:'rgb(215,215,215)'}}>
                  <Icon name="trash-o" color={'gray'} size={20} />
                </TouchableOpacity>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
  }

  renderFalsevers = (props) => {
    if(this.state.falsevers==null){
      return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      )
    }
    else if (this.state.falsevers.length==0) {
      return(
        <View style={{backgroundColor:'#F9F8F9',flex:1}}>
          <Text style={{fontFamily:'SourceSansPro-Regular',textAlign:'center',marginTop:0,color:'black',padding:15,fontSize:16}}>Sohbetiniz bulunmamaktadır. Sosyal Panodaki falcılara mesaj göndererek sohbet başlatabilirsiniz!</Text>
        </View>
      )
    }
    else{
      var messages = this.state.falsevers
      return (
        <View>
          <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center',backgroundColor:'white',borderTopWidth:1,borderColor:'rgb(215,215,215)',padding:10}}>
           <Text style={{fontFamily:'SourceSansPro-Regular',fontSize:14}}>Özel mesaj almak istemiyorum</Text>
           <Switch  onTintColor={'rgb( 236, 196, 75)'} value={this.props.userStore.dmBlocked} onValueChange={()=>{this.props.userStore.changeDmStatus()}}/>
          </View>

        {
         messages.map(function (message,index) {
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'rgb(215,215,215)'}} onPress={() => {this.goToFalsever(message)}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',height:80,paddingLeft:15}}>
                <Image source={{uri:message.avatar}} style={styles.falciAvatar}></Image>

                <View style={{paddingLeft:10,flex:2}}>
                  <Text style={{fontFamily:'SourceSansPro-SemiBold',fontSize:15,color:'rgb(36, 20, 102)'}}>
                    {message.name}
                   </Text>
                   <Text style={{fontFamily:'SourceSansPro-Regular',fontSize:14}}>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(message.createdAt).calendar()))}
                  </Text>

                </View>
                {message.timePassed?       <View style={{alignSelf:'center',marginRight:15}}><Icon name="exclamation-circle" color={'red'} size={26} /></View>:null}
                {message.read ? null:   <View style={{marginTop:17,marginRight:15,height:26,width:26,borderRadius:13,backgroundColor:'red',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>1</Text></View> }
                <TouchableOpacity onPress={() => {this.deleteFalsever(message.fireID,index)}} style={{padding:25,borderLeftWidth:1,borderColor:'rgb(215,215,215)'}}>
                  <Icon name="trash-o" color={'rgb(36, 20, 102)'} size={25} />
                </TouchableOpacity>
              </View>

             </TouchableOpacity>
             );
         }, this)
       }

       </View>
      )
    }
  }

  renderAllSosyals = (props) => {


      var sosyaller = this.props.socialStore.allSocials
      if(sosyaller){
      if(sosyaller.length>0){
        return (

          <FlatList
            data={sosyaller}
            keyExtractor={this._keyExtractor}
            renderItem={({item,index}) => this.renderSosyalItem(item,index)}
          />

        )
      }
        else{
          return(
            <View style={{backgroundColor:'#F9F8F9',flex:1}}>
              <Text style={{fontFamily:'SourceSansPro-Regular',textAlign:'center',marginTop:0,color:'black',padding:15,fontSize:16}}>Hiç sosyal falın yok. Haydi ana sayfadan ilk sosyal falını paylaş!</Text>
            </View>
          )
        }
      }
      else{
        return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />)
      }
  }

  renderSosyalItem = (item,index) => {


    var profile_pic=null
    item.profile_pic?profile_pic={uri:item.profile_pic}:item.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
    return (
      <TouchableOpacity key={index}  style={{backgroundColor: "#ffffff",width:'100%',borderColor:'rgb(215,215,215)',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToSosyalFal(item,index)}}>
       <View style={{flexDirection:'row',height:80,paddingTop:10}}>

       <Image source={{uri:item.photos[0]}} style={styles.kahveAvatar}></Image>

         <View style={{padding:10,flex:1}}>

           <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5 , fontFamily: "SourceSansPro-Bold",
  fontSize: 15,
  fontWeight: "600",
  fontStyle: "normal",
  letterSpacing: 0,
  textAlign: "left",
  color: "#241466"}}>
             {item.question}
            </Text>
          <Text style={{fontFamily: "SourceSansPro-Regular",
  fontSize: 14,
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  textAlign: "left",
  color: "#948b99"}}>
               {capitalizeFirstLetter(replaceGecenHafta(moment(item.time).calendar()))}
              </Text>


         </View>
         <View style={{paddingRight:10,alignItems:'center',justifyContent:'flex-end',width:80,borderColor:'rgb(215,215,215)',flexDirection:'row'}}>
           {item.unread==0 ? null:   <View style={{marginRight:15,height:22,width:22,borderRadius:11,backgroundColor:'red',alignSelf:'center',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>{item.unread}</Text></View> }

            <Text style={{fontFamily: "SourceSansPro-Bold",
              fontSize: 15,
              fontWeight: "bold",
              fontStyle: "normal",
              letterSpacing: 0,
              textAlign: "right",flexDirection:"row",
              color: "#241466"}}>{"("+item.comments.length+")"}</Text>
         </View>
       </View>

      </TouchableOpacity>
      );
  }
  _keyExtractor = (item, index) => index.toString();


  renderAllGunluks = (props) => {


      var sosyaller = this.props.socialStore.allGunluks
      if(sosyaller){
      if(sosyaller.length>0){
        return (

        <FlatList
          data={sosyaller}
          keyExtractor={this._keyExtractor}
          renderItem={({item,index}) => this.renderGunlukItem(item,index)}
        />

        )
        }
        else{
          return(
            <View style={{backgroundColor:'#F9F8F9',flex:1}}>
              <Text style={{fontFamily:'SourceSansPro-Regular',textAlign:'center',marginTop:0,color:'black',padding:15,fontSize:16}}>Hiç günlük falın yok. Haydi ana sayfadan ilk günlük falını paylaş!</Text>
            </View>
          )
        }
      }
      else{
        return(

        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />)
    }
  }

  renderGunlukItem = (item,index) => {

    return (
      <TouchableOpacity key={index}  style={{backgroundColor: "#ffffff",width:'100%',borderColor:'rgb(215,215,215)',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToGunlukFal(item,index)}}>
       <View style={{flexDirection:'row',height:80,paddingTop:10}}>

       <Image source={{uri:item.photos[0]}} style={styles.kahveAvatar}></Image>

         <View style={{padding:10,flex:1}}>

           <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5 , fontFamily: "SourceSansPro-Bold",
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
         <View style={{paddingRight:10,paddingLeft:20,alignItems:'center',justifyContent:'center',width:80,borderColor:'teal',flexDirection:'row'}}>
            {item.unread==0 ? null:   <View style={{marginRight:15,height:22,width:22,borderRadius:11,backgroundColor:'red',alignSelf:'center',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>{item.unread}</Text></View> }
            <Text style={{fontFamily: "SourceSansPro-Bold",
  fontSize: 15,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  textAlign: "center",flexDirection:"row",
  color: "#241466"}}>{item.comments?item.comments.length>5?<Text> ({item.comments.length}) <Text style={{fontSize:16}}>🔥</Text></Text>:"("+item.comments.length+")":0}</Text>
         </View>
       </View>

      </TouchableOpacity>
      );
  }

  renderBizden = () => {
    if(this.state.lastBizden==null){
      return null
    }
    else{

      return(
        <View>
          <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} onPress={() => {this.navigateto('ChatBizden'); this.props.userStore.setBizdenUnread(0)}}>
           <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
              <View>
              <Image source={require('../static/images/anneLogo3.png')} style={styles.falciAvatar}></Image>

             </View>
             <View style={{padding:10,flex:2}}>
               <Text style={{fontWeight:'bold',fontSize:16}}>
                 Nevin
                </Text>
                <Text numberOfLines={1} ellipsizeMode={'tail'}>
                  {capitalizeFirstLetter(this.state.lastBizden)}
               </Text>
             </View>
             <View style={{padding:20}}>
             {this.props.userStore.bizdenUnread==1 ?    <View style={{height:26,width:26,borderRadius:13,backgroundColor:'red',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>1</Text></View> :    <Icon name="angle-right" color={'gray'} size={20} />}

            </View>
           </View>
          </TouchableOpacity>
        </View>

      )
    }
  }
  renderNotifications = () => {
    if(this.state.notifications==null){
      return null
    }
    else{

      return(
        <FlatList
          data={this.state.notifications}
          keyExtractor={this._keyExtractor}
          renderItem={({item,index}) => this.renderNotificationItem(item,index)}
        />

      )
    }
  }

  renderNotificationItem(item,index){
    return(
      <View>
        <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} onPress={() => {}}>
         <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
            <View>
            <Image source={require('../static/images/anneLogo3.png')} style={styles.falciAvatar}></Image>

           </View>
           <View style={{padding:10,flex:2}}>
             <Text style={{fontWeight:'bold',fontSize:16}}>
               Nevin
              </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'}>
                {item.text}
             </Text>
           </View>
           <View style={{padding:20}}>


          </View>
         </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {


    return (
      <ImageBackground source={require('../static/images/background.png')} style={styles.container}>

        <ScrollableTabView
          style={{flex:1,alignItems:'center',borderWidth:0,borderColor: 'rgb( 236, 196, 75)',justifyContent:'center'}}
          tabBarActiveTextColor='rgb(250, 249, 255)'
          tabBarBackgroundColor='#241466'
          tabBarInactiveTextColor='rgb( 118, 109, 151)'
          tabBarUnderlineStyle={{backgroundColor:'rgb( 236, 196, 75)', borderColor: 'rgb( 236, 196, 75)'}}
          tabBarTextStyle={{fontFamily:'SourceSansPro-Bold'}}
         >

         <ScrollView tabLabel={'FALLARIN ('+(this.props.socialStore.sosyalUnread+this.props.socialStore.gunlukUnread)+")"} style={{flex:1,width:'100%'}}>
           <View style={{flex:1}}>
             <View style={{height:50,justifyContent:'center',backgroundColor:'transparent',paddingLeft:23}}>
               <Text style={{fontFamily:'SourceSansPro-Bold',color:'rgb(250, 249, 255)'}}>SOSYAL FALLARIN</Text>
             </View>
             {this.renderAllSosyals()}
           </View>

          <View style={{flex:1}}>
            <View style={{height:50,justifyContent:'center',backgroundColor:'transparent',paddingLeft:23}}>
              <Text style={{fontFamily:'SourceSansPro-Bold',color:'rgb(250, 249, 255)'}}>GÜNLÜK FALLARIN</Text>
            </View>
            {this.renderAllGunluks()}
          </View>
         </ScrollView>
         <ScrollView tabLabel={'SOHBETLERİN ('+this.props.socialStore.falseverUnread+")"} style={{flex:1,width:'100%'}}>
          {this.renderFalsevers()}
         </ScrollView>
       </ScrollableTabView>
      </ImageBackground>
    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
  falciAvatar:{
    height:50,
    width:50,

    borderRadius:25,
  },
  kahveAvatar:{
    height:50,
    width:50,
    margin:7,
    marginLeft:15,
    borderRadius:5,
  },

});
