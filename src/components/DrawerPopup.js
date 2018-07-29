import React, { Component } from 'react';
import {ActivityIndicator,Dimensions, Image,Text,TouchableHighlight,Button, TouchableOpacity, View , StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Picker from 'react-native-picker';
import PropTypes from 'prop-types';

require('../components/data/falcilar.js');
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("userStore")
@observer
export default class DrawerPopup extends Component {


  constructor(props) {
    super(props);

  }

  componentDidUpdate = () => {

  }


  render() {

    return (


      <PopupDialog
      //dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title=" " />}
      dialogStyle={{alignSelf:"flex-start",borderRadius:0}}
      width={0.7}
      height={1}
      ref={(popupDialog) => { this.popupDrawer = popupDialog; }}
      dialogAnimation={slideAnimation}
    >
    <View style={{flex:1}}>
    <View style={{flex:1,marginBottom:10,marginTop:15,paddingRight:23,paddingLeft:23}}>
      <Image style={{alignSelf:'center',height:80,width:80, borderRadius:0,marginTop:0,marginBottom:10}} source={require('../static/images/logo.png')}></Image>
      <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}  onPress={() => {this.props.navigation.navigate('Oneri')}}>
        <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"FİKİR VER, KAZAN"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}   onPress={() => {this.props.navigation.navigate('FalPuan')}}>
        <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"FAL PUAN"}</Text>
      </TouchableOpacity>
       <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}   onPress={() => {this.props.navigation.navigate('Kimiz')}}>
         <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"BİZ KİMİZ?"}</Text>
       </TouchableOpacity>
       <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}  onPress={() => {this.props.navigation.navigate('JoinTeam')}}>
         <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"EKİBİMİZE KATIL"}</Text>
       </TouchableOpacity>
       <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}  onPress={() => {this.props.navigation.navigate('TermsofUse')}}>
         <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"KULLANIM KOŞULLARI"}</Text>
       </TouchableOpacity>
       <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30,marginBottom:14}}  onPress={() => {this.logout()}}>
         <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"ÇIKIŞ YAP"}</Text>
       </TouchableOpacity>
      <Text style={{paddingTop:15,fontSize:12,flex:1,color: 'gray',textAlign: 'center',fontFamily:'SourceSansPro-Italic'}}>Uygulamada yaşadığınız her türlü problemi <Text style={{textDecorationLine:'underline'}}>info@kahvefalisohbeti.com</Text> adresine e-mail yoluyla iletebilirsiniz</Text>

     </View>
    </View>
   </PopupDialog>

    );
  }
}

var styles = StyleSheet.create({
  container: {

    padding: 15,
    paddingTop:5,
    paddingBottom:0,
    width: Dimensions.get('window').width-20,
  },
  firstrow: {

    justifyContent:'space-around',
    borderBottomWidth:1,
    borderTopWidth:1,
    borderColor:'gainsboro',
    paddingBottom:10,
    paddingTop:10,

  },
  secondrow: {
    flexDirection: 'column',
    justifyContent:'space-around',
    borderBottomWidth:1,
    borderColor:'gainsboro',
    paddingBottom:15,
    paddingTop:5,
    borderTopWidth:1,
  },
  secondinner:{
    paddingTop:5,
    flexDirection: 'row',
    justifyContent:'space-around',
  },
  thirdrow: {
    paddingTop:10
  },
  numbers:{
    fontSize:20
  },
  buttontext1:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontSize:14
  },
  button1:{
    backgroundColor:'#1194F7',
    justifyContent:'center',
    padding:5
  },

});
