import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  KeyboardAvoidingView,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Alert,
  Button,
  Switch,
    ImageBackground,
  Share
} from 'react-native';
import axios from 'axios';
import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import StarRating from 'react-native-star-rating';
import { NavigationActions,SafeAreaView } from 'react-navigation'
import moment from 'moment';
import Lightbox from 'react-native-lightbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}

@inject("userStore")
@inject("socialStore")
@observer
export default class GunlukFal extends React.Component {
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
      starCount: 0,
      sikayet:"",
      spinnerVisible:false,
  };
}

  static navigationOptions = ({ navigation }) => ({
      title: 'Günlük Fal',
      headerRight:<Button title={"Puan Ver"} onPress={() => {navigation.state.params.showpopup()}}/>,
  });


    showpopup = () => {
      this.popupRate.show()
    }

    payBahsis = (bahsis) => {
      this.setState({spinnerVisible:true})
      var products = [
         'com.grepsi.kahvefaliios.bahsis'+bahsis,
      ];
      InAppUtils.loadProducts(products, (error, products) => {
        if(error){this.setState({spinnerVisible:false})}
        else{

          var identifier = 'com.grepsi.kahvefaliios.bahsis'+bahsis
          InAppUtils.purchaseProduct(identifier, (error, response) => {
            this.setState({spinnerVisible:false})
             // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
             if(error){

             }
             else{
               if(response && response.productIdentifier) {
                 Backend.sendPayload('bahsis'+bahsis)
                 Backend.addCredits(0,"bahsis"+bahsis)
                 Alert.alert('Bahşiş',"Memnun kalmanıza çok sevindik. Bahşişiniz falcımıza iletiliyor.")
               }
             }
          });
        }
      });
    }

  componentDidMount() {
    this.props.navigation.setParams({ showpopup: this.showpopup})
    const { params } = this.props.navigation.state;
    //this.props.socialStore.setUnread(0)
    var id =Backend.getUid()
    if(params.fal){
      this.setState({fal:params.fal,comments:params.fal.comments})

      if(params.fal.unread>0){
        Backend.setGunlukRead(params.fal._id).then(()=>{
          Backend.getAllFals().then( (response) => {
             this.props.socialStore.setAllFals(response)
          })
        })
      }
    }
    else if (params.falId) {

      Backend.getGunluk(params.falId).then( (response) => {
        if(response.unread>0){
          Backend.setGunlukRead(params.falId).then(()=>{
            Backend.getAllFals().then((response) => {
               this.props.socialStore.setAllFals(response)
            })
          })
        }
        this.setState({fal:response,comments:response.comments});
      })
    }


  }

  componentDidUpdate() {

  }

  componentWillMount () {
   this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
   this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
 }

 componentWillUnmount () {
   this.keyboardDidShowListener.remove();
   this.keyboardDidHideListener.remove();
 }

 _keyboardDidShow = (e) => {
   //alert(JSON.stringify(e.endCoordinates));
   this.setState({keyboardHeight:e.endCoordinates.height})
 }

 _keyboardDidHide = () =>  {
  // alert('Keyboard Hidden');
  this.setState({keyboardHeight:0})
 }

 onStarRatingPress = (rating) => {
   this.setState({
     starCount: rating
   });
 }

 sendReview = () => {
   if(this.state.starCount==0){
     alert('Lütfen önce puan veriniz')
   }
   else{
     if(this.state.starCount<3){
       Alert.alert('Puanlama',"Yorumlarınız bizim için çok değerli. Puanlamanız için teşekkür ederiz.")
       fetch('https://eventfluxbot.herokuapp.com/sendMail', {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           uid: Backend.getUid(),
           star:this.state.starCount,
           text:this.state.sikayet,
           falci:this.state.falciNo
         })
       })
       this.popupRate.dismiss()
     }
     else{
       fetch('https://eventfluxbot.herokuapp.com/sendMail', {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           uid: Backend.getUid(),
           star:this.state.starCount,
           text:this.state.sikayet,
           falci:this.state.falciNo
         })
       })
       Keyboard.dismiss()
       this.popupRate.dismiss()
       this.popupBahsis.show()
     }
   }
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

 updateSize = (height) => {
    //alert(height)
    this.setState({
      inputHeight:height
    });
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
            meslek='Kendi İşi';
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

  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
  }

  sendtoSuper = () =>{
    const { navigate } = this.props.navigation;
    navigate( "FalPaylas",{type:1,photos:this.state.fal.photos} )
  }

  addComment = () => {
    const { params } = this.props.navigation.state;
    var index = params.index
    if(this.state.commentInput.length<40){
      Alert.alert("Kısa Yorum","Lütfen daha uzun ve detaylı yorumlayın.")
    }
    else {
      if(this.state.commentInput.length>600){
        Alert.alert("Çok Uzun Yorum","Lütfen yorumunuzu biraz daha kısa tutun.")
      }
      else{
        this.setState({commentInput:''})
        var falPuan =this.props.userStore.user.falPuan
        var seviye = 1
        if (falPuan>20&&falPuan<51){
          seviye = 2
        }else if (falPuan>50&&falPuan<101) {
          seviye = 3
        }else if (falPuan>100&&falPuan<176) {
          seviye = 4
        }
        else if (falPuan>175) {
          seviye = 5
        }
        var comment={comment:this.state.commentInput,parentIndex:this.state.replyingTo,createdAt: new Date(),name:this.props.userStore.userName,fireID:Backend.getUid(),seviye:seviye,photoURL:firebase.auth().currentUser.photoURL}
        var newcomments=this.state.comments
        if(this.state.replyingTo){
          newcomments.splice(this.state.replyingTo, 0, comment);
          //console.log(newcomments[this.state.replyingTo].name)
        }
        else {
          newcomments.push(comment)
          this.setState({comments:newcomments})
        }
        Keyboard.dismiss()
        Backend.addComment(this.state.fal._id,comment,this.props.userStore.user.commented)
        /*
        if(!this.props.userStore.user.commented){
          setTimeout(()=>{Alert.alert("Teşekkürler","İlk yorumunuzu yaptığınız için 15 Kredi kazandınız!")},200)
          this.props.userStore.setCommentedTrue()
          Keyboard.dismiss()
        }*/

      }
    }
  }


    deleteComment = (index) => {
      Alert.alert(
        'Yorum Silimi',
        'Bu yorumu silmek istediğinden emin misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {

            Backend.deleteComment(this.state.fal._id,index)
            var comments = this.state.comments
            comments.splice(index,1)
            this.setState({comments:comments})
          }},
        ],
      )
    }

  renderCommentDelete = (index) => {
    if(this.state.falowner==true){
      return (
        <TouchableOpacity style={{width:20,alignItems:'center',justifyContent:'center',borderColor:'gray',borderWidth:1,height:20}} onPress={() => {this.deleteComment(index)}}>
          <Icon name="times" color={'red'} size={15} />

        </TouchableOpacity>
      );
    }
  }

  renderComments = () => {
    if(this.state.comments.length>0){
      return(
        <ScrollView style={{flex:1,backgroundColor:'#f8fff8'}}>

          {
            this.state.comments.map(function (comment,index) {
              var liked = false;
              var disliked = false;
              var likecount=0;
              var dislikecount=0;
              var kolor='rgb(209,142,12)'
              var id = Backend.getUid()

              switch(comment.seviye) {
                  case 2:
                      kolor='rgb(60,179,113)'
                      break;
                  case 3:
                      kolor='rgb(114,0,218)'
                      break;
                  case 4:
                      kolor='rgb(0,185,241)'
                      break;
                  case 5:
                      kolor='rgb(249,50,12)'
                      break;
              }


                return (
                  <View  key={index}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,backgroundColor:comment.parentIndex?'#F9F8F9':'#F2F1F3',borderColor:'gray'}}>
                    <View style={{marginLeft:comment.parentIndex?47:0}}>
                        <TouchableOpacity style={{marginTop:17}} onPress={() => {this.props.navigation.navigate('User',{fireid:comment.fireID,profPhotos:comment.profile_pic})}}>
                          {comment.fireID==this.state.fal.fireID?<Text style={{fontSize:12,textAlign:'center',color:'#241466',fontStyle:'italic'}}>Fal Sahibi</Text>:null}
                          <Image source={{uri:comment.photoURL}} style={styles.falciAvatar}></Image>
                        </TouchableOpacity>
                      <View style={{position:'absolute',top:comment.fireID==this.state.fal.fireID?72:56,elevation:2,left:45,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{comment.seviye?comment.seviye:1}</Text></View>
                     </View>
                    <View style={{padding:10,flex:2,marginTop:7,marginRight:5}}>
                      <Text style={{  fontFamily: "SourceSansPro-Bold",
                                      fontSize: 15,
                                      fontWeight: "bold",
                                      fontStyle: "normal",
                                      letterSpacing: 0,
                                      textAlign: "left",
                                      color: "#000000",marginBottom:5}}>
                        {comment.name} <Text style={{ fontFamily: "SourceSansPro-Regular",fontSize: 14,fontWeight: "normal",fontStyle: "normal",letterSpacing: 0,textAlign: "center",color: "#948b99"}}>
                          -{" "}{capitalizeFirstLetter(replaceGecenHafta(moment(comment.createdAt).calendar()))}
                        </Text>
                      </Text>
                      <Text style={{ fontFamily: "SourceSansPro-Regular",
                                      fontSize: 14,
                                      fontWeight: "normal",
                                      fontStyle: "normal",
                                      letterSpacing: 0,
                                      textAlign: "left",
                                      color: "#000000"}}>
                        {comment.comment}
                      </Text>

                    </View>

                  </View>



                  </View>


                  );


            }, this)
          }
            <Text style={{textAlign:'center',color:'rgb(89, 70, 159)',fontSize:14,padding:5,fontFamily:'SourceSansPro-Italic'}}>Günlük falınız tamamlanmıştır...{"\n"}Dilerseniz falınızı <Text style={{textDecorationLine:'underline'}} onPress={()=>{this.showpopup()}}>buradan</Text> değerlendirebilirsiniz</Text>
          <View style={{backgroundColor:'#241466',padding:20}}>

            <TouchableOpacity  onPress={() => {this.sendtoSuper();}} style={{flex:1,alignItems:'center',flexDirection:'row',height:55,borderRadius:4,backgroundColor:'rgb( 236 ,196 ,75)',justifyContent:'center'}}>
              <Text style={{textAlign:'center',color:'white',fontFamily:'SourceSansPro-Bold'}}>SORU SOR VE DAHA FAZLA YORUM AL    </Text>
              <Icon name="share" color={'white'} size={15} />
            </TouchableOpacity>

          </View>

        </ScrollView>
      )
    }
    else{
      return(
        <View style={{backgroundColor:'#F9F8F9',flex:1}}>
          <Text style={{textAlign:'center',marginTop:5,color:'black',padding:15,fontSize:16}}>Haydi bu fala yorum yapan ilk 3 kişiden biri ol, <Text style={{fontWeight:'bold'}}>2 kat</Text> FalPuan kazan 😉</Text>
        </View>
      )
    }
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

       {/**/}


          {this.state.profinfo.sosyal? this.renderKendiFali(this.state.profinfo.sosyal):<Text style={{textAlign:'center',marginTop:30,marginBottom: 30, fontFamily: "SourceSansPro-Regular",
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
    marginTop:15,  alignItems: 'center', justifyContent: 'center',marginTop:15}} onPress={()=>{this.startChat(this.state.profinfo,seviye)}}>


                      <View style={{ flex: 1, flexDirection: 'row-reverse', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                        <View style={{ flex: 1, flexDirection:"row", justifyContent: 'center', alignItems: 'center', }}>
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

      )
      }
      else {
        return(<ActivityIndicator/>)
      }
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



  renderBody = () => {
      var fal = this.state.fal
      if(fal){
        var profile_pic=null
        fal.profile_pic?profile_pic={uri:fal.profile_pic}:fal.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
        var meslek =''
        switch(fal.workStatus) {
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
              meslek='Kendi İşi';
              break;
        }
        var iliski =''
        switch(fal.relStatus) {
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
        return(
            <View style={{flex:1}}>


              <View style={{alignItems:'flex-start',flexDirection:'row',backgroundColor:'#f7f7f7',justifyContent:'flex-start',borderColor:'gray',borderBottomWidth:0,paddingTop:8, height: 78}}>
                <TouchableOpacity style={{}} onPress={()=>{this.showProfPopup(this.state.fal.fireID,this.state.fal.profile_pic)}}>
                  <Image source={profile_pic} style={styles.falciAvatar}></Image>
                </TouchableOpacity>
                <View style={{paddingTop:10,paddingLeft:2}}>
                  <Text style={{  fontFamily: "SourceSansPro-Bold",
                                  fontSize: 15,
                                  fontWeight: "bold",
                                  fontStyle: "normal",
                                  letterSpacing: 0,
                                  textAlign: "left",
                                  color: "#000000"}}>
                    {fal.name}
                   </Text>
                   <Text style={{fontFamily: "SourceSansPro-Bold",
                                  fontSize: 14,
                                  fontWeight: "bold",
                                  fontStyle: "normal",
                                  letterSpacing: 0,
                                  textAlign: "left",
                                  color: "#948b99"}}>
                     {fal.age+" yaşında, "+iliski+", "+meslek}<Text style={{color:'teal'}}>

                     </Text>
                  </Text>
                </View>
              </View>

              <View style={{backgroundColor:'white',width:'100%',flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:115,paddingBottom:10}}>

              {
                fal.photos.map(function (foto,index) {

                  return (
                    <View style={{flex:1,height:85,margin:10,elevation:3}} key={index}>
                     <Lightbox navigator={null} renderContent={() => { return(<Image source={{uri:foto}} style={{flex:1,resizeMode:'contain' ,  shadowColor: "rgba(0, 0, 0, 0.2)",
                                shadowOffset: {
                                  width: 0,
                                  height: 2
                                },
                                shadowRadius: 2,
                                shadowOpacity: 1,}}></Image>)}} style={{height:85}}>

                      <Image source={{uri:foto}} style={{  width: 85,
                                height: 85,
                                borderRadius: 4,
                                shadowColor: "rgba(0, 0, 0, 0.2)",
                                shadowOffset: {
                                  width: 0,
                                  height: 2
                                },
                                shadowRadius: 2,
                                shadowOpacity: 1,alignSelf:'center'}}></Image>
                     </Lightbox>
                     </View>
                    );
                }, this)}
              </View>
              <Banner
                 unitId={'ca-app-pub-6158146193525843/6972275728'}
                 request={request.build()}
                 onAdFailedtoLoad={() => {

                 }}
                 onAdLoaded={() => {

                   }}
               />
             <Text style={{backgroundColor:'rgb(89, 70, 159)',padding:3,color:'white',fontSize:12,textAlign:'center',fontFamily: "SourceSansPro-Italic"}}>Günlük fallar sizlere reklam sponsorluğunda sunulmaktadır.</Text>
              <View style={{flex:1}}>
                <View style={{height: 40,backgroundColor:'#241466',alignItems:"center",justifyContent:"center",flexDirection:"row"}}><Text style={{  fontFamily: "SourceSansPro-Bold",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#faf9ff",margin:3}}>YORUMLAR</Text></View>
                {this.renderComments()}
              </View>

            </View>
            )
      }else {
        return null
      }
    }


  render() {


    const {keyboardHeight} = this.state;

    let newStyle = {
      height:keyboardHeight
    }
    return (

      <View style={styles.containerrr}>
        <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />
        <ScrollView>
          {this.renderBody()}


        </ScrollView>
        <PopupDialog
           dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Puan Ver" />}
           width={0.9}
           height={320}
           dialogStyle={{marginTop:-250}}
           ref={(popupDialog) => { this.popupRate = popupDialog; }}>
          <View style={{margin:10,marginLeft:20,marginRight:20,flex:1}}>
           <StarRating
            disabled={false}
            maxStars={5}
            rating={this.state.starCount}
            selectedStar={(rating) => this.onStarRatingPress(rating)}
            starColor={'gold'}
            />

            <View style={{height:80,marginTop:10}}>
              <Text style={{fontFamily:'SourceSansPro-Italic',fontStyle:'italic',color:'gray'}}>(Zorunlu Değil)</Text>
              <TextInput
                multiline = {true}
                underlineColorAndroid='rgba(0,0,0,0)'
                style={{fontFamily:'SourceSansPro-Regular',flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => this.setState({sikayet:text})}
                placeholder={'Buraya falcımız ile ilgili yorumlarınızı yazabilirsiniz. Teşekkür ederiz!'}
                editable = {true}
              />
            </View>
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around',marginTop:10}}>
              <Text style={{fontFamily:'SourceSansPro-Regular'}}> Falcı değerlendirmemi görebilsin </Text>
              <Switch
                onValueChange={(value) => this.setState({falseSwitchIsOn: value})}
                value={this.state.falseSwitchIsOn} />
            </View>
            <View style={{marginTop:10}}>
              <Button title={"Gönder"}  onPress={() => {this.sendReview()}}/>
            </View>
          </View>
         </PopupDialog>
         {this.state.comments?
         <PopupDialog
           dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Bahşiş" />}
           width={0.9}
           height={320}
           dialogStyle={{marginTop:-200}}
           ref={(popupDialog) => { this.popupBahsis = popupDialog; }}>
          <View style={{margin:20,flex:1}}>
             <Image style={{alignSelf:'center',height:50,width:50, borderRadius:25,marginBottom:10}} source={{uri:this.state.comments[0].photoURL}}></Image>
             <Text style={{fontFamily:'SourceSansPro-Regular',fontSize:16,color:'black'}}>{"Falını beğendiysen "+this.state.comments[0].name+" falcımıza ufak bir bahşiş vermeye ne dersin?"}</Text>
             <View style={{flexDirection:'row',height:50,marginTop:15}}>

               <TouchableHighlight style={{flexGrow:2,backgroundColor:'rgba(60,179,113, 0.8)',justifyContent:'center'}} onPress={() => {this.payBahsis(1)}}>
                 <Text style={{fontFamily:'SourceSansPro-Bold',textAlign:'center',color:'white',fontWeight:'bold',fontSize:18}}>1.29 TL</Text>
               </TouchableHighlight>
               <TouchableHighlight style={{flexGrow:2,marginRight:10,marginLeft:10,backgroundColor:'rgba(114,0,218, 0.8)',justifyContent:'center'}} onPress={() => {this.payBahsis(2)}}>
                 <Text style={{fontFamily:'SourceSansPro-Bold',textAlign:'center',color:'white',fontWeight:'bold',fontSize:18}}>3.49 TL</Text>
               </TouchableHighlight>
               <TouchableHighlight style={{flexGrow:2,backgroundColor:'rgba(249,50,12, 0.8)',justifyContent:'center'}} onPress={() => {this.popupBahsis.dismiss(); Alert.alert('Puanlama',"Yorumlarınız bizim için çok değerli. Puanlamanız için teşekkür ederiz.");}}>
                 <Text style={{fontFamily:'SourceSansPro-Bold',textAlign:'center',color:'white',fontWeight:'bold',fontSize:18}}>İstemiyorum</Text>
               </TouchableHighlight>
             </View>
          </View>
         </PopupDialog>
         :null}
        <PopupDialog

         dialogStyle={{marginTop:-140}}
         width={0.9}
         height={0.68}
         ref={(popupDialog) => { this.popupDialog = popupDialog; }}
         >
           <View style={{flex:1}}>
             <ScrollView style={{padding:0,paddingTop:25}}>
              {this.renderProfInfo()}


             </ScrollView>
           </View>
         </PopupDialog>

      </View>

    );
  }
}




const styles = StyleSheet.create({
  containerrr: {


    flex:1,
  backgroundColor:'#241466'

  },
  contain: {
    flex: 1,
    height: 150,
  },
  falciAvatar:{
    height:48,
    width:48,
    margin:7,
    marginLeft:15,
    borderRadius:24,
  },
  faltypeyazi:{
    textAlign: 'left',color:'white',fontWeight:'bold',fontSize:22
  },
  faltypeyazipopup:{
    textAlign: 'left',color:'white',fontFamily:'SourceSansPro-Bold',fontSize:16,marginTop:5,marginBottom:5
  },
  faltypeyazikucuk:{
    textAlign: 'left',color:'white',fontSize:14
  },
  faltypeyazikucukpopup:{
    color:'white',textAlign: 'left',fontSize:14,fontFamily:'SourceSansPro-Regular'
  },
  faltypeyazikucukpopup2:{
    flex:1,color:'white',fontSize:14,fontWeight:'bold',alignSelf:'stretch',textAlign:'center'
  },
  box:{flex:1,borderColor:'white',backgroundColor:'#241466',borderRadius:5,paddingTop:10,marginTop:10,paddingLeft:20,paddingRight:20,width:'100%'}



});
