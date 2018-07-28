import React, {

} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  KeyboardAvoidingView,
  TextInput,Dimensions,
  Keyboard,
  Alert,
  ActivityIndicator,
  Share,
  ImageBackground
} from 'react-native';
import ScrollableTabView, { DefaultTabBar,  ScrollableTabBar,  } from 'react-native-scrollable-tab-view';
import PropTypes from 'prop-types';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
import Lightbox from 'react-native-lightbox';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Icon from 'react-native-vector-icons/FontAwesome';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}

@inject("socialStore")
@inject("userStore")
@observer
export default class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          fal:null,
          comments:null,
          keyboardHeight:0,
          inputHeight:40,
          keyboardAcik:false,
          commentInput:'',
          profinfo:null,
          replyingTo:false,
          writing:false,
          falowner:false,
          voters1:[],
          voters2:[],
          votedFor:false,
          expired:false,
          commentLikes:null,
          shouldSendMessage:true,
          hasActiveChat:null

      };

    }


    static navigationOptions =({ navigation }) =>  ({


        title: 'Fal Sever',

        headerStyle: {
          backgroundColor:'white',
          height: 46

        },headerRight:<View></View>,
        headerTitleStyle: {
          position:"absolute",fontWeight: 'bold',
          fontSize:18,
          textAlign: "center",
          color: "#241466",
    textAlign:'center',alignSelf: 'center'
        },
        tabBarLabel: 'Profil',
         tabBarIcon: ({ tintColor }) => (
           <Icon name="user" color={tintColor} size={25} />
         ),
      });




      componentDidMount(){
        var userID=this.props.navigation.state.params.fireid
        this.setUser(userID,this.props.navigation.state.params.profPhotos)
        this.props.socialStore.activeFalsevers.map((x)=>{x.fireID==userID&&this.setState({hasActiveChat:x});})
      }


      startChat = (falsever,seviye) => {
        if(this.state.hasActiveChat){
          const { navigate } = this.props.navigation;
          navigate( "ChatFalsever",{falsever:this.state.hasActiveChat} )
        }
        else {
          if(this.state.shouldSendMessage==false){
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
              Backend.startChat(falsever,creditNeeded)
              var bilgilerref= firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler/'+falsever.fireID);
              bilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,name:falsever.name,avatar:falsever.avatar,text:" "})
            }
          }
        }

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

      setUser = (fireid,profPhoto) =>{
        //this.popupDialog2.dismiss()
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
        // alert(responseJson.profile_pic)

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

          }).then(()=>{this.props.userStore.isAdmin!=true&&(this.state.profinfo.blockedUsers!=null&&this.state.profinfo.blockedUsers.map((x)=>{x==Backend.getUid()&&this.setState({shouldSendMessage:false});}));})
          //this.popupDialog.show()
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
            <View style={{flexDirection:"column",justifyContent:"space-between",width:"100%",flex:1}}>
               <View style={{position:"absolute",top:15,zIndex:10,backgroundColor:'transparent',height:80,width:80,alignSelf:'center',borderRadius:40,elevation:4}} >
                 <Lightbox navigator={null} renderContent={() => { return(<Image source={this.state.profinfo.profile_pic} style={{flex:1,resizeMode:'contain' ,  shadowColor: "rgba(0, 0, 0, 0.2)",
                   shadowOffset: {
                      width: 0,
                      height: 2
                    },
                    shadowRadius: 2,
                    shadowOpacity: 1,}}></Image>)}} style={{height:85}}>

                    <Image source={this.state.profinfo.profile_pic} style={{  backgroundColor:'transparent',height:80,width:80,alignSelf:'center',borderRadius:40,zIndex:11}}></Image>
                   </Lightbox>
              </View>
            <View style={{flex:1,marginTop:55,paddingTop:35,position:'relative',top:0,width:Dimensions.get("window").width,backgroundColor:'white',flexDirection:'column',borderRadius:5,width:"100%"}}>


            <Text style={{alignSelf:'center',marginBottom:4,marginTop:4,fontFamily: "SourceSansPro-Bold",
          fontSize: 18,
          fontWeight: "bold",
          fontStyle: "normal",
          letterSpacing: 0,
          textAlign: "center",
          color: "#241466"}}>{this.state.profinfo.name}

          {/* {JSON.stringify(this.state.profinfo.blockedUsers)}
          {JSON.stringify(Backend.getUid())} */}
          </Text>
            {this.state.profinfo.bio? <Text style={{marginTop:10, fontFamily: "SourceSansPro-Italic",
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "italic",
      letterSpacing: 0,
      textAlign: "center",
      color: "#241466",marginBottom:10}}>{this.state.profinfo.bio}



      </Text>:null}

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
              <Text style={{fontSize:16,color:kolor,fontWeight:'bold'}}>{unvan}


              </Text>
            </View>
            <View style={{alignSelf:'center',alignItems:'center',marginTop:10,marginBottom:15,flexDirection:'row'}}>
              <View style={{justifyContent:'center'}}>
                <View style={{position:'absolute',zIndex: 3,left:-12,elevation:3,justifyContent:'center',height:26,width:26,borderRadius:13,backgroundColor:kolor}}><Text style={{fontSize:14,backgroundColor:'transparent',color:'rgb(227,159,47)',fontWeight:'bold',textAlign:'center'}}>{seviye}</Text></View>
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
         </View>
         <View style={{flex:1,paddingTop:15,position:'relative',paddingBottom:15,top:0,marginTop:15,marginBottom:50,width:'100%',backgroundColor:'white',flexDirection:'column',justifyContent:'center',borderRadius:5}}>

         {/**/}


            {this.state.profinfo.sosyal? this.renderKendiFali(this.state.profinfo.sosyal):<Text style={{textAlign:'center',marginTop:30,marginBottom: 30, fontFamily: "SourceSansPro-Regular",
      fontSize: 16,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      width:Dimensions.get("window").width-30,
      color: "#37208e"}}>Yorum bekleyen fal bulunmamaktadır.</Text>}




      <TouchableOpacity style={ { width:'60%',
        flexDirection:'row',alignSelf:'center',
            height: 40,
          borderRadius: 4,
          backgroundColor: "#37208e",
          marginTop:30,marginBottom:25,  alignItems: 'center', justifyContent: 'center'}} onPress={()=>{this.startChat(this.state.profinfo,seviye)}}>
          <View style={{ flex: 1, flexDirection: 'row-reverse', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>
            {this.state.hasActiveChat?

              <View style={{ flex: 1, flexDirection:"row", justifyContent: 'center', alignItems: 'center', }}>

                  <View style={ {
                          padding:12,alignItems:'center',
                          justifyContent:'center'}}>
                    <Icon name="chevron-right" color={'white'} size={18} />
                  </View>
                </View>
                :
            <View style={{ flex: 1, flexDirection:"row", justifyContent: 'center', alignItems: 'center', }}>
              <View style={ {
                      padding:12,alignItems:'center',
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
            }
                 <View style={{ flex: 2,  justifyContent: 'center', alignItems: 'center' }}>

                   <Text style={{fontFamily: "SourceSansPro-Bold",fontSize: 15,fontWeight: "bold",fontStyle: "normal",letterSpacing: 0,
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

          </View>

        )
        }
        else {
          return(<ActivityIndicator/>)
        }
      }

      AlertBlocked = (name) => {
        Alert.alert(name+" sizden özel mesaj almak istememektedir.")
      }
      navigateToFal = (fal) => {
        const { navigate } = this.props.navigation;
        navigate( "SocialFal",{fal:fal} )
      }
      renderKendiFali = (kendiFali) =>{
        var sosyal=kendiFali
        return(
        <View style={{flex:1}}>

          <View style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,width:"100%",paddingTop:12,paddingBottom:15,backgroundColor:	"#F9F8F9",borderColor:"#979797"}}>
                      <View style={{marginLeft:17}}>
                          <TouchableOpacity style={{marginTop:3}}onPress={() => {this.navigateToFal(sosyal)}}>



                        {/* <View style={{position:'absolute',top:56,elevation:2,left:45,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{comment.seviye?comment.seviye:1}</Text></View> */}
                      <View style={{padding:0,flex:2,marginTop:0,marginRight:0}}>
                        <Text style={{  fontFamily: "SourceSansPro-Bold",
                                        fontSize: 15,
                                        fontWeight: "bold",
                                        fontStyle: "normal",
                                        letterSpacing: 0,
                                        textAlign: "left",
                                        color: "#000000",marginBottom:5}}>
                          {this.state.profinfo.name} <Text style={{ fontFamily: "SourceSansPro-Regular",fontSize: 14,fontWeight: "normal",fontStyle: "normal",letterSpacing: 0,textAlign: "center",color: "#948b99"}}>
                          -{" "}{capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}
                          </Text>
                        </Text>
                        <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                        <Text numberOfLines={2} ellipsizeMode={'tail'} style={{ fontFamily: "SourceSansPro-Regular",
                                        fontSize: 14,
                                        fontWeight: "normal",
                                        fontStyle: "normal",
                                        letterSpacing: 0,
                                        textAlign: "left",
                                        color: "#000000",width:"80%"}}>
                          {sosyal.question}
                        </Text>

                         <Text style={{textAlign:'right',color:'black',width:"15%"}}>{sosyal.comments?sosyal.comments.length>5?<Text><Text style={{fontSize:16}}>🔥</Text> ({sosyal.comments.length})</Text>:"("+sosyal.comments.length+")":0}</Text>
                                        </View>
                          </View>
                          </TouchableOpacity>

                        </View>

          </View>

           {/**/}


          {/**/}
        </View>
        )

      }

      render() {

    return (
      <ImageBackground  source={require('../static/images/background.png')} style={styles.container}>
<ScrollView style={{padding:0,paddingTop:25}}>
              {this.renderProfInfo()}
{/* <Text>{JSON.stringify(this.props.navigation.state.params.fireid)}</Text>
<Text>{JSON.stringify(this.props.navigation.state.params.profPhotos)}</Text>
<Text>{JSON.stringify(this.state.profinfo)}</Text> */}


             </ScrollView>

      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    padding:0,
    paddingTop:0,
    paddingBottom:0,

    backgroundColor:'rgba(48,35,174,1)'

  },
  drawerVisible:{
    width: "50%",
  },
  drawer:{
    height: "100%",
    width: 0,
    position: "absolute",
    zIndex: 1000,elevation:10,
    top: 0,
    left: 0,
    backgroundColor: "#111",


    paddingTop: 60,
    textAlign:"center"
  },
  pickerContainer: {
    borderColor:'white',

    borderTopWidth:2,
    backgroundColor:'transparent',
    paddingLeft:25,
    paddingRight:25,

    backgroundColor:'white',
    flex:1,
    width:'100%',

  },
  picker:{
    flexDirection:'row',justifyContent:'space-between',padding:10,marginBottom:10,alignItems:'center',backgroundColor:'#676891',width:'100%',height:40,borderRadius:4
  },
  nameinput:{
    fontSize:14,fontWeight:'bold',backgroundColor:'transparent',color:'dimgray',justifyContent:'space-between',alignItems:'center',backgroundColor:'#f9f9fb',width:'70%',height:30
  },
  pickerText:{
    backgroundColor:'transparent',color:'white',fontFamily:'SourceSansPro-Semibold',fontSize:12,paddingLeft:10,paddingRight:10
  },
  inputwrap:{
    flexDirection:'row',justifyContent:'space-between',paddingLeft:10,paddingRight:10,marginBottom:10,alignItems:'center',backgroundColor:'#f9f9fb',width:'100%',height:30,borderRadius:5
  },

  profileButton:{
    borderWidth:0,borderColor:'rgba(245,245,245,0.25)',height:30

  }
});
