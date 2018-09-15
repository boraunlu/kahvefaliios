import React, {

} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  Linking
} from 'react-native';

import Icon from "react-native-vector-icons/FontAwesome"
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("userStore")
@observer
export default class FalPuan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'
  };
}

  static navigationOptions = {
      title: 'Fal Puan',
    };





  componentDidMount() {

  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>
        <ScrollView>
          <Text style={{fontSize:24,color:'white',marginTop:10,textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>🎁 ÖDÜLLER 🎁</Text>

          <Text style={{fontSize:20,color:'white',marginTop:20,textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>HER 50 FALPUAN = 25 KREDİ</Text>
          {/*
          <Text style={{fontSize:26,color:'white',marginTop:10,textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>+</Text>

          <Text style={{textAlign:'left',color:'white',fontFamily:'SourceSansPro-Bold',marginTop:5}}>      Haftalık Fal Puan Sıralamasında</Text>
          <View style={[styles.faltypecontainer, { flexDirection: 'row-reverse', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} >
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>
              <View style={{ flex: 2, height: 50, justifyContent: 'center', alignItems: 'center', width: 45}}>
                <Text style={styles.textKey2}>1.ye</Text>
              </View>
                   <View style={{ flex: 5, height: 50, justifyContent: 'center', alignItems: 'flex-start',paddingLeft:10  }}>

                     <Text style={styles.textTitle}>

                       {'\u2022'} 150 TL Değerinde Alışveriş Kartı
                     </Text>
                   </View>
                 </View>
                 <View style={{
                   flex: 5, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 50,
                   borderRadius: 4,
                   backgroundColor: "#bc4576"
                 }}>
                 </View>
                 <View style={{
                   flex: 2, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                   borderRadius: 4,
                   backgroundColor: "transparent"
                 }}>
                 </View>
          </View>
          <View style={[styles.faltypecontainer, { flexDirection: 'row-reverse', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} >
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>
              <View style={{ flex: 2, height: 50, justifyContent: 'center', alignItems: 'center', width: 45}}>
                <Text style={styles.textKey2}>2.ye</Text>
              </View>
                   <View style={{ flex: 5, height: 50, justifyContent: 'center', alignItems: 'flex-start',paddingLeft:10  }}>

                     <Text style={styles.textTitle}>

                       {'\u2022'} 100 TL Değerinde Alışveriş Kartı
                     </Text>
                   </View>
                 </View>
                 <View style={{
                   flex: 5, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 50,
                   borderRadius: 4,
                   backgroundColor: "#e4b05c"

                 }}>
                 </View>
                 <View style={{
                   flex: 2, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                   borderRadius: 4,
                   backgroundColor: "transparent"
                 }}>
                 </View>
          </View>
          <View style={[styles.faltypecontainer, { flexDirection: 'row-reverse', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} >
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>
              <View style={{ flex: 2, height: 50, justifyContent: 'center', alignItems: 'center', width: 45}}>
                <Text style={styles.textKey2}>3.ye</Text>
              </View>
                   <View style={{ flex: 5, height: 50, justifyContent: 'center', alignItems: 'flex-start',paddingLeft:10  }}>

                     <Text style={styles.textTitle}>

                       {'\u2022'} 50 TL Değerinde Alışveriş Kartı
                     </Text>
                   </View>
                 </View>
                 <View style={{
                   flex: 5, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 50,
                   borderRadius: 4,
                    backgroundColor: "#C0C0C0"
                 }}>
                 </View>
                 <View style={{
                   flex: 2, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                   borderRadius: 4,
                   backgroundColor: "transparent"
                 }}>
                 </View>
          </View>
          */}

          <View style={styles.containers}>
            <Text style={styles.textTitle2}>
              FalPuan Nasıl Kazanılır?
            </Text>

            <Text style={styles.textKey3}>
              *Bir faldan, 5'i fal sahibinden 5'i falseverlerden olmak üzere en fazla 10 FalPuan kazanılabilir. Ne kadar çok farklı fala yorum yaparsanız FalPuan kazancınız o kadar artar!
            </Text>
            <View style={{flexDirection:'row'}}>

            <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Fal Sahibinin Yorumunuzu Beğenmesi: </Text>
              <Text style={styles.textValue}>5 Puan</Text>
            </View>
            <View style={{flexDirection:'row'}}>

            <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Falseverlerin Yorumunuzu Beğenmesi: </Text>
              <Text style={styles.textValue}>1 Puan</Text>
            </View>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Günlük Fal Baktırmak: </Text>
              <Text style={styles.textValue}>1 Puan</Text>
            </View>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>El Falı Baktırmak: </Text>
              <Text style={styles.textValue}>1 Puan</Text>
            </View>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Sosyal Fal Baktırmak: </Text>
              <Text style={styles.textValue}>5 Puan</Text>
            </View>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Süper Sosyal Fal Baktırmak: </Text>
              <Text style={styles.textValue}>10 Puan</Text>
            </View>
          </View>
          {/*
          <Text style={styles.infotext}>
            {'\u2022'} Haftalık Fal Puanınınızın sayımı Pazar 23:59'da sonlanmaktadır.{'\n'}
            {'\u2022'} Fal Puan ile kazanılan krediler anında hesabınıza eklenmektedir. Örneğin haftalık 50 falpuana ulaştığınız anda 25 krediniz yüklenir. 100 falpuana ulaştığınızda 25 kredi daha anında yüklenir.{'\n'}
            {'\u2022'} Alışveriş Kartı kazananı her hafta Pazartesi veya Salı günü <Text  style={{fontFamily:'SourceSansPro-Bold',textDecorationLine:'underline',}}
                onPress={() => {Linking.openURL('https://www.instagram.com/kahvefalisohbeti')}}
              >
                @kahvefalısohbeti
              </Text> Instagram hesabımızda hikaye olarak yayınlanacaktır.{'\n'}
              {'\u2022'} Bir haftada maksimum 150 Kredi kazanılabilir.{'\n'}
              {'\u2022'} Hediye Kartı kazanabilmek için en az 18 yaşında olmak gerekir.{'\n'}
              {'\u2022'} Apple şirketinin bu yarışma ile herhangi bir ilişkisi bulunmamaktadır.
          </Text>*/}
          <Text style={styles.infotext}>
            {'\u2022'} Haftalık Fal Puanınınızın sayımı Pazar 23:59'da sonlanmaktadır.{'\n'}
            {'\u2022'} Fal Puan ile kazanılan krediler anında hesabınıza eklenmektedir. Örneğin haftalık 50 falpuana ulaştığınız anda 25 krediniz yüklenir. 100 falpuana ulaştığınızda 25 kredi daha anında yüklenir.{'\n'}

              {'\u2022'} Bir haftada maksimum 150 Kredi kazanılabilir.{'\n'}

          </Text>
        </ScrollView>
      </ImageBackground>

    );
  }
}


let deviceWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    padding:10,
    paddingBottom:0,
    paddingTop:0

  },
  textKey:{
    fontFamily: "SourceSansPro-Regular",
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: "#241466",
    paddingBottom:10
  },
  textKey3:{
    fontFamily: "SourceSansPro-Regular",
    fontSize: 14,
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: "#241466",
    paddingBottom:10
  },
  textKey2:{
    fontFamily: "SourceSansPro-Bold",
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: "#241466",
    paddingBottom:10
  },
  textValue:{
    fontFamily: "SourceSansPro-Bold",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: "#241466",
    textAlign:'right',
    paddingBottom:7,
    alignSelf:"flex-end",
    position:"absolute",
    right:0
  },
  textTitle:{
    fontFamily: "SourceSansPro-Bold",
    textAlign:'left',
    fontSize: 16,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,

    marginBottom:5,
    color: "white"
  },textTitle2:{
    fontFamily: "SourceSansPro-Bold",
    textAlign:'left',
    fontSize: 16,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign:'center',
    marginBottom:5,
    color:"#241466"
  },containers:{
    width:deviceWidth*0.9,
    flex:1,
    opacity: 0.9,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginTop:20,
    padding:15,
    alignSelf:'center'
  },containers2:{
    width:deviceWidth*0.9,
    flex:1,
    opacity: 0.9,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginTop:20,
    padding:15
  },Icon:{
    position:"relative",
    top:3,
    marginRight:9
  },
  Icon2:{
    position:"relative",
  },
  falPuan:{
    fontSize:20,
    fontFamily:'SourceSansPro-Bold',
    color:'white',
    textAlign:'center'
  },
  faltypeyazi:{
    textAlign: 'center',color:'white',fontWeight:'bold', fontFamily: "SourceSansPro-Regular",
    fontSize: 22,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
  },
  faltypecontainer:{
    flex:1,
    height: 50,
  borderRadius: 4,
  backgroundColor: "#ffffff",
  marginBottom :15
  },
  faltypeimage:{
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    height:123,
    flexDirection:'column-reverse'
  },
  corner:{ width: 78,
    margin:-10,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding:8,alignItems:'center',

    justifyContent:'center'}
,coin:{
  height:15,
  width:15,
  marginLeft:5,
},
infotext:{
  color:'white',
  fontSize:12,
  fontFamily:'SourceSansPro-Regular',
  marginTop:10
}
});
