import { observable,action,computed } from 'mobx';
import Backend from '../Backend';

export default class SocialStore {
  @observable socials = null;
  @observable commenteds = null;
  @observable sosyalInput='';
  @observable tek = null;
  @observable falPhotos = [];


  @action setSocials(sosyals) {
    this.socials=sosyals
  }
  @action setCommenteds(commenteds) {
    this.commenteds=commenteds
  }
  @action setSosyalInput(input) {

    this.sosyalInput=input.text
  }
  @action setTek(tek) {

    this.tek=tek
  }
  @action addComment(comment,index) {


  }
  @action addPhoto(image) {

    this.falPhotos.push(image)
    if(this.falPhotos.length>3){
      this.falPhotos=this.falPhotos.slice(-3)
    }

  }
}
