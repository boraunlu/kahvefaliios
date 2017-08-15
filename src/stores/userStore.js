import { observable,action,computed } from 'mobx';

export default class UserStore {
  @observable user = null;
  @observable userCredit= 50;
  @observable bizdenUnread= 0;
  @observable aktifUnread= 0;
  @observable sharedWeek= false;


  @action increment(credittoadd) {
    this.userCredit = this.userCredit+credittoadd;

  }

  @action setBizdenUnread(value) {
    this.bizdenUnread =value
  }

  @action setAktifUnread(value) {
    this.aktifUnread =value
  }

  @computed get totalNoti() {
        return this.bizdenUnread + this.aktifUnread;
    }

  @action setUser(user) {
    this.user = user;
    this.userCredit=user.credit
    this.sharedWeek=user.sharedToday
  }

}