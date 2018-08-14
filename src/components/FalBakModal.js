import React, { Component } from 'react';
import { Modal, Button,ScrollView, Image,ImageBackground,Dimensions, Text,TouchableHighlight, TouchableOpacity, View , StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';

class Element extends Component {


  constructor(props) {
    super(props);

  }

  render(){
    return(
      <TouchableOpacity style={{alignSelf:'stretch',padding:5, borderTopWidth:1, borderColor:'black'}} onPress={() => {this.props.sendPayload(this.props.payload)}}>
        <View style={{alignSelf:'stretch',padding:5,flexDirection:'row'}}>
          <Image source={{ uri: this.props.image}} style={{height:60,width:60}} ></Image>
          <Text style={{lineHeight:60}}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}


export default class FalBakModal extends Component {


  constructor(props) {
    super(props);

  }



  render() {

    var modalBackgroundStyle = {
      backgroundColor: this.props.transparent ? 'transparent' : 'blue',
     };
     var innerContainerTransparentStyle = this.props.transparent ? {backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10} : null;
     var activeButtonStyle = {
       backgroundColor: '#ddd'
     };


    return (

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.props.modalVisible}
          onRequestClose={() => {}}
          >
          <View style={[styles.container, modalBackgroundStyle]}>
            <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>

              <ScrollView style={{padding:30}}>

              <Text style={{fontSize:30,color:'white',textAlign:'center',marginBottom:70,fontFamily:'SourceSansPro-Bold'}}>🎁 FAL BAK, KAZAN! 🎁</Text>
              <View style={{flexDirection:'row',alignSelf:'center',marginBottom:25}}>
                <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>1</Text></View>
                <Text style={{fontSize:20,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>FALLARA YORUM YAP</Text>
              </View>
              <View style={{alignSelf:'center',marginBottom:25}}>
                  <Icon name="arrow-down" color={'rgb( 236 ,196 ,75)'} size={35} />
              </View>

              <View style={{flexDirection:'row',alignSelf:'center',marginBottom:25}}>
                <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>2</Text></View>
                <Text style={{fontSize:20,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>BEĞENİ KAZANARAK FAL PUAN BİRİKTİR</Text>
              </View>
              <View style={{alignSelf:'center',marginBottom:25}}>
                  <Icon name="arrow-down" color={'rgb( 236 ,196 ,75)'} size={35} />
              </View>
              <View style={{flexDirection:'row',alignSelf:'center',marginBottom:10}}>
                <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>3</Text></View>
                <Text style={{fontSize:20,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>FAL PUANLARINLA ANINDA KREDİ KAZAN VE ÇEKİLİŞE KATIL!</Text>
              </View>
              <TouchableOpacity style={{alignSelf:'center'}} onPress={()=>{this.props.navigation.navigate('FalPuan')}}>
                <Text style={{color:'white'}}>Ödülleri Gör</Text>
              </TouchableOpacity>

              <Button
                onPress={() => {this.props.setFalbakVisibility(false)}}
                title="X"
                color="#841584"
              />
              </ScrollView>
            </ImageBackground>


           </View>
        </Modal>


    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    flexDirection: 'column-reverse',
    backgroundColor:'rgba(0, 0, 0, 1)'
  },
  innerContainer: {
    height: 300,

    flexDirection:'column',
  },
  row: {
    alignSelf:'stretch',
    flex: 1,
    flexDirection: 'row',
    justifyContent:'space-around',
    marginBottom: 20,
  },
  rowTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 18,
    margin: 5,
    textAlign: 'center',
  },
  scrollcontainer:{

  },
  modalButton: {
    marginTop: 5,
    width:15,
    height:15,
  },
  pickerItem: {
    fontSize: 16,
  },
});
