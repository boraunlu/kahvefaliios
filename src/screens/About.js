import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  ScrollView,
  Button,
  ActivityIndicator
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'



export default class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

  };
}

  static navigationOptions = {
      title: 'Hakkında & Ayarlar',
    };

  logout = () => {

    Backend.logOut()
  }
  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (
      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <View style={{paddingTop:5}}>
          <Button title={"Çıkış Yap"} color={"gray"} onPress={() => {this.logout()}}/>
        </View>
        <ScrollView style={{backgroundColor:'white',opacity:0.8,margin:5,padding:5}}>
          <Text style={{textAlign:'center',fontWeight:'bold',fontSize:18}}>Kullanım Koşulları</Text>
          <Text style={{textAlign:'justify'}}>
            ·  İş bu kullanım şartları Kahve Falı Sohbeti uygulamasının kullanım şartlarını içermektedir.{"\n"}

            ·  Kahve Falı Sohbeti uygulamasındaki yorumlar yorumcuların hayal gücü ile üretilmiş olup gelecek ile ilgili tahminleri paylaşma amaçlı olsa da gerçeği yansıtmamaktadır.

            ·  Kahve Falı Sohbeti uygulamasındaki amaç sohbet ve eğlence amaçlı olarak yorumcuların kişisel yorumlarıyla oluşturdukları içerikleden oluşmaktadır ve bu yorumlar 18 yaşından küçükler için sakıncalı olabilir.{"\n"}

            ·  Kahve Falı Sohbeti uygulamasındaki yorumcuların kişisel yorumlarından doğabilecek sonuçlardan Kahve Falı Sohbeti kesinlikle sorumlu değildir.{"\n"}

            ·  Kahve Falı Sohbeti uygulaması fincan fotoğrafı gönderme bölümünde fincan fotoğrafının haricinde başka fotoğraf gönderen kullanıcıların üyeliklerini iptal etme hakkını saklı tutar.{"\n"}

            ·  Kahve Falı Sohbeti uygulaması, kullanıcıların kişilik haklarına ve gizliliklerine saygılıdır. Koşullardaki maddelerde, kullanıcıların kendi isteği veya yetkili mercilerin talebi haricinde kullanıcıların bilgilerini gizili tutacağını taahhüt eder.{"\n"}

            ·  Kahve Falı Sohbeti sitesinde kesinlikle büyü, hurafe vb. ile ilgili içerik ve tavsiye,öneri gibi yazılar, resimler, öneriler bulunmamaktadır,bulunamaz ve bulundurulmasına izin verilmez.{"\n"}

            ·  Kahve Falı Sohbeti uygulamasını kullanan tüm kullanıcılar bu koşulları kabul ettiğini taahhüt eder.{"\n"}

            ·  Kahve Falı Sohbeti uygulaması üyelerin bilgilerini, yasal mercilerden resmi bir istek gelmesi haricinde gizli tutacağını taahüt eder.{"\n"}

            ·  Kahve Falı Sohbeti uygulamasının üyeleri bilgilerini istedikleri zaman düzenleyebilirler. Kullanım koşullarına uymayan bilgileri yönetim istediği zaman silme hakkına veya o üyenin üyeliğini iptal etme hakkına sahiptir.{"\n"}

            ·  Kahve Falı Sohbeti uygulamasının üyeleri istedikleri zaman üyeliklerini iptal edebilirler.{"\n"}

            ·  Kahve Falı Sohbeti uygulamasının üyeleri uygulama ile ilgili her türlü problemi <Text style={{fontWeight:'bold'}}>info@kahvefalisohbeti.com</Text> adresine e-posta göndererek bildirebilir. Kahve Falı Sohbeti, oluşacak sorunları en iyi niyetiyle çözmek için garanti verir.{"\n"}

            ·  Kahve Falı Sohbeti uygulaması bu metindeki içeriği istediği zaman değiştirebileceğini beyan eder.{"\n"}
          </Text>
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
    fontSize: 30,
    color:'white',
    textAlign:'center'
  },
  underlabel:{
    color:'white'
  },
  coin:{
    height:25,
    width:25,
    marginLeft:5,
    marginTop:5
  },
  textInput: {
    height: 40,
    marginLeft: 15,
  },
});
