import { observable,action,computed } from 'mobx';
import Backend from '../Backend';

export default class UserStore {
  @observable user = null;
  @observable userName = ' ';
  @observable userCredit= 0;
  @observable bizdenUnread= 0;
  @observable aktifUnread= 0;
  @observable sharedWeek= false;
  @observable aktifLastMessage= '';
  @observable age = null;
  @observable meslekStatus= null;
  @observable iliskiStatus= null;
  @observable isAgent= false;



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

  @action setSharedTrue() {
    this.sharedWeek =true
  }
  @action setAppRatedTrue() {
    this.user.appRated =true
  }
  @action changeAge(value) {
    this.age=value

  }

  @action changeMeslek(value) {
    var status=0
    if(value=="Çalışıyor"){
      status=1;
    }
    else if (value=='İş arıyor') {
      status=2;
    }
    else if (value=='Öğrenci') {
      status=3;
    }
    else if (value=='Çalışmıyor') {
      status=4;
    }
    this.meslekStatus=status

  }
  @action changeIliski(value) {
    var status="0"
    if(value=="Sevgilisi Var"){
      status="1";
    }
    else if (value=='Evli') {
      status="2";
    }

    this.iliskiStatus=status

  }

  @computed get totalNoti() {
        return this.bizdenUnread + this.aktifUnread;
  }

  @computed get meslek() {
      var meslek =''
      switch(this.meslekStatus) {
        case 1:
            meslek='Çalışıyor';
            break;
        case 2:
            meslek='İş arıyor';
            break;
        case 3:
            meslek='Öğrenci';
            break;
        case 4:
            meslek='Çalışmıyor';
            break;
      }
      return meslek;
  }
  @computed get iliski() {
    var iliski =''
    switch(this.iliskiStatus) {
        case "0":
            iliski='İlişkisi Yok';
            break;
        case "1":
            iliski='Sevgilisi Var';
            break;
        case "2":
            iliski='Evli';
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



  @action setUser(user) {
    this.user = user;
    this.userCredit=user.credit
    this.userName=user.name
    this.age=user.age
    this.sharedWeek=user.sharedToday
    if(user.lastMessage){
      this.aktifLastMessage=user.lastMessage.text
    }
    if(user.relStatus){
      this.iliskiStatus=user.relStatus
    }
    if(user.workStatus){
      this.meslekStatus = user.workStatus
    }
    if(user.isAgent){
      this.isAgent = user.isAgent

    }
  }

}
