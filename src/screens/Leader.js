import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import axios from 'axios';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';
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
export default class Leader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leaders:[],
      profinfo:null,
      weeks:[],
      weekResults:[]
  };
}

  static navigationOptions = {
      title: 'Puan Tablosu',
    };

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
                 this.props.userStore.increment(50-creditNeeded)
                 Backend.startChat(falsever,creditNeeded)
                 var bilgilerref= firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler/'+falsever.fireID);
                 bilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,name:falsever.name,avatar:falsever.avatar,text:" "})
               }
             }
          });
        }
      });
    }

    startChat = (falsever,seviye) => {
      if(falsever.dmBlocked){
        Alert.alert(falsever.name+" özel mesaj almak istememektedir")
      }
      else {
        var creditNeeded=seviye*10
        falsever.avatar=falsever.profile_pic.uri
        if(this.props.userStore.userCredit<creditNeeded){
          Alert.alert(
            'Kredi Gerekli',
            'Sohbet başlatmak için kredi gerekiyor. Fal Puanlarınızı krediye çevirerek veya kredi satın alarak devam edebilirsiniz',
            [
              {text: 'İstemiyorum', onPress: () => {}},
              {text: 'Tamam', onPress: () => {
                this.payChat(creditNeeded,falsever)

              }},
            ],
          )
        }
        else {
          const { navigate } = this.props.navigation;

          navigate( "ChatFalsever",{falsever:falsever,first:true} )
          Backend.addCredits(creditNeeded*-1)
          this.props.userStore.increment(creditNeeded*-1)
          var bilgilerref= firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler/'+falsever.fireID);
          bilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,name:falsever.name,avatar:falsever.avatar,text:" "})
          Backend.startChat(falsever,creditNeeded)
        }
      }
    }



  componentDidMount() {

    axios.post('https://eventfluxbot.herokuapp.com/appapi/getLeaders', {
      uid: Backend.getUid(),
      yeni:true
    })
    .then( (response) => {
      var responseJson=response.data

      var leaders=Array.from(responseJson.leaders)
      var weeks=Array.from(responseJson.weeks)
      var weekResults=Array.from(responseJson.weekresults)
      this.setState({leaders:leaders,weeks:weeks,weekResults:weekResults});
    })
    .catch(function (error) {

    });



  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }

  renderProfInfo = () => {
    if(this.state.profinfo){
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
        <Text style={{alignSelf:'center'}}>{this.state.profinfo.age+" yaşında, "+this.state.profinfo.iliski+", "+this.state.profinfo.meslek}</Text>
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
    }

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
    </View>
    )

  }

  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
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
          this.setState({profinfo:responseJson});

    })
    .catch(function (error) {

    });

  }

  renderLeaders = () => {
    var leaders = this.state.leaders
    if(leaders.length>0){
      return (

         leaders.map(function (leader,index) {

           var profile_pic=null
           leader.profile_pic?profile_pic={uri:leader.profile_pic}:leader.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.showProfPopup(leader.fireID,leader.profile_pic)}}>
              <View style={{flexDirection:'row',height:60}}>
                <View style={{width:40,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontWeight:'bold',fontSize:22}}>{index+1+"."}</Text>
                </View>
                <Image source={profile_pic} onError={(error) => {}} style={styles.falciAvatar}></Image>

                  <View style={{padding:10,flex:1,justifyContent:'center',}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
                      {leader.name}
                     </Text>


                  </View>
                  <View style={{padding:15,justifyContent:'center',width:100,borderColor:'teal'}}>

                    <Text style={{textAlign:'center',color:'black'}}>FalPuan</Text>
                    <Text style={{textAlign:'center',fontSize:18,fontWeight:'bold',color:'black'}}>{leader.falPuan}</Text>
                  </View>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
    else if(leaders.length==0){
      return(
      <ActivityIndicator
        animating={true}
        style={[styles.centering, {height: 80}]}
        size="large"
      />)
    }
  }

  renderWeeks = () => {
    var leaders = this.state.weeks
    if(leaders.length>0){
      return (

         leaders.map(function (leader,index) {

           var profile_pic=null
           leader.profile_pic?profile_pic={uri:leader.profile_pic}:leader.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.showProfPopup(leader.fireID,leader.profile_pic)}}>
              <View style={{flexDirection:'row',height:60}}>
                <View style={{width:40,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontWeight:'bold',fontSize:22}}>{index+1+"."}</Text>
                </View>
                <Image source={profile_pic} onError={(error) => {}} style={styles.falciAvatar}></Image>

                  <View style={{padding:10,flex:1,justifyContent:'center',}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
                      {leader.name}
                     </Text>


                  </View>
                  <View style={{padding:15,justifyContent:'center',width:100,borderColor:'teal'}}>

                    <Text style={{textAlign:'center',color:'black'}}>FalPuan</Text>
                    <Text style={{textAlign:'center',fontSize:18,fontWeight:'bold',color:'black'}}>{leader.falPuan}</Text>
                  </View>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
    else if(leaders.length==0){
      return(
      <ActivityIndicator
        animating={true}
        style={[styles.centering, {height: 80}]}
        size="large"
      />)
    }
  }

  renderWeekResults = () => {
    var leaders = this.state.weekResults
    if(leaders.length>0){
      return (

         leaders.map(function (leader,index) {

           var profile_pic=null
           leader.profile_pic?profile_pic={uri:leader.profile_pic}:leader.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.showProfPopup(leader.fireID,leader.profile_pic)}}>
              <View style={{flexDirection:'row',height:60}}>
                <View style={{width:40,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontWeight:'bold',fontSize:22}}>{index+1+"."}</Text>
                </View>
                <Image source={profile_pic} onError={(error) => {}} style={styles.falciAvatar}></Image>

                  <View style={{padding:10,flex:1,justifyContent:'center',}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:14}}>
                      {leader.name}
                     </Text>


                  </View>
                  <View style={{padding:15,justifyContent:'center',width:100,borderColor:'teal'}}>

                    <Text style={{textAlign:'center',color:'black'}}>FalPuan</Text>
                    <Text style={{textAlign:'center',fontSize:18,fontWeight:'bold',color:'black'}}>{leader.falPuan}</Text>
                  </View>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
    else if(leaders.length==0){
      return(
      <ActivityIndicator
        animating={true}
        style={[styles.centering, {height: 80}]}
        size="large"
      />)
    }
  }

  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
      <ScrollableTabView
        style={{paddingTop:50,flex:1}}
       renderTabBar={()=><DefaultTabBar  activeTextColor='white' inactiveTextColor='lightgray' tabStyle={{height:40}} underlineStyle={{backgroundColor:'white'}} backgroundColor='teal' />}
       tabBarPosition='overlayTop'
       >
       <ScrollView tabLabel='Haftalık Yarışma' style={{flex:1,width:'100%'}}>
        {this.renderWeeks()}
       </ScrollView>
       <ScrollView tabLabel='Geçen Haftanın Kazananları' style={{flex:1,width:'100%'}}>
        {this.renderWeekResults()}
       </ScrollView>
       <ScrollView tabLabel='Tüm Zamanlar' style={{flex:1,width:'100%'}}>
         {this.renderLeaders()}
       </ScrollView>
     </ScrollableTabView>

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

});
