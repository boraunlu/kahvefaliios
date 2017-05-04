import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Keyboard,
  ScrollView,
  Button,
  Dimensions,
  ActivityIndicator
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import { NavigationActions } from 'react-navigation'

const productId = "deneme"
var products = [
   'com.grepsi.kahvefaliios.25',
];

export default class Odeme extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      credit:null,
  };

  this.setnavigation = this.setnavigation.bind(this);
}

  static navigationOptions = {
      title: 'Ödeme',

    };

    setnavigation(route){
          const { navigate } = this.props.navigation;
      navigate(route);
    }

    pay(){

      InAppUtils.loadProducts(products, (error, products) => {
        if(error){alert(error)}
        alert(JSON.stringify(products))
      });

    }


  componentDidMount() {
    this.props.navigation.setParams({ setnavigation: this.setnavigation })
    Keyboard.dismiss()
    fetch('https://eventfluxbot.herokuapp.com/webhook/getCredits', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: Backend.getUid(),
      })
    })
    .then((response) => response.json())
     .then((responseJson) => {
      this.setState({credit:responseJson.credit})
     })
  }

  componentWillUnmount() {
    console.log("odemeunmount")

  }


  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
      <ScrollView>
        <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:15,alignSelf:'stretch'}}>
          <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
          </Image>
          <View style={{borderRadius:10,flexDirection:'row',backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10,width:Dimensions.get('window').width-85}}>
            <Text  style={[styles.chattext]}>
              {'Mevcut Kredin:' + ' '}
            </Text>
            {this.state.credit!==null ? (
              <Text  style={[styles.chattext]}>
                {this.state.credit}
              </Text>
              ) : (
                <ActivityIndicator
                  animating={true}
                  size="small"
                />
              )}

            <Image source={require('../static/images/coins.png')} style={{width:15, height: 15,marginLeft:5,marginTop:5}}/>
          </View>

        </View>

        <View style={styles.descContainer}>
            <View style={{flexDirection:'row'}}>
          <Text style={styles.description}>Aşk Falı       :<Text style={styles.description2}> 100 Kredi</Text></Text><Image source={require('../static/images/coins.png')} style={styles.coin}/>
              </View>
            <View style={{flexDirection:'row'}}>
          <Text style={styles.description}>Detaylı Fal  :<Text style={styles.description2}> 150 Kredi</Text></Text><Image source={require('../static/images/coins.png')} style={styles.coin}/>

              </View>
            <View style={{flexDirection:'row'}}>
          <Text style={styles.description}>Yıldızname :<Text style={styles.description2}> 250 Kredi</Text></Text><Image source={require('../static/images/coins.png')} style={styles.coin}/>

              </View>
        </View>
        <View style={styles.productsContainer}>
          <Text  style={[styles.label2, {fontWeight: 'bold'}]}>
            Kredi Al
          </Text>
          <ScrollView >
            <View style={styles.productRow}>
                <View>
                  <View style={{flexDirection:'row'}}>
                    <Text style={[styles.label]}>
                      100 Kredi
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Text style={[styles.underlabel]} >
                    +10 Kredi Hediye
                  </Text>
                </View>
                <Button style={styles.buyButton} color={'#1194F7'} onPress={() => {this.pay()}} title={"7.99 TL"}>
                </Button>
            </View>
            <View style={styles.productRow}>
              <View>
                <View style={{flexDirection:'row'}}>
                  <Text style={[styles.label]}>
                    150 Kredi
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View>
                <Text style={[styles.underlabel]}>
                  +15 Kredi Hediye
                </Text>
              </View>
                <Button title={"11.99 TL"} style={styles.buyButton} onPress={() => {this.pay()}} color={'#1194F7'}>
                </Button>
            </View>
            <View style={[styles.productRow,{elevation:5}]}>
                <View>
                  <Text style={{color:'white'}}>
                    En çok tercih edilen!
                  </Text>
                  <View style={{flexDirection:'row'}}>
                    <Text style={[styles.label,{fontWeight:'bold'}]}>
                      250 Kredi
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Text style={[styles.underlabel]}>
                    +25 Kredi Hediye
                  </Text>
                </View>
                <Button title={"18.99 TL"} style={styles.buyButton} onPress={() => {this.pay()}} color={'#1194F7'}>
                </Button>
            </View>
            <View style={styles.productRow}>
              <View>
                <View style={{flexDirection:'row'}}>
                  <Text style={[styles.label]}>
                    500 Kredi
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View>
                <Text style={[styles.underlabel]}>
                  +50 Kredi Hediye
                </Text>
              </View>
                <Button title={"34.99 TL"} style={styles.buyButton} onPress={() => {this.pay()}} color={'#1194F7'}>
                </Button>
            </View>
            <View style={styles.productRow}>
                <View>
                  <View style={{flexDirection:'row'}}>
                    <Text style={[styles.label]}>
                      1000 Kredi
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Text style={[styles.underlabel]}>
                    +100 Kredi Hediye
                  </Text>
                </View>
                <Button title={"64.99 TL"} style={styles.buyButton} onPress={() => {this.pay()}} color={'#1194F7'}>
                </Button>
            </View>
          </ScrollView>
        </View>
        </ScrollView>
      </Image>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    padding:5,
  },
  buyButton:{
    color:'green'
  },
  productRow:{
   margin:5,padding:10,backgroundColor:'rgba(0, 0, 0, 0.7)',flexDirection:'row',justifyContent:'space-between',paddingBottom:10,paddingTop:10, borderWidth:1,borderColor:'gainsboro'
  },
  currentCreditContainer:{
   marginTop:10,backgroundColor:'rgba(0, 0, 0, 0.5)',flexDirection:'row',justifyContent:'center',paddingBottom:10,paddingTop:10,
 },
 productsContainer:{
   margin:5,flexDirection:'column',justifyContent:'center',paddingBottom:10,paddingTop:10, borderColor:'gray',flex:1
 },
  label: {
    fontSize: 20,
    color:'white',
    textAlign:'center',
    backgroundColor:'transparent'
  },
  chattext:{
    fontSize:16,
    color:'white'
  },
  label2:{
    fontSize: 24,
    color:'white',
    textAlign:'center',
    backgroundColor:'transparent'
  },
  headline:{
    fontSize: 30,
    color:'white',
    textAlign:'center'
  },
  underlabel:{
    color:'white'
  },
  coin:{
    height:15,
    width:15,
    marginLeft:5,
    marginTop:5
  },
  textInput: {
    height: 40,
    marginLeft: 15,
  },
  descContainer:{
    margin:15,
  },
  description:{
    color:'white',
    fontSize:20,
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  description2:{
    color:'white',
    fontSize:20,
    fontWeight:'normal',
    backgroundColor:'transparent'
  }
});
