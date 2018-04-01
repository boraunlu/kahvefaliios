import React, { Component } from 'react';
import {ActivityIndicator,Switch, Dimensions, Image,Text,TouchableHighlight,Button, TouchableOpacity, View , StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from 'react-native-progress/Bar';
import Picker from 'react-native-picker';

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

  changeDmStatus(){
    this.props.userStore.changeDmStatus()
  }

  renderUserData(){
    if (this.props.userStore.user) {
      var falPuan =this.props.userStore.user.falPuan
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

      return (
        <View >
          <TouchableOpacity  onPress={() => {this.props.setDestination('FalPuan')}}>
            <View style={{alignSelf:'center',alignItems:'center',marginTop:10,flexDirection:'row'}}>
              <Text style={{fontSize:16,color:kolor,fontWeight:'bold'}}>{unvan}</Text>
              <Icon style={{position:'absolute',right:-30}} name="question-circle" color={'lightgray'} size={20} />
            </View>
            <View style={{alignSelf:'center',alignItems:'center',marginTop:10,marginBottom:15}}>
              <View style={{justifyContent:'center'}}>
                <View style={{position:'absolute',zIndex: 3,left:-40,justifyContent:'center',height:30,width:30,borderRadius:15,backgroundColor:kolor}}><Text style={{fontSize:18,backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>{seviye}</Text></View>
                <ProgressBar borderColor={kolor} color={kolor} height={16} borderRadius={8} progress={gosterilenpuan/limit} width={200} />
              </View>
              <Text style={{}}>{gosterilenpuan+"/"+limit+" FalPuan"}</Text>
            </View>
          </TouchableOpacity>
          <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
           <Text style={{fontSize:14}}>Özel mesaj almak istemiyorum</Text>
           <Switch value={this.props.userStore.dmBlocked} onValueChange={()=>{this.changeDmStatus()}}/>
          </View>
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
