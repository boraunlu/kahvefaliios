import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  ImageBackground,
  Button,
  TextInput,
  ActionSheetIOS,
  Keyboard,
  Modal,
  Alert,
  Switch
} from 'react-native';
import PropTypes from 'prop-types';
import axios from 'axios';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogTitle ,  SlideAnimation } from 'react-native-popup-dialog';
import Picker from 'react-native-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import CameraRollPicker from 'react-native-camera-roll-picker';
import CameraPick from '../components/CameraPick';
import Camera from 'react-native-camera';
import ProfilePicker from '../components/ProfilePicker';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import ImageResizer from 'react-native-image-resizer';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

const slideAnimation = new SlideAnimation({
slideFrom: 'left',
});

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
      drawerVisible:false,
  };
}


static navigationOptions =({ navigation }) =>  ({
  title: 'Profilin',
   headerLeft:<Icon
   raised

   name='navicon'
   type='font-awesome'
   color='#241466'
   size={28}
   style={{width:28,height:28,marginLeft:15,}}
   onPress={()=>{navigation.state.params.openDrawer()} }/>
   ,
   headerRight:<View></View>,

   tabBarLabel: 'Profil',
    tabBarIcon: ({ tintColor }) => (
      <Icon name="user" color={tintColor} size={25} />
    ),

  });




    sendMail = () => {
      if(this.state.text == 'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'||this.state.text==""){
        alert("Lütfen önce önerini veya şikayetini yaz")
      }
      else{
        Alert.alert('Şikayet & Oneri','Yorumlarınız bize ulaşmıştır. Teşekkürler!')
        Keyboard.dismiss()
        this.setState({text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'})
        this.popupDialog2.dismiss(() => {

        });
        axios.post('https://eventfluxbot.herokuapp.com/sendMail', {
          uid: Backend.getUid(),
          text: this.state.text
        })
        .then( (response) => {

        })
        .catch(function (error) {

        });


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

        });
        axios.post('https://eventfluxbot.herokuapp.com/sendMail', {
          uid: Backend.getUid(),
          text: "başvuru "+this.state.kendi
        })
        .then( (response) => {
          Keyboard.dismiss()
        })
        .catch(function (error) {

        });

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

    ImageResizer.createResizedImage(image, 500, 500,'JPEG',80)
    .then(({uri}) => {
      console.log("uri "+uri)
      Backend.uploadProfilePic(uri).then((url) => {
        this.setState({spinnerVisible:false})
        this.props.userStore.setProfilePic(url)
      })
      .catch((error) => {
              console.log(err);
        this.setState({spinnerVisible:false})
        this.setPickerVisible(false);
        setTimeout(function(){Alert.alert("Tekrar Deneyin","Fotoğrafın yüklenirken bir sorun oluştu. Lütfen tekrar dener misin?");},300);

      })
    }).catch((err) => {
      console.log(err);
        setTimeout(function(){Alert.alert("Tekrar Deneyin","Fotoğrafın yüklenirken bir sorun oluştu. Lütfen tekrar dener misin?");},300);
    });




  }

  initMeslekPicker = () => {

   var meslekArray=["Öğrenciyim", "Kamuda Çalışıyorum", "Özel Sektör", "Kendi İşim","Çalışmıyorum","İş Arıyorum"];

   Picker.init({
       pickerData: meslekArray,
       selectedValue: [this.props.userStore.meslek],
       pickerTitleText:'İş Durumunuz',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',

       onPickerConfirm: data => {
           this.props.userStore.changeMeslek(data)
       },

   });
    Picker.show()
  }

  initiliskiPicker = () => {

   var iliskiArray=["İlişkim Yok", "Sevgilim Var","Evliyim","Nişanlıyım","Platonik","Ayrı Yaşıyorum","Yeni Ayrıldım","Boşandım"];

   Picker.init({
       pickerData: iliskiArray,
       selectedValue: [this.props.userStore.meslek],
       pickerTitleText:'İlişki Durumunuz',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',
       onPickerConfirm: data => {
           this.props.userStore.changeIliski(data)
       },

   });
    Picker.show()
  }

  initAgePicker = () => {

    let agedata = [];
    for(var i=18;i<70;i++){
        agedata.push(i);
    }

   Picker.init({
       pickerData: agedata,
       selectedValue: [this.props.userStore.age],
       pickerTitleText:'Yaşınız',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',
       onPickerConfirm: data => {

           this.props.userStore.changeAge(data[0])
       },

   });
    Picker.show()
  }

  initCityPicker = () => {

    let citydata = ['Yurtdışı','İstanbul','Ankara','İzmir','Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Antalya','Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale','Kırklareli','Kırşehir','Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Şırnak','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yalova','Yozgat','Zonguldak'];


   Picker.init({
       pickerData: citydata,
       selectedValue: [this.props.userStore.city],
       pickerTitleText:'Şehriniz',
       pickerCancelBtnText:'Kapat',
       pickerConfirmBtnText: 'Tamam',
       onPickerConfirm: data => {

           this.props.userStore.changeCity(data[0])
       },

   });
    Picker.show()
  }

  OpenDrawer =  () => {
    if(this.state.drawerVisible===true){
      this.popupDialog.dismiss()
      this.setState({
      drawerVisible: false
      })
          }else{

            this.popupDialog.show();
            this.setState({
              drawerVisible: true
            })
          }
        }


  componentDidMount() {
     this.props.navigation.setParams({ openDrawer: this.OpenDrawer  })


  }

  onImageError = (error) => {
    this.props.userStore.checkProfPic()
  }

  logout = () => {

    Backend.logOut()
  }

  componentWillUnmount() {


  }

  setBio = () => {
    //alert(this.props.userStore.bio)
    Backend.setBio(this.props.userStore.bio)
  }

  renderBio = () => {
    if(this.props.userStore){

      return(
        <TextInput
         style={{height: 40,marginTop:6,marginBottom:16,marginRight:25,marginLeft:25,fontSize:12,borderRadius:4,borderColor:'rgb(215,214,214)',borderWidth:1,textAlign:'center',justifyContent:'center',fontStyle:'italic'}}
         onChangeText={(nametext) => this.props.userStore.setBio({nametext})}
         onSubmitEditing={()=>{this.setBio()}}
         placeholder={'Profil cümlenizi yazınız'}
         placeholderTextColor={'rgb(215,214,214)'}
         maxLength={80}
         value={this.props.userStore.bio}
       />)

    }
  }


  render() {


    return (

      <ImageBackground  source={require('../static/images/background.png')} style={styles.container}>

        <ScrollView style={{flex:1,width:'100%',padding:15,paddingTop:0}}>


          {/* Mevcut Kredi */}


          <View style={{paddingRight:15,height: 30,borderRadius: 15,position:'absolute',top:20,flexDirection:'row',justifyContent:'flex-start'}}>
          <TouchableOpacity  onPress={() => {this.props.navigation.navigate("Odeme")}} style={{flexDirection:'row'}}>
              <View style={{width:30,height: 30,borderRadius: 15,backgroundColor: 'white',flexDirection:'row',justifyContent:'center',alignItems:'center',zIndex:3}}>


                    <Image source={require('../static/images/profile/coinsCopy.png')} style={{height:16.2,width:18}}/>




              </View>

              <View style={{height:24,paddingRight:18,paddingLeft:37,paddingBottom:2,borderRadius:12,position:'relative',right:29,top:3,backgroundColor:'rgba(0,0,0,0.18)',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>

                    <Text style={{textAlign:'left',fontWeight:'bold',fontFamily:'SourceSansPro-Bold',color:'rgb(255,255,255)',fontSize:12}}>
                    Mevcut Kredin:</Text>
                    <Text style={{fontSize:14,fontWeight:'bold',fontFamily:'SourceSansPro-Bold',color:'rgb(255,255,255)',position:'relative',left:7}}>

                    &nbsp;
                    {this.props.userStore.userCredit}
                    </Text>


              </View>
              </TouchableOpacity>
          </View>

      {/*      Profil fotoğrafı      */}

    <View style={{height:100,width:'100%',zIndex: 4,top:55,position:'absolute',flexDirection:'row',justifyContent:'center',}}>
       <TouchableOpacity onPress={()=>{this.changePhoto()}} style={{shadowColor: "rgba(0, 0, 0, 0.2)",
       shadowOffset: {
         width: 0,
         height: 2
       },
       shadowRadius: 1,
       shadowOpacity: 1,elevation:2, backgroundColor:'transparent',alignSelf:'center',left:12,position:'relative',width:80,height:80,borderRadius:40,alignItems:'center'}}>
              <Image style={{backgroundColor:'transparent',height:80,width:80, borderRadius:40}} onError={(error) => this.onImageError(error)} source={{uri:this.props.userStore.profilePic}}></Image>

            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.changePhoto()}} style={{shadowColor: "rgba(0, 0, 0, 0.2)",
            shadowOffset: {
              width: 0,
              height: 2
            },
            shadowRadius: 1,
            shadowOpacity: 1,elevation:3,width:24,height:24,borderRadius:12,alignItems:'center',top:34,right:7,position:'relative',alignSelf:'center',zIndex:3,backgroundColor:'white'}}>
            <Image style={{backgroundColor:'transparent',height:12,width:12, borderRadius:6,position:'absolute',top:6}} source={require('../static/images/profile/group.png')}></Image>
            </TouchableOpacity>
       </View>
          {/* Profil sayfası upper div */}
          <View style={{flex:1,marginTop:55,paddingTop:50,position:'relative',top:50,width:'100%',backgroundColor:'white',flexDirection:'column',borderRadius:5}}>



            <Text style={{alignSelf:'center',marginBottom:-13,fontWeight:'bold',color:'rgb(36,20,102)',fontFamily:'SourceSansPro-Bold',fontSize:18}}>{this.props.userStore.userName}</Text>


            <View style={{alignItems:'center'}}>
            <UserData userData={this.props.userStore.user} setDestination={(destination) =>{this.props.navigation.navigate(destination)}}/>


          </View>
          <View>
            <Text style={{textAlign:'center',fontFamily:'SourceSansPro-Bold' }}>Bu Haftaki Fal Puanınız: {this.props.userStore.week}</Text>
          </View>
          {this.renderBio()}
          </View>

          {/* Profil sayfası lower div        */}

           <View style={{flex:1,paddingTop:15,position:'relative',paddingBottom:15,top:50,marginTop:15,marginBottom:50,width:'100%',backgroundColor:'white',flexDirection:'column',justifyContent:'center',borderRadius:5}}>


            <View style={styles.pickerContainer}>

                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{fontSize:14,fontFamily:'SourceSansPro-Bold',fontWeight:'900',color:'rgb(166,158,171)',height:40}}>Özel Mesaj Almak İstemiyorum</Text>
              <Switch style={{marginBottom:13}} value={this.props.userStore.dmBlocked} onValueChange={()=>{this.props.userStore.changeDmStatus()}}/>


             </View>

              <View ref={agePicker => this.agePicker = agePicker}><TouchableOpacity onPress={() => {this.initAgePicker()}} style={styles.picker}><Text style={styles.pickerText}>{this.props.userStore.age>10 ? this.props.userStore.age+" yaşındayım" : "Yaşınızı Seçin"}</Text><Image source={require('../static/images/profile/shape.png')}/></TouchableOpacity></View>
              <View ref={agePicker => this.iliskiPicker = agePicker}><TouchableOpacity onPress={() => {this.initiliskiPicker()}} style={styles.picker}><Text  style={styles.pickerText}>{this.props.userStore.iliski!=='' ? this.props.userStore.iliski : "İlişki Durumu"}</Text><Image source={require('../static/images/profile/shape.png')}/></TouchableOpacity></View>
              <View ref={agePicker => this.meslekPicker = agePicker}><TouchableOpacity onPress={() => {this.initMeslekPicker()}} style={styles.picker}><Text  style={styles.pickerText}>{this.props.userStore.meslek!=='' ? this.props.userStore.meslek : "Çalışma Durumu"}</Text><Image source={require('../static/images/profile/shape.png')}/></TouchableOpacity></View>
              <View ref={agePicker => this.cityPicker = agePicker}><TouchableOpacity onPress={() => {this.initCityPicker()}} style={styles.picker}><Text  style={styles.pickerText}>{this.props.userStore.city!=='' ? this.props.userStore.city : "Şehir"}</Text><Image source={require('../static/images/profile/shape.png')}/></TouchableOpacity></View>
            </View>

          </View>

          {/* Profile Page Buttons */}


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
        //dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title=" " />}
        dialogStyle={{alignSelf:"flex-start",borderRadius:0}}
        width={0.7}
        height={1}
        ref={(popupDialog) => { this.popupDialog = popupDialog; }}
        dialogAnimation={slideAnimation}
      >
      <View style={{flex:1}}>
      <View style={{flex:1,marginBottom:10,marginTop:15,paddingRight:23,paddingLeft:23}}>
        <Image style={{alignSelf:'center',height:80,width:80, borderRadius:0,marginTop:0,marginBottom:10}} source={require('../static/images/logo.png')}></Image>
          <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}   onPress={() => {this.props.navigation.navigate('KrediKazan');}}>
            <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"KREDİ KAZAN"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}  onPress={() => {this.props.navigation.navigate('Sikayet')}}>
            <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"PROBLEM BİLDİR"}</Text>
          </TouchableOpacity>
           <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}   onPress={() => {this.props.navigation.navigate('Kimiz')}}>
             <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"BİZ KİMİZ?"}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}  onPress={() => {this.props.navigation.navigate('JoinTeam')}}>
             <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"EKİBİMİZE KATIL"}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30}}  onPress={() => {this.props.navigation.navigate('TermsofUse')}}>
             <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"KULLANIM KOŞULLARI"}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={{marginBottom:17,borderRadius:5,flexDirection:'column',justifyContent:'center',borderWidth:2,borderColor:'rgba(36,20,102,0.55)',height:30,marginBottom:14}}  onPress={() => {this.logout()}}>
             <Text style={{paddingTop:3,fontSize:14,flex:1,color: 'rgb(36,20,102)',textAlign: 'center',fontFamily:'SourceSansPro-Bold',fontWeight:'900'}}>{"ÇIKIŞ YAP"}</Text>
           </TouchableOpacity>
       </View>
      </View>
     </PopupDialog>

      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    padding:0,
    paddingTop:0,
    paddingBottom:0,

    backgroundColor:'rgba(48,35,174,1)'

  },
  pickerContainer: {
    borderColor:'white',

    borderTopWidth:2,
    backgroundColor:'transparent',
    paddingLeft:25,
    paddingRight:25,

    backgroundColor:'white',
    flex:1,
    width:'100%',

  },
  picker:{
    flexDirection:'row',justifyContent:'space-between',padding:10,marginBottom:10,alignItems:'center',backgroundColor:'#676891',width:'100%',height:40,borderRadius:4
  },
  nameinput:{
    fontSize:14,fontWeight:'bold',backgroundColor:'transparent',color:'dimgray',justifyContent:'space-between',alignItems:'center',backgroundColor:'#f9f9fb',width:'70%',height:30
  },
  pickerText:{
    backgroundColor:'transparent',color:'white',fontFamily:'SourceSansPro-Semibold',fontSize:12,paddingLeft:10,paddingRight:10
  },
  inputwrap:{
    flexDirection:'row',justifyContent:'space-between',paddingLeft:10,paddingRight:10,marginBottom:10,alignItems:'center',backgroundColor:'#f9f9fb',width:'100%',height:30,borderRadius:5
  },

  profileButton:{
    borderWidth:2,borderColor:'rgba(245,245,245,0.25)',height:30

  }
});
