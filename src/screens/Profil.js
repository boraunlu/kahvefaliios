import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Button,
  TextInput,
  ActionSheetIOS,
  Keyboard,
  Modal,
  Alert,
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import Picker from 'react-native-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import ProgressBar from 'react-native-progress/Bar';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

var radio_props = [
  {label: 'Falıma bakılmadı', value: 0 },
  {label: 'Falların içeriğini beğenmedim', value: 1 },
  {label: 'Uygulamanın dizaynını beğenmedim', value: 2 },
  {label: 'Reklam İzleyemiyorum', value: 3 },
  {label: 'Diğer', value: 4 },
];

@inject("userStore")
@observer
export default class Profil extends React.Component {
  constructor(props) {
    super(props);
    this._images = [];
    this.state = {

      profPhoto:'https://www.peerspace.com/web-templates/assets/images/no_avatar_placeholder.png',
      userName:null,
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!',
      email:'',
      kendi:'',
      radioValue:0,
      pickerVisible: false,
      cameraVisible: false,
      spinnerVisible:false,
  };
}

  static navigationOptions = {
      title: 'Profilin',
      tabBarLabel: 'Profil',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="user" color={tintColor} size={25} />
       ),
    };



    sendMail = () => {
      if(this.state.text == 'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'||this.state.text==""){
        alert("Lütfen önce önerini veya şikayetini yaz")
      }
      else{
        Alert.alert('Şikayet & Oneri','Yorumlarınız bize ulaşmıştır. Teşekkürler!')
        Keyboard.dismiss()
        this.setState({text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'})
        this.popupDialog2.dismiss(() => {
          console.log('callback');
        });
        fetch('https://eventfluxbot.herokuapp.com/sendMail', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: Backend.getUid(),
            text: this.state.text
          })
        })
        .then((response) => {

        })
      }
    }

    sendBasvuru = () => {
      if(this.state.kendi == ""){
        alert("Lütfen önce kendinden bahset")
      }
      else{
        Alert.alert('Başvuru','Başvurunuz bize ulaşmıştır. Teşekkürler!')
        this.setState({kendi:''})
        this.popupDialog3.dismiss(() => {
          console.log('callback');
        });
        fetch('https://eventfluxbot.herokuapp.com/sendMail', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: Backend.getUid(),
            text: "başvuru "+this.state.kendi
          })
        })
        .then((response) => {
          Keyboard.dismiss()
        })
      }
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
              this.uploadProfilePic(images[0].image);
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

  uploadProfilePic = (image) => {
    this.setState({cameraVisible:false,spinnerVisible:true})
    var uri = image
    Backend.uploadProfilePic(uri).then((url) => {
      this.setState({profPhoto:url,spinnerVisible:false})
    })
    .catch((error) => {
      this.setState({spinnerVisible:false})
      this.setPickerVisible(false);
      setTimeout(function(){Alert.alert("Tekrar Deneyin","Fotoğrafın yüklenirken bir sorun oluştu. Lütfen tekrar dener misin?");},300);

    })
  }

  componentDidMount() {

    var user = firebase.auth().currentUser;

    if(user.photoURL){

      this.setState({profPhoto:user.photoURL})

    }
    if(user.displayName){
        this.setState({userName:user.displayName})
    }

    /*
    fetch('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
      })
    })
    .then((response) => response.json())
     .then((responseJson) => {
       //alert(JSON.stringify(responseJson));
          this.setState({userData:responseJson});
         //alert(JSON.stringify(responseJson))

     })*/
  }
  logout = () => {

    Backend.logOut()
  }

  componentWillUnmount() {


  }


  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView style={{flex:1}}>
          <View style={{elevation:3,paddingTop:15,marginTop:30,backgroundColor:'white',flexDirection:'column'}}>
            <TouchableOpacity onPress={()=>{this.changePhoto()}} style={{alignSelf:'center',marginBottom:3,width:64,height:64,borderRadius:32,borderColor:'teal',borderWidth:1,paddingTop:1,alignItems:'center'}}>
              <Image style={{height:60,width:60, borderRadius:30}} source={{uri:this.state.profPhoto}}></Image>
              <TouchableOpacity onPress={()=>{this.changePhoto()}} style={{position:'absolute',top:20,left:60,width:40,height:30,borderColor:'teal',alignItems:'center',backgroundColor:'transparent'}}>
                <Icon name="pencil" color={'gray'} size={20} />
              </TouchableOpacity>
            </TouchableOpacity>
            <Text style={{alignSelf:'center',marginBottom:5,fontWeight:'bold',color:'black',fontSize:18}}>{this.state.userName}</Text>

            <UserData userData={this.props.userStore.user} setDestination={(destination) =>{this.props.navigation.navigate(destination)}}/>

          </View>
          <View style={{paddingTop:5,marginBottom:10,flex:1}}>
            <View style={{marginBottom:5}}>
              <Button title={"Biz Kimiz"} color={'rgb(60,179,113)'} onPress={() => {this.props.navigation.navigate('Kimiz')}}/>
            </View>
            <View style={{marginBottom:5}}>

                <Button title={"Öneri & Şikayet"} color={'rgb(209,142,12)'} onPress={() => {this.popupDialog2.show()}}/>


            </View>
            <View style={{marginBottom:5}}>
              <Button title={"Ekibimize Katıl"} color={'rgb(114,0,218)'} onPress={() => {this.popupDialog3.show()}}/>
            </View>
            <View style={{marginBottom:5}}>
              <Button title={"Kullanım Koşulları"} color={'rgb(0,185,241)'} onPress={() => {this.popupDialog.show()}}/>
            </View>
            <View style={{marginBottom:5}}>
              <Button title={"Çıkış Yap"} color={'rgb(249,50,12)'} onPress={() => {this.logout()}}/>
            </View>
          </View>
          <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />
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
              maximum={1}
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
              sendCapturedImage={(image) => { this.uploadProfilePic(image.path)}}
            />
          </Modal>
        </ScrollView>

        <PopupDialog
         dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Kullanım Koşulları" />}
         dialogStyle={{marginTop:-250}}
         width={'90%'}
         height={'60%'}
         ref={(popupDialog) => { this.popupDialog = popupDialog; }}
       >
           <View style={{flex:1}}>
           <ScrollView style={{padding:10}}>
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
           </View>
         </PopupDialog>
         <PopupDialog
          dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Öneri" />}
          dialogStyle={{marginTop:-250}}
          width={'90%'}
          height={'30%'}
          ref={(popupDialog) => { this.popupDialog2 = popupDialog; }}
        >
        <View style={{flex:1}}>
          <TextInput

            multiline = {true}

            style={{height: 80,flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
            onChangeText={(text) => this.setState({text})}

            placeholder={'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'}
            editable = {true}
          />

          <View style={{marginBottom:10}}>
            <Button title={"Gönder"}  onPress={() => {this.sendMail()}}/>
          </View>
          </View>
        </PopupDialog>
        <PopupDialog
         dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Öneri" />}
         dialogStyle={{marginTop:-250}}
         width={'90%'}
         height={'50%'}
         ref={(popupDialog) => { this.popupSikayet = popupDialog; }}
       >
       <View style={{flex:1}}>
         <RadioForm
           radio_props={radio_props}
           initial={0}
           onPress={(value) => {this.setState({radioValue:value})}}
         />
         <TextInput

           multiline = {true}

           style={{height: 80,flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
           onChangeText={(text) => this.setState({text})}

           placeholder={'Buraya uygulamamızda görmek isteyeceğiniz yenilikleri yazabilirsiniz. Teşekkür ederiz!'}
           editable = {true}
         />

         <View style={{marginBottom:10}}>
           <Button title={"Gönder"}  onPress={() => {this.sendMail()}}/>
         </View>
       </View>
       </PopupDialog>
      <PopupDialog
           dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Başvuru Formu" />}
           dialogStyle={{marginTop:-300}}
           width={'90%'}
           height={'40%'}
           ref={(popupDialog) => { this.popupDialog3 = popupDialog; }}
         >
         <View style={{flex:1,padding:5}}>
            <View style={{height:50,marginBottom:10}}>
              <Text>E-posta Adresiniz</Text>
               <TextInput

                 multiline = {true}

                 style={{height: 20,flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
                 onChangeText={(text) => this.setState({email:text})}

                 editable = {true}
               />
             </View>
             <Text>Kısaca kendinizi tanıtın</Text>
              <TextInput

                multiline = {true}

                style={{height: 20,flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => this.setState({kendi:text})}
                placeholder={"Bize biraz kendinizden bahsedin"}
                editable = {true}
              />

           <View style={{marginBottom:10}}>
             <Button title={"Gönder"}  onPress={() => {this.sendBasvuru()}}/>
           </View>
         </View>
        </PopupDialog>

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
    paddingRight:10,
    paddingLeft:10,

  },

});
