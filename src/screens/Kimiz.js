import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'


export default class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'
  };
}

  static navigationOptions = {
      title: 'Biz Kimiz',
    };





  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <Image style={{height:80,width:80, borderRadius:40,marginBottom:30}} source={require('../static/images/anneLogo3.png')}></Image>
        <View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10}}>
          <Text style={{fontSize:16,color:'white',textAlign:'justify'}}>
            İsmim Nevin.{"\n"}{"\n"}

                        Çok uzun seneler farklı fal türleri ile uğraşıp bir çok yerde fal baktıktan sonra yılların verdiği deneyimimi internet üzerinde kullanmaya karar verdim ve Facebooktaki Kahve Falı Sohbeti sayfasını kurdum. Sayfanın beklediğimden çok daha fazla talep görmesiyle birlikte gelen fallara yetişemez duruma geldim ve kendi falcı ekibimi toplamaya karar verdim.{"\n"}{"\n"}
                        Şu anda cennet ülkemizin farklı yerlerinde yaşayan 14 kişiden oluşan ve giderek de büyüyen bir ekibiz. Bir süre önceye kadar sadece Facebook üzerinden fal bakıyorduk, ancak bu deneyimi iyileştirmeye ve sizin de şu anda kullanıyor olduğunuz Kahve Falı Sohbeti mobil uygulamamızı yaratmaya karar verdik.{"\n"}{"\n"}
                        Dilerim benden ve ekibimiden memnun kalırsınız. Neyse haliniz çıksın faliniz!
          </Text>

        </View>
      </Image>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    padding:10,
    paddingTop:30
  },

});
