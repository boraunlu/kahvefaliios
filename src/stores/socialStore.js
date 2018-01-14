import { observable,action,computed } from 'mobx';
import Backend from '../Backend';

export default class SocialStore {
  @observable socials = null;
  @observable commenteds = null;


  @action setSocials(sosyals) {

    this.socials=sosyals
/*
    var commenteds=[]
    var id = Backend.getUid()
    for (var i = 0; i < sosyals.length; i++) {
      var sosyal = sosyals[i]
      if(sosyal.comments&&sosyal.comments.length>0){
        for (var i = 0; i < sosyal.comments.length; i++) {
          if(sosyal.comments[i].fireID==id){
            commenteds.push(sosyal)
            break;
          }
        }
      }
    }
      this.commenteds=commenteds*/

  }
  @action setCommenteds(commenteds) {


  }
  @action addComment(comment,index) {

    //this.socials[index].comments.push(comment)

  }





}
