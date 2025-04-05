
from fastapi import WebSocket
from Module.gifs_loader import fetch_gifs
from Module.connect_database import retrieve_database, update_database
import json
import datetime
import asyncio


from Module.openai_models import generate_response

friends_locks = {}

async def get_friend_lock(username):
    if username not in friends_locks:
        friends_locks[username] = asyncio.Lock()
    return friends_locks[username]


async def handle_messages(websocket: WebSocket, message, username, users_directory, online_users):
                
                if "get" in message:
                    
                
                    if message["get"] == "profile_pic":
                        # print(users_directory)
                        uname = message["uname"].lower()
                       
                        query = f"SELECT full_name, created_on FROM users WHERE username = '{uname}'"
                        output = (await retrieve_database(query))[0]
                        name = output[0]
                        created_on = str(output[1])
    
                        updated_on = None

                        if "updated_on" in message:
                            updated_on = message["updated_on"]
                            if updated_on != "null":
                                updated_on = datetime.datetime.strptime(updated_on, '%Y-%m-%d %H:%M:%S.%f')

                        query = f"SELECT user_id FROM users WHERE username = '{uname}'"
                        output = (await retrieve_database(query))[0][0]
                        # print(output)
                        query_profile_pic = f"SELECT base64_string FROM images WHERE user_id = {output}"

                        last_update = f"SELECT profile_img FROM user_updates WHERE user_id = '{output}'"
                        last_update = (await retrieve_database(last_update))[0][0]

                        query = f"SELECT last_seen FROM users, user_updates WHERE users.username = '{uname}' AND users.user_id = user_updates.user_id;"
                     
                        if uname in users_directory[username]["friends"].friends() and users_directory[username]["friends"].friends()[uname] == 'accepted' :
                          last_seen = (await retrieve_database(query))[0][0]
                     
                        else:
                          last_seen = "..."

                        if ( updated_on == None or updated_on == "null" or last_update > updated_on):
                          output = {"Type": "profileImg", "profile_pic": (await retrieve_database(query_profile_pic))[0][0], "uname": uname, "name": name, "last_seen": str(last_seen), "created_on": created_on, "updated_on":  str(last_update) }    
                        #   print(output)
                        else:
                          output = { "Type": "profileDetails", "uname": uname, "name": name, "last_seen": str(last_seen), "created_on": created_on }    
                        await websocket.send_json(output)
                        return

                    if message["get"] == "online_status":
                        def get_friends(json_obj):
                            keys = []
                            for k, v in json_obj.items():
                                if v == "accepted":
                                  keys.append(k)
                         
                            return keys
                        
                        # print(users_directory[username]["friends"].friends())
                        if username not in online_users:
                            online_users.append(username)
                            
                        friends = get_friends(users_directory[username]["friends"].friends())
                        online_friends = list(set(online_users) & set(friends))
                   
                        # Example usage
                        
                        # print(online_friends)
                        data = {"Type": "friendsStatus", "online_status": online_friends }
                       
                        # print(online_friends)
                        await websocket.send_json(data)
                        return

                    if message["get"] == "search_users":
                        uname = message["input"].lower().replace(" ", "")
                        # print(uname)
                        query = f"""
                                    SELECT * FROM users 
                                    WHERE username LIKE '%{uname}%'
                                    ORDER BY 
                                        CASE 
                                            WHEN username LIKE '{uname}%' THEN 1
                                            ELSE 2
                                        END,
                                        username
                                """ 
                        output = await retrieve_database(query)
                        
                        
                        if(len(output)==0):
                            await websocket.send_json({"Type":"search_users", "info":[]})
                            return

                        query = f"""
                                    SELECT friend_lists FROM users 
                                    WHERE username = '{username}'
                                """ 
                        friend = (await retrieve_database(query))[0][0]
                  
                        if(len(friend)==0):
                            await websocket.send_json({"Type":"search_users","info":"not_found"})
                            
                        data = []
                        for element in output:
                            if(element[1] in friend):
                                status = friend[element[1]]
                            else:
                                status = "none"

                            data.append({
                                'uname': element[1],
                                'name': element[3],
                                'status': status
                            })
                        # print(data)   
                
                        await websocket.send_json({"Type":"search_users", "info":data})
                        return


                    if message["get"] == "search_friends":
                
                        query = f"""
                                    SELECT friend_lists FROM users 
                                    WHERE username = '{username}'
                                """ 
                        output = (await retrieve_database(query))[0][0]
                  
                        if(len(output)==0):
                            await websocket.send_json({"Type":"search_friends", "info":"not_found"})
                            return

                        # await websocket.send_json({"search_friend":output})
                        usr_prompt = users_directory[username]["messages"]._ai_prompts
                        usr_msg = users_directory[username]["messages"].messages()

                        data = []
                        Keys = list(output.keys())
    
                        for user in Keys:
                            get_usr = (await retrieve_database(f"SELECT * FROM users WHERE username = '{user}'"))[0]
                            query_pic_update = (await retrieve_database(f"SELECT profile_img FROM user_updates WHERE user_id = '{get_usr[0]}'"))[0]
                            # print(query_pic_update)
                            data.append({
                                'uname': get_usr[1],
                                'name': get_usr[3],
                                'status': output[user],
                                'updated_on': str(query_pic_update[0])
                            })
                            if not user in usr_prompt:
                                usr_prompt[user] = []
                            
                            if not user in usr_msg:
                                usr_msg[user] = []

                        # print(data)   
                        # friends = await retrieve_database(f"SELECT friend_lists FROM users WHERE username = '{username}'")[0][0]
                        await websocket.send_json({"Type":"search_friends", "info":data})
                        return      

                    if message["get"] == "search_gifs":
                        term = message["input"]
                        fmt = message["format"]
                        rating = message["rating"]
                        limit = message["limit"]
                        offset = message["offset"]
                        bundle = message["bundle"]
                        gifs = fetch_gifs(fmt, term, rating, limit, offset, bundle)
                        
                        await websocket.send_json({"Type": "gifs", "gifs": gifs})
                        return

                

                 
                elif "send" in message:
                    if message["send"] == "friend_req":
                      friend = message["to"]
                        
                      user_friend_lock = await get_friend_lock(username)
                      friend_friend_lock = await get_friend_lock(friend)
            
                      async with user_friend_lock, friend_friend_lock:
                        if friend == username:
                           await websocket.send_json({"Error": "Access Denied"})
                           return
                     
                        query = f"SELECT friend_lists FROM users WHERE username = '{username}'"
                        user_output = (await retrieve_database(query))[0][0]
                        user_output[friend] = "pending"



                        query = f"SELECT friend_lists FROM users WHERE username = '{friend}'"
                        friend_output = (await retrieve_database(query))[0][0]
                        friend_output[username] = "requested"
                        
                        
                        jsn = json.dumps(user_output)

                        query = "UPDATE users SET friend_lists = %s::json WHERE username = %s"
                        params=(jsn, username)
                        await update_database(query, params, return_id = False)
                      

                        jsn = json.dumps(friend_output)

                        query = "UPDATE users SET friend_lists = %s::json WHERE username = %s"
                        params=(jsn, friend)
                        await update_database(query, params, return_id = False)
                        
                        await users_directory[username]["friends"].update_friends(user_output)
                     
                        if friend in users_directory:
                          await users_directory[friend]["friends"].update_friends(friend_output)


                        await websocket.send_json({"Type":"friend_req", "status": "sent", "to": friend})
                        return
                    
                    if message["send"] == "del_friend_req":
                       
                       friend = message["from"]
                       
                       user_friend_lock = await get_friend_lock(username)
                       friend_friend_lock = await get_friend_lock(friend)
                       
                       async with user_friend_lock, friend_friend_lock:
                            
                            if friend == username:
                             await websocket.send_json({"Error": "Access Denied"})
                             return

                            query = f"SELECT friend_lists FROM users WHERE username = '{username}'"
                            user_output = (await retrieve_database(query))[0][0]
                        
                            query = f"SELECT friend_lists FROM users WHERE username = '{friend}'"
                            friend_output = (await retrieve_database(query))[0][0]
                            
                            
                            if friend in user_output:
                                del user_output[friend]

                            
                            if username in friend_output:
                                del friend_output[username]
                            
                            # users_directory[friend]={}
                            
                            jsn = json.dumps(user_output)

                            query = "UPDATE users SET friend_lists = %s::json WHERE username = %s"
                            params = (jsn, username)
                            await update_database(query, params, return_id = False)

                            jsn = json.dumps(friend_output)

                            query = "UPDATE users SET friend_lists = %s::json WHERE username = %s"
                            params = (jsn, friend)
                            await update_database(query, params, return_id = False)

                            query = "DELETE FROM messages WHERE uname_1 IN (%s, %s) AND uname_2 IN (%s, %s)"
                            params = (username, friend, username, friend)
                            await update_database(query, params, return_id = False)
                            

                            await users_directory[username]["friends"].update_friends(user_output)

                            if friend in users_directory:
                                await users_directory[friend]["friends"].update_friends(friend_output)


                            if "message" in users_directory[username]:
                                del users_directory[username]["message"]._messages[friend]
                                del users_directory[username]["message"]._ai_prompts[friend]

                            await websocket.send_json({"Type":"friend_req","status":"deleted", "from": friend})
                            return
                    
                      
                    if message["send"] == "acc_friend_req":
                        friend = message["of"]

                        user_friend_lock = await get_friend_lock(username)
                        friend_friend_lock = await get_friend_lock(friend)
            
                        async with user_friend_lock, friend_friend_lock:
                            if friend == username:
                               await websocket.send_json({"Error": "Access Denied"})
                               return

                            query = f"SELECT friend_lists FROM users WHERE username = '{username}'"
                            user_output = (await retrieve_database(query))[0][0]
                        
                            if friend in user_output and user_output[friend] == "requested":
                               user_output[friend] = "accepted"
                            else:
                               await websocket.send_json({"Error": "Access Denied"}) 
                               return
                          


                            query = f"SELECT friend_lists FROM users WHERE username = '{friend}'"
                            friend_output = (await retrieve_database(query))[0][0]

                            if username in friend_output and friend_output[username] == "pending":
                                friend_output[username] = "accepted"
                            else:
                                await websocket.send_json({"Error": "Access Denied"}) 
                                user_output[friend] = "requested"
                                return
                         

                            jsn = json.dumps(user_output)
                        
                            query = "UPDATE users SET friend_lists = %s::json WHERE username = %s"
                            params = (jsn, username)
                            await update_database(query, params, return_id = False)


                            jsn = json.dumps(friend_output)

                            query = "UPDATE users SET friend_lists = %s::json WHERE username = %s"
                            params = (jsn, friend)
                            await update_database(query, params, return_id = False)
                            
                            await users_directory[username]["friends"].update_friends(user_output)
                            if friend in users_directory:
                                await users_directory[friend]["friends"].update_friends(friend_output)
                   
                            #  = await retrieve_database(f"SELECT user_id FROM users WHERE username = '{friend}'")[0][0]
                            query = "INSERT INTO messages (uname_1, uname_2, messages) VALUES (%s, %s, %s::json)"
                            params = (username, friend, json.dumps([]))
                            await update_database(query, params, return_id=False)


                            await websocket.send_json({"Type":"friend_req", "status":"accepted", "of": friend})
                        return

                    if message["send"] == "Message":
                      
                      friend = message["to"]
                      if friend not in users_directory[username]["friends"].friends():
                         return

                      # print(users_directory[username]["friends"].friends())
                      user_message_lock = await get_friend_lock(username)
                      friend_message_lock = await get_friend_lock(friend)
            
                      async with user_message_lock, friend_message_lock:
                
                        chats = json.dumps(message["chats"])
                   
                        current = datetime.datetime.now(datetime.timezone.utc)
                        current = current.strftime('%Y-%m-%d %H:%M:%S.%f')
                        
                        usr_msg = users_directory[username]["messages"].messages()
                        
                        usr_prompt = users_directory[username]["messages"]._ai_prompts
                        length = len(usr_msg[friend])
                        
                        _id = 0
                        if length != 0:
                           _id = usr_msg[friend][0]["id"] + 1
                        
                        # await 
                        ids = []
                        for k in reversed(message["chats"]):
                           k["id"] = _id
                           ids.append(_id)
                           k["time"] = current
                           _id = _id + 1  

                           if k["font"]:
                             usr_prompt[friend].append({"sender": k["sender"], "message": k["font"]["text"] })
                           
                        usr_msg[friend][:0] =  message["chats"]   
                       
                        # print(users_directory[username]["messages"].messages())
                        

                        if friend in users_directory:
                          frd_msg = users_directory[friend]["messages"].messages()
                          frd_prompt = users_directory[friend]["messages"]._ai_prompts
                          frd_msg[username] = usr_msg[friend]
                          frd_prompt[username] = usr_prompt[friend]



                        chats_str = json.dumps(message['chats'])
                        print(chats_str)

                        query = """
                            UPDATE messages 
                            SET messages = %s::jsonb || messages::jsonb 
                            WHERE (uname_1 IN (%s, %s) AND uname_2 IN (%s, %s))
                        """ 

                        params = (chats_str, username, friend, username, friend)
                        await update_database(query, params, return_id = False)
                        
                        if friend in users_directory and users_directory[friend]["friends"]._msg_updates:
                            send_msg = {"Type": "message_recieved", "sender": username, "to": friend, "chats": message['chats'], "updated_on": str(current)}
                            await users_directory[username]['friends'].send_message(send_msg)
                        
                  
                        await websocket.send_json({"Type": "message_sent", "to": message["to"], "id's":ids, "updated_on": str(current)})
                    
                    if message["send"] == "delete_messages":
                        friend = message["uname"]
                        if friend not in users_directory[username]["friends"]._friends:
                            return
                        
                        usr_msg = users_directory[username]["messages"].messages()
                        usr_prompt = users_directory[username]["messages"]._ai_prompts

                        usr_msg[friend] = []
                        usr_prompt[friend] = []

                        query = """
                            UPDATE messages 
                            SET messages = %s::jsonb
                            WHERE (uname_1 IN (%s, %s) AND uname_2 IN (%s, %s))
                        """ 

                        params = (json.dumps([]), username, friend, username, friend)
                        await update_database(query, params, return_id = False)
                        
                          

                        users_directory[username]["friends"]._msg_updates = False

                        if friend in users_directory:
                            users_directory[friend]["friends"]._msg_updates = False
                            send_msg = {"Type": "messages_deleted", "sender": username, "to": friend, "updated_on": "null"}
                            await users_directory[username]['friends'].send_message(send_msg)
                            
                            frd_msg = users_directory[friend]["messages"].messages()
                            frd_prompt = users_directory[friend]["messages"]._ai_prompts
                            frd_msg[username] = usr_msg[friend]
                            frd_prompt[username] = usr_prompt[friend]
                            
                  
                        await websocket.send_json({"Type": "messages_deleted", "updated_on": "null"})


                elif "update" in message:

                        if message["update"] == "profileImg":
       
                           base64_string = message["base64_string"]
                           current = datetime.datetime.now(datetime.timezone.utc)
                           current = current.strftime('%Y-%m-%d %H:%M:%S.%f')

                           query = "UPDATE images SET base64_string = %s WHERE user_id = %s;"
                           params = (base64_string, users_directory[username]['id'])
                           await update_database(query, params, return_id = False)

                           query = "UPDATE user_updates SET profile_img = %s WHERE user_id = %s;"
                           params = (str(current), users_directory[username]['id'])
                           await update_database(query, params, return_id = False)
                           
                           updates = {"Type": "profileImg", "profile_pic": base64_string, "uname": username, "name": users_directory[username]["name"], "last_seen": str(current), "updated_on":  str(current) }    
                           await users_directory[username]['friends'].update_profile_details(updates)
                           
                           await websocket.send_json(updates)
                           await websocket.send_json({"Type": "image_update", "status": "successful", "updated_on":  str(current) })
                           return


                        if message["update"] == "profileName":

                           current = datetime.datetime.now(datetime.timezone.utc)
                           current = current.strftime('%Y-%m-%d %H:%M:%S.%f')

                           query = "UPDATE users SET full_name = %s WHERE user_id = %s;"
                           params = (message['name'], users_directory[username]['id'] )
                           await update_database(query, params, return_id = False)

                           query = f"UPDATE user_updates SET full_name = '{str(current)}' WHERE user_id = {users_directory[username]['id']};"
                           
                        #    updates = {"name": message["name"], "uname": uname, "updated_on": str(current) }
                           
                           updates = {"Type": "profileDetails", "uname": username, "name": message["name"], "last_seen": str(current), "updated_on":  str(current) }    
                           await users_directory[username]['friends'].update_profile_details(updates)
                           
                           await websocket.send_json(updates)
                           await websocket.send_json({"Type":"name_update", "status": "successful"})
                           return

                        
                        if message["update"] == "last_seen":
                                                    
                            def is_friends(json_obj):
                                if message["uname"] in json_obj and json_obj[message["uname"]] == 'accepted':
                                  return True
                                else:
                                  return False
                        
                            # print(users_directory[username]["friends"].friends())
                            friends = is_friends(users_directory[username]["friends"].friends())
                            
                            if not friends:
                                await websocket.send_json({"Error": "Access Denied"})
                                return
                            
                            query = f"SELECT last_seen FROM users, user_updates WHERE users.username = '{message['uname']}' AND users.user_id = user_updates.user_id;"
                            output = (await retrieve_database(query))[0][0]

                            await websocket.send_json({"Type":"last_seen", "time": str(output), "user": message['uname']})
                            return

                        if message["update"] == "messages":
                            friends = users_directory[username]["friends"].friends()
                            chats = {}
                            
                            for e in message["friends_data"]:
                                if e['friend'] in friends and friends[e['friend']] == 'accepted':
                                    
                                    query = f"""
                                        SELECT * from messages
                                        WHERE uname_1 IN ('{username}', '{e["friend"]}') AND uname_2 IN ('{username}', '{e["friend"]}')        
                                    """
                                    msg = await retrieve_database(query)
                                    users_directory[username]["friends"]._msg_updates = True
                                    maxTranslateY = 0
                                    if msg: 
                                        
                                        agg_msg = []
                                        updated_on = e["updated_on"]
                                        if updated_on != "null":
                                           updated_on = datetime.datetime.strptime(updated_on, '%Y-%m-%d %H:%M:%S.%f')
                                           for m in msg[0][3]:
                                                if m["transform"]["translateY"] > maxTranslateY:
                                                   maxTranslateY = m["transform"]["translateY"] 
                                                msg_time = datetime.datetime.strptime(m['time'], '%Y-%m-%d %H:%M:%S.%f')
                                                if msg_time > updated_on:
                                                    agg_msg.append(m)
                                                else:
                                                    break
                                        else:
                                           for m in msg[0][3]:
                                                if m["transform"]["translateY"] > maxTranslateY:
                                                   maxTranslateY = m["transform"]["translateY"] 
                                                agg_msg.append(m)

                                     
                                        chats[e['friend']] = {}
                                        chats[e['friend']]['Messages'] = agg_msg

                                        n_updated_on = msg[0][3][0]['time'] if len(msg[0][3]) > 0 else 'null'
                                        chats[e['friend']]['updated_on'] = n_updated_on
                                        chats[e['friend']]['maxTranslateY'] = maxTranslateY
                                        length = len(msg[0][3])
                                        started_on = "null"
                                        if length != 0:
                                            started_on = msg[0][3][length - 1]["time"]
                                        
                                        chats[e['friend']]['started_on'] = started_on
                            # send_msg = {"Type": "message_recieved", "sender": username, "to": friend, "chats": message["chats"], "updated_on": str(current)}
                            print(chats)
                            await websocket.send_json({"Type" : "update_messages", "chats" : chats}) 
                            return
                
                elif "generate" in message:
                    if message["generate"] == "AI Request":
                        
                        prompt = users_directory[username]["messages"]._ai_prompts[message["friend"]]
                        ai_engine = users_directory[username]["ai_engine"]
                        print(message)

                        if len(ai_engine.current_process)>0 and not ai_engine.current_process[len(ai_engine.current_process)-1].is_set():
                                print("\nTerminating current stream")
                                ai_engine.current_process[len(ai_engine.current_process)-1].set()

                        if "terminate" in message:
                                await websocket.send_json({"Type": "ai_generated", "stream": "<terminate>"})
                                return
                        # print(current_thread)
                            
                        if message["Type"] == "completion":
                            agg_prompt = []
                            for msg in message['input']:
                               agg_prompt =  agg_prompt + [{"sender":username, "message": msg}]

                            agg_prompt = prompt + agg_prompt
                            print(agg_prompt)
                            # thread = threading.Thread(target=generate_response, args=(agg_prompt, chat_engine,  message["Type"], websocket ))
                            await generate_response(agg_prompt, ai_engine, message["Type"], websocket)
                            return
                        else:
                            return 
                        
                      
                            
                                                                    
                            
                            
