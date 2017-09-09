import React, { Component } from 'react';
import {ActivityIndicator, Dimensions, Image,Text,TouchableHighlight,Button, TouchableOpacity, View , StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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

  initMeslekPicker = () => {

   var meslekArray=["Öğrenci", "Çalışıyor","Çalışmıyor","İş arıyor"];

   Picker.init({
       pickerData: meslekArray,
       selectedValue: [this.props.userStore.meslek],
       pickerTitleText:'İş Durumunuz',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',

       onPickerConfirm: data => {
           this.props.userStore.changeMeslek(data)
       },

   });
  }

  initiliskiPicker = () => {

   var iliskiArray=["İlişkisi Yok", "Sevgilisi Var","Evli"];

   Picker.init({
       pickerData: iliskiArray,
       selectedValue: [this.props.userStore.meslek],
       pickerTitleText:'İlişki Durumunuz',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',
       onPickerConfirm: data => {
           this.props.userStore.changeIliski(data)
       },

   });
  }

  initAgePicker = () => {

    let agedata = [];
    for(var i=12;i<70;i++){
        agedata.push(i);
    }

   Picker.init({
       pickerData: agedata,
       selectedValue: [this.props.userStore.age],
       pickerTitleText:'Yaşınız',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',
       onPickerConfirm: data => {

           this.props.userStore.changeAge(data[0])
       },

   });
  }

  componentDidUpdate = () => {



  }

  renderUserData(){
    if (this.props.userStore.user) {

      return (
        <View >
        <View style={styles.thirdrow}>
          <TouchableOpacity onPress={() => {this.initAgePicker()}} style={{flexDirection:'row',justifyContent:'space-between',padding:10,marginBottom:10,alignItems:'center',backgroundColor:'sienna',width:'100%',height:30,borderRadius:5}}><Text style={{fontWeight:'bold',backgroundColor:'transparent',color:'white'}}>{this.props.userStore.age>10 ? this.props.userStore.age+" yaşında" : "Yaşınızı Seçin"}</Text><Icon name="chevron-down" color={'white'} size={14} /></TouchableOpacity>
          <TouchableOpacity onPress={() => {this.initiliskiPicker()}} style={{flexDirection:'row',justifyContent:'space-between',padding:10,marginBottom:10,alignItems:'center',backgroundColor:'sienna',width:'100%',height:30,borderRadius:5}}><Text style={{fontWeight:'bold',backgroundColor:'transparent',color:'white'}}>{this.props.userStore.iliski!=='' ? this.props.userStore.iliski : "İlişki Durumu"}</Text><Icon name="chevron-down" color={'white'} size={14} /></TouchableOpacity>
          <TouchableOpacity onPress={() => {this.initMeslekPicker()}} style={{flexDirection:'row',justifyContent:'space-between',padding:10,marginBottom:10,alignItems:'center',backgroundColor:'sienna',width:'100%',height:30,borderRadius:5}}><Text style={{fontWeight:'bold',backgroundColor:'transparent',color:'white'}}>{this.props.userStore.meslek!=='' ? this.props.userStore.meslek : "Çalışma Durumu"}</Text><Icon name="chevron-down" color={'white'} size={14} /></TouchableOpacity>

        </View>
        <View style={styles.secondrow}>
          <Text style={{fontWeight:'bold',textAlign:'center',fontSize:16}}>Fal İstatistiklerin</Text>
          <View style={styles.secondinner}>
            <View >
              <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
                <Text style={{fontWeight:'bold'}}>Toplam</Text>
              </View>
              <View style={{paddingTop:5,alignItems:'center'}}>
                <Text style={styles.numbers}>{this.props.userData.timesUsed ? this.props.userData.timesUsed : 0}</Text>
              </View>
            </View>
            <View>
              <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
                <Text style={{fontWeight:'bold'}}>Aşk</Text>
              </View>
              <View style={{paddingTop:5,alignItems:'center'}}>
                <Text style={styles.numbers}>{this.props.userData.loveUsed ? this.props.userData.loveUsed : 0}</Text>
              </View>
            </View>
            <View>
              <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
                <Text style={{fontWeight:'bold' }}>Detaylı</Text>
              </View>
              <View style={{paddingTop:5,alignItems:'center'}}>
                <Text style={styles.numbers}>{this.props.userData.detayUsed ? this.props.userData.detayUsed : 0}</Text>
              </View>
            </View>
          </View>
          </View>
        <View style={styles.thirdrow}>
            <Text style={{fontWeight:'bold',marginBottom:5}}>İlk konuştuğumuz tarih: <Text style={{fontWeight:'normal'}}>{moment(this.props.userData.joinDate).format('LLL')}</Text></Text>
            <Text style={{fontWeight:'bold',marginBottom:5}}>En son fal baktığın tarih: <Text style={{fontWeight:'normal'}}>{moment(this.props.userData.lastUsed).format('LLL')}</Text></Text>
            <Text style={{fontWeight:'bold'}}>Kredin: <Text style={{fontWeight:'normal'}}>{this.props.userData.credit ? this.props.userData.credit : 0}</Text></Text>
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
