import { observable,action,computed } from 'mobx';
import Backend from '../Backend';
import {AppState} from 'react-native';


getProfPicFromName = (name,gender) => {
  if(gender=='female'){
    var firststr='kadinharfler'
    var secondstr='K'
  }
  else {
    var firststr='erkekharfler'
    var secondstr='E'
  }
  var firstchar=name.charAt(0).toUpperCase()
  var isLetter = firstchar.match(/[A-Z]/i);
  if(!isLetter){
    if(firstchar=="İ"){firstchar='AI'}
    else if(firstchar=="Ö"){firstchar='AO'}
    else if(firstchar=="Ü"){firstchar='AU'}
    else if(firstchar=="Ç"){firstchar='AC'}
    else if(firstchar=="Ş"){firstchar='AS'}
    else {
      firstchar='K'
    }
  }

  var urlBase= 'https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/'+firststr+'%2F'+firstchar+secondstr+'.jpg?alt=media'
  return urlBase
}

export default class UserStore {
  @observable user = null;
  @observable userName = ' ';
  @observable profilePic = 'https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/erkekharfler%2FKE.jpg?alt=media';
  @observable userCredit= 0;
  @observable falPuan= 0;
  @observable bizdenUnread= 0;
  @observable aktifUnread= 0;
  @observable gunlukUnread= 0;
  @observable sosyalUnread= 0;
  @observable falseverUnread= 0;
  @observable sharedWeek= false;
  @observable aktifLastMessage= '';
  @observable age = null;
  @observable meslekStatus= null;
  @observable iliskiStatus= null;
  @observable isAgent= false;
  @observable bio= '';
  @observable city= '';
  @observable dmBlocked= false;
  @observable gunlukUsed=false;
  @observable isAdmin=false;




  @action increment(credittoadd) {
    this.userCredit = this.userCredit+credittoadd;

  }

  @action setBizdenUnread(value) {
    this.bizdenUnread =value
  }

  @action setAktifUnread(value) {
    this.aktifUnread =value
  }

  @action increaseAktifUnread() {
    this.aktifUnread =this.aktifUnread+1
  }


  @action setAktifLastMessage(value) {
    this.aktifLastMessage =value
  }
  @action increaseFalseverUnread(value) {
    this.falseverUnread =this.falseverUnread+value
  }

  @action setFalseverUnread(value) {
    this.falseverUnread =value
  }

  @action setSharedTrue() {
    this.sharedWeek =true
  }
  @action setAppRatedTrue() {
    this.user.appRated =true
  }
  @action setCommentedTrue() {
    this.user.commented =true
    this.userCredit = this.userCredit+15;
  }
  @action changeDmStatus() {
    this.dmBlocked=!this.dmBlocked
    Backend.changeDmStatus(this.dmBlocked)
  }
  @action changeAge(value) {
    this.age=value
    Backend.setProfile(this.userName,this.age,this.iliskiStatus,this.meslekStatus)
  }

  @action changeCity(value) {
    this.city=value
    Backend.setCity(value)
  }
  @action setGunlukUsedTrue() {
    this.gunlukUsed=true
  }
  @action setGunlukUnread(value) {
    this.gunlukUnread=value
  }

  @action changeMeslek(value) {
    var status=0
    if (value=='İş Arıyorum') {
      status=2;
    }
    else if (value=='Öğrenciyim') {
      status=3;
    }
    else if (value=='Çalışmıyorum') {
      status=4;
    }
    else if (value=='Kamuda Çalışıyorum') {
      status=5;
    }
    else if (value=='Özel Sektör') {
      status=7;
    }
    else if (value=="Kendi İşim") {
      status=6;
    }
    this.meslekStatus=status
      Backend.setProfile(this.userName,this.age,this.iliskiStatus,this.meslekStatus)
  }
  @action changeIliski(value) {
    var status="0"
    if(value=="Sevgilim Var"){
      status="1";
    }
    else if (value=='Evliyim') {
      status="2";
    }
    else if (value=='Nişanlıyım') {
      status="3";
    }
    else if (value=='Platonik') {
      status="4";
    }
    else if (value=='Ayrı Yaşıyorum') {
      status="5";
    }
    else if (value=='Yeni Ayrıldım') {
      status="6";
    }
    else if (value=='Boşandım') {
      status="7";
    }

    this.iliskiStatus=status
    Backend.setProfile(this.userName,this.age,this.iliskiStatus,this.meslekStatus)

  }

  @computed get totalNoti() {
        return this.falseverUnread+this.gunlukUnread + this.sosyalUnread;
  }

  @computed get meslek() {
      var meslek =''
      switch(this.meslekStatus) {
        case 1:
            meslek='Kendi İşim';
            break;
        case 2:
            meslek='İş Arıyorum';
            break;
        case 3:
            meslek='Öğrenciyim';
            break;
        case 4:
            meslek='Çalışmıyorum';
            break;
        case 5:
            meslek='Kamuda Çalışıyorum';
            break;
        case 6:
            meslek='Kendi İşim';
            break;
        case 7:
            meslek='Özel Sektör';
            break;
      }
      return meslek;
  }
  @computed get iliski() {
    var iliski =''
    switch(this.iliskiStatus) {
        case "0":
            iliski='İlişkim Yok';
            break;
        case "1":
            iliski='Sevgilim Var';
            break;
        case "2":
            iliski='Evliyim';
            break;
        case "3":
            iliski='Nişanlıyım';
            break;
        case "4":
            iliski='Platonik';
            break;
        case "5":
            iliski='Ayrı Yaşıyorum';
            break;
        case "6":
            iliski='Yeni Ayrıldım';
            break;
        case "7":
            iliski='Boşandım';
            break;

    }
    return iliski
  }

  @computed get profileIsValid() {
    var isvalid =true
    if(this.iliskiStatus==null||this.meslekStatus==null||this.age==null||this.userName.length<3){
      isvalid=false
    }
    return isvalid
  }
  @action setUserName(name) {

    this.userName=name.nametext
  }
  @action setBio(name) {

    this.bio=name.nametext
  }

  @action setProfilePic(url) {
    this.profilePic=url
  }

  @action checkProfPic() {

    if(this.profilePic.length>5){
      var gender='male'
      this.user?this.user.gender=='female'?gender='female':null:null
      var profilePic=getProfPicFromName(this.userName,gender)
      this.profilePic=profilePic
      Backend.setProfilePic(profilePic)
    }
  }


  @action setUser(user) {
    this.user = user;
    this.userCredit=user.credit
    this.userName=user.name
    if(user.profile_pic){
      this.profilePic=user.profile_pic
    }
    else {
      var profilePic=getProfPicFromName(user.name,user.gender)
      this.profilePic=profilePic
      Backend.setProfilePic(profilePic)
    }
    this.falPuan=user.falPuan
    this.bio=user.bio
    this.age=user.age
    this.city=user.city
    this.dmBlocked=user.dmBlocked
    this.sharedWeek=user.sharedToday
    this.isAdmin=user.isAdmin
    if(user.lastMessage){
      this.aktifLastMessage=user.lastMessage.text
    }
    if(user.relStatus){
      this.iliskiStatus=user.relStatus
    }
    if(user.workStatus){
      this.meslekStatus = user.workStatus
    }
    if(user.appGunlukUsed){
      this.gunlukUsed= user.appGunlukUsed
    }
  }

}
