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
      var infoText=""
      this.state.profinfo.age?infoText=infoText+this.state.profinfo.age+" yaşında":null
      this.state.profinfo.iliski?infoText=infoText+", "+this.state.profinfo.iliski:null
      this.state.profinfo.meslek?infoText=infoText+", "+this.state.profinfo.meslek:null
      var falPuan =this.state.profinfo.falPuan
      var seviye = 1
      var limit =20
      var gosterilenpuan=falPuan
      var unvan = "Yeni Falsever"
      var kolor="#ffd967"
      if (falPuan>20&&falPuan<51){
        seviye = 2
        limit = 30
        gosterilenpuan=falPuan-20
        unvan = "Falsever"
        kolor='#e6d5a0'
      }else if (falPuan>50&&falPuan<101) {
        seviye = 3
        limit = 50
        gosterilenpuan=falPuan-50
        unvan = "Deneyimli Falsever"
        kolor='#8975cd'
      }else if (falPuan>100&&falPuan<176) {
        seviye = 4
        limit = 75
        gosterilenpuan=falPuan-100
        unvan = "Fal Uzmanı"
        kolor='rgb(184,30,94)'
      }
      else if (falPuan>175) {
        seviye = 5
        limit = 12500
        gosterilenpuan=falPuan
        unvan = "Fal Profesörü"
        kolor='rgb(103,35,120)'
      }
      return(
        <View style={{flexDirection:"column",justifyContent:"space-between"}}>

          <View style={{backgroundColor:'transparent',height:80,width:80,alignSelf:'center',borderRadius:40,elevation:4}} >
          <Image style={{backgroundColor:'transparent',height:80,width:80,alignSelf:'center',borderRadius:40}} source={this.state.profinfo.profile_pic}/>
          </View>


        <Text style={{alignSelf:'center',marginBottom:4,marginTop:4,fontFamily: "SourceSansPro-Bold",
      fontSize: 18,
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "center",
      color: "#241466"}}>{this.state.profinfo.name}</Text>
    {this.state.profinfo.bio? <Text style={{marginTop:10, fontFamily: "SourceSansPro-Italic",
  fontSize: 14,
  fontWeight: "normal",
  fontStyle: "italic",
  letterSpacing: 0,
  textAlign: "center",
  color: "#241466",marginBottom:10}}>{this.state.profinfo.bio}</Text>:null}

        <Text style={{fontFamily: "SourceSansPro-Italic",
  fontSize: 14,
  fontWeight: "normal",
  fontStyle: "italic",
  letterSpacing: 0,
  textAlign: "center",
  color: "#241466"}}>{infoText}</Text>
{this.state.profinfo.city? <Text style={{position:'relative',right:10,  fontFamily: "SourceSansPro-Italic",
  fontSize: 14,
  fontWeight: "normal",
  fontStyle: "italic",
  letterSpacing: 0,
  textAlign: "center",
  color: "#241466"}}>{"📍 "+this.state.profinfo.city}</Text>:null}

        <View style={{alignSelf:'center',alignItems:'center',marginTop:10,flexDirection:'row'}}>
          <Text style={{fontSize:16,color:kolor,fontWeight:'bold'}}>{unvan}</Text>
        </View>
        <View style={{alignSelf:'center',alignItems:'center',marginTop:10,marginBottom:15,flexDirection:'row'}}>
          <View style={{justifyContent:'center'}}>
            <View style={{position:'absolute',zIndex: 3,left:-12,elevation:3,justifyContent:'center',height:26,width:26,borderRadius:13,backgroundColor:kolor}}><Text style={{fontSize:14,backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>{seviye}</Text></View>
            <View style={{height:16,width:200,borderRadius:8,elevation:1}}>
              <View style={{height:16,width:200*(gosterilenpuan/limit),backgroundColor:kolor,borderRadius:8}}>
              </View>
              <Text style={{position:'absolute',bottom:0,elevation:2,backgroundColor:'rgba(0,0,0,0)',fontSize:12,alignSelf:'center',fontWeight:'bold',color:'rgb(55,32,142)'}}>{gosterilenpuan+"/"+limit}</Text>
            </View>

          </View>

     </View>
     <View style={{width:"100%",marginTop:15,height:1,
        backgroundColor: "#cecece"}}>
        </View>
     {/**/}

     {/**/}


        {this.state.profinfo.sosyal? this.renderKendiFali(this.state.profinfo.sosyal):<Text style={{textAlign:'center',marginTop:30,marginBottom: 20, fontFamily: "SourceSansPro-Regular",
  fontSize: 16,
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,

  color: "#37208e"}}>Yorum bekleyen fal bulunmamaktadır.</Text>}




        <TouchableOpacity style={ { width:'60%',
  flexDirection:'row',alignSelf:'center',
    height: 40,
  borderRadius: 4,
  backgroundColor: "#37208e",
  alignItems: 'center', justifyContent: 'center',marginTop:20}} onPress={()=>{this.startChat(this.state.profinfo,seviye)}}>


                    <View style={{ flex: 1, flexDirection: 'row-reverse', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                      <View style={{ flex: 1, flexDirection:"row", justifyContent: 'center', alignItems: 'center',top:3 }}>
                        <View style={ {

                                padding:8,alignItems:'center',

                                justifyContent:'center'}}>
                                 <Text style={{  fontFamily: "SourceSansPro-Bold",
                              fontSize: 12,
                              fontWeight: "bold",
                              fontStyle: "normal",
                              letterSpacing: 0,
                              textAlign: "center",
                              color: "#ffffff"}}>
                               {seviye*10}
                                           </Text>
                             </View>
                        <Image source={require("../static/images/sosyal/coins-copy.png")} />
                           </View>
                           <View style={{ flex: 2,  justifyContent: 'center', alignItems: 'center' }}>

                             <Text style={{fontFamily: "SourceSansPro-Bold",fontSize: 15,top:3,fontWeight: "bold",fontStyle: "normal",letterSpacing: 0,
                            textAlign: "center",
                            color: "#ffffff"}}>
                             Özel Mesaj
                             </Text>

                           </View>


                         </View>


                         <View style={{
                           flex: 2, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center',
                           height: 40,
                           borderRadius: 4,
                           backgroundColor: "#5033c0"
                         }}>
                         </View>
                         <View style={{
                           flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "transparent"
                         }}>
                         </View>



                  </TouchableOpacity>

      {/* part */}




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
         <View style={{width:"100%",flex:1}}>

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

  showProfPopup = (fireid,profPhoto) =>{
    this.popupDialog.show()
    this.setState({profinfo:null})
    fetch('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: fireid,
      })
    })
    .then((response) => response.json())
   .then((responseJson) => {
     //alert(responseJson.profile_pic)

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
  }

  renderLeaders = () => {
    var leaders = this.state.leaders
    if(leaders.length>0){
      return (

         leaders.map(function (leader,index) {

           var profile_pic=null
           leader.profile_pic?profile_pic={uri:leader.profile_pic}:leader.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.props.navigation.navigate('User',{fireid:leader.fireID,profPhotos:leader.profile_pic})}}>
              <View style={styles.row}>
                <View style={{width:40,justifyContent:'center',alignItems:'center'}}>
                  <Text style={styles.index}>{index+1+"."}</Text>
                </View>
                <Image source={profile_pic} onError={(error) => {}} style={styles.falciAvatar}></Image>

                  <View style={{width:"100%",flex:1,justifyContent:'center',}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.name}>
                    {leader.name}
                    </Text>


                  </View>
                  <View style={{width:"100%",justifyContent:'center', width: 70,marginTop:18,marginRight:15,
                                height: 45,
                                borderRadius: 4,
                                backgroundColor: "#e7e5e9"}}>

                    <Text style={{textAlign:'center',  fontFamily: "SourceSansPro-Regular",
                                fontSize: 12,
                                fontWeight: "normal",
                                fontStyle: "normal",
                                letterSpacing: 0,
                                textAlign: "center",
                                color: "#241466"}}>FalPuan</Text>
                              <Text style={{textAlign:'center', fontFamily: "SourceSansPro-Bold",
                                fontSize: 13,
                                fontWeight: "bold",
                                fontStyle: "normal",
                                letterSpacing: 0,
                                textAlign: "center",
                                color: "#241466"}}>{leader.falPuan}</Text>
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
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.props.navigation.navigate('User',{fireid:leader.fireID,profPhotos:leader.profile_pic})}}>
              <View style={styles.row}>
                <View style={{width:40,justifyContent:'center',alignItems:'center'}}>
                  <Text style={styles.index}>{index+1+"."}</Text>
                </View>
                <Image source={profile_pic} onError={(error) => {}} style={styles.falciAvatar}></Image>

                  <View style={{width:"100%",flex:1,justifyContent:'center',}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.name}>
                      {leader.name}
                     </Text>


                  </View>
                  <View style={{width:"100%",justifyContent:'center', width: 70,marginTop:18,marginRight:15,
  height: 45,
  borderRadius: 4,
  backgroundColor: "#e7e5e9"}}>

                    <Text style={{textAlign:'center',  fontFamily: "SourceSansPro-Regular",
  fontSize: 12,
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  textAlign: "center",
  color: "#241466"}}>FalPuan</Text>
<Text style={{textAlign:'center', fontFamily: "SourceSansPro-Bold",
  fontSize: 13,
  fontWeight: "bold",
  fontStyle: "normal",
  letterSpacing: 0,
  textAlign: "center",
  color: "#241466"}}>{leader.falPuan}</Text>
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
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.props.navigation.navigate('User',{fireid:leader.fireID,profPhotos:leader.profile_pic})}}>
              <View style={styles.row}>
                <View style={{width:40,justifyContent:'center',alignItems:'center'}}>
                  <Text style={styles.index}>{index+1+"."}</Text>
                </View>
                <Image source={profile_pic} onError={(error) => {}} style={styles.falciAvatar}></Image>

                  <View style={{width:"100%",flex:1,justifyContent:'center',}}>

                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.name}>
                      {leader.name}
                     </Text>


                  </View>
                  <View style={{width:"100%",justifyContent:'center', width: 70,marginTop:18,marginRight:15,
                                height: 45,
                                borderRadius: 4,
                                backgroundColor: "#e7e5e9"}}>

                    <Text style={{textAlign:'center',  fontFamily: "SourceSansPro-Regular",
                                fontSize: 12,
                                fontWeight: "normal",
                                fontStyle: "normal",
                                letterSpacing: 0,
                                textAlign: "center",
                                color: "#241466"}}>FalPuan</Text>
                              <Text style={{textAlign:'center', fontFamily: "SourceSansPro-Bold",
                                fontSize: 13,
                                fontWeight: "bold",
                                fontStyle: "normal",
                                letterSpacing: 0,
                                textAlign: "center",
                                color: "#241466"}}>{leader.falPuan}</Text>
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

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>
      <View style={{flex:1,width:'100%'}}>
        <ScrollableTabView
          style={{paddingTop:50,flex:1}}
         renderTabBar={()=><DefaultTabBar  activeTextColor='white' inactiveTextColor='#766d97' tabStyle={{height:40,alignSelf:"center",justifyContent:"center",alignItems:"center"}} underlineStyle={{backgroundColor:'#ecc44b'}} backgroundColor='#241466' />}
         tabBarPosition='overlayTop'
         >
         <ScrollView tabLabel='HAFTALIK YARIŞMA' style={{flex:1,width:"100%"}}>
          {this.renderWeeks()}
         </ScrollView>
         <ScrollView  tabLabel='GEÇEN HAFTA'  style={{flex:1,width:"100%"}}>
          {this.renderWeekResults()}
         </ScrollView>
         <ScrollView tabLabel='TÜM ZAMANLAR' style={{flex:1,width:"100%"}}>
           {this.renderLeaders()}
         </ScrollView>
       </ScrollableTabView>
       </View>
       <PopupDialog

        dialogStyle={{marginTop:-140}}
        width={0.9}
        height={430}
        ref={(popupDialog) => { this.popupDialog = popupDialog; }}
        >
          <View style={{flex:1}}>
            <ScrollView style={{width:"100%",paddingTop:25}}>
             {this.renderProfInfo()}


            </ScrollView>
          </View>
        </PopupDialog>
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
    width: 48,
    height: 48,
    margin:15,
    borderRadius:24,
    marginLeft:0,
    marginRight:0
  },
  row:{
    flexDirection:'row',
    height:80,
    borderBottomWidth:1,
    borderColor:"rgba(166,158,171,0.4)",
    backgroundColor: "#ffffff"

  },name:{
    fontFamily: "SourceSansPro-Regular",fontSize: 15,fontWeight: "600",fontStyle: "normal",letterSpacing: 0,textAlign: "left",color: "#241466",marginBottom:0,marginLeft:10
  },index:{
    fontFamily: "SourceSansPro-Bold",
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#241466"
  }

  });
