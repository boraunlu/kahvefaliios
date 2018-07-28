import React, {

} from 'react';
import {
  StyleSheet,
  Text,
  View,Alert,
  Image,
  ScrollView,TextInput,Button,
  ImageBackground,Dimensions,Keyboard
} from 'react-native';

import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import PropTypes from 'prop-types';

export default class TermsofUse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {


  };

}

  static navigationOptions = {
      title: 'KULLANIM KOŞULLARI',
      headerStyle: {
        backgroundColor:'white',
        height: 46

      },headerRight:<View style={{width:70,height:10}}></View>,
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize:18,
        textAlign: "center",alignSelf: 'center',
        color: "#241466",
  textAlign:'center'
      },

    };




  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>
        {/* <Image style={{height:80,width:80, borderRadius:40,marginTop:30,marginBottom:30}} source={require('../static/images/anneLogo3.png')}></Image>*/}

        <View style={{width:Dimensions.get('window').width*0.9,borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10,marginTop:20}}>


              <View style={{width:"100%",height:Dimensions.get('window').height*0.8,marginBottom:10}}>
              <ScrollView style={{padding:10}}>
             <Text style={{textAlign:'justify',color:"#ffffff",paddingBottom:10}}>
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
              </View>


         </View>
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {



    alignItems:'center',
    paddingRight:10,
    paddingLeft:10,
    backgroundColor: '#ccc',
    flex: 1,

    justifyContent: 'flex-start',
  },

});
