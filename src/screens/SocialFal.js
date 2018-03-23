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
    ImageBackground,
  Share
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions,SafeAreaView } from 'react-navigation'
import moment from 'moment';
import Lightbox from 'react-native-lightbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
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
  };
}

  static navigationOptions = {
      title: 'Fal',
    };





  componentDidMount() {
    const { params } = this.props.navigation.state;
    this.setState({fal:params.fal,comments:params.fal.comments})
    var id =Backend.getUid()
    if(params.fal.poll1){
      voters1=params.fal.voters1
      voters2=params.fal.voters2
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
    if(id==params.fal.fireID||id=='cPO19kVs6NUJ9GTEDwyUgz184IC3'||id=='lSSzczH3UcPLL0C9A7rQgbSWkay2'){
      this.setState({falowner:true,votedFor:true})
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

 startChat = (fireID) => {
   const { navigate } = this.props.navigation;
   var falsever= this.state.profinfo
   falsever.avatar=falsever.profile_pic.uri
   navigate( "ChatFalsever",{falsever:falsever} )
 }

 updateSize = (height) => {
    //alert(height)
    this.setState({
      inputHeight:height
    });
  }

  like = (index) => {
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
     //alert(responseJson.sosyal)
     this.setState({profinfo:responseJson});

      })
  }

  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
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
        else if (falPuan>175&&falPuan<301) {
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

  renderAktifStripe = () => {
    if(this.state.fal)
    {
      var simdi = moment();
      if(simdi.diff(this.state.fal.time,"days")>7)
      {
        return(
          <View style={{backgroundColor:'red'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',width:'100%',fontSize:16,margin:3}}>Yeni Yoruma Kapalı</Text></View>
        )
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
              var id = Backend.getUid()
              for (var i = 0; i < comment.likes.length; i++) {
                if(comment.likes[i]==id){
                  liked=true;
                  break;
                }
              }
              likecount=comment.likes.length
            }
            if(comment.dislikes){
              var id = Backend.getUid()
              for (var i = 0; i < comment.dislikes.length; i++) {
                if(comment.dislikes[i]==id){
                  disliked=true;
                  break;
                }
              }
              dislikecount=comment.dislikes.length
            }

            if(dislikecount>4){
              return(
                      <View key={index} style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,backgroundColor:'#EeFFEe',borderColor:'gray'}}>
                        <View style={{marginLeft:comment.parentIndex?60:0}}>
                          <TouchableOpacity style={{marginTop:10}} onPress={()=>{this.showProfPopup(comment.fireID,comment.photoURL)}}>
                            <Image source={{uri:comment.photoURL}} style={styles.falciAvatar}></Image>
                          </TouchableOpacity>
                          <View style={{position:'absolute',top:42,left:42,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{comment.seviye?comment.seviye:1}</Text></View>
                        </View>
                        <View style={{padding:10,flex:2}}>
                          <Text style={{fontWeight:'normal',textAlign:'center',padding:20,fontStyle:'italic',fontSize:12}}>
                            Bu yorum olumsuz tepki aldığı için yayından kaldırılmıştır
                          </Text>
                        </View>
                      </View>
                      )
            }
            else {
              return (
                <View key={index} style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,backgroundColor:comment.parentIndex?'#f8FFf8':'#EeFFEe',borderColor:'gray'}}>
                  <View style={{marginLeft:comment.parentIndex?60:0}}>
                    <TouchableOpacity style={{marginTop:10}} onPress={()=>{this.showProfPopup(comment.fireID,comment.photoURL)}}>
                      {comment.fireID==this.state.fal.fireID?<Text style={{fontSize:12,textAlign:'center',color:'teal',fontStyle:'italic'}}>Fal Sahibi</Text>:null}
                      <Image source={{uri:comment.photoURL}} style={styles.falciAvatar}></Image>
                    </TouchableOpacity>
                  <View style={{position:'absolute',top:comment.fireID==this.state.fal.fireID?58:42,left:42,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{comment.seviye?comment.seviye:1}</Text></View>
                  </View>
                  <View style={{padding:10,flex:2}}>
                    <Text style={{fontWeight:'bold',fontSize:16,marginBottom:5}}>
                      {comment.name} - <Text style={{color:'gray',fontWeight:'normal',fontSize:14}}>
                       {capitalizeFirstLetter(replaceGecenHafta(moment(comment.createdAt).calendar()))}
                      </Text>
                    </Text>
                    <Text style={{fontWeight:'normal',fontSize:14}}>
                      {comment.comment}
                    </Text>
                    <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
                      <TouchableOpacity onPress={()=>{this.setState({replyingTo:index+1}); this.refs.Input.focus(); }}>
                        <Text style={{textDecorationLine:'underline',fontWeight:'bold',color:'teal',fontSize:14}}>
                          Cevap ver
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{marginLeft:30,flexDirection:'row',alignItems:'center',justifyContent:'center'}} onPress={()=>{!liked&&comment.fireID!==Backend.getUid()?this.like(index):null}}>
                        {liked?<Icon name="heart" color={'red'} size={20} />:<Icon name="heart-o" color={'gray'} size={20} />}
                        <Text style={{marginLeft:4}}>{likecount}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{marginLeft:30,flexDirection:'row',alignItems:'center',justifyContent:'center'}} onPress={()=>{!disliked&&comment.fireID!==Backend.getUid()?this.dislike(index):null}}>
                        {disliked?<Icon name="thumbs-down" color={'blue'} size={20} />:<Icon name="thumbs-o-down" color={'gray'} size={20} />}
                        <Text style={{marginLeft:4}}>{dislikecount}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {this.renderCommentDelete(index)}
                </View>
                );
            }

          }, this)
        }
        {this.renderYorumYap()}
        </ScrollView>
      )
    }
    else{
      return(
        <View style={{flex:1}}>
          <Text style={{textAlign:'center',marginTop:5,color:'black',padding:15,fontSize:16}}>Haydi bu fala yorum yapan ilk 3 kişiden biri ol, <Text style={{fontWeight:'bold'}}>2 kat</Text> FalPuan kazan 😉</Text>
        </View>
      )
    }


  }

  renderYorumYap = () => {
    if(this.state.comments.length<3){
      return(
        <View style={{flex:1}}>
          <Text style={{textAlign:'center',marginTop:5,color:'black',padding:15,fontSize:16}}>Haydi bu fala yorum yapan ilk 3 kişiden biri ol, <Text style={{fontWeight:'bold'}}>2 kat</Text> FalPuan kazan 😉</Text>
        </View>
      )
    }
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

  renderPoll = () => {
    if(this.state.fal.poll1){

      if(this.state.fal.poll1.length>1){
        return(
          <View>
          <View style={{flexDirection:'row',padding:30,paddingBottom:5,paddingTop:5,justifyContent:'space-between'}}>
            <TouchableOpacity style={{justifyContent:'center',height:40,width:'45%',borderColor: 'blue', marginRight:5,borderTopLeftRadius: 10,borderBottomLeftRadius: 10,borderRadius:10,paddingLeft:8,paddingRight:8,backgroundColor:'#6AAFE6'}} onPress={()=>{this.voteFor(1)}}>
             <Text style={{color:'white',fontWeight:'bold',textAlign:'center'}}>
              {this.state.fal.poll1}
             </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{justifyContent:'center',height:40,width:'45%',borderColor: 'red',marginLeft:5,borderTopRightRadius: 10,borderRadius:10,borderBottomRightRadius: 10,paddingLeft:8,paddingRight:8,backgroundColor:'#E72564'}} onPress={()=>{this.voteFor(2)}}>
              <Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>
               {this.state.fal.poll2}
              </Text>
            </TouchableOpacity>
          </View>
              {this.renderPollResults()}
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

      var v1percentage=parseInt(v1count*100/(v1count+v2count))
      var v2percentage =100-v1percentage
      if(v1count+v2count==0){v1percentage=0;v2percentage=0;}
      return(
        <View style={{flexDirection:'row',paddingBottom:5,justifyContent:'center'}}>
          <View style={{flex:1,justifyContent:'center'}} >
           <Text style={{color:'#6AAFE6',fontWeight:'bold',fontSize:18,textAlign:'center'}}>
            {"%"+v1percentage}
           </Text>
          </View>
          <View style={{flex:1,justifyContent:'center'}} >
            <Text style={{textAlign:'center',color:'#E72564',fontSize:18,fontWeight:'bold'}}>
                 {"%"+v2percentage}
            </Text>
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
            meslek='Kendi İşim';
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
            <View style={{alignItems:'center',flexDirection:'row',backgroundColor:'white',justifyContent:'center',borderColor:'gray',borderBottomWidth:0,paddingTop:10}}>
              <TouchableOpacity style={{marginTop:10}} onPress={()=>{this.showProfPopup(this.state.fal.fireID,this.state.fal.profile_pic)}}>
                <Image source={profile_pic} style={styles.falciAvatar}></Image>
              </TouchableOpacity>
              <View style={{}}>
                <Text style={{fontWeight:'bold',fontSize:17}}>
                  {fal.name}
                 </Text>
                 <Text style={{fontWeight:'normal',marginTop:5}}>
                   {fal.age+" yaşında, "+iliski+", "+meslek}<Text style={{color:'teal'}}>

                   </Text>
                </Text>
              </View>
            </View>
            <View style={{alignItems:'center',borderColor:'gray',backgroundColor:'white',borderBottomWidth:0,padding:5}}>

              <Text style={{fontWeight:'bold',fontStyle:'italic',fontSize:18,marginTop:5}}>
                {"''"+fal.question+"''"}

              </Text>
            </View>
            <View style={{backgroundColor:'white',width:'100%',flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:90,paddingBottom:10}}>
            {
              fal.photos.map(function (foto,index) {

                return (
                  <View style={{flex:1,height:60,margin:10}} key={index}>
                   <Lightbox navigator={null} renderContent={() => { return(<Image source={{uri:foto}} style={{flex:1,resizeMode:'contain'}}></Image>)}} style={{height:60}}>

                    <Image source={{uri:foto}} style={{ height: 60,borderRadius:5,width:60,alignSelf:'center'}}></Image>
                   </Lightbox>
                   </View>
                  );
              }, this)}

            </View>
            {this.renderPoll()}

            <View style={{flex:1,marginTop:10}}>
              <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',fontSize:18,margin:3}}>Yorumlar ({this.state.comments.length})</Text></View>
              {this.renderComments()}
            </View>

          </View>
          )
    }else {
      return null
    }
  }

  render() {

    return (

      <SafeAreaView style={styles.containerrr}>
        <ScrollView>
          {this.renderAktifStripe()}
          {this.renderBody()}


        </ScrollView>
        <PopupDialog

         dialogStyle={{marginTop:-250}}
         width={0.9}
         height={400}
         ref={(popupDialog) => { this.popupDialog = popupDialog; }}
         >
           <View style={{flex:1}}>
             <ScrollView style={{padding:10,paddingTop:15}}>
              {this.renderProfInfo()}


             </ScrollView>
           </View>
         </PopupDialog>
        <View style={{bottom:this.state.writing?this.state.keyboardHeight:0,flexDirection:'row',padding:3,backgroundColor:'lightgray',position:'absolute',width:'100%'}} >
          <TextInput
            editable={true}
            multiline={true}
            onBlur={() => {this.setState({replyingTo:false,writing:false})} }
            onFocus={() => {this.setState({writing:true})} }
            ref='Input'
            underlineColorAndroid='rgba(0,0,0,0)'
            value={this.state.commentInput}
            onChangeText={(text) => this.setState({commentInput:text})}
            placeholder={this.state.replyingTo?"Cevabını yaz":"Yorumunu yaz"}
            onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
            style={{height:this.state.keyboardHeight>0?80:30,borderRadius:5,borderColor: 'gray', borderWidth: 1,flex:1,padding:3,backgroundColor:'white'}}
          />
          <TouchableOpacity style={{padding:5,justifyContent:'center'}} onPress={()=>{this.addComment()}}>
            {this.state.keyboardHeight>0?<Text style={{fontSize:10,position:'absolute',top:0}}>{this.state.commentInput.length+"/500"}</Text>:null}
            <Text style={{color:'teal'}}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

    );
  }
}




const styles = StyleSheet.create({
  containerrr: {

    paddingBottom:36,
    flex:1,
    backgroundColor:'white'

  },
  contain: {
    flex: 1,
    height: 150,
  },
  falciAvatar:{
    height:50,
    width:50,
    margin:7,
    borderRadius:25,
  }

});
