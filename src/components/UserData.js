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
export default class UserData extends Component {


  constructor(props) {
    super(props);

  }

  componentDidUpdate = () => {

  }


  renderUserData(){
    if (this.props.userStore.user) {
      var falPuan =this.props.userStore.user.falPuan
      var seviye = 1
      var limit =25
      var gosterilenpuan=falPuan
      var unvan = "Yeni Falsever"
      var kolor="#ffd967"
      if (falPuan>25&&falPuan<76){
        seviye = 2
        limit = 50
        gosterilenpuan=falPuan-25
        unvan = "Falsever"
        kolor='rgb(60,179,113)'
      }else if (falPuan>75&&falPuan<201) {
        seviye = 3
        limit = 125
        gosterilenpuan=falPuan-75
        unvan = "Deneyimli Falsever"
        kolor='rgb(114,0,218)'
      }else if (falPuan>200&&falPuan<501) {
        seviye = 4
        limit = 300
        gosterilenpuan=falPuan-200
        unvan = "Fal Uzmanı"
        kolor='rgb(0,185,241)'
      }
      else if (falPuan>500) {
        seviye = 5
        limit = 12500
        gosterilenpuan=falPuan
        unvan = "Fal Profesörü"
        kolor='rgb(249,50,12)'
      }


      return (
        <View >
          <TouchableOpacity  onPress={() => {this.props.setDestination('FalPuan')}}>
            <View style={{alignSelf:'center',alignItems:'center',marginTop:10,flexDirection:'row'}}>
              <Text style={{fontSize:14,color:kolor,fontFamily:'SourceSansPro-Bold',fontWeight:'bold'}}>{unvan}</Text>

            </View>

            <View style={{alignSelf:'center',alignItems:'center',marginTop:10,marginBottom:15,flexDirection:'row'}}>
              <View style={{justifyContent:'center'}}>
                <View style={{shadowColor: "rgba(0, 0, 0, 0.2)",
                shadowOffset: {
                  width: 0,
                  height: 2
                },
                shadowRadius: 1,
                shadowOpacity: 1,position:'absolute',zIndex: 3,left:-12,elevation:3,justifyContent:'center',height:26,width:26,borderRadius:13,backgroundColor:kolor}}><Text style={{fontSize:14,backgroundColor:'transparent',color:'rgb(227,159,47)',fontWeight:'bold',textAlign:'center'}}>{seviye}</Text></View>
                <View   style={{shadowColor: "rgba(0, 0, 0, 0.2)",
                shadowOffset: {
                  width: 0,
                  height: 2
                },
                shadowRadius: 1,
                shadowOpacity: 1,height:16,width:200,borderRadius:8,elevation:1}}>

                  <View style={{height:16,width:200*(gosterilenpuan/limit),backgroundColor:kolor,borderRadius:8}}>

                  </View>
                  <Text style={{position:'absolute',bottom:0,elevation:2,backgroundColor:'rgba(0,0,0,0)',fontSize:12,alignSelf:'center',fontWeight:'bold',color:'rgb(55,32,142)'}}>{gosterilenpuan+"/"+limit}</Text>
                </View>
                <View  style={{width:20,height:20,position:'absolute',right:-30}}>

                  <Image source={require('../static/images/newImages/noun620918Cc.png')} style={{width:20,height:20}}/>

                </View>

              </View>

            </View>

          </TouchableOpacity>

        </View>
      );
    } else {
      return (
        <ActivityIndicator
          animating={true}
          size="large"
        />
      );
    }
  }

  render() {

    return (


          <View style={styles.container}>
            { this.renderUserData() }
           </View>

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
