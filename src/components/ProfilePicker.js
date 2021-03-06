import React, { Component } from 'react';
import {ActivityIndicator, Dimensions, Image,Text,TextInput,TouchableHighlight,Button, TouchableOpacity, View , StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Picker from 'react-native-picker';
import * as Animatable from 'react-native-animatable';
import PropTypes from 'prop-types';



import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("userStore")
@observer
export default class ProfilePicker extends Component {


  constructor(props) {
    super(props);
    this.state = {
      nametext:this.props.userStore.userName,
    };


  }

  static alarmla = () => {
      alert("anneiği")
  }


  initMeslekPicker = () => {

   var meslekArray=["Öğrenciyim", "Kamuda Çalışıyorum", "Özel Sektör", "Kendi İşim","Çalışmıyorum","İş Arıyorum"];

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
    Picker.show()
  }

  initiliskiPicker = () => {

   var iliskiArray=["İlişkim Yok", "Sevgilim Var","Evliyim","Nişanlıyım","Platonik","Ayrı Yaşıyorum","Yeni Ayrıldım","Boşandım"];

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
    Picker.show()
  }

  initAgePicker = () => {

    let agedata = [];
    for(var i=18;i<70;i++){
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
    Picker.show()
  }


  componentDidMount = () => {


    //this.alarmla()
  }
  componentDidUpdate = (prevProps,prevState) => {

    if(this.props.checkValidation){
      if(!this.props.userStore.age){
        this.agePicker.shake()
      }
      if(!this.props.userStore.iliski){
        this.iliskiPicker.shake()
      }
      if(!this.props.userStore.meslek){
        this.meslekPicker.shake()
      }
      if(this.props.userStore.userName.length<3){
      //  this.namePicker.shake()
      }

      this.props.changeValidation()
    }
    //this.agePicker.shake()
    //this.agePicker.shake()
    //this.alarmla()
  }


  render() {

    return (
      <View style={styles.pickerContainer}>
        <Animatable.View ref={agePicker => this.agePicker = agePicker}><TouchableOpacity onPress={() => {this.initAgePicker()}} style={styles.picker}><Animatable.Text style={styles.pickerText}>{this.props.userStore.age>10 ? this.props.userStore.age+" yaşındayım" : "Yaşınızı Seçin"}</Animatable.Text><Icon name="chevron-down" color='rgb( 55, 32, 142)' size={14} /></TouchableOpacity></Animatable.View>
        <Animatable.View ref={agePicker => this.iliskiPicker = agePicker}><TouchableOpacity onPress={() => {this.initiliskiPicker()}} style={styles.picker}><Animatable.Text  style={styles.pickerText}>{this.props.userStore.iliski!=='' ? this.props.userStore.iliski : "İlişki Durumu"}</Animatable.Text><Icon name="chevron-down" color='rgb( 55, 32, 142)' size={14} /></TouchableOpacity></Animatable.View>
        <Animatable.View ref={agePicker => this.meslekPicker = agePicker}><TouchableOpacity onPress={() => {this.initMeslekPicker()}} style={styles.picker}><Animatable.Text  style={styles.pickerText}>{this.props.userStore.meslek!=='' ? this.props.userStore.meslek : "Çalışma Durumu"}</Animatable.Text><Icon name="chevron-down" color='rgb( 55, 32, 142)' size={14} /></TouchableOpacity></Animatable.View>
      </View>
    );
  }
}

var styles = StyleSheet.create({

  pickerContainer: {
    borderColor:'white',

    backgroundColor:'transparent',

    backgroundColor:'rgba(0, 0, 0, 0)'

  },
  picker:{
    flexDirection:'row',justifyContent:'space-between',padding:5,paddingLeft:10,paddingRight:10,marginBottom:10,alignItems:'center',backgroundColor:'#f9f9fb',width:'100%',height:30,borderRadius:5
  },
  nameinput:{
    fontSize:14,backgroundColor:'transparent',color:'rgb( 55, 32, 142)',justifyContent:'space-between',alignItems:'center',backgroundColor:'#f9f9fb',width:'70%',height:30,fontFamily:'SourceSansPro-Bold'
  },
  pickerText:{
    backgroundColor:'transparent',color:'rgb( 55, 32, 142)',fontFamily:'SourceSansPro-Bold'
  },
  inputwrap:{
    flexDirection:'row',justifyContent:'space-between',paddingLeft:10,paddingRight:10,marginBottom:10,alignItems:'center',backgroundColor:'#f9f9fb',width:'100%',height:30,borderRadius:5
  },

});
