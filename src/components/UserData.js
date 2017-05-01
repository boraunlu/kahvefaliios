import React, { Component } from 'react';
import {ActivityIndicator, Dimensions, Image,Text,TouchableHighlight,Button, TouchableOpacity, View , StyleSheet} from 'react-native';


import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

var falcilar =[{name:"Başak",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/basak.png"},
{name:"Berfin",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/berfin.png"},
{name:"Berrak",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/berrak.png"},
{name:"Beste",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/beste.png"},
{name:"Canan",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/canan.png"},
{name:"Çiğdem",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/cigdem.png"},
{name:"Didem",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/didem.png"},
{name:"Ela",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/ela.png"},
{name:"Elif",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/elif.png"},
{name:"Ferhan",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/ferhan.png"},
{name:"Feride",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/feride.png"},
{name:"Gülsüm",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/gulsum.png"},
{name:"Hande",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/hande.png"},
{name:"İlke",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/ilke.png"},
{name:"İlknur",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/ilknur.png"},
{name:"Jülide",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/julide.png"},
{name:"Müge",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/muge.png"},
{name:"Nergiz",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/nergiz.png"},
{name:"Neriman",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/neriman.png"},
{name:"Nevin",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/nevin.png"},
{name:"Öykü",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/oyku.png"},
{name:"Suzan",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/suzan.png"}
]

export default class UserData extends Component {


  constructor(props) {
    super(props);

  }

  renderUserData(){
    if (this.props.userData) {
      return (
        <View >
        <View style={styles.firstrow}>

      {this.props.userData.currentFalci!==null ? (
                <View style={{flexDirection: 'row',flex:1,alignItems:'center',justifyContent:'space-around'}}>
                  <Text>Bugünkü Falcınız: <Text style={{fontWeight:'bold',fontSize:16}}>{falcilar[this.props.userData.currentFalci].name}</Text></Text>
                  <Image source={{uri:falcilar[this.props.userData.currentFalci].url}} style={{height:34,width:34, borderRadius:17}}></Image>
                  <TouchableOpacity style={styles.button1} onPress={() => {this.props.setDestination('Chat')}}>
                      <Text style={styles.buttontext1}>Sohbete Devam</Text>
                  </TouchableOpacity>
                </View>
                ) : (
                  <TouchableOpacity onPress={() => {this.props.setDestination('Chat')}}>
                    <Text style={{textAlign:'center',color:'#1194F7',textDecorationLine:'underline'}}>Bugünkü falcını hemen belirle!</Text>
                  </TouchableOpacity>
                )}

        </View>
        <View style={styles.secondrow}>
          <View >
            <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
              <Text style={{fontWeight:'bold'}}>Toplam Fal</Text>
            </View>
            <View style={{paddingTop:5,alignItems:'center'}}>
              <Text style={styles.numbers}>{this.props.userData.timesUsed ? this.props.userData.timesUsed : 0}</Text>
            </View>
          </View>
          <View>
            <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
              <Text style={{fontWeight:'bold'}}>Aşk Falı</Text>
            </View>
            <View style={{paddingTop:5,alignItems:'center'}}>
              <Text style={styles.numbers}>{this.props.userData.loveUsed ? this.props.userData.loveUsed : 0}</Text>
            </View>
          </View>
          <View>
            <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
              <Text style={{fontWeight:'bold' }}>Katrin Falı</Text>
            </View>
            <View style={{paddingTop:5,alignItems:'center'}}>
              <Text style={styles.numbers}>{this.props.userData.detayUsed ? this.props.userData.detayUsed : 0}</Text>
            </View>
          </View>
        </View>
        <View style={styles.thirdrow}>
            <Text style={{fontWeight:'bold',marginBottom:5}}>İlk konuştuğumuz tarih: <Text style={{fontWeight:'normal'}}>{moment(this.props.userData.joinDate).format('LLL')}</Text></Text>
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
    flexDirection: 'row',
    justifyContent:'space-around',
    borderBottomWidth:1,
    borderColor:'gainsboro',
    paddingBottom:15,
    paddingTop:15
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
