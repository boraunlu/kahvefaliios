import React, {

} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions
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
          <Image style={{alignSelf:'center',height:60,width:60, borderRadius:30,marginTop:20,marginBottom:10}} source={require('../static/images/logo.png')}></Image>
          <Text style={styles.falPuan}>
              Fal Puanın: {this.props.userStore.falPuan}{"\n"}
            </Text>
          <View style={styles.containers}>
            <Text style={styles.textTitle}>
              Fal Puan Nasıl Kazanılır?{"\n"}
            </Text>
            <View style={{flexDirection:'row'}}>

            <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Yorumunuzun Beğenilmesi: </Text>
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
          <View style={styles.containers}>
            <Text style={styles.textTitle}>
              Seviyeler{"\n"}
            </Text>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Seviye 1: </Text>
              <Text style={styles.textValue}>Yeni Falsever</Text>
            </View>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Seviye 2:</Text>
              <Text style={styles.textValue}>Falsever</Text>
            </View>
            <View style={{flexDirection:'row'}}>
             <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
            <Text style={styles.textKey}>Seviye 3:</Text>
            <Text style={styles.textValue}>Deneyimli Falsever</Text>
            </View>
            <View style={{flexDirection:'row'}}>
             <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
            <Text style={styles.textKey}>Seviye 4:</Text>
            <Text style={styles.textValue}>Fal Uzmanı</Text>
            </View>
            <View style={{flexDirection:'row'}}>
               <Icon style={styles.Icon} name="arrow-right" color="#b78d0c" size={14} />
              <Text style={styles.textKey}>Seviye 5:</Text>
              <Text style={styles.textValue}>Fal Profesörü</Text>
            </View>
          </View>
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
    paddingRight:10,
    paddingLeft:10,

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
  textValue:{
    fontFamily: "SourceSansPro-Bold",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: "#241466",
    textAlign:'right',
    paddingBottom:10,
    alignSelf:"flex-end",
    position:"absolute",
    right:0
  },
  textTitle:{
    fontFamily: "SourceSansPro-Bold",
    textAlign:'justify',
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    marginBottom:5,
    color: "#241466"
  },containers:{
    width:deviceWidth*0.9,
    flex:1,
    height: 205,
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
  falPuan:{
    fontSize:20,
    fontFamily:'SourceSansPro-Bold',
    color:'white',
    textAlign:'center'
  }

});
