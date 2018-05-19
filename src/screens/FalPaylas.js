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
  AsyncStorage,
  TextInput,
  Keyboard,
  Switch,
  Alert,
  TouchableHighlight,
  KeyboardAvoidingView,
  Modal,
  ActionSheetIOS,
  ImageBackground,
} from 'react-native';

import axios from 'axios';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import ImageResizer from 'react-native-image-resizer';
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
      falType:null,
      anonimSwitchIsOn:true,
      pickerVisible: false,
      cameraVisible: false,
      spinnerVisible:false,
      pollInput1:'',
      pollInput2:'',
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
        if((this.state.pollInput1.length>0&&this.state.pollInput2.length==0)||(this.state.pollInput2.length>0&&this.state.pollInput1.length==0)){
              Alert.alert("Şıkları Giriniz","Lütfen her iki şıkkı da giriniz ya da ikisini de boş bırakınız")
        }
        else {
          if(this.state.falPhotos.length>1){
            this.setState({spinnerVisible:true})

            Backend.uploadImages(this.state.falPhotos).then((urls) => {

              this.setState({spinnerVisible:false})
              if(this.state.falType==2||this.state.falType==3){
                this.postSosyal(urls)
              }
              else if(this.state.falType==1){

                if(this.props.userStore.userCredit<50){
                  this.paySosyal(urls,50)
                }
                else{
                  Backend.addCredits(-50)
                  this.props.userStore.increment(-50)
                  this.postSosyal(urls)
                }
              }
              else {
                if(this.props.userStore.userCredit<100){
                  this.paySosyal(urls,100)
                }
                else{
                  Backend.addCredits(-100)
                  this.props.userStore.increment(-100)
                  this.postSosyal(urls)
                }
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


    postSosyal = (urls) => {
      Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn,this.state.pollInput1,this.state.pollInput2)

      Keyboard.dismiss()
      this.setState({sosyalInput:'',falPhotos:[]})
     setTimeout(()=>{Alert.alert("Teşekkürler","Falınız diğer falseverlerle paylaşıldı. Sosyal sayfasında falınıza gelen yorumlarını takip edebilirsiniz!");this.props.navigation.goBack();},950)
     setTimeout(()=>{

       axios.post('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
         uid: Backend.getUid(),
       })
       .then( (response) => {
         var responseJson=response.data

         this.props.socialStore.setSocials(responseJson.sosyals)
        this.props.socialStore.setTek(responseJson.tek)
       })
       .catch(function (error) {

       });


      },1050)
    }

      paySosyal = (urls,para) => {
        this.setState({spinnerVisible:true})
        var products = [
           'com.grepsi.kahvefaliios.sosyal',
        ];
        if(para==50){products = [
           'com.grepsi.kahvefaliios.50',
        ];}
        InAppUtils.loadProducts(products, (error, products) => {
          if(error){this.setState({spinnerVisible:false})}
          else{

            var identifier = 'com.grepsi.kahvefaliios.sosyal'
            if(para==50){identifier = 'com.grepsi.kahvefaliios.50'}
            InAppUtils.purchaseProduct(identifier, (error, response) => {
              this.setState({spinnerVisible:false})
               // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
               if(error){

               }
               else{
                 if(response && response.productIdentifier) {
                   Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn,this.state.pollInput1,this.state.pollInput2)
                   this.setState({modalVisible:false,inputVisible:false})
                   Keyboard.dismiss()

                   this.setState({sosyalInput:'',falPhotos:[]})

                   axios.post('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
                     uid: Backend.getUid(),
                   })
                   .then( (response) => {
                     var responseJson=response.data

                     this.props.socialStore.setSocials(responseJson.sosyals)
                    this.props.socialStore.setTek(responseJson.tek)
                   })
                   .catch(function (error) {

                   });

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
    const { params } = this.props.navigation.state;
    var falType = params ? params.falType : null;
    var storePhotos=this.props.socialStore.falPhotos
    this.setState({falPhotos:storePhotos})
    this.setState({falType:falType+1})
      //AsyncStorage.getItem('falPhotos').then((value) => {if(value){this.setState({falPhotos:JSON.parse(value)})}})
  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }


  render() {


    return (


        <KeyboardAwareScrollView  style={{flex:1,backgroundColor:'#36797f'}} >
        <View style={{flex:1,alignItems:'center',paddingBottom:40}}>
            <Spinner visible={this.state.spinnerVisible} textContent={"Fotoğraflarınız yükleniyor..."} textStyle={{color: '#DDD'}} />
            <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
            {this.state.falType ==2||this.state.falType ==3?
                null
                : this.state.falType==1?

                <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>

                  <Text style={[styles.label]}>
                    50
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View>
                :
                <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>

                  <Text style={[styles.label]}>
                    100
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View>

            }

            </View>
            <Image source={require('../static/images/karilar.png')} style={{height:100,resizeMode:'contain',marginTop:10}}/>
            <Text style={styles.faltypeyazipopup}>
              Siz sorun, diğer falseverlerimiz cevaplasın!
            </Text>
            <Text style={styles.faltypeyazikucukpopup}>
              Birlikten kuvvet doğar! Falınızı, aklınızdaki soru ile birlikte 2 gün boyunca Sosyal Panomuzda yayınlayın, diğer falseverlerin yorumuna sunun.   {"\n"}
            </Text>
            <TextInput
              multiline={true}
              value={this.state.sosyalInput}
              maxLength={150}
              onChangeText={(text) =>{this.setState({sosyalInput:text})}}
              placeholder={"Sorunu yaz"}
              style={{height:80,width:'90%',borderColor: 'gray',fontSize:14, borderWidth: 1,padding:3,borderRadius:10,marginBottom:10,backgroundColor:'white'}}
            />
            <Text style={{color:'white',fontWeight:'bold'}}>Anket şıklarınız</Text>
            <View style={{flexDirection:'row',padding:30,paddingBottom:5,paddingTop:5}}>
              <TextInput
                maxLength={20}
                value={this.state.pollInput1}
                onChangeText={(text) =>{this.setState({pollInput1:text})}}
                placeholder={"Örn. Evet"}
                style={{height:40,width:'50%',borderColor: 'gray', borderWidth: 1,color:'blue',borderTopLeftRadius: 10,borderBottomLeftRadius: 10,padding:3,textAlign:'center',fontSize:14,backgroundColor:'white'}}
              />
              <TextInput
                maxLength={20}
                value={this.state.pollInput2}
                onChangeText={(text) =>{this.setState({pollInput2:text})}}
                placeholder={"Örn. Hayır"}
                style={{height:40,width:'50%',borderColor: 'gray', borderWidth: 1,color:'red',borderTopRightRadius: 10,borderBottomRightRadius: 10,padding:3,textAlign:'center',fontSize:14,backgroundColor:'white'}}
              />
            </View>
            <Text style={{color:'white',fontSize:12}}>Anket yapmak istemiyorsanız bu seçenekleri boş bırakabilirsiniz</Text>

            <View style={{width:'100%',marginTop:20,flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:100,paddingBottom:40,paddingTop:20,justifyContent:'space-around'}}>
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
        </KeyboardAwareScrollView >


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
