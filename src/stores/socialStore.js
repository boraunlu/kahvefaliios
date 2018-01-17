import { observable,action,computed } from 'mobx';
import Backend from '../Backend';

export default class SocialStore {
  @observable socials = null;
  @observable commenteds = null;


  @action setSocials(sosyals) {

    this.socials=sosyals


  }
  @action setCommenteds(commenteds) {
    this.commenteds=commenteds

  }
  @action addComment(comment,index) {

    //this.socials[index].comments.push(comment)

  }





}
