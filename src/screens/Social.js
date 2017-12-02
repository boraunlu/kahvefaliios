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
  Button
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}

function generatefalcisayisi() {
  var saat = moment().hour()
  var gun = moment().day()%3
  var dk = moment().minute()%10
  var falcisayisi= 5
  if(saat>7&&saat<11){
    falcisayisi=4+gun
  }
  if(saat>10&&saat<16){
    falcisayisi=6+gun
  }
  if(saat>15&&saat<22){
    falcisayisi=8+gun
  }
  if(saat>21&&saat<25){
    falcisayisi=5+gun
  }
  if(saat<4){
    falcisayisi=2+gun
  }
  if(saat>3&&saat<8){
    falcisayisi=1+gun
  }
  return falcisayisi*17+dk
}

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("socialStore")
@observer
export default class Social extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sosyaller:null,
      tek:null
  };
}

  static navigationOptions = ({ navigation }) => ({
      title: 'Sosyal',
      tabBarIcon: ({ tintColor }) => (
        <Icon name="group" color={tintColor} size={22} />
      ),
      headerRight:<View style={{paddingRight:5}}><Button color={'teal'} title={"+ Fal Paylaş"} onPress={() => {navigation.state.params.showpopup()}}/></View>,
      headerLeft:<View style={{flexDirection:'row',alignItems:'center',paddingLeft:5}}><Text>{"   ("+generatefalcisayisi()+") Online"}</Text><View style={{backgroundColor:'#00FF00',height:12,width:12,borderRadius:6,marginLeft:5}}></View></View>  ,

    })



  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
  }

  showpopup = () => {
    this.popupSosyal.show()

  }




  componentDidMount() {
    this.props.navigation.setParams({ showpopup: this.showpopup  })
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

        this.setState({tek:responseJson.tek});

        this.props.socialStore.setSocials(responseJson.sosyals)
     })
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {


  }

  replaceAvatar = (index) => {

    var sosyals = this.props.socialStore.socials
    sosyals[index].profile_pic=null
    this.props.socialStore.setSocials(sosyals)
  }

  renderTek = () => {
    if(this.state.tek){
      var tek = this.state.tek
      var profile_pic=null
      tek.profile_pic?profile_pic={uri:tek.profile_pic}:tek.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
      return(
        <View style={{height:70,marginBottom:20}}>

          <TouchableOpacity style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1,borderTopWidth:1,height:70}} onPress={() => {this.navigateToFal(tek)}}>
           <View style={{flexDirection:'row',height:70}}>

           <Image source={profile_pic} style={styles.falciAvatar}></Image>
             <View style={{padding:10,flex:1}}>

               <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:16}}>
                 {tek.question}
                </Text>
                <Text style={{fontWeight:'normal',fontSize:14}}>
                  {tek.name} - <Text style={{color:'gray'}}>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(tek.time).calendar()))}
                  </Text>
                 </Text>

             </View>
             <View style={{padding:15,justifyContent:'center',width:60,borderColor:'teal'}}>
               <Text style={{color:'black'}}>({tek.comments?tek.comments.length:0})</Text>
             </View>
           </View>

          </TouchableOpacity>
        </View>
      )
    }
  }

  renderSosyaller = () => {
    if(this.props.socialStore.socials){
      var sosyaller = this.props.socialStore.socials
      return (

         sosyaller.map(function (sosyal,index) {
           var profile_pic=null
           sosyal.profile_pic?profile_pic={uri:sosyal.profile_pic}:sosyal.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'rgba(248,255,248,0.8)',width:'100%',borderColor:'gray',flex:1,borderBottomWidth:1}} onPress={() => {this.navigateToFal(sosyal,index)}}>
              <View style={{flexDirection:'row',height:70,}}>

              <Image source={profile_pic} onError={(error) => {this.replaceAvatar(index)}} style={styles.falciAvatar}></Image>
                <View style={{padding:10,flex:1}}>

                  <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',marginBottom:5,fontSize:16}}>
                    {sosyal.question}
                   </Text>
                   <Text style={{fontWeight:'normal',fontSize:14}}>
                     {sosyal.name} - <Text style={{color:'gray'}}>
                      {capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}
                     </Text>
                    </Text>

                </View>
                <View style={{padding:15,justifyContent:'center',width:90,borderColor:'teal'}}>
                  <Text style={{textAlign:'center',color:'black'}}>{sosyal.comments?sosyal.comments.length>5?<Text><Text style={{fontSize:20}}>🔥</Text> ({sosyal.comments.length})</Text>:"("+sosyal.comments.length+")":0}</Text>
                </View>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
    else{
      return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      )
    }
  }

  render() {


    return (

      <Image source={require('../static/images/Aurora.jpg')} style={styles.container}>

        <View style={{flex:1,width:'100%'}}>
          <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:5,alignSelf:'stretch'}}>
            <View>
              <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
              </Image>

            </View>
            <View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.6)',padding:10,width:Dimensions.get('window').width-85}}>
              <Text style={{fontSize:16,color:'white'}}>
                Bu sayfada diğer falseverlerden gelen falları okuyabilir, bu fallara yorum yapıp beğeni kazanabilirsin.
              </Text>

            </View>
          </View>
            {this.renderTek()}
          <View style={{backgroundColor:'teal'}}><Text style={{margin:3,fontSize:17,textAlign:'center',color:'white',fontWeight:'bold'}}>Yorum Bekleyen Falseverler ({this.props.socialStore.socials?this.props.socialStore.socials.length:0})</Text></View>
          <ScrollView style={{backgroundColor:'rgba(255,255,255,0.8)'}}>

            {this.renderSosyaller()}
          </ScrollView>
        </View>
        <PopupDialog

          ref={(popupDialog) => { this.popupSosyal = popupDialog; }}

          width={'80%'}
          height={'60%'}
          dialogStyle={{marginTop:-150}}
          overlayOpacity={0.75}
        >
          <View style={{flex:1,backgroundColor:'#36797f',alignItems:'center'}} >

              <Image source={require('../static/images/karilar.png')} style={{height:60,resizeMode:'contain',marginTop:10}}/>
              <Text style={styles.faltypeyazipopup}>
                Falımı nasıl paylaşabilirim?
              </Text>
              <Text style={styles.faltypeyazikucukpopup}>
                Ana sayfa üzerinden falcılarımızla yaptığınız sohbetin bitiminde çıkan <Text style={{fontWeight:'bold',fontSize:15}}>"Falseverlere Sor"</Text> seçeneğini kullanarak falınızın burada yayınlanmasını sağlayabilirsiniz.  {"\n"}
              </Text>
                <Image style={{height:140,resizeMode:'contain',alignSelf:'center'}} source={require('../static/images/sosyalreklam1.png')}/>
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

  },
  falciAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:20,
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
  }

});
