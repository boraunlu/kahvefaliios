import { observable,action,computed } from 'mobx';
import Backend from '../Backend';

export default class SocialStore {
  @observable socials = null;





  @action setSocials(socials) {

    this.socials=Array.from(socials)
  }
  @action addComment(comment,index) {

    //this.socials[index].comments.push(comment)
    
  }





}
