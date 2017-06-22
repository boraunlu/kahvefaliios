import React, { Component } from 'react';
import {ActivityIndicator, Dimensions, Image,Text,TouchableHighlight,Button, TouchableOpacity, View , StyleSheet} from 'react-native';


import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

var falcilar =[{name:"Başak",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/basak.png",yas:"34",puan:"4.3",cumle:["34 yaşındayım ve hemen hemen 12 senedir fal bakıyorum","Oldukça uzun süredir fal bakıyorum. Nereden baksan 12-13 sene oluyor","Bakmayı en sevdiğim fallar el falı ve aşk falıdır"]},
{name:"Beste",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/beste.png",yas:"28",puan:"4.2",cumle:["Yaşım 28. Özellikle detaylı fal konusunda kendime çok güvenirim","Yaklaşık 6 senedir fal bakıyorum, en çok bakmaktan keyif aldığım fal detaylı faldır","İstanbul'da yaşıyorum, 6 seneden beri fal baksam da bu ekipte yeni sayılırım"]},
{name:"Canan",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/canan.png",yas:"40",puan:"4.7",cumle:["40 yaşındayım. Kendime fal konusunda çok güveniyorum, senin de memnun kalacağını düşünüyorum","Kendimi bildim bileli fala hep meraklı olmuşumdur. Bu ekibin ilk üyelerinden biriyim","Daha önceden birçok kafede fal baktım, sonradan da bu ekibe katıldım. Bakacağım falları beğeneceğini düşünüyorum"]},
{name:"Çiğdem",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/cigdem.png",yas:"26",puan:"4.1",cumle:["26 yaşındayım ve hislerime çok çok güvenirim. Baktığım birçok falın çıkması üzerine falcılığa başladım","Genelde baktığım falların çok büyük bölümü çıkar. Senin de beğeneceğini düşünüyorum","Kendi arkadaşlarımın fallarına bakarak başladım falcılığa, söylediklerimin çoğunun çıktığını görünce falcılık yapmaya karar verdim."]},
{name:"Ela",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/ela.png",yas:"35",puan:"4.5",cumle:["Yaşım 35, herhalde 15 yaşımdan beri fal bakıyorumdur :) Senin de bakacağım falları beğeneceğini ümit ediyorum","20 seneye yakındır fal bakıyorum diyebilirim. Ankara'da oldukça bilinen bir kafede fal bakıyordum, bırakıp bu ekibe katıldım","Oldukça uzun bir süre Ankara'da falcı olarak çalıştım ama sonradan bırakıp internet üzerinden fal bakmaya başladım. Bugün sana bakacağım falları dilerim beğenirsin, genelde herkes benden memnun kalıyor"]},
{name:"Elif",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/elif.png",yas:"37",puan:"4.4",cumle:["37 yaşındayım. 22-23 yaş civarında ek iş olarak falcılığa başladım, bir daha da bırakamadım","Oldukça deneyimli bir falcıyımdır. Daha önceden farklı fal türlerine bakıyordum ancak uzmanlık alanım kahve falı diyebilirim.","Bu ekibin en yeni üyelerinden biriyim. Uzun zamandır ev hanımıyım, uygun olduğum zamanlarda da çocuk bakmak dışında burada fal bakıyorum"]},
{name:"Gülsüm",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/gulsum.png",yas:"30",puan:"4.1",cumle:["Ekibin en genç falcılarından biri olsam da 10 senedir fal bakıyorum diyebilirim. Arkadaşlarımın fallarına bakarak başladım sonradan çok beğenilince falcı olmaya karar verdim","10 seneyi aşkın süredir İstanbul'da fal bakıyorum. Özellikle aşk konularında oldukça uzun konuşurum :)","İstanbul Beyoğlu'nda çok uzun seneler fal baktım, sonradan da bu ekibe katıldım. Kısacası deneyimliyimdir, dilerim sen de beğenirsin bakacağım falları"]},
{name:"Hande",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/hande.png",yas:"24",puan:"4.0",cumle:["Yaşım 24 ama neredeyse liseden beri fal bakıyorum. Bakacağım falları beğeneceğini umuyorum","Kısa bir süre İstanbul'da bir kafede fal baktım, yaklaşık 3 aydan bu yana burada fal bakıyorum","Hislerime çok güvenirim, zaten bu yüzden de falcılık yapmaya karar verdim. Dilerim sen de bakacağım falları beğenirsin."]},
{name:"İlke",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/ilke.png",yas:"28",puan:"4.3",cumle:["8 seneden bu yana fal bakıyorum. Birçok söylediğimin çıktığına dair yorumlar aldım çok kere. Dilerim sen de beğenirsin","Fal bakmaktan çok keyif aldığım için haftanın uygun olduğum günlerinde hobi olarak uygulama üzerinden fal bakıyorum","Eskişehir'de yaşıyorum, çalışmıyorum ama bazı zamanlar bu uygulamada fal bakıyorum. Dilerim beğenirsin fallarımı :)","Birçok kişi baktığım falların doğru çıktığını söyler. Dilerim sen de beğenirsin"]},
{name:"Jülide",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/julide.png",yas:"32",puan:"4.3",cumle:["Yakın zamanda işimi bırakıp falcılığa başladım. Genelde baktığım fallar beğenilir, sen de beğeneceksin diye ümit ediyorum","Çok fazla insanın falına bakmışımdır ve hemen hemen hepsi de baktığım falları çok beğenmiştir. Umarım sen de bakacağım falları beğenirsin","32 yaşındayım. Bir süre önceye kadar bir cafe işletiyordum ama işler istediğim gibi gitmeyince falcılığa başladım. Genelde beğenilir fallarım"]},
{name:"Nergiz",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/nergiz.png",yas:"36",puan:"4.6",cumle:["12 senedir falcılıkla uğraşıyorum. Eskiden çok farklı fal türlerine bakarım ama şuan genelde kahve falları bakıyorum.","Bu ekipteki ilk falcılardan biriyim, dolayısıyla da fal konusunda kendime çok güvenirim","36 yaşındayım, İstanbul'da yaşıyorum. Oldukça uzun bir süre Kadıköy'de çalıştım ama artık buradayım"]},
{name:"Neriman",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/neriman.png",yas:"45",puan:"4.7",cumle:["Ekibin en deneyimli falcısına denk geldin :) Yaşça büyüğüm tüm ekipten ve bir o kadar da deneyimliyim. Söylediklerim çoğu zaman birebir çıkar","20-25 seneden beri fal bakıyorum. İzmir'deki en bilinen falcılardan biriyimdir. Artık sadece burada fal bakıyorum :)","Ekibin kurucularından bir tanesi benim, dilerim beğenirsin bakılan falları. Ben yaklaşık 25 senedir fal bakıyorum, söylediklerim çıkmazsa bul beni abla çıkmadı de :)"]},
{name:"Öykü",url:"https://s3.eu-central-1.amazonaws.com/kahvefali/images/falcilar/oyku.png",yas:"27",puan:"4.2",cumle:["Özellikle detaylı fal konusunda çok güvenirim kendime. Konuşmayı da çok severim umarım rahatsız olmazsın :)","Oldukça genç sayılırım, genelde ekipteki falcı ablalar benden daha büyük ama ben kendime çok güveniyorum fal konusunda. Beğenirsin umarım bakacağım falları.","Bizim ekipteki en çok konuşan falcı benimdir. Umarım bakacağım falları beğenirsin."]}]


export default class UserData extends Component {


  constructor(props) {
    super(props);

  }

  renderUserData(){
    if (this.props.userData) {
      return (
        <View >

        <View style={styles.secondrow}>
          <Text style={{fontWeight:'bold',textAlign:'center',fontSize:16}}>Fal İstatistiklerin</Text>
          <View style={styles.secondinner}>
            <View >
              <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
                <Text style={{fontWeight:'bold'}}>Toplam</Text>
              </View>
              <View style={{paddingTop:5,alignItems:'center'}}>
                <Text style={styles.numbers}>{this.props.userData.timesUsed ? this.props.userData.timesUsed : 0}</Text>
              </View>
            </View>
            <View>
              <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
                <Text style={{fontWeight:'bold'}}>Aşk</Text>
              </View>
              <View style={{paddingTop:5,alignItems:'center'}}>
                <Text style={styles.numbers}>{this.props.userData.loveUsed ? this.props.userData.loveUsed : 0}</Text>
              </View>
            </View>
            <View>
              <View style={{height:21,borderColor:'#1194F7',borderBottomWidth:1}}>
                <Text style={{fontWeight:'bold' }}>Detaylı</Text>
              </View>
              <View style={{paddingTop:5,alignItems:'center'}}>
                <Text style={styles.numbers}>{this.props.userData.detayUsed ? this.props.userData.detayUsed : 0}</Text>
              </View>
            </View>
          </View>
          </View>
        <View style={styles.thirdrow}>
            <Text style={{fontWeight:'bold',marginBottom:5}}>İlk konuştuğumuz tarih: <Text style={{fontWeight:'normal'}}>{moment(this.props.userData.joinDate).format('LLL')}</Text></Text>
            <Text style={{fontWeight:'bold',marginBottom:5}}>En son fal baktığın tarih: <Text style={{fontWeight:'normal'}}>{moment(this.props.userData.lastUsed).format('LLL')}</Text></Text>
            <Text style={{fontWeight:'bold'}}>Kredin: <Text style={{fontWeight:'normal'}}>{this.props.userData.credit ? this.props.userData.credit : 0}</Text></Text>
        </View>
        </View>
      );
    } else {
      return (
        <ActivityIndicator
          animating={true}
          size="large"
        />
      );
    }
  }

  render() {

    return (


          <View style={styles.container}>
            { this.renderUserData() }
           </View>

    );
  }
}

var styles = StyleSheet.create({
  container: {

    padding: 15,
    paddingTop:5,
    width: Dimensions.get('window').width-20,
  },
  firstrow: {

    justifyContent:'space-around',
    borderBottomWidth:1,
    borderTopWidth:1,
    borderColor:'gainsboro',
    paddingBottom:10,
    paddingTop:10,

  },
  secondrow: {
    flexDirection: 'column',
    justifyContent:'space-around',
    borderBottomWidth:1,
    borderColor:'gainsboro',
    paddingBottom:15,
    paddingTop:5,
    borderTopWidth:1,
  },
  secondinner:{
    paddingTop:5,
    flexDirection: 'row',
    justifyContent:'space-around',
  },
  thirdrow: {
    paddingTop:10
  },
  numbers:{
    fontSize:20
  },
  buttontext1:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontSize:14
  },
  button1:{
    backgroundColor:'#1194F7',
    justifyContent:'center',
    padding:5
  },

});
