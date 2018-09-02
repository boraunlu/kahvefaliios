import { observable,action,computed } from 'mobx';
import moment from 'moment';
import Backend from '../Backend';

export default class SocialStore {
  @observable socials = null;
  @observable commenteds = null;
  @observable allSocials = null;
  @observable allGunluks = null;
  @observable sosyalInput='';
  @observable tek = null;
  @observable falPhotos = [];
  @observable tekUnread = 0;
  @observable lastFalType= null;
  @observable falseverUnread= 0;
  @observable sosyalUnread = 0;
  @observable gunlukUnread = 0;
  @observable activeFalsevers = []



  @action setSocials(sosyals) {
    this.socials=sosyals
  }
  @action setCommenteds(commenteds) {
    this.commenteds=commenteds
  }
  @action setAllSocials(sosyals) {
    this.allSocials=sosyals
  }
  @action setAllGunluks(sosyals) {
    this.allGunluks=sosyals
  }
  @action setAllFals(allfals) {

    var allSocials=Array.from(allfals.sosyals)
    this.allSocials=allSocials


    var sosyalUnread = 0


    if(allSocials){
      for (var i = 0; i < allSocials.length; i++) {
        if(allSocials[i].unread>0){
          sosyalUnread=+allSocials[i].unread
        }
      }
    }
    this.sosyalUnread=sosyalUnread

  }

  @action increaseFalseverUnread(value) {
    this.falseverUnread =this.falseverUnread+value
  }

  @action setFalseverUnread(value) {
    this.falseverUnread =value
  }
  @action setActiveFalsevers(falsevers) {
    this.activeFalsevers=falsevers
  }
  @computed get totalNoti() {
        return this.falseverUnread+this.sosyalUnread + this.gunlukUnread;
  }

  @action setSosyalInput(input) {
    this.sosyalInput=input.text
  }
  @action setTek(tek) {

    this.tek=tek
  }
  @action setUnread(value) {
    this.unread=value
  }
  @action addPhoto(image) {

    this.falPhotos.push(image)
    if(this.falPhotos.length>3){
      this.falPhotos=this.falPhotos.slice(-3)
    }

  }
}
