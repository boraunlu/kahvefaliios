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
  Keyboard
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
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
@observer
export default class SocialFal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fal:null,
      comments:null,
      keyboardHeight:0,
      inputHeight:40,
      commentInput:''
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

  addComment = () => {
    var comment={comment:this.state.commentInput,createdAt: new Date(),name:this.props.userStore.userName,fireID:Backend.getUid(),photoURL:firebase.auth().currentUser.photoURL}

    var newcomments=this.state.comments
    newcomments.push(comment)
    this.setState({comments:newcomments,commentInput:''})
    Keyboard.dismiss()
    Backend.addComment(this.state.fal._id,comment)

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

      }
      return(
          <View style={{flex:1}}>


            <View style={{alignItems:'center',backgroundColor:'white',justifyContent:'space-between',borderColor:'gray',borderBottomWidth:0}}>
              <Image source={profile_pic} style={styles.falciAvatar}></Image>
              <View style={{alignItems:'center'}}>
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

              <Text style={{fontWeight:'bold',fontStyle:'italic',fontSize:18,marginTop:10}}>
                {"''"+fal.question+"''"}

              </Text>
            </View>
            <View style={{backgroundColor:'white',width:'100%',flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:80}}>
            {
              fal.photos.map(function (foto,index) {

                return (
                   <Image key={index} source={{uri:foto}} style={{flex:1,height:60,borderRadius:5,margin:10}}></Image>

                  );
              }, this)}
            </View>
            <View style={{flex:1}}>
              <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold',fontSize:16,margin:3}}>Yorumlar</Text></View>
              <ScrollView style={{flex:1,backgroundColor:'white'}}>
              {
                this.state.comments.map(function (comment,index) {

                  return (
                    <View key={index} style={{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderColor:'gray'}}>
                      <Image source={{uri:comment.photoURL}} style={styles.falciAvatar}></Image>
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
                    </View>
                    );
                }, this)}
                </ScrollView>
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

      <Image source={require('../static/images/Aurora.jpg')} style={styles.container}>

          {this.renderBody()}
          <KeyboardAvoidingView style={{bottom:this.state.keyboardHeight,flexDirection:'row',padding:3,backgroundColor:'lightgray',position:'absolute',width:'100%'}} >
            <TextInput
              editable={true}
              multiline={true}
              onChangeText={(text) => this.setState({commentInput:text})}
              placeholder={"Yorumunu yaz"}
              onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
              style={{height:this.state.keyboardHeight>0?80:30,borderRadius:5,borderColor: 'gray', borderWidth: 1,flex:1,padding:3,backgroundColor:'white'}}
            />
            <TouchableOpacity style={{padding:5,justifyContent:'center'}} onPress={()=>{this.addComment()}}>
              <Text style={{color:'teal'}}>Gönder</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>


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
    paddingBottom:36

  },
  falciAvatar:{
    height:50,
    width:50,
    margin:7,
    borderRadius:25,
  }

});
