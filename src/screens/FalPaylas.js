import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Button,
  TextInput,
  Keyboard,
  Switch,
  Alert,
  TouchableHighlight,
  Modal,
  ActionSheetIOS,
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("socialStore")
@inject("userStore")
@observer
export default class FalPaylas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!',
      sosyalInput:'',
      falPhotos:[],
      anonimSwitchIsOn:true,
      pickerVisible: false,
      cameraVisible: false,
      spinnerVisible:false,
  };
}

  static navigationOptions = {
      title: 'Fal Paylaş',

    };


    renderphoto1 = () => {
      if(this.state.falPhotos[0]){
        return (
          <View style={{width:50,height:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} >

           <Image source={{uri:this.state.falPhotos[0]}} style={{ height: 70,width:70,alignSelf:'center'}}></Image>
           </View>
          );
      }
      else {
        return(
        <TouchableHighlight style={{height:70,width:70,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Icon name="plus" color={'black'} size={36} /></TouchableHighlight>
        )
      }
    }
    renderphoto2 = () => {
      if(this.state.falPhotos[1]){
        return (
          <View style={{width:50,height:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} >

           <Image source={{uri:this.state.falPhotos[1]}} style={{ height: 70,width:70,alignSelf:'center'}}></Image>
           </View>
          );
      }
      else {
        return(
          <TouchableHighlight style={{height:70,width:70,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Icon name="plus" color={'black'} size={36} /></TouchableHighlight>
        )
      }
    }
    renderphoto3 = () => {
      if(this.state.falPhotos[2]){
        return (
          <View style={{width:50,height:50,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} >

           <Image source={{uri:this.state.falPhotos[2]}} style={{ height: 70,width:70,alignSelf:'center'}}></Image>
           </View>
          );
      }
      else {
        return(
          <TouchableHighlight style={{height:70,width:70,alignSelf:'center',backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Icon name="plus" color={'black'} size={36} /></TouchableHighlight>
        )
      }
    }

    changePhoto = () => {
      const options = ['Çekilmiş Fotoğraflarından Seç', 'Yeni Fotoğraf Çek', 'İptal'];
      const cancelButtonIndex = options.length - 1;
      ActionSheetIOS.showActionSheetWithOptions({
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            this.setPickerVisible(true);
            break;
          case 1:
            Camera.checkVideoAuthorizationStatus().then((response) => {if(response==true){this.setCameraVisible(true)}})
            break;
          default:
        }
      });

    }

    sendSosyal = () => {
      if(this.state.sosyalInput.length<20){

        Alert.alert("Kısa soru","Lütfen sorunla ilgili bize biraz daha detay ver. Biz bizeyiz burada :)")
      }
      else{
        if(this.state.sosyalInput.length>200){
          Alert.alert("Uzun soru","Lütfen sorunu daha kısa bir şekilde ifade et, herkes okusun :).")
        }
        else{
          if(this.state.falPhotos.length>1){
            this.setState({spinnerVisible:true})

            Backend.uploadImages(this.state.falPhotos).then((urls) => {
              console.log(urls)
              this.setState({spinnerVisible:false})


                if(this.props.userStore.userCredit<100){
                  this.paySosyal(urls)
                }
                else{
                  Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn)
                  Backend.addCredits(-100)
                  this.props.userStore.increment(-100)
                  Keyboard.dismiss()
                  this.setState({sosyalInput:'',falPhotos:[]})
                  fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
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
                     // this.setState({tek:responseJson.tek});
                      this.props.socialStore.setSocials(responseJson.sosyals)
                      this.props.socialStore.setTek(responseJson.tek)


                   })

                   setTimeout(()=>{Alert.alert("Teşekkürler","Falınız diğer falseverlerle paylaşıldı. Sosyal sayfasında falınıza gelen yorumlarını takip edebilirsiniz!");this.props.navigation.goBack();},950)
                }

            })
            .catch(error => {
              console.log(error)
              this.setState({spinnerVisible:false})
              Alert.alert("Lütfen tekrar dener misin? Fotoğraflar yüklenirken bir sorun oluştu. ")
            })

          }
          else {
              Alert.alert("En az 2 adet fotoğraf yüklemeniz gerekiyor ")
          }

        }
      }
    }


      paySosyal = (urls) => {
        this.setState({spinnerVisible:true})
        var products = [
           'com.grepsi.kahvefaliios.sosyal',
        ];
        InAppUtils.loadProducts(products, (error, products) => {
          if(error){this.setState({spinnerVisible:false})}
          else{

            var identifier = 'com.grepsi.kahvefaliios.sosyal'
            InAppUtils.purchaseProduct(identifier, (error, response) => {
              this.setState({spinnerVisible:false})
               // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
               if(error){

               }
               else{
                 if(response && response.productIdentifier) {
                   Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn)
                   //this.popupSosyal.dismiss()
                   this.setState({modalVisible:false,inputVisible:false})
                   Keyboard.dismiss()

                   this.setState({sosyalInput:'',falPhotos:[]})

                   fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
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
                      // this.setState({tek:responseJson.tek});
                       this.props.socialStore.setSocials(responseJson.sosyals)
                      this.props.socialStore.setTek(responseJson.tek)

                    })
                    setTimeout(()=>{Alert.alert("Teşekkürler","Falınız diğer falseverlerle paylaşıldı. Sosyal sayfasında falınıza gelen yorumlarını takip edebilirsiniz!");this.props.navigation.goBack();},950)

                 }
               }
            });
          }
        });
      }

    selectImages = (images) => {
      this.setImages(images);
    }

    setImages = (images) => {
      this._images = images;
    }

    getImages = () => {
      return this._images;
    }

    setPhoto = (path) => {
      this.setState({cameraVisible:false,spinnerVisible:false})
      var images = this.state.falPhotos
      images.push(path)
      this.setState({falPhotos:images})
    }

    setPickerVisible = (visible = false) => {
      this.setState({pickerVisible: visible});
    }

    setCameraVisible = (visible = false) => {
      this.setState({cameraVisible: visible});
    }


    renderNavBar = () => {
      return (
        <NavBar style={{
          statusBar: {
            backgroundColor: '#FFF',
            height:30
          },
          navBar: {
            backgroundColor: '#FFF',

          },
        }}>
          <NavButton onPress={() => {
            this.setPickerVisible(false);
          }}>
            <NavButtonText style={{
              color: '#000',
              fontSize:26
            }}>
              {'<'}
            </NavButtonText>
          </NavButton>
          <NavTitle style={{
            color: '#000',
          }}>
            {'Fotoğraflarım'}
          </NavTitle>
          <NavButton onPress={() => {
            if(this._images.length==0){
              alert("Lütfen önce fotoğraf seçin")
            }
            else{
              this.setPickerVisible(false);

              const images = this.getImages().map((image) => {
                return {
                  image: image.uri,
                };
              });
              this.setFromPicker(images);
              this.setImages([]);
            }
          }}>
            <NavButtonText style={{
              color: '#000',
            }}>
              {'Gönder'}
            </NavButtonText>
          </NavButton>
        </NavBar>
      );
    }

    setFromPicker = (images) => {
      var falPhotos = this.state.falPhotos
      for (var i = 0; i < images.length; i++) {
        falPhotos.push(images[i].image)
      }

      this.setState({falPhotos:falPhotos})
    }


  componentDidMount() {

  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }


  render() {


    return (


        <ScrollView style={{flex:1,backgroundColor:'#36797f'}} >
        <View style={{flex:1,alignItems:'center',paddingBottom:40}}>
            <Spinner visible={this.state.spinnerVisible} textContent={"Fotoğraflarınız yükleniyor..."} textStyle={{color: '#DDD'}} />
            <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>

                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                  <Text style={[styles.label]}>
                    100
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View>
            </View>
            <Image source={require('../static/images/karilar.png')} style={{height:100,resizeMode:'contain',marginTop:10}}/>
            <Text style={styles.faltypeyazipopup}>
              Siz sorun, diğer falseverlerimiz cevaplasın!
            </Text>
            <Text style={styles.faltypeyazikucukpopup}>
              Birlikten kuvvet doğar! Falınızı, aklınızdaki soru ile birlikte 3 gün boyunca Sosyal Panomuzda yayınlayın, diğer falseverlerin yorumuna sunun.   {"\n"}
            </Text>
            <TextInput
              multiline={true}
              value={this.state.sosyalInput}
              onChangeText={(text) =>{this.setState({sosyalInput:text})}}
              placeholder={"Sorunu yaz"}
              style={{height:100,width:'90%',borderColor: 'gray', borderWidth: 1,padding:3,backgroundColor:'white'}}
            />
            <View style={{flexDirection:'row',alignItems:'center',marginTop:20}}>
              <Text style={{color:'white'}}> Profil Fotoğrafım Görünebilir </Text>
              <Switch
                onValueChange={(value) => this.setState({anonimSwitchIsOn: value})}
                value={this.state.anonimSwitchIsOn} />
            </View>
            <View style={{width:'100%',flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:100,paddingBottom:40,paddingTop:20,justifyContent:'space-around'}}>
            {
              this.renderphoto1()
            }
            {
              this.renderphoto2()
            }
            {
              this.renderphoto3()
            }

            </View>

           <TouchableOpacity  onPress={() => {this.sendSosyal();}} style={{width:'100%',height:40,backgroundColor:'white',justifyContent:'center'}}>
             <Text style={{textAlign:'center',fontWeight:'bold'}}>GÖNDER</Text>
           </TouchableOpacity>

           <Modal
             animationType={'slide'}
             transparent={false}
             visible={this.state.pickerVisible}
             onRequestClose={() => {
               this.setPickerVisible(false);
             }}
           >
             {this.renderNavBar()}
             <CameraRollPicker
               maximum={3}
               imagesPerRow={3}
               callback={this.selectImages}
               selected={[]}
               emptyText={"Yükleniyor... \n \n Eğer çok uzun sürüyorsa uygulamamıza fotoğraflarına erişim izni vermemiş olabilirsiniz. Teşekkürler!"}
             />
           </Modal>
           <Modal
             animationType={'slide'}
             transparent={false}
             visible={this.state.cameraVisible}
             onRequestClose={() => {
               this.setCameraVisible(false);
             }}
           >
              <CameraPick
               sendCapturedImage={(image) => { this.setPhoto(image.path)}}
             />
           </Modal>



           </View>
        </ScrollView>


    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    paddingRight:10,
    paddingLeft:10,
    backgroundColor:'teal'

  },
  coin:{
    height:15,
    width:15,
    marginLeft:5,
  },
  label: {
    fontSize: 12,
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  },
  centering: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 8,
},
faltypeyazi:{
  textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22
},
faltypeyazipopup:{
  textAlign: 'center',color:'white',fontWeight:'bold',fontSize:18,marginTop:15
},
faltypeyazikucuk:{
  textAlign: 'center',color:'white',fontSize:14
},
faltypeyazikucukpopup:{
  color:'white',fontSize:14,margin:5,textAlign:'center',marginTop:15
},
faltypeyazikucukpopup2:{
  flex:1,color:'white',fontSize:14,padding:15,fontWeight:'bold',alignSelf:'stretch',textAlign:'center'
},


});
