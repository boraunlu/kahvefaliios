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
  Alert
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
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
      profinfo:null
  };
}

  static navigationOptions = {
      title: 'Fal',
    };





  componentDidMount() {
    const { params } = this.props.navigation.state;
    this.setState({fal:params.fal,comments:params.fal.comments})


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

  showProfPopup = (fireid) =>{
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
     responseJson.profile_pic?responseJson.profile_pic={uri:responseJson.profile_pic}:responseJson.gender=="female"?responseJson.profile_pic=require('../static/images/femaleAvatar.png'):responseJson.profile_pic=require('../static/images/maleAvatar.png')
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
        var comment={comment:this.state.commentInput,createdAt: new Date(),name:this.props.userStore.userName,fireID:Backend.getUid(),seviye:seviye,photoURL:firebase.auth().currentUser.photoURL}
        var newcomments=this.state.comments
        newcomments.push(comment)
        this.setState({comments:newcomments})
        Keyboard.dismiss()
        Backend.addComment(this.state.fal._id,comment)
        this.props.socialStore.addComment(comment,index)
        setTimeout(()=>{Alert.alert("Teşekkürler","Yorumunuz paylaşıldı!")},200)
      }
    }


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

  renderComments = () => {
    if(this.state.comments.length>0){
      return(
        <ScrollView style={{flex:1,backgroundColor:'#f8fff8'}}>
        {
          this.state.comments.map(function (comment,index) {
            var liked = false;
            var likecount=0;
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

            return (
              <View key={index} style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,backgroundColor:'#f8fff8',borderColor:'gray'}}>
                <View>
                  <TouchableOpacity onPress={()=>{this.showProfPopup(comment.fireID)}}>
                    <Image source={{uri:comment.photoURL}} style={styles.falciAvatar}></Image>
                  </TouchableOpacity>
                  <View style={{position:'absolute',top:42,left:42,backgroundColor:kolor,borderRadius:10,height:20,width:20}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',backgroundColor:'transparent'}}>{comment.seviye?comment.seviye:1}</Text></View>
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
                </View>
                <TouchableOpacity style={{width:25,alignItems:'center',justifyContent:'center'}} onPress={()=>{!liked&&comment.fireID!==Backend.getUid()?this.like(index):null}}>
                  {liked?<Icon name="heart" color={'red'} size={20} />:<Icon name="heart-o" color={'gray'} size={20} />}
                  <Text>{likecount}</Text>
                </TouchableOpacity>
              </View>
              );
          }, this)}
          </ScrollView>
      )
    }
    else{
      return(
        <View style={{flex:1}}>
          <Text style={{textAlign:'center',marginTop:20,color:'black',fontSize:16}}>Haydi bu fala ilk yorum yapan sen ol 😉</Text>
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
        else if (falPuan>175&&falPuan<301) {
          seviye = 5
          limit = 125
          gosterilenpuan=falPuan-175
          unvan = "Fal Profesörü"
          kolor='rgb(249,50,12)'
        }
        return(
        <View>
          <Image style={{backgroundColor:'transparent',alignSelf:'center',height:60,width:60, borderRadius:30}} source={this.state.profinfo.profile_pic}></Image>
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
        </View>

      )
      }
      else {
        return(<ActivityIndicator/>)
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
            meslek='"Kendi İşim';
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
              <Image source={profile_pic} style={styles.falciAvatar}></Image>

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
            <View style={{flex:1}}>
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

    const {keyboardHeight} = this.state;

    let newStyle = {
      height:keyboardHeight
    }
    return (

      <View style={styles.containerrr}>
        <ScrollView>
          {this.renderAktifStripe()}
          {this.renderBody()}


        </ScrollView>
        <PopupDialog

         dialogStyle={{marginTop:-250}}
         width={0.9}
         height={325}
         ref={(popupDialog) => { this.popupDialog = popupDialog; }}
         >
           <View style={{flex:1}}>
             <ScrollView style={{padding:10,paddingTop:15}}>
              {this.renderProfInfo()}


             </ScrollView>
           </View>
         </PopupDialog>
        <KeyboardAvoidingView style={{bottom:this.state.keyboardHeight>0?this.state.keyboardHeight:0,flexDirection:'row',padding:3,backgroundColor:'lightgray',position:'absolute',width:'100%'}} >
          <TextInput
            editable={true}
            multiline={true}
            underlineColorAndroid='rgba(0,0,0,0)'
            value={this.state.commentInput}
            onChangeText={(text) => this.setState({commentInput:text})}
            placeholder={"Yorumunu yaz"}
            onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
            style={{height:this.state.keyboardHeight>0?80:30,borderRadius:5,borderColor: 'gray', borderWidth: 1,flex:1,padding:3,backgroundColor:'white'}}
          />
          <TouchableOpacity style={{padding:5,justifyContent:'center'}} onPress={()=>{this.addComment()}}>
            {this.state.keyboardHeight>0?<Text style={{fontSize:10,position:'absolute',top:0}}>{this.state.commentInput.length+"/500"}</Text>:null}
            <Text style={{color:'teal'}}>Gönder</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>

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
