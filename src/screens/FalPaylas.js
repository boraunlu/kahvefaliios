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
import ProfilePicker from '../components/ProfilePicker';
import CheckBox from 'react-native-check-box'
import Spinner from 'react-native-loading-spinner-overlay';
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import SwitchSelector from 'react-native-switch-selector';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import ImageResizer from 'react-native-image-resizer';
import * as Animatable from 'react-native-animatable';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import Sound from 'react-native-sound'
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';


var magic = new Sound('magic.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {

    return;
  }

});


const options = [
  { label: 'Günlük', value: 0 },
    { label: 'Sosyal', value: 1 },
    { label: 'Süper 🌟', value: 2 }
];
const options2 = [
    { label: 'Sosyal', value: 1 },
    { label: 'Süper 🌟', value: 2 }
];

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
      checked:false,
      super:this.props.navigation.state.params.type,
      profileIsValid:false
  };
}

  static navigationOptions = {
      title: 'Fal Paylaş',

    };


    renderphoto1 = () => {
      if(this.state.falPhotos[0]){
        return (
          <View style={{height:80,width:80,alignSelf:'center',backgroundColor:'white',borderRadius:4,alignItems:'center',justifyContent:'center'}} >
            <Image source={{uri:this.state.falPhotos[0]}} style={{ height: 80,width:80,borderRadius:4,alignSelf:'center'}}></Image>
          </View>
        );
      }
      else {
        return(
          <TouchableOpacity style={{height:80,width:80,alignSelf:'center',backgroundColor:'white',borderRadius:4,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Image source={require('../static/images/plus.png')} style={{ height: 40,width:40,alignSelf:'center'}}></Image></TouchableOpacity>
        )
      }
    }
    renderphoto2 = () => {
      if(this.state.falPhotos[1]){
        return (
          <View style={{height:80,width:80,alignSelf:'center',backgroundColor:'white',borderRadius:4,alignItems:'center',justifyContent:'center'}} >

           <Image source={{uri:this.state.falPhotos[1]}} style={{ height: 80,width:80,borderRadius:4,alignSelf:'center'}}></Image>
           </View>
          );
      }
      else {
        return(
          <TouchableOpacity style={{height:80,width:80,alignSelf:'center',backgroundColor:'white',borderRadius:4,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Image source={require('../static/images/plus.png')} style={{ height: 40,width:40,alignSelf:'center'}}></Image></TouchableOpacity>
        )
      }
    }
    renderphoto3 = () => {
      if(this.state.falPhotos[2]){
        return (
          <View style={{height:80,width:80,alignSelf:'center',backgroundColor:'white',borderRadius:4,alignItems:'center',justifyContent:'center'}} >

            <Image source={{uri:this.state.falPhotos[2]}} style={{ height: 80,width:80,borderRadius:4,alignSelf:'center'}}></Image>
           </View>
          );
      }
      else {
        return(
          <TouchableOpacity style={{height:80,width:80,alignSelf:'center',backgroundColor:'white',borderRadius:4,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.changePhoto()}}><Image source={require('../static/images/plus.png')} style={{ height: 40,width:40,alignSelf:'center'}}></Image></TouchableOpacity>
        )
      }
    }

    replacePhotos = (checked) => {

      this.setState({checked:!checked})
      if(!checked){
        var randomNum =  Math.floor(Math.random()*(15-0+1)+0);
        var randomNum = randomNum*3;
        var photos=[]
        photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+randomNum+'.jpg?alt=media')
        photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+(randomNum+1)+'.jpg?alt=media')
        photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+(randomNum+2)+'.jpg?alt=media')
        this.setState({falPhotos:photos})
      }
      else {
        var photos=[]
        this.setState({falPhotos:photos})
      }

    }

    refreshPhotos = () => {


        var randomNum =  Math.floor(Math.random()*(15-0+1)+0);
        var randomNum = randomNum*3;
        var photos=[]
        photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+randomNum+'.jpg?alt=media')
        photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+(randomNum+1)+'.jpg?alt=media')
        photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+(randomNum+2)+'.jpg?alt=media')
        this.setState({falPhotos:photos})


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

    changeValidation = () => {
      this.setState({checkValidation:false})
    }

    sendSosyal = (supertype) => {
      if(this.props.userStore.profileIsValid){
        var valid=false
        if(supertype===0||supertype===3){
          if(this.state.falPhotos.length>1){
            valid=true
          }
          else {
              Alert.alert("En az 2 adet fotoğraf yüklemeniz gerekiyor ")
          }
        }
        else {

          if(this.state.falPhotos.length>1){
            if(this.state.sosyalInput.length<20){

              Alert.alert("Kısa soru","Lütfen sorunla ilgili bize biraz daha detay ver. Biz bizeyiz burada :)")
            }
            else{
              if((this.state.pollInput1.length>0&&this.state.pollInput2.length==0)||(this.state.pollInput2.length>0&&this.state.pollInput1.length==0)){
                    Alert.alert("Şıkları Giriniz","Lütfen her iki şıkkı da giriniz ya da ikisini de boş bırakınız")
              }
              else {
                valid=true
              }
            }
          }
          else {
              Alert.alert("En az 2 adet fotoğraf yüklemeniz gerekiyor ")
          }

        }

        if(valid){
          this.setState({spinnerVisible:true})

          Backend.uploadImages(this.state.falPhotos).then((urls) => {

            this.setState({spinnerVisible:false})
            if(supertype==0){
              this.postSosyal(urls)
            }
            else if(supertype==1){

              if(this.props.userStore.userCredit<100){
                this.paySosyal(urls,100)
              }
              else{
                Backend.addCredits(-100)
                this.props.userStore.increment(-100)
                this.postSosyal(urls)
              }
            }
            else if (supertype==3) {
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
              if(this.props.userStore.userCredit<150){
                this.paySosyal(urls,150)
              }
              else{
                Backend.addCredits(-150)
                this.props.userStore.increment(-150)
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
      }
      else{
        this.setState({checkValidation:true})
      }
    }


    postSosyal = (urls) => {
      Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn,this.state.pollInput1,this.state.pollInput2,this.state.super)
      var alertMessage="Falınız diğer falseverlerle paylaşıldı. Sosyal sayfasında falınıza gelen yorumlarını takip edebilirsiniz!"
      if(this.state.super===0){this.props.userStore.setGunlukUsedTrue();alertMessage="Günlük falınız gönderildi! Kısa süre içinde falınıza bakılacak"}
      Keyboard.dismiss()
      this.setState({sosyalInput:'',falPhotos:[]})
       setTimeout(()=>{Alert.alert("Teşekkürler",alertMessage);},550)
       setTimeout(()=>{

         const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Greeting', action: NavigationActions.navigate({ routeName: 'Social' })})

            ]
          })
          this.props.navigation.dispatch(resetAction)
          /*
         axios.post('https://eventfluxbot.herokuapp.com/appapi/getTek', {
           uid: Backend.getUid(),
         })
         .then((response) => {
           var responseJson=response.data
           this.props.socialStore.setTek(responseJson)
         })
         .catch(function (error) {

         });*/
      },850)
    }

      paySosyal = (urls,para) => {
        this.setState({spinnerVisible:true})
        var products = [
           'com.grepsi.kahvefaliios.sosyal',
        ];
        if(para==150){
          products = [
             'com.grepsi.kahvefaliios.150',
          ];
        }else if (para==50) {
          products = [
             'com.grepsi.kahvefaliios.50',
          ];
        }
        InAppUtils.loadProducts(products, (error, products) => {
          if(error){this.setState({spinnerVisible:false})}
          else{

            var identifier = 'com.grepsi.kahvefaliios.sosyal'
            if(para==150){identifier = 'com.grepsi.kahvefaliios.150'}
            else if (para==50) {
              identifier = 'com.grepsi.kahvefaliios.50'
            }
            InAppUtils.purchaseProduct(identifier, (error, response) => {
              this.setState({spinnerVisible:false})
               // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
               if(error){

               }
               else{
                 if(response && response.productIdentifier) {
                   postSosyal(urls)

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

    renderFalInfo = () => {
      if(this.state.super===2){
        return(
          <View style={styles.box}>
            <Text style={styles.faltypeyazipopup}>
              Maksimum yorum, maksimum sohbet!
            </Text>
            <Animatable.Text   animation="pulse" easing="ease-out" iterationCount="infinite" style={[styles.faltypeyazikucukpopup]}>
              {'\u2022'} Falınız 3 gün süre ile panoda kalır
              {'\u2022'} Minimum 20 yorum gelmezse krediniz iade{"\n"}
              {'\u2022'} Falınız panonun hep en üst bölümünde kalır{"\n"}
            </Animatable.Text>
          </View>
        )
      }
      else if(this.state.super===1){
        return(
          <View style={styles.box}>
            <Text style={styles.faltypeyazipopup}>
              Falınızı sosyal panoda tüm deneyimli falcıların yorumuna açın!
            </Text>
            <Animatable.Text   animation="pulse" easing="ease-out" iterationCount="infinite" style={[styles.faltypeyazikucukpopup]}>
              {'\u2022'} Falınız 2 gün süre ile panoda kalır{"\n"}
              {'\u2022'} Minimum 10 yorum gelmezse krediniz iade
            </Animatable.Text>
          </View>
        )

      }
      else {
        return(
          <View style={styles.box}>
            <Text style={styles.faltypeyazipopup}>
              Falınıza BİR deneyimli yorumcudan yorum gelir.
            </Text>
            <Text style={styles.faltypeyazikucukpopup}>
              Falınız sosyal panoda yer almaz. Falınızı sadece tek bir falcı görür.
            </Text>

          </View>
        )
      }

    }
    renderSosyalInput = () => {
      if(this.state.super===1||this.state.super===2){
        return(
          <View style={{flex:1,width:'100%'}}>
            <View style={{flex:1,width:'100%'}}>
              <TextInput
                multiline={true}
                value={this.state.sosyalInput}
                maxLength={150}
                blurOnSubmit={true}
                onChangeText={(text) =>{this.setState({sosyalInput:text})}}
                placeholder={"Sorunuzu yazınız"}
                style={{height:80,width:'100%',fontSize:14, padding:14,borderRadius:4,marginBottom:10,backgroundColor:'white'}}
              />
            </View>
            <View style={{flexDirection:'row'}}>
              <TextInput
                maxLength={20}
                value={this.state.pollInput1}
                onChangeText={(text) =>{this.setState({pollInput1:text})}}
                placeholder={"Örn. EVET"}
                placeholderTextColor={'rgba(184,30,94,0.6)'}
                style={{height:40,flex:1,marginRight:5,color:'red',borderRadius: 4,padding:3,textAlign:'center',fontSize:14,backgroundColor:'white'}}
              />
              <TextInput
                maxLength={20}
                value={this.state.pollInput2}
                onChangeText={(text) =>{this.setState({pollInput2:text})}}
                placeholder={"Örn. HAYIR"}
                placeholderTextColor={'rgba(74,144,226,0.6)'}
                style={{height:40,flex:1,marginLeft:5,color:'blue',borderRadius: 4,padding:3,textAlign:'center',fontSize:14,backgroundColor:'white'}}
              />
            </View>
            <Text style={{color:'white',fontSize:10,marginTop:5}}>Not: Anket yapmak istemiyorsanız bu seçenekleri boş bırakabilirsiniz.</Text>
            {this.state.profileIsValid?
              null:<View style={{width:'100%',marginTop:20}}>
                <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>
              </View>
            }
          </View>
        )

      }
      else if (this.state.super===3) {
        return (
          <View style={{width:'100%',marginLeft:-15,marginRight:-15}}>

              <Text style={{color:'white',marginTop:-10,marginBottom:25,marginLeft:50,textAlign:'center'}}>2 fotoğraf yeterlidir</Text>


            <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>
          </View>
        )
      }
      else {
        return (
          <View style={{width:'100%',marginLeft:-15,marginRight:-15}}>
            <View style={{marginRight:25,marginBottom:10,marginTop:-10,flexDirection:'row',justifyContent:'flex-end'}}>
              <CheckBox
                style={{width:150}}
                checkBoxColor={'white'}
                onClick={()=>this.replacePhotos(this.state.checked)}
                isChecked={this.state.checked}
                leftTextStyle={{color:'white',textDecorationLine:'underline'}}
                leftText={"Fotoğrafım Yok"}
                />
              {this.state.checked?
              <TouchableOpacity  style={{marginLeft:10,justifyContent:'center'}} onPress={()=>{this.refreshPhotos()}}>
                <Icon name="refresh" color={'white'} size={16} />
              </TouchableOpacity>:
              <View style={{marginLeft:10,width:15,justifyContent:'center'}}/>
            }
            </View>
            <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>
          </View>
        )
      }
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
    if(params.photos){
      this.setState({falPhotos:params.photos})
    }

    if(this.props.userStore.profileIsValid){this.setState({profileIsValid:true})}

      //AsyncStorage.getItem('falPhotos').then((value) => {if(value){this.setState({falPhotos:JSON.parse(value)})}})
  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }
  renderPrice(){
    if(this.props.userStore.user){
      if(this.state.super==1){
        return(
          <View style={{padding:5,flexDirection:'row',zIndex:1001,position:'absolute',top:0,left:0}}>
            <Image source={require('../static/images/coins.png')} style={styles.coin}/>
            <Text style={[styles.label]}>
              100
            </Text>

          </View>

        )
      }
      else if (this.state.super==2) {
        return(
          <View style={{padding:5,flexDirection:'row',zIndex:1001,position:'absolute',top:0,left:0}}>
            <Image source={require('../static/images/coins.png')} style={styles.coin}/>
            <Text style={[styles.label]}>
              150
            </Text>

          </View>
        )
      }
      else if (this.state.super==3) {
        if(this.props.userStore.user.handUsed){
          return(
            <View style={{padding:5,flexDirection:'row',zIndex:1001,position:'absolute',top:0,left:0}}>
              <Image source={require('../static/images/coins.png')} style={styles.coin}/>
              <Text style={[styles.label]}>
                50
              </Text>

            </View>
          )
        }
        else {
          return(
            <View style={{padding:5,flexDirection:'row',zIndex:1001,position:'absolute',top:0,left:0}}>

              <Text style={[styles.label]}>
                ÜCRETSİZ
              </Text>

            </View>
          )
        }
      }
      else {
        if(this.props.userStore.gunlukUsed){
          return(
            <View style={{padding:5,flexDirection:'row',zIndex:1001,position:'absolute',top:0,left:0}}>
              <Image source={require('../static/images/coins.png')} style={styles.coin}/>
              <Text style={[styles.label]}>
                100
              </Text>

            </View>
          )
        }
        else {
          return(
            <View style={{padding:5,flexDirection:'row',zIndex:1001,position:'absolute',top:0,left:0}}>

              <Text style={[styles.label]}>
                ÜCRETSİZ
              </Text>

            </View>
          )
        }
      }
    }
  }

  render() {
    var backgroundImage={}
    if(this.state.super===0){
      backgroundImage=require('../static/images/newImages/BG.png')
    }
    else if (this.state.super===1) {
      backgroundImage=require('../static/images/sosyalback.png')
    }
    else {
      backgroundImage=require('../static/images/superback.png')
    }

    return (

      <ImageBackground source={backgroundImage} style={styles.container}>
        <View style={{
          elevation:4,
          position:'absolute',
          top:-77,
          left:-75,

          width: 120,
          height: 120,
          backgroundColor: "rgb(89, 70, 159)",
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowRadius: 1,
          shadowOpacity: 1,
          borderRadius: 50,
          zIndex:10,
          transform: [
            {scaleX: 2}]}}>

        </View>
        {this.renderPrice()}
        <KeyboardAwareScrollView  style={{flex:1}} >
          <View style={{flex:1,alignItems:'center',paddingBottom:40,paddingLeft:15,paddingRight:15}}>
            <View style={{flex:1,marginLeft:-15,marginRight:-15,paddingLeft:15,paddingRight:15,alignSelf: 'stretch'}}>







            </View>

            {this.props.navigation.state.params.type==1?
              <View style={{flex:1,paddingLeft:30,paddingRight:30,marginTop:50,width:'100%'}}>
                <SwitchSelector  options={options2} buttonColor={'rgb(236,196,75)'} initial={0} onPress={(value) => {this.setState({super:value});value==2?magic.play():null;}} />
              </View>:
              this.props.navigation.state.params.type==3?
              <View style={{flex:1,paddingLeft:30,paddingRight:30,marginTop:50,width:'100%'}}>
                <Text style={{textAlign:'center',color:'white',fontSize:20,fontFamily:'SourceSansPro-Bold'}}>El Falı</Text>
              </View>:
              this.props.navigation.state.params.type==2?
              <View style={{flex:1,paddingLeft:30,paddingRight:30,marginTop:50,width:'100%'}}>
                <SwitchSelector  options={options2} buttonColor={'rgb(236,196,75)'} initial={1} onPress={(value) => {this.setState({super:value});value==2?magic.play():null;}} />
              </View>:
              <View style={{flex:1,paddingLeft:30,paddingRight:30,marginTop:50,width:'100%'}}>
                <SwitchSelector  options={options} buttonColor={'rgb(236,196,75)'} initial={0} onPress={(value) => {this.setState({super:value});value==2?magic.play():null;}} />
              </View>
            }




            {this.renderFalInfo()}

            <View style={{width:'100%',marginTop:20,flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:100,paddingBottom:40,paddingTop:20,justifyContent:'space-between'}}>
              <View>
                 <Image source={require('../static/images/fincan.png')} style={{ height: 30,marginBottom:5,width:30,alignSelf:'center'}}></Image>
                 <Text style={{color:'white',fontSize:13,fontWeight:'bold'}}>
                   FALINIZ
                 </Text>
              </View>
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
            {this.renderSosyalInput()}

           <TouchableOpacity  onPress={() => {this.sendSosyal(this.state.super);}} style={{width:'100%',height:55,marginTop:20,borderRadius:4,backgroundColor:'rgb( 236 ,196 ,75)',justifyContent:'center'}}>
             <Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>PAYLAŞ</Text>
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

             <Spinner visible={this.state.spinnerVisible} textContent={"Fotoğraflarınız yükleniyor..."} textStyle={{color: '#DDD'}} />

           </View>

        </KeyboardAwareScrollView >
        </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignSelf: 'stretch',
    width: null,

  },
  coin:{
    height:15,
    width:15,
    marginRight:5,
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
  textAlign: 'left',color:'white',fontWeight:'bold',fontSize:22
},
faltypeyazipopup:{
  textAlign: 'left',color:'white',fontFamily:'SourceSansPro-Bold',fontSize:16,marginTop:5,marginBottom:5
},
faltypeyazikucuk:{
  textAlign: 'left',color:'white',fontSize:14
},
faltypeyazikucukpopup:{
  color:'white',textAlign: 'left',fontSize:14,fontFamily:'SourceSansPro-Regular'
},
faltypeyazikucukpopup2:{
  flex:1,color:'white',fontSize:14,fontWeight:'bold',alignSelf:'stretch',textAlign:'center'
},
box:{flex:1,borderColor:'white',borderRadius:5,paddingTop:10,marginTop:10,paddingLeft:20,paddingRight:20,width:'100%'}


});
