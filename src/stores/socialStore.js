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
  @observable falseverUnread= 0;
  @observable sosyalUnread = 0;
  @observable gunlukUnread = 0;



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
    var allGunluks=Array.from(allfals.gunluks)
    this.allGunluks=allGunluks

    var sosyalUnread = 0
    var gunlukUnread = 0

    if(allSocials){
      for (var i = 0; i < allSocials.length; i++) {
        if(allSocials[i].unread>0){
          sosyalUnread=+allSocials[i].unread
        }
      }
    }

    if(allGunluks){
      for (var i = 0; i < allGunluks.length; i++) {
        if(allGunluks[i].unread>0){
            gunlukUnread=+allGunluks[i].unread
        }
      }
    }

    this.sosyalUnread=sosyalUnread
    this.gunlukUnread=gunlukUnread

    var lastGunluk=allGunluks[0]
    var lastSocial=allSocials[0]
    var lastFalType=null
    if(lastSocial){
      if(lastGunluk){
        lastSocial.time>lastGunluk.time?lastFalType='sosyal':lastFalType='gunluk'
      }
      else {
        lastFalType='sosyal';
      }
    }
    else {
      if(lastGunluk){
        lastFalType='gunluk';
      }
    }

    if(lastFalType=='sosyal'){
      var sosyal=lastSocial
      var simdi =moment()
      if(sosyal.status===1){
        if(simdi.diff(moment(sosyal.time),"days")<2){
              this.tek=sosyal

        }
      }
      else if (sosyal.status===3) {
        if(simdi.diff(moment(sosyal.time),"days")<3){
              this.tek=sosyal

        }
      }
    }

    if(lastFalType=='gunluk'){
      var gunluk=lastGunluk
      var simdi =moment()
      if(gunluk.status===1){
        if(simdi.diff(moment(gunluk.time),"days")<1){
              this.tek=gunluk
        }
      }
    }


  }

  @action increaseFalseverUnread(value) {
    this.falseverUnread =this.falseverUnread+value
  }

  @action setFalseverUnread(value) {
    this.falseverUnread =value
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
