from fastapi import WebSocket,WebSocketDisconnect, FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from Module.connect_database import retrieve_database, update_database
from Module.services import handle_messages
from Module.openai_models import AIChatEngine

import hashlib
import binascii

import numpy as np
import io
import uvicorn

import time, wave
import asyncio
import json
import os

import datetime

import jwt

# import traceback
import logging
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

# from dotenv import load_dotenv # Load environment variables from .env file 
# load_dotenv()

app = FastAPI()

origins = [
    "*",
    # "http://192.168.31.72:8081",  # Your React Native app's origin
    # "http://localhost:8081",       # Local development
    # Add any other origins you want to allow
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],               # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],               # Allow all headers
)


SECRET_KEY = os.getenv("SECRET_KEY")

def encrypt_password(password, salt):
    # password = password
    if(salt==None):
     salt = os.urandom(1000)  
    
    salted_password = salt+password.encode()
    hashed_password = hashlib.sha256(salted_password).hexdigest()
    salt = binascii.hexlify(salt).decode()

    return hashed_password, salt

def unhex(salt):
    salt = binascii.unhexlify(salt)
    return salt

   
invalidated_tokens = set()


def create_token(username: str, expires_in: int):
       payload = {
           "username": username,
           "exp": time.time() + expires_in # Token expires in 1 hour
       }
       return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: str):
    if token in invalidated_tokens:
        raise HTTPException(status_code=401, detail="Token has been invalidated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["username"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


    # def add_assistant_message(self, prompt):
    #     self.messages.append({
    #         "user_id": "assistant",
    #         "content": message
    #     })






# app.mount("/static", StaticFiles(directory="static"), name="static")  
# templates = Jinja2Templates(directory="templates")


# @app.get("/", response_class=HTMLResponse) 
# async def get(request: Request): 
#     return templates.TemplateResponse("index.html", {"request": request})

@app.post("/user")
async def checkUser(request: Request):
    response = await request.json()
    username = response.get("User").lower()
    output = await retrieve_database(f"SELECT * FROM users WHERE username = '{username}'")
    if output:
        return {"user":"exist"}
    # if response.get("User").lower() in users_directory:
    #  return {"user":"exist"}
    else:
      return {"user":"not exist"}

@app.post("/auth")
async def authenticate(request: Request):
    response = await request.json()
    # await retrieve_database(f"SELECT * FROM users WHERE username = '{user}'")
    user = response.get('user').lower()
    pwd = response.get("pwd")
    # print(user, pwd)
    output = await retrieve_database(f"SELECT * FROM users WHERE username = '{user}'")
    if output:
        if(output[0][2] == pwd):
            print(output[0][2])
            token = create_token(user, expires_in=60) 
            return {"status": "success", "token": token}

        else:
            return {"status": "failed", "error": "Password is incorrect"}

    else:  
       return {"status": "failed", "error": "Username not exist"}



@app.post("/create")
async def createUser(request: Request):
    response = await request.json()
    
    name = response.get("name")
    user = response.get('user').lower()
    pwd = response.get("pwd")
    b64_data = response.get("profile_img")
    created_on = datetime.datetime.now(datetime.timezone.utc)

    print(user, pwd ,name, created_on)

    
    if len(user) < 5 or len(pwd) < 5:
        return {"account": "Account creation failed"}

    checkUser = await retrieve_database(f"SELECT * FROM users WHERE username = '{user}'")
    if checkUser:
        return {"account":"Account already exists"}
        
    


    insert_data = {"username": user, "password": pwd, "full_name":name,  "created_on": created_on, "privacy":"public", "friend_lists": json.dumps({}), "group_ids": json.dumps({})}
    # print(list(insert_data.keys()))
    query = """
                INSERT INTO users (username, password, full_name, created_on,  privacy, friend_lists, group_ids) VALUES (
                 %s, %s, %s, %s, %s, %s::json, %s::json) RETURNING user_id
            """
    params = (
              insert_data['username'], 
              insert_data['password'], 
              insert_data['full_name'], 
              insert_data['created_on'], 
              insert_data['privacy'],
              insert_data['friend_lists'],
              insert_data['group_ids']
              )
    
    output = await update_database(query, params, return_id = True)

    if output == "An error occurred":
        # print(output)          
        return {"account":"Account creation failed"}
    
    query = """
                INSERT INTO user_updates ( user_id, full_name, profile_img, last_seen, messages) VALUES ( %s, %s, %s, %s, %s )
            """
    
    params = (output, insert_data['created_on'], insert_data['created_on'], insert_data['created_on'], insert_data['created_on'])
    
    await update_database(query, params, return_id = False)
    
    query =     """
                    INSERT INTO images (user_id, base64_string)
                    VALUES (%s, %s) RETURNING img_id
                """
    params = (output, b64_data)
    await update_database(query, params, return_id = True)                        
    return {"account":"Account successfully created"}
    
    # if user not in users_directory and len(pwd) >= 5:
    #     users_directory[user] = {"password": pwd, "profile_img": img } 
    #     return {"account":"Account successfully created"}

    # else:
    #     return {"account":"Account creation failed"}
    
class FriendsDirectory:
    def __init__(self, username, data):
        self._friends = data
        self._username = username
        self._msg_updates = False

    def friends(self): 
        return self._friends
    
    async def update_friends(self, friends):
        self._friends = friends
        
        try:
            ws = users_directory[self._username]["websocket"]
            await ws.send_json({"Type":"notification", "update":"Update Friend Tab"})

        except Exception as e:
          print(e)

        print("Friends list has been updated!")
     
    async def update_profile_details(self, data):
        try:
            for k, v in self._friends.items():
                if k in online_users and v == 'accepted':
                    ws = users_directory[k]["websocket"]
                    await ws.send_json(data)


        except Exception as e:
            print(e)
            logger.info(traceback.format_exc())
        print("Updates sent to friends!")

    

    async def send_message(self, data):
        print(self._friends)
        try:
            for k, v in self._friends.items():
                if k in online_users and k == data["to"] and v == 'accepted':
                    ws = users_directory[k]["websocket"]
                    await ws.send_json(data)


        except Exception as e:
            print(e)
            logger.info(traceback.format_exc())
        print("Updates sent to friends!")


    
class MessageDirectory:
    def __init__(self, username, data, prompts):
 
        self._messages = data
        self._ai_prompts = prompts
        self._username = username

    def messages(self): 
        return self._messages



online_users = []


message_directory = { }

users_directory = { }    # maintain users database or their chat history in their where each key represents the username



async def update_user_directory(username, websocket: WebSocket): 
    output = await retrieve_database(f"SELECT * FROM users WHERE username = '{username}'")
    messages = await retrieve_database(f"SELECT * FROM messages WHERE uname_1 = '{output[0][1]}' OR uname_2 = '{output[0][1]}'")
    
    # print(messages)
    friends_msg = {}
    prompts = {}

    for index, e in enumerate(messages):   # creating dictionary of user chats 
        if e[1] != output[0][1]:
            friends_msg[e[1]] = messages[index][3]
            prompts[e[1]] = []
            for item in reversed(messages[index][3]):
               if item["font"]:
                 prompts[e[1]].append({"sender":item["sender"], "message": item["font"]["text"]})
        else:
            friends_msg[e[2]] = messages[index][3]
            prompts[e[2]] = []
            for item in reversed(messages[index][3]):
               if item["font"]:
                 prompts[e[2]].append({"sender":item["sender"], "message": item["font"]["text"]})



    # print(output)                                                                     // friend and user -> ref
    users_directory[username] = { 
                                        "websocket": websocket,
                                        "id":output[0][0],
                                        "uname": output[0][1],
                                        "name": output[0][3],
                                        "created_on":output[0][4],
                                        "privacy":output[0][5],
                                        "friends": FriendsDirectory(username, output[0][6]),
                                        "messages": MessageDirectory(username, friends_msg, prompts),
                                        "ai_engine": AIChatEngine(username),
                                        "groups": output[0][7],

                                }
   


@app.websocket('/ws/{token}')     # will be responsible for handling real time stream of audio chunks and all AI generated responses will be sent to the streamer client 
async def chat(websocket: WebSocket, token: str):
    try:
        username = verify_token(token)
        invalidated_tokens.add(token)
        # chat_history = users_directory[user_id]    # creates an instance of the ChatHistory class and each user will have their own instance of ChatHistory
        
        await websocket.accept()

        if username not in online_users:
           online_users.append(username)
          
        await update_user_directory(username, websocket)
        
       
    # audio_queue = asyncio.Queue()
    # response_queue = asyncio.Queue()
    # process_task = asyncio.create_task(process_audio_stream(audio_queue, response_queue))   # It will create asynchrounous task to handle audio_queue in the background, detect speeches in the audio_queue using pre trained Model and add it to response_queue
    
        async def load_and_handle_messages():
            while True:
                try:
                    message = await load_messages(websocket, username)
                    # print(message)
                    if message:
                        asyncio.create_task( handle_messages(websocket, message, username, users_directory, online_users))
                    
                    await asyncio.sleep(0.1)
                    
                except WebSocketDisconnect as e: 
                    print(f"Client disconnected: {e}")

                except Exception as e:
                    logger.info(f"Error: {e}")
                    logger.info(traceback.format_exc())
                    print("Websocket get disconnected")
                    if username in online_users:
                        online_users.remove(username)
                   
                    last_seen = datetime.datetime.now(datetime.timezone.utc)
                    last_seen = last_seen.strftime('%Y-%m-%d %H:%M:%S.%f')
                    params = (last_seen, users_directory[username]['id'])
                    await update_database("UPDATE user_updates SET last_seen = %s WHERE user_id = %s", params, return_id = False)
                   
                    if username in users_directory:
                        del users_directory[username]
                    break
        
        await load_and_handle_messages()

    except Exception as e:
          await websocket.close()
          raise HTTPException(status_code=401, detail="Websocket Connection rejected")


async def load_messages(websocket: WebSocket, username):  
    
        # message = await websocket.receive()   # receives the texts from clients
        try:
            message = await asyncio.wait_for(websocket.receive(), timeout=7.0)

            if "text" in message:
            #   print(message["text"])
              return json.loads(message["text"])
        except asyncio.TimeoutError:
            await websocket.close()
            if username in online_users:
               online_users.remove(username)
            raise WebSocketDisconnect("No data received for 7 seconds")
        

        




        # if "bytes" in message:
        #     with wave.open(io.BytesIO(message["bytes"]), 'rb') as wav_file:
                # print(wav_file.getframerate(), wav_file.getsampwidth(), wav_file.getnchannels(), wav_file.getnframes())
            
                # while True:
                #     audio_data = wav_file.readframes(1024)
            
                #     if not audio_data:
                #         break
                #     await audio_queue.put(audio_data)    
                # return None

     
            

    # except Exception as e:
    #     logger.info(e)
    #     print("Websocket gets Disconnected")
    #     return e
        
    