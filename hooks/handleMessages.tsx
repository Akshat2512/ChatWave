import { setAICompletion, setChatRecieved, setChatSent, setChatStorage, setChatUpdate, setFriendsList, setGifsList, setOnlineUsers, setProfileDetails, setProfileImgAction, setProfileName, setSearchList, setUpdateState } from "@/store/userAction";
import { friendsProp } from "@/store/userReducer";
import { formatDate } from "./TimeFormating";
import { store } from "@/store/store";
import { CHAT_UPDATE } from "@/store/types";



export function HandleMessage(message: any, userName: string | null, online: string[], friends: friendsProp[], searchUser: any, dispatch: any) {


  if (message['Type'] == "profileDetails") {

    console.log(message)
    if (message.uname == userName) {

      if("created_on" in message)
        {
          const date = new Date(message.created_on+'Z').toDateString();
          const time = new Date(message.created_on+'Z').toLocaleTimeString();
          dispatch(setProfileDetails(message["name"], date + ", " + time))
        }
      else{
        dispatch(setProfileName(message["name"]))
      }
    }
    else {
      console.log("profileDetailsUpdated : ", message.uname)

      const update_item = friends.find((item) => item.uname == message['uname']);
      if (update_item) {
        update_item.uname = message['uname'];
        update_item.name = message['name'];

        update_item.lastseen = formatDate(message.last_seen);
        // update_item.message = "Start messaging again";
        
        dispatch(setFriendsList(friends))
      }

    }

    return;
  }

  if (message['Type'] == 'profileImg') {
    // console.log(message)
    if (message["uname"] == userName) {
      dispatch(setProfileImgAction(`${message["profile_pic"]}`, message["updated_on"]))
      if("created_on" in message){
      const date = new Date(message.created_on).toDateString();
      const time = new Date(message.created_on).toLocaleTimeString();
      dispatch(setProfileDetails(message["name"], date + ", " + time))
      }
    }
    else {
      console.log("profileImageUpdated : ", message.uname)
      const item = friends.find(item => item.uname === message["uname"]);
      // console.log(item)
      if (item) {
        item.message = "Start Messaging";
        item.lastseen = formatDate(message.last_seen);
        item.profileImage = setProfileImgAction(message['profile_pic'], message['updated_on']).payload
        dispatch(setFriendsList(friends))
      }
      
      const search = searchUser.find((item: any) => item.uname === message["uname"]);
      if (search) {
        search.profileImg = setProfileImgAction(message['profile_pic'], message.updated_on).payload.uri;
        dispatch(setSearchList(searchUser))
        // console.log("searchUser: ", searchUser)
      }

  
    }


    return;
  }

  if(message["Type"]=="name_update"){
    if(message["status"] == 'successful'){
      alert("Name updated successfully")
      // const date = new Date(message.created_on).toDateString();
      // const time = new Date(message.created_on).toLocaleTimeString();
      // dispatch(setProfileDetails(message["name"], date + ", " + time))
      }
  }

  if(message["Type"]=="image_update"){
    if(message["status"] == 'successful'){
    alert("Successfully updated your profile picture");
    // dispatch(setProfileImgAction(`${message["profile_pic"]}`, message["updated_on"]))
    // const date = new Date(message.created_on).toDateString();
    // const time = new Date(message.created_on).toLocaleTimeString();
    // dispatch(setProfileDetails(message["name"], date + ", " + time))
    }
  }


  if (message["Type"] == 'friendsStatus') {

    var offline_users: string[] = [];


    if (JSON.stringify(message["online_status"]) != JSON.stringify(online)) {

     if(message["online_status"].length < online.length){
            offline_users = online.filter(e => !message["online_status"].includes(e));
   
       }

      dispatch(setOnlineUsers(message["online_status"]))

      return {update:"Update last_seen", users: offline_users }
  
    }

    return;
  }

  if (message["Type"] == 'search_users') {

    console.log("Dispatch: ", message['info']);
    if(message["info"] == "not_found"){
      dispatch(setSearchList([]))
    }
    else{
      dispatch(setSearchList(message['info']))
    }

    return;
  }

  if (message["Type"] == 'search_friends') {

    // dispatch(set(message['info']))
    const search: { uname: string, name: string, status: string, updated_on: string }[] | "not_found" = message['info'];
    var new_friends: friendsProp[] = [];

    if (search == "not_found") {
      dispatch(setFriendsList([]));
    }
   if (search != "not_found") {
      search.map((e, index: number) => {
        const update_item = friends.find((item) => item.uname == e.uname);
        if (update_item) {
          update_item.uname    =  e.uname;
          update_item.name     =  e.name;
          update_item.message  =  "Updating message ...";
          update_item.lastseen =  "...";
          update_item.status   =  e.status;

        }
       else {
          new_friends.push(
            {
              id: String(index),
              uname: e.uname,
              name: e.name,
              message: "Updating message ...",
              status: e.status,
              lastseen: "...",
              profileImage: { uri: null, updated_on: null }
            }
          )

        }
        // friends [ 1,2,3,4,5,6]  search [1,3,4,5]
      })
      const chat_state =  { ...store.getState().chatData.chats };
      const fontUpdate =  store.getState().chatData.fontStylesAndLayout
     
      friends = friends.filter((e: friendsProp, index: number) => {
        const item = search.find((item) => item.uname == e.uname);
        if (item) {
          return e;
        }
        else{
          delete chat_state[e.uname]
          delete fontUpdate[e.uname]
        }
      
      })
      dispatch( {
              type: CHAT_UPDATE,
              payload: {chats: chat_state, fontStyles: fontUpdate}
          })

      const updated_friends = [...friends, ...new_friends];
      dispatch(setFriendsList(updated_friends));

      return {update: "Update Messages", users: updated_friends};
    }
   } 
 

  if (message["Type"] == "last_seen"){
     const item = friends.find(e=> e.uname == message.user)
      if(item)
      {
        item.lastseen = formatDate(message.time);
      }
     
      console.log(message)
      dispatch(setFriendsList(friends))
  }
  

  if (message["Type"] == 'friend_req') {
    //  console.log(message)
    if (message["status"] == "sent") {
      console.log("requested");
    }
    if (message["status"] == "accepted") {
      console.log("accepted");
    }
    if (message["status"] == "deleted") {
      console.log("deleted");
    }
    // return "Update Friend Tab";
    
  }

  if (message["Type"] == 'notification') {
    //  console.log(message)
      if(message["update"] == "Update Friend Tab")
          return "Update Friend Tab";
    
  }

  if(message["Type"] == "gifs"){
    if(message["gifs"]){
       dispatch(setGifsList(message["gifs"]))
    }
  }

  if(message["Type"] == "update_messages"){
      console.warn(message["chats"])
      dispatch(setChatUpdate(message["chats"]));
      dispatch(setUpdateState("ready"));

      friends.forEach(e => {
        e.message = "Start Messaging"
      })
      dispatch(setFriendsList(friends));
  }

  if(message["Type"] == "message_sent"){
    if(message["updated_on"]){
      // console.log(message);
      dispatch(setChatSent(message["to"], message["id's"], message["updated_on"]));
    }
  }

  if(message["Type"] == "message_recieved"){
    if(message["updated_on"]){
      // console.log('Message recieved: ', message)
      dispatch(setChatRecieved(message["sender"], message["chats"], message["updated_on"]))
    }
  }

  if(message["Type"] == "messages_deleted"){
    console.log("message deleted");
    return {update: "Update Messages", users: friends};
  }

  if(message["Type"] == "ai_generated"){
    console.log('"'+message["stream"]+'"')
    dispatch(setAICompletion(message["stream"]))
  }

}

