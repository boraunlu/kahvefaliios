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
      headerBackTitle:'Geri'

    };

    setnavigation(route){
          const { navigate } = this.props.navigation;
      navigate(route);
    }

    pay = (credit) => {
      var products = [
         'com.grepsi.kahvefaliios.'+credit,
      ];
      InAppUtils.loadProducts(products, (error, products) => {
        if(error){}
        else{
          var identifier = products[0].identifier
          InAppUtils.purchaseProduct(identifier, (error, response) => {
             // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
             if(error){}
             else{
               if(response && response.productIdentifier) {
                  //AlertIOS.alert('Purchase Successful', 'Your Transaction ID is ' + response.transactionIdentifier);
                  fetch('https://eventfluxbot.herokuapp.com/webhook/addCredits', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      uid: Backend.getUid(),
                      credit: credit
                    })
                  })
                  .then((response) => {
                    alert('Teşekkürler!'+ credit+' Kredin hesabına eklendi.')
                    this.setState((previousState) => {
                      return {
                        credit: previousState.credit+credit,
                      };
                    });
                  });
               }
             }
          });
        }
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
    //console.log("odemeunmount")

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
        
        </View>
        <View style={styles.productsContainer}>
          <Text  style={[styles.label2, {fontWeight: 'bold'}]}>
            Kredi Al
          </Text>
          <ScrollView >
          <TouchableOpacity onPress={() => {this.pay(100)}}>
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
                <Button style={styles.buyButton} color={'#1194F7'} onPress={() => {this.pay(100)}} title={"6.99 TL"}>
                </Button>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.pay(150)}}>
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
                <Button title={"9.99 TL"} style={styles.buyButton} onPress={() => {this.pay(150)}} color={'#1194F7'}>
                </Button>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.pay(250)}}>
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
                <Button title={"13.99 TL"} style={styles.buyButton} onPress={() => {this.pay(250)}} color={'#1194F7'}>
                </Button>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.pay(250)}}>
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
                <Button title={"24.99 TL"} style={styles.buyButton} onPress={() => {this.pay(500)}} color={'#1194F7'}>
                </Button>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.pay(1000)}}>
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
                <Button title={"44.99 TL"} style={styles.buyButton} onPress={() => {this.pay(1000)}} color={'#1194F7'}>
                </Button>
            </View>
          </TouchableOpacity>
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
    padding:0,
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
