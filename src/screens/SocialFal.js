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
  Dimensions,
  ImageBackground,
  Share,
  Flatlist,
  Modal,
  AppState
} from 'react-native';
import axios from 'axios';
//import ImageZoom from 'react-native-image-pan-zoom';
import ImageViewer from 'react-native-image-zoom-viewer';
import ScrollableTabView, { DefaultTabBar,  ScrollableTabBar,  } from 'react-native-scrollable-tab-view';
import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions,SafeAreaView } from 'react-navigation'
import moment from 'moment';
import Lightbox from 'react-native-lightbox';
import CountDown from 'react-native-countdown-component';
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(str) {
  str=str.replace("geçen ","")
  str=str.replace("bugün ","")
  return str
}

@inject("userStore")
@inject("socialStore")
@observer
export default class SocialFal extends React.Component {
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
      appState: AppState.currentState,
      commentsList:[],
      hiddenComments:[],
      modalVisible: false


  };
}

  static navigationOptions = {
      title: 'Fal',
    };





  componentDidMount() {
    const { params } = this.props.navigation.state;
    AppState.addEventListener('change', this._handleAppStateChange);

    if(params.fal){
      this.setFal(params.fal)
    }
    else if (params.falId) {
      Backend.getSosyal(params.falId).then( (response) => {
          this.setFal(response)
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
   AppState.removeEventListener('change', this._handleAppStateChange);
 }

 _handleAppStateChange = (nextAppState) => {
   if(this.state.fal){
     if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
       fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyal', {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           falid: this.state.fal._id,
         })
       })
       .then((response) => response.json())
        .then((responseJson) => {

            this.setFal(responseJson)
        })
     }
     this.setState({appState: nextAppState});
   }

 }

 _keyboardDidShow = (e) => {
   //alert(JSON.stringify(e.endCoordinates));
   this.setState({keyboardHeight:e.endCoordinates.height})
 }

 _keyboardDidHide = () =>  {
  // alert('Keyboard Hidden');
  this.setState({keyboardHeight:0})
 }

 setFal = (fal) => {

   this.setState({fal:fal,comments:fal.comments})
   var id =Backend.getUid()
   var simdi=moment()
   if(fal.status==1){
     if(simdi.diff(moment(fal.time),"days")>2){
         this.setState({expired:true})
     }
   }
   else if (fal.status==3) {
     if(simdi.diff(moment(fal.time),"days")>3){
         this.setState({expired:true})
     }
   }
   if(fal.poll1){
     voters1=fal.voters1
     voters2=fal.voters2
     this.setState({voters1:voters1,voters2:voters2})
     for (var i = 0; i < voters1.length; i++) {
       if(id==voters1[i]){
         this.setState({votedFor:true})
         break;
       }
     }
     for (var i = 0; i < voters2.length; i++) {
       if(id==voters2[i]){
         this.setState({votedFor:true})
         break;
       }
     }
   }
   if(id==fal.fireID){

     this.setState({falowner:true,votedFor:true})
     if(fal.unread>0){
       Backend.setSosyalRead(fal._id).then(()=>{
         Backend.getAllFals().then( (response) => {
            this.props.socialStore.setAllFals(response)
         })
       })

     }

   }

   if(this.props.userStore.isAdmin){
     this.setState({falowner:true})

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

  like = (index) => {
    firebase.analytics().logEvent("like")
    var newcomments=this.state.comments
    if(newcomments[index].likes){
      newcomments[index].likes.push(Backend.getUid())
    }
    else{
      var likes=[Backend.getUid()]
      newcomments[index].likes=likes
    }
    this.setState({comments:newcomments})
    Backend.like(this.state.fal._id,index);

  }

  dislike = (index) => {
    var newcomments=this.state.comments
    if(newcomments[index].dislikes){
      newcomments[index].dislikes.push(Backend.getUid())
    }
    else{
      var dislikes=[Backend.getUid()]
      newcomments[index].dislikes=dislikes
    }
    this.setState({comments:newcomments})
    Backend.dislike(this.state.fal._id,index);

  }

  shareFal = () => {

    Share.share({
      message: this.state.fal.question+" http://www.falsohbeti.com/sosyal/"+this.state.fal._id,
      url: 'http://www.falsohbeti.com/sosyal/'+this.state.fal._id,
      title: 'Kahve Falı Sohbeti'
    }, {
      // Android only:
      dialogTitle: 'Kahve Falı Sohbeti',
      // iOS only:

    })
  }

  deleteFal = () => {

      Alert.alert(
        'Fal Silimi',
        'Falını silmek istediğinden emin misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            Backend.deleteSosyal(this.state.fal._id)
            this.props.socialStore.setTek(null)
            setTimeout(()=>{
              Backend.getSocials().then((socials)=>{
                this.props.socialStore.setSocials(socials)
                this.props.navigation.goBack()
              })
            },650)

          }},
        ],
      )

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

  showProfPopup = (fireid,profPhoto) =>{

    this.popupDialog.show()
    this.setState({profinfo:null})

    axios.post('https://eventfluxbot.herokuapp.com/appapi/getAppUser', {
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

  addComment = () => {
    const { params } = this.props.navigation.state;
    var index = params.index
    if(this.state.commentInput.length<30&&!this.state.replyingTo){
      Alert.alert("Kısa Yorum","Lütfen daha uzun ve detaylı yorumlayın.")
    }
    else {
      if(this.state.commentInput.length>1000){
        Alert.alert("Çok Uzun Yorum","Lütfen yorumunuzu biraz daha kısa tutun.")
      }
      else{
        firebase.analytics().logEvent("comment")
        this.setState({commentInput:''})
        var falPuan =this.props.userStore.user.falPuan
        var seviye = 1
        if (falPuan>25&&falPuan<76){
          seviye = 2
        }else if (falPuan>75&&falPuan<201) {
          seviye = 3
        }else if (falPuan>200&&falPuan<501) {
          seviye = 4
        }
        else if (falPuan>500) {
          seviye = 5
        }
        var comment={comment:this.state.commentInput,parentIndex:this.state.replyingTo,createdAt: new Date(),name:this.props.userStore.userName,fireID:Backend.getUid(),seviye:seviye,photoURL:this.props.userStore.profilePic}
        var newcomments=this.state.comments
        if(this.state.replyingTo){
          newcomments.splice(this.state.replyingTo, 0, comment);
          this.setState({comments:newcomments})
          this.hideComments();
          //console.log(newcomments[this.state.replyingTo].name)
        }
        else {
          newcomments.push(comment)
          this.setState({comments:newcomments})
          //this.parseComments(this.state.comments)
        }
        Keyboard.dismiss()
        Backend.addComment(this.state.fal._id,comment)
        /*
        if(!this.props.userStore.user.commented){
          setTimeout(()=>{Alert.alert("Teşekkürler","İlk yorumunuzu yaptığınız için 15 Kredi kazandınız!")},200)
          this.props.userStore.setCommentedTrue()
          Keyboard.dismiss()
        }*/

      }
    }
  }

  showSuper = () => {
    firebase.analytics().logEvent("superleSosyal")
    this.popupSuper.show()
  }

  superle = () => {
    firebase.analytics().logEvent("superlePopup")
    if(this.props.userStore.userCredit>49){
      Backend.addCredits(-50)
      this.props.userStore.increment(-50)
      Backend.superle(this.state.fal._id)
      Alert.alert('Super Fal',"Falınız süperlendi! 🌟 Artık falınız panonun üst bölümünde yer alacak ve falınıza daha çok yorum gelecek")
      var fal=this.state.fal
      this.state.fal.status=3
      this.setState({fal:fal})
      setTimeout(()=>{
        Backend.getSocials().then((socials)=>{
          this.props.socialStore.setSocials(socials)
        })
      },650)

      this.popupSuper.dismiss()
    }
    else {
      this.paySuper()
    }
  }

  paySuper = () => {
    this.setState({spinnerVisible:true})
    var products = [
       'com.grepsi.kahvefaliios.50',
    ];

    InAppUtils.loadProducts(products, (error, products) => {
      if(error){this.setState({spinnerVisible:false})}
      else{

        var identifier = 'com.grepsi.kahvefaliios.50'
        InAppUtils.purchaseProduct(identifier, (error, response) => {
          this.setState({spinnerVisible:false})
           // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
           if(error){

           }
           else{
             if(response && response.productIdentifier) {
               Backend.superle(this.state.fal._id)
               Alert.alert('Super Fal',"Falınız süperlendi! 🌟 Artık falınız panonun üst bölümünde yer alacak ve falınıza daha çok yorum gelecek")
               var fal=this.state.fal
               this.state.fal.status=3
               this.setState({fal:fal})
               setTimeout(()=>{
                 Backend.getSocials().then((socials)=>{
                   this.props.socialStore.setSocials(socials)
                 })
               },650)
               this.popupSuper.dismiss()
             }
           }
        });
      }
    });
  }

  showLikesPopup = (comment)=>{
    this.setState({commentLikes:comment})
    this.popupDialog2.show();
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



  parseComments =(comments) =>{
      this.state.commentsList=[];
      var _comments= [];
      comments.map((x,index)=>{
        if(x.parentIndex>0){

          if(this.state.commentsList[this.state.commentsList.length-1]){
            this.state.commentsList[this.state.commentsList.length-1].push(x)
          }
        }
        else{
          var clear = [];
          _comments= clear
           _comments.push(x);
          this.state.commentsList.push(_comments)
        }

    })

  }
  showComments= (_hiddenComments) => {
    if(_hiddenComments[0]==this.state.hiddenComments[0]){

    //console.warn("hello")
    var hide = [];
    this.setState({hiddenComments:hide});
    this.hideComments();

    }else if(_hiddenComments==null){
    //console.warn("noon")
    } else{

    this.state.hiddenComments=[];
    this.setState({hiddenComments:_hiddenComments});
      //console.warn(JSON.stringify(this.state.hiddenComments));
    }
  }

  hideComments = () => {
    var hide = [];
    this.setState({hiddenComments:hide});
  }

  renderAktifStripe = () => {
    if(this.state.expired)
    {
      return(
        <View style={{backgroundColor:'red'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',width:'100%',fontSize:16,margin:3}}>Yeni Yoruma Kapalı</Text></View>
      )
    }
    else {
      if(this.state.fal){
        if(this.state.fal.status==3){
          return(
            <View style={{justifyContent:'center',zIndex:5,position:'absolute',height:50,width:'100%',backgroundColor:'rgb( 236 ,196 ,75)',padding:3}}><Text style={{fontFamily:'SourceSansPro-Bold',textAlign:'center',color:'white',fontWeight:'bold',width:'100%',fontSize:14}}>Bu bir Süper Fal🌟{"\n"} Yorumlarından 2 Kat FalPuan Kazan!</Text></View>
          )
        }
      }

    }
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
  renderFalDelete = () => {
    if(this.state.falowner==true){
      return (
        <TouchableOpacity style={{width:20,alignItems:'center',justifyContent:'center',position:'absolute',top:5,right:5,height:20}} onPress={() => {this.deleteFal()}}>
          <Icon name="trash-o" color={'#241466'} size={18} />
        </TouchableOpacity>
      );
    }
  }

  renderComments = () => {
   //

   this.parseComments(this.state.comments)
      //this.state.comments.map(function (comment,index) {console.warn(JSON.stringify(comment.likesNew?(comment.likesNew.name+comment.likesNew):"hata"));console.warn(index)})
      //this.state.comments.map(function (comment,index) {console.warn(JSON.stringify(comment.dislikesNew?(comment):"hata"));console.warn(index)})
      //this.state.comments.map(x=>console.warn(x.dislikesNew))


      if(this.state.comments.length>0){

        return(

          <ScrollView style={{flex:1,backgroundColor:'#f8fff8'}}>
          {

            this.state.commentsList.map((comments,i)=>{


              var __hiddenComments ;
              var count = Object.keys(comments).length-1;
              __hiddenComments = [];
            return(

              <View style={{flex:1}} key={i}>
              {
                comments.map(function (comment,index) {

                  __hiddenComments.push(comment._id);
                  var commentIndex ;
                  this.state.comments.map((_comment,_index)=>{

                  if(_comment._id==comment._id){
                    commentIndex=_index;
                  }

                });



      // var isHidden ;
      // this.state.hiddenComments.map((x)=>x==comment._id?isHidden=false:isHidden=true);

      var liked = false;
      var disliked = false;
      var likecount=0;
              var dislikecount=0;
              var kolor='rgb(209,142,12)'
              var id = Backend.getUid()

              //console.warn(comment)
                //console.warn(comment.likesNew)
                //console.warn(comment.dislikesNew)
               // console.warn(comment.dislikesNew)

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
              if(comment.likes){

                for (var i = 0; i < comment.likes.length; i++) {
                  if(comment.likes[i]==id){
                    liked=true;
                    break;
                  }
                }
                likecount=comment.likes.length
              }
              if(comment.dislikes){

                for (var i = 0; i < comment.dislikes.length; i++) {
                  if(comment.dislikes[i]==id){
                    disliked=true;
                    break;
                  }
                }
                dislikecount=comment.dislikes.length
              }

              if(comment.parentIndex==false) {
                return (


                  <View key={commentIndex} id={comment._id}  style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,backgroundColor:comment.parentIndex?'#F9F8F9':'#F2F1F3',borderColor:'rgb(166, 158, 171)'}}>


                    <View style={{marginLeft:comment.parentIndex?47:0}}>
                      <TouchableOpacity style={{marginTop:17}}
                      onPress={() => {this.props.navigation.navigate('User',{fireid:comment.fireID,profPhotos:comment.photoURL})}
                      //  onPress={()=>{this.showProfPopup(comment.fireID,comment.photoURL)}
                    }>
                          {comment.fireID==this.state.fal.fireID?<Text style={{fontSize:12,textAlign:'center',color:'#241466',fontStyle:'italic'}}>Fal Sahibi</Text>:null}
                          <Image source={{uri:comment.photoURL}} style={styles.falciAvatar}></Image>
                        </TouchableOpacity >
                      <View style={{position:'absolute',top:comment.fireID==this.state.fal.fireID?72:56,elevation:2,left:45,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{comment.seviye?comment.seviye:1}</Text></View>
                     </View>
                    <View style={{padding:10,flex:2,marginTop:7,marginRight:5}}>
                      <Text style={{  fontFamily: "SourceSansPro-Bold",
                                      fontSize: 15,
                                      fontWeight: "bold",
                                      fontStyle: "normal",
                                      letterSpacing: 0,
                                      textAlign: "left",
                                      color: "#000000",marginBottom:5}}>{/*{JSON.stringify(comment.parentIndex)}*/}
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
                  {/*commentIndex*/}
                        {/*this.state.fal.commentsNew*/}
                        {/*JSON.stringify(this.state.comments.map((x,index1)=>{x._id}))*/}


                      </Text>
                      <View style={{flexDirection:'row',alignItems:'center',marginTop:5,marginBottom:5}}>
                        <TouchableOpacity onPress={()=>{this.setState({replyingTo:commentIndex+1}); this.refs.Input?this.refs.Input.focus():null; }}>
                          <Text style={{textDecorationLine:'underline',  fontFamily: "SourceSansPro-Bold",
                                        fontSize: 15,
                                        fontWeight: "bold",
                                        fontStyle: "normal",
                                        letterSpacing: 0,
                                        textAlign: "center",
                                        color: "#241466"}}>
                            Cevap Ver
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginLeft:30,flexDirection:'row',alignItems:'center',justifyContent:'center'}} onPress={()=>{!liked&&comment.fireID!==Backend.getUid()?this.like(commentIndex):null}}>
                          {liked?<Icon name="heart" color={'red'} size={20} />:<Icon name="heart-o" color={'gray'} size={20} />}
                          <Text style={{marginLeft:4}}>{likecount}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginLeft:12,flexDirection:'row',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.showLikesPopup(comment)}}>

                          <Text style={{marginLeft:4,textDecorationLine:'underline'}}>Beğenenler</Text>
                        </TouchableOpacity>

                      </View>



                      {count>0&&
                        <View style={{}}>
                        <TouchableOpacity style={{flexDirection:"row",marginTop:5,marginBottom:-8}}  onPress={()=>{__hiddenComments.length>1?this.showComments(__hiddenComments):null}}>
                        {(__hiddenComments[0]&&this.state.hiddenComments[0])&&__hiddenComments[0]==this.state.hiddenComments[0]?<Icon name="angle-up" color={'grey'} size={24} />:<Icon name="angle-down" color={'#241466'} size={24} />}
                       <Text style={{fontFamily: "SourceSansPro-Regular",fontSize: 16,color:"#241466",fontFamily:'SourceSansPro-Bold',fontStyle: "normal",letterSpacing: 0,textAlign: "left",}}>
                        {" "+count+" cevap"} </Text>
                          </TouchableOpacity>
                         </View>
                       }
                    </View>

                    {this.renderCommentDelete(commentIndex)}

                  </View>
                  );
                } else
                 if(this.state.hiddenComments.includes(comment._id)==true)
                {
                  return (


                    <View key={commentIndex} id={comment._id} style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:0,backgroundColor:comment.parentIndex?'#F9F8F9':'#F2F1F3',borderColor:'gray'}}>
                     {/* <TouchableOpacity style={{position:"absolute",top:0,right:0}} onPress={()=>this.hideComments()}> */}
                     {/* <Text>Sakla</Text> */}
                     {/* </TouchableOpacity> */}

                      <View style={{marginLeft:comment.parentIndex?47:0}}>
                          <TouchableOpacity style={{marginTop:17}}
                        onPress={() => {this.props.navigation.navigate('User',{fireid:comment.fireID,profPhotos:comment.photoURL})}
                        //  onPress={()=>{this.showProfPopup(comment.fireID,comment.photoURL)}
                      }>
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
                                        color: "#000000",marginBottom:5}}>{/*{JSON.stringify(comment.parentIndex)}*/}
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
                    {/*commentIndex*/}
                          {/*this.state.fal.commentsNew*/}
                          {/*JSON.stringify(this.state.comments.map((x,index1)=>{x._id}))*/}


                        </Text>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:5,marginBottom:5}}>
                          <TouchableOpacity onPress={()=>{this.setState({replyingTo:commentIndex+1}); this.refs.Input?this.refs.Input.focus():null; }}>
                            <Text style={{textDecorationLine:'underline',  fontFamily: "SourceSansPro-Bold",
                                          fontSize: 15,
                                          fontWeight: "bold",
                                          fontStyle: "normal",
                                          letterSpacing: 0,
                                          textAlign: "center",
                                          color: "#241466"}}>
                              Cevap Ver
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{marginLeft:30,flexDirection:'row',alignItems:'center',justifyContent:'center'}} onPress={()=>{!liked&&comment.fireID!==Backend.getUid()?this.like(commentIndex):null}}>
                            {liked?<Icon name="heart" color={'red'} size={20} />:<Icon name="heart-o" color={'gray'} size={20} />}
                            <Text style={{marginLeft:4}}>{likecount}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={{marginLeft:12,flexDirection:'row',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.showLikesPopup(comment)}}>

                            <Text style={{marginLeft:4,textDecorationLine:'underline'}}>Beğenenler</Text>
                          </TouchableOpacity>

                        </View>

                      </View>

                      {this.renderCommentDelete(commentIndex)}
                    </View>
                    );
                }

              }, this)
            }
          </View>
        )
          })
          }

        {this.renderYorumYap()}

        </ScrollView>
      )
    }
    else{
      return(
        <View style={{backgroundColor:'#F9F8F9',flex:1}}>
          <Text style={{fontFamily:'SourceSansPro-Regular',textAlign:'center',marginTop:5,color:'black',padding:15,fontSize:16}}>Haydi bu fala ilk yorum yapan sen ol 😉</Text>
        </View>
      )
    }
  }

  renderLike=()=>{

    return(<View style={{flex:1}}>

     {this.state.commentLikes.likesNew&&this.state.commentLikes.likesNew.map((x,index)=>{
       var _seviye = 1
       var limit =25
       var gosterilenpuan=x.seviye
       var unvan = "Yeni Falsever"
       var kolor="#ffd967"

       if (x.seviye>25&&x.seviye<76){
         _seviye = 2
         limit = 50
         gosterilenpuan=x.seviye-25
         unvan = "Falsever"
         kolor='rgb(60,179,113)'
       }else if (x.seviye>75&&x.seviye<201) {
         _seviye = 3
         limit = 125
         gosterilenpuan=x.seviye-75
         unvan = "Deneyimli Falsever"
         kolor='rgb(114,0,218)'
       }else if (x.seviye>200&&x.seviye<501) {
         _seviye = 4
         limit = 300
         gosterilenpuan=x.seviye-200
         unvan = "Fal Uzmanı"
         kolor='rgb(0,185,241)'
       }
       else if (x.seviye>500) {
         _seviye = 5
         limit = 12500
         gosterilenpuan=x.seviye
         unvan = "Fal Profesörü"
         kolor='rgb(249,50,12)'
       }
          return(

        <TouchableOpacity onPress={() => {this.props.navigation.navigate('User',{fireid:x.fireID,profPhotos:x.profile_pic})}} key={index} style={{marginLeft:0,flexDirection:'row',justifyContent:'flex-start',alignContent:"center",borderBottomWidth:1,backgroundColor:'#F9F8F9',borderColor:'gray'}}>
        <View style={{marginTop:1}}>

          {x.profile_pic?
          <Image source={{uri:x.profile_pic}} style={styles.falciAvatar}/>
          : x.gender=="female"?
          <Image source={require('../static/images/femaleAvatar.png')} style={styles.falciAvatar}/>
    :
          <Image source={require('../static/images/maleAvatar.png')} style={styles.falciAvatar}/>
        }

      </View>
      <View style={{position:'absolute',top:36,elevation:2,left:45,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{_seviye?_seviye:1}</Text></View>
       <View>
       {x.fireID==this.state.fal.fireID?
       <Text style={{position:"absolute",top:5,left:14,elevation:2,fontSize:12,textAlign:'center',color:'#241466',fontStyle:'italic'}}>Fal Sahibi</Text>:null}
       <Text style={{  fontFamily: "SourceSansPro-Bold",
                        fontSize: 18,
                        fontWeight: "bold",
                        fontStyle: "normal",
                        letterSpacing: 0,
                        textAlign: "left",marginTop:18,marginLeft:14,
                        color: "#000000",}}>
          {x.name} </Text>

       </View>
     </TouchableOpacity>)

      })}
      </View>
  )
 }
 renderDislike=()=>{

   return(
     <View style={{flex:1}}>
{/* <Text>dislikes:{this.state.commentLikes.dislikesNew&&JSON.stringify(this.state.commentLikes.dislikesNew)}</Text> */}
{this.state.commentLikes.dislikesNew&&this.state.commentLikes.dislikesNew.map((x,index)=>{
  var _seviye = 1
  var limit =20
  var gosterilenpuan=x.seviye
  var unvan = "Yeni Falsever"
  var kolor="#ffd967"
  if (x.seviye>20&&x.seviye<51){
    _seviye = 2
    limit = 30
    gosterilenpuan=x.seviye-20
    unvan = "Falsever"
    kolor='rgb(60,179,113)'
  }else if (x.seviye>50&&x.seviye<101) {
    _seviye = 3
    limit = 50
    gosterilenpuan=x.seviye-50
    unvan = "Deneyimli Falsever"
    kolor='rgb(114,0,218)'
  }else if (x.seviye>100&&x.seviye<176) {
    _seviye = 4
    limit = 75
    gosterilenpuan=x.seviye-100
    unvan = "Fal Uzmanı"
    kolor='rgb(0,185,241)'
  }
  else if (x.seviye>175) {
    _seviye = 5
    limit = 12500
    gosterilenpuan=x.seviye
    unvan = "Fal Profesörü"
    kolor='rgb(249,50,12)'
  }
     return(<TouchableOpacity    onPress={() => {this.props.navigation.navigate('User',{fireid:x.fireID,profPhotos:x.profile_pic})}} key={index} style={{marginLeft:0,flexDirection:'row',justifyContent:'flex-start',alignContent:"center",borderBottomWidth:1,backgroundColor:'#F9F8F9',borderColor:'gray'}}>
   <View style={{marginTop:1}}>

     {x.profile_pic?
     <Image source={{uri:x.profile_pic}} style={styles.falciAvatar}/>
     : x.gender=="female"?
     <Image source={require('../static/images/femaleAvatar.png')} style={styles.falciAvatar}/>
:
     <Image source={require('../static/images/maleAvatar.png')} style={styles.falciAvatar}/>
   }

 </View>
 <View style={{position:'absolute',top:36,elevation:2,left:45,backgroundColor:"red",borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{_seviye?_seviye:1}</Text></View>
<View>
{x.fireID==this.state.fal.fireID?
<Text style={{position:"absolute",top:5,left:14,elevation:2,fontSize:12,textAlign:'center',color:'#241466',fontStyle:'italic'}}>Fal Sahibi</Text>:null}
<Text style={{  fontFamily: "SourceSansPro-Bold",
                 fontSize: 18,
                 fontWeight: "bold",
                 fontStyle: "normal",
                 letterSpacing: 0,
                 textAlign: "left",marginTop:18,marginLeft:14,
                 color: "#000000",}}>
   {x.name} </Text>

</View></TouchableOpacity>)

})}
     </View>
   )
 }

 renderLikes = () =>{
   if(this.state.commentLikes){
     var profile_picture=require('../static/images/maleAvatar.png')
     return(
       <View style={{flex:1,width:'100%'}}>

           <View
             style={{flex:1,width:'100%',height:50,justifyContent:'center',alignItems:'center',backgroundColor:'#241466',borderBottomWidth:5,borderColor:'rgb( 236, 196, 75)'}}
            >
            <Text style={{fontFamily:'SourceSansPro-Bold',fontSize:18,color:'rgb(250, 249, 255)'}}>Beğenenler</Text>
              </View>
              <View      style={{flex:1,width:"100%"}}  >
               {/* <Text>likes:{this.state.commentLikes.likesNew&&JSON.stringify(this.state.commentLikes.likesNew)}</Text>  */}
              {this.renderLike()}

             </View>



         </View>
   )}
   else {
     return(<ActivityIndicator/>)
   }

 }



  renderYorumYap = () => {
    if(this.state.falowner){
      var a = moment();

       var b = moment(this.state.fal.time).add(2, 'days');
       if(this.state.fal.status==3){
         b = moment(this.state.fal.time).add(3, 'days');
       }
       var hours=b.diff(a, 'hours')
       var minutes=b.diff(a, 'minutes')
       minutes=minutes%60
       hours<0?hours=0:null
       minutes<0?minutes=0:null
       return(
         <Text style={{textAlign:'center',color:'rgb(89, 70, 159)',fontSize:14,padding:5,fontFamily:'SourceSansPro-Italic'}}>
           {"Panoda kalan süreniz: "+hours+" saat, "+minutes+" dk"}
         </Text>
       )
    }
    else {
      if(this.state.fal.status==3){
        return(
          <View style={{backgroundColor:'#F9F8F9',flex:1}}>
            <Text style={{textAlign:'center',marginTop:5,color:'black',padding:15,fontSize:16}}>Bu bir <Text style={{fontWeight:'bold'}}>Süper Fal!</Text> Güzel bir yorum yap ve <Text style={{fontWeight:'bold'}}>2 kat</Text> FalPuan kazan 😉</Text>
          </View>
        )
      }else {
        if(this.state.comments.length<3){
          return(
            <View style={{backgroundColor:'#F9F8F9',flex:1}}>
              <Text style={{textAlign:'center',marginTop:5,color:'black',padding:15,fontSize:16}}>Haydi bu fala yorum yapan ilk 3 kişiden biri ol, <Text style={{fontWeight:'bold'}}>2 kat</Text> FalPuan kazan 😉</Text>
            </View>
          )
        }
      }
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

   renderSuperle = () => {
     if(this.state.fal.status===1&&this.state.falowner){
       var superText="FALINI SÜPERLE 🌟"
       if(this.state.fal.type==2){superText="RÜYANI SÜPERLE 🌟"}
       return(
         <View style={{flexDirection:'row',backgroundColor:'#f7f7f7',paddingBottom:10,paddingRight:50,paddingLeft:50}}>
           <TouchableOpacity  onPress={() => {this.showSuper();}} style={{flex:1,alignItems:'center',shadowColor: "rgba(0, 0, 0, 0.2)",
             shadowOffset: {
               width: 3,
               height: 6
             },
             shadowRadius: 1,
             shadowOpacity: 1,flexDirection:'row',height:35,borderRadius:4,backgroundColor:'rgb( 236 ,196 ,75)',justifyContent:'center'}}>
             <Text style={{textAlign:'center',color:'white',fontFamily:'SourceSansPro-Bold'}}>{superText}</Text>
           </TouchableOpacity>
         </View>
       )
     }

   }


     renderPoll = () => {
       if(this.state.fal.poll1){

         if(this.state.fal.poll1.length>1){
           return(
             <View>

             {this.state.votedFor

               ?
               this.renderPollResults()
               :
               <View style={{flexDirection:'row',padding:30,paddingBottom:5,paddingTop:5,marginBottom:17,justifyContent:'space-between'}}>
               <TouchableOpacity style={{justifyContent:'center',height:50,width:'45%',  backgroundColor: "#5033c0",
     shadowColor: "rgba(0, 0, 0, 0.2)",
     shadowOffset: {
       width: 0,
       height: 2
     },
     shadowRadius: 2,
     shadowOpacity: 1, marginLeft:5,borderRadius:5,paddingLeft:8,paddingRight:8}} onPress={()=>{this.voteFor(1)}}>
                <Text style={{  fontFamily: "SourceSansPro-Bold",
     fontSize: 14,
     fontWeight: "bold",
     fontStyle: "normal",
     letterSpacing: 0,

     color: "#ffffff",textAlign:'center'}}>
                 {this.state.fal.poll1}
                </Text>
               </TouchableOpacity>
               <TouchableOpacity style={{justifyContent:'center',height:50,width:'45%',  backgroundColor: "#b81e5e",
     shadowColor: "rgba(0, 0, 0, 0.2)",
     shadowOffset: {
       width: 0,
       height: 2
     },
     shadowRadius: 2,
     shadowOpacity: 1, marginRight:5,borderRadius:5,paddingLeft:8,paddingRight:8}} onPress={()=>{this.voteFor(2)}}>
                 <Text style={{ fontFamily: "SourceSansPro-Bold",
     fontSize: 14,
     fontWeight: "bold",
     fontStyle: "normal",
     letterSpacing: 0,

     color: "#ffffff",textAlign:'center'}}>
                  {this.state.fal.poll2}
                 </Text>
               </TouchableOpacity>
             </View>
               }



                 </View>
           )
         }
         else{return null}
       }
     }

     renderPollResults = () => {
       if(this.state.votedFor){
         var v1count=this.state.voters1.length
         var v2count=this.state.voters2.length

         let deviceWidth = Dimensions.get('window').width

         var v1percentage=parseInt(v1count*100/(v1count+v2count))
         var v2percentage =100-v1percentage
         if(v1count+v2count==0){v1percentage=0;v2percentage=0;}
         return(
           <View style={{marginTop:-10,flexDirection:'row',paddingBottom:5,justifyContent:'space-between',height:77,marginLeft:"7%",marginRight:"7%"}}>

             <View style={{flex:1,alignItems:'flex-start',flexDirection:"column"}} >

               <Text style={{  fontFamily: "SourceSansPro-Bold",position:"relative",top:12,
     fontSize: 14,
     fontWeight: "bold",
     fontStyle: "normal",
     letterSpacing: 0,
     textAlign: "left",
     color: "#5033c0"}}>
                    {this.state.fal.poll1}
               </Text>
             <View style={{flex:1,justifyContent:'space-between',flexDirection:"row",alignItems:"center",marginBottom:5}} >
               <View style={{height:14,width:(deviceWidth*0.33),borderRadius:8,elevation:1,backgroundColor:"#d8d8d8"}}>

                   <View style={{height:14,width:(deviceWidth*0.33)*(v1percentage/100),borderRadius:8,backgroundColor: "#5033c0"}}>

                   </View>

                  </View>
               <Text style={{  fontFamily: "SourceSansPro-Bold",paddingLeft:3,
     fontSize: 14,
     fontWeight: "bold",
     fontStyle: "normal",
     letterSpacing: 0,
     textAlign: "left",
     color: "#5033c0"}}>
                    {"%"+v1percentage}
               </Text>
             </View>
            </View>

             <View style={{flex:1,alignItems:'flex-start',flexDirection:"column"}} >

               <Text style={{  fontFamily: "SourceSansPro-Bold",position:"relative",top:12,
     fontSize: 14,
     fontWeight: "bold",
     fontStyle: "normal",
     letterSpacing: 0,
     textAlign: "left",
     color: "#b81e5e"}}>
                    {this.state.fal.poll2}
               </Text>
             <View style={{flex:1,justifyContent:'space-between',flexDirection:"row",alignItems:"center",marginBottom:5}} >
             <View   style={{height:14,width:(deviceWidth*0.33),borderRadius:8,elevation:1,backgroundColor:"#d8d8d8"}}>

                   <View style={{height:14,
                  // position:"absolute",

                   width:(deviceWidth*0.35)*(v2percentage/100),


                     borderRadius:8,backgroundColor: "#b81e5e"}}>

                   </View>

                  </View>
               <Text style={{  fontFamily: "SourceSansPro-Bold",paddingLeft:3,
     fontSize: 14,
     fontWeight: "bold",
     fontStyle: "normal",
     letterSpacing: 0,
     textAlign: "left",
     color: "#b81e5e"}}>
                    {"%"+v2percentage}
               </Text>
             </View>
            </View>
           </View>
         )
       }
       else {
         return null
       }
     }




  voteFor = (vote) => {
    if(!this.state.votedFor){
      if(vote==1){
        var voters1=this.state.fal.voters1
        voters1.push(Backend.getUid())
        this.setState({voters1:voters1,votedFor:true})
        Backend.voteFor(1,this.state.fal._id)
      }
      if(vote==2){
        var voters2=this.state.fal.voters1
        voters2.push(Backend.getUid())
        this.setState({voters2:voters2,votedFor:true})
        Backend.voteFor(2,this.state.fal._id)
      }
    }

  }

  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  }

  renderPhotos = () => {
    if(this.state.fal.type==2){
      return null
    }
    else {
      var fal = this.state.fal
      return(
        <View style={{backgroundColor:'white',width:'100%',flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:115,paddingBottom:10}}>
          {
            fal.photos.map(function (foto,index) {

              return (
                <View style={{flex:1,height:85,margin:10,elevation:3}} key={index}>
                  <TouchableOpacity style={{width:85,alignItems:'center',justifyContent:'center',borderColor:'gray',borderWidth:1,height:85}} onPress={() => this.setState({ modalVisible: true,photoIndex:index })}>
                     <Image source={{uri:foto}} style={{ width: 85,
                                                 height: 85,
                                                 borderRadius: 4,
                                                 shadowColor: "rgba(0, 0, 0, 0.2)",
                                                 shadowOffset: {
                                                   width: 0,
                                                   height: 2
                                                 },
                                                 shadowRadius: 2,
                                                 shadowOpacity: 1,alignSelf:'center'}}></Image>

                   </TouchableOpacity>
                 </View>
                );
            }, this)
          }
        </View>
      )
    }
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
        const images = []
        fal.photos.map(function (foto,index) {
         let photo = {
              url: foto,
              props: {}
          }
         images.push(photo)
        })

        var falTypeIcon=require('../static/images/newImages/noun548595Cc.png')
        if(fal.type==2){var falTypeIcon=require('../static/images/moondream.jpg')}

        return(
            <View style={{flex:1}}>

              <Modal

               animationType="slide"
               visible={this.state.modalVisible}
                onRequestClose={() => {
                  //alert('Modal has been closed.');
                }}
                transparent={true}>
              <TouchableOpacity style={{width:40,alignItems:'center',position:"absolute",top:4,right:4,zIndex:100,elevation:5,justifyContent:'center',borderColor:'gray',height:40}}  onPress={() => {
                            this.setModalVisible(!this.state.modalVisible);
                          }}>
                    <Icon name="times" color={'#5033c0'} size={40} />
              </TouchableOpacity>
                          {/* <View style={{backgroundColor:"red",flex:1,width:200,height:200}}></View> */}
                          <ImageViewer
                          index={this.state.photoIndex}
                          imageUrls={images}/>
            </Modal>

              <View style={{alignItems:'flex-start',flexDirection:'row',backgroundColor:'#f7f7f7',justifyContent:'flex-start',borderColor:'gray',borderBottomWidth:0,paddingTop:8, height: 78}}>
                <TouchableOpacity style={{}}
                                  onPress={() => {this.props.navigation.navigate('User',{fireid:this.state.fal.fireID,profPhotos:this.state.fal.profile_pic})}}
                  >
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
                {this.renderFalDelete()}
              </View>
              {this.renderSuperle()}
              <View style={{alignItems:'flex-start',borderColor:'gray',backgroundColor:'white',borderBottomWidth:0,padding:5,paddingRight:15,marginLeft:"4%",marginRight:"4%",marginBottom:15,marginTop:10,flexDirection:"row",justifyContent:"flex-start"}}>
              <Image source={falTypeIcon} style={{  width: 40,
                                height: 40,
                                borderRadius: 4,
                                shadowColor: "rgba(0, 0, 0, 0.2)",
                                shadowOffset: {
                                  width: 0,
                                  height: 2
                                },
                                shadowRadius: 2,
                                shadowOpacity: 1,alignSelf:'center',marginLeft:18,marginRight:10}}></Image>
                              <Text style={{  fontFamily: "SourceSansPro-BoldItalic",flex:1,
                                fontSize: 14,
                                fontWeight: "bold",
                                fontStyle: "italic",
                                letterSpacing: 0,
                                textAlign: "left",
                                color: "#000000",marginTop:2}}>
                  {fal.question}

                </Text>
              </View>

              {this.renderPhotos()}
              {this.renderPoll()}

              <View style={{flex:1}}>
                <View style={{height: 40,backgroundColor:'#241466',alignItems:"center",justifyContent:"center",flexDirection:"row"}}><Text style={{  fontFamily: "SourceSansPro-Bold",
                  fontSize: 14,
                  fontWeight: "bold",
                  fontStyle: "normal",
                  letterSpacing: 0,
                  textAlign: "center",
                  color: "#faf9ff",margin:3}}>YORUMLAR ({this.state.comments.length})</Text></View>
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
    let paddingBottom = 58
    let paddingTop=0
    if(this.state.expired){paddingBottom:0}else {
        if(this.state.fal){if(this.state.fal.status==3){paddingTop=50}}
    }

    return (

      <View style={[styles.containerrr,{paddingBottom:paddingBottom,paddingTop:paddingTop}]}>
        {this.renderAktifStripe()}
        <ScrollView>

          {this.renderBody()}


        </ScrollView>
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

         <PopupDialog
         dialogStyle={{marginTop:-140}}
         width={0.9}
         height={0.68}
         ref={(popupDialog) => { this.popupDialog2 = popupDialog; }}
         >
           <View style={{flex:1}}>
             <ScrollView style={{padding:0,flex:1}}>
              {this.renderLikes()}
            </ScrollView>
           </View>
         </PopupDialog>

         <PopupDialog
          dialogStyle={{marginTop:-100,borderRadius:4}}
          width={0.9}
          height={0.5}
          ref={(popupDialog) => { this.popupSuper = popupDialog; }}
          >
            <ImageBackground source={require('../static/images/background.png')} style={[styles.container,{borderRadius:4}]}>
              <ScrollView style={{flex:1,paddingTop:20,borderRadius:4}}>
                <Text style={{color:'white',fontFamily:'SourceSansPro-Bold',fontSize:30,textAlign:'center'}}>Süper Fal 🌟</Text>
                <Text style={styles.superyazi}>{'\n'}</Text>
                <Text style={styles.superyazi}>{'\u2022'} Falın panonun en üstünde yer alır</Text>
                <Text style={styles.superyazi}>{'\u2022'} Minimum 20 yorum gelmezse kredin iade</Text>
                <Text style={styles.superyazi}>{'\u2022'} Falın 3 gün boyunca panoda kalır</Text>
                  <TouchableOpacity style={ { width:'80%',flexDirection:'row',alignSelf:'center',height: 40,
                    borderRadius: 4,
                    backgroundColor: "#37208e",
                    alignItems: 'center', justifyContent: 'center',marginTop:50}} onPress={()=>{this.superle()}}>

                    <View style={{ flex: 1, flexDirection: 'row-reverse', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>
                      <View style={{ flex: 1, flexDirection:"row", justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{padding:10,alignItems:'center',justifyContent:'center'}}>
                           <Text style={{  fontFamily: "SourceSansPro-Bold",
                            fontSize: 12,
                            fontWeight: "bold",
                            fontStyle: "normal",

                            textAlign: "center",
                            color: "#ffffff"}}>
                              50
                            </Text>
                         </View>
                         <Image source={require("../static/images/sosyal/coins-copy.png")} />
                      </View>
                      <View style={{ flex: 2,  justifyContent: 'center', alignItems: 'center' }}>

                         <Text style={{fontFamily: "SourceSansPro-Bold",fontSize: 15,fontWeight: "bold",fontStyle: "normal",letterSpacing: 0,
                        textAlign: "center",
                        color: "#ffffff"}}>
                         Süperle
                         </Text>
                      </View>
                    </View>
                    <View style={{
                         flex: 2, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center',
                         height: 40,
                         borderRadius: 4,
                         backgroundColor:'rgb( 236 ,196 ,75)'
                       }}>
                       </View>
                       <View style={{
                         flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                         borderRadius: 4,
                         backgroundColor: "transparent"
                       }}>
                    </View>
                  </TouchableOpacity>
              </ScrollView>
            </ImageBackground>
          </PopupDialog>
         {this.state.expired?null:
           <View style={{bottom:this.state.writing?this.state.keyboardHeight:0,flexDirection:'row',padding:10,backgroundColor:"#37208e",position:'absolute',width:'100%'}} >
             <TextInput
               editable={true}
               multiline={true}
               onBlur={() => {this.setState({replyingTo:false,writing:false})} }
               onFocus={() => {this.setState({writing:true})} }
               ref='Input'
               blurOnSubmit={true}
               value={this.state.commentInput}
               onChangeText={(text) => this.setState({commentInput:text})}
               placeholder={this.state.replyingTo?"Cevabını yaz":"Yorumunu yaz"}
               onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
               style={{height:this.state.keyboardHeight>0?80:38,borderRadius:4,borderColor: "#37208e", borderWidth: 1,flex:1,padding:3,backgroundColor:'white'}}
             />
             <TouchableOpacity style={{padding:5,paddingLeft:15,justifyContent:'center'}} onPress={()=>{this.addComment()}}>
               {this.state.keyboardHeight>0?<Text style={{fontSize:10,position:'absolute',color:'white',fontFamily:'SourceSansPro-Regular',top:0}}>{this.state.commentInput.length+"/800"}</Text>:null}
               <Text style={{  fontFamily: "SourceSansPro-Regular",
                 fontSize: 16,
                 fontWeight: "600",
                 fontStyle: "normal",
                 letterSpacing: 0,
                 textAlign: "center",
                 color: "#ffffff"}}>Gönder</Text>
             </TouchableOpacity>
           </View>
         }

      </View>

    );
  }
}




const styles = StyleSheet.create({
  containerrr: {

    flex:1,
    backgroundColor:'white'

  },
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',

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
  superyazi:{
    fontSize:14,
    color:'white',
    fontFamily:'SourceSansPro-Bold'
  }


});
