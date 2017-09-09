import { observable,action,computed } from 'mobx';
import Backend from '../Backend';

export default class UserStore {
  @observable user = null;
  @observable userCredit= 50;
  @observable bizdenUnread= 0;
  @observable aktifUnread= 0;
  @observable sharedWeek= false;
  @observable aktifLastMessage= '';
  @observable age = null;
  @observable meslekStatus= null;
  @observable iliskiStatus= null;


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

  @action changeAge(value) {
    this.age=value
    Backend.setProfile(value,this.iliskiStatus,this.meslekStatus)
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
    Backend.setProfile(this.age,this.iliskiStatus,status)
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
    Backend.setProfile(this.age,status,this.meslekStatus)
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

  @action setUser(user) {
    this.user = user;
    this.userCredit=user.credit
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
  }

}
