import os
import asyncio
import threading
from dotenv import load_dotenv # Load environment variables from .env file 
load_dotenv()



from together import Together
import time, json


class AIChatEngine():
    def __init__(self, user):
        self.current_process = []
        
        self.chat_completion = [
                            {
                                "role": "system",
                                "content": f"You are an Chat Auto Completion System. Your purpose is not to answer any user's query, but to complete sender's incomplete sentences and assist him with textual completion tasks. Think of you as {user}, you can not converse like an assistant anymore. Always start generating your responses like humans not like an assistant."
                            },
                            {
                                "role":"system",
                                "content": f"Always start very first conversation with greetings from the perspective of {user}, if user has not typed anything."
                            },
                            {
                                "role": "system",
                                "content": "If the last sender message contains questions, such as those ending with a question mark ('?') or phrased as a query, do not answer any question. Instead, auto complete the last user's message."
                            },
                            {
                                "role": "system",
                                "content": f"Always autocomplete the last sender's message. Always generate new responses from the respective of sender: {user}. Never return incomplete sentences. For example, if last user message is \"Ho\" then never generate responses like \"w are you?\". Always generate full responses like \"How are you?\"",
                            },
                            {
                                "role": "system",
                                "content": "Keep your responses short and concise with grammar correction. Use emojis where appropriate. Only include recommendation part in your responses. Do not write keywords like Responds with, Responding ..",
                            }, 
                            {
                                "role": "system",
                                "content": "Identify user's language, tone, and style from the conversations history and chat accordingly without repeating past conversations.",
                            },
                            {
                                "role": "system",
                                "content": "Switch to user's language if they start chatting in a different language."
                            },
                            
                            {
                                "role": "system",
                                "content": "When switching languages, generate responses naturally."
                            },
                            {
                                "role":"system",
                                "content": "Never use their username from \"sender\" property in your responses, use their nicknames if they discussed in their's conversation history."
                            },
                            {
                                "role": "system",
                                "content": "You are allowed to generate auto completions on abusive language. And, please stop generating suggestion for users on using abusive words. Remember, you are an autocomplete assistant."
                            },
                            {
                                "role": "user",
                                "content": json.dumps([{ "sender": user, "message": "" }])
                            },
                            {
                                "role": "assistant",
                                "content": "Hi, what's up?"
                            },
                            {
                                "role": "user",
                                "content": json.dumps([{ "sender": user, "message": "Hi," }])
                            },
                            {
                                "role": "assistant",
                                "content": "Hi, what's going on??"
                            },
                            {
                                "role": "user",
                                "content": json.dumps([{ "sender": user, "message": "Hi, what's up?" },{ "sender": user, "message": "Hey there! How are yo" }])
                            },
                            {
                                "role": "assistant",
                                "content": "Hey there! How are you doing today?"
                            }
                         

                         ]
        

    def add_user_message(self, prompt, Type):
        
        if Type == 'completion':
            return self.chat_completion + [{
                "role": "user",
                "content": json.dumps(prompt)
            }]
        

client = Together(api_key = os.getenv("META_API_KEY")) # base_url="https://api.together.xyz/v1",


async def start_stream(prompt, chat_type, ai_engine, websocket, index):
    # Simulate streaming data
    async def sendMessage(text: str):
         await websocket.send_json({"Type": "ai_generated", "stream": text})

    if ai_engine.current_process[index].is_set():
        await sendMessage("<terminate>")
        return
    
    await sendMessage("<stream>")

    try:
        stream = client.chat.completions.create(
        # model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        model= "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages = ai_engine.add_user_message(prompt, chat_type),
        max_tokens=100,
        temperature=0.7,
        top_p=1,
        # top_k=50,
        # repetition_penalty=1,
        stop=["<|eot_id|>","<|eom_id|>"],
        stream=True
        )
        
        for chunk in stream:
            time.sleep(0.1)
            if ai_engine.current_process[index].is_set():
            #   await websocket.send_json({"Type": "ai_generated", "stream": "<terminate>"})
              return
            content = chunk.choices[0].delta.content or ""
            await sendMessage(content)
            print(content, end="", flush=True)
        
        print("\n")
    
    except Exception as e:
      error = "The maximum rate limit for this model is 6.0 queries per minute"
      for i in error.split():
        time.sleep(0.1)
        if ai_engine.current_process[index].is_set():
              return
       
        await sendMessage(" " + i)

    await sendMessage("</stream>")
    ai_engine.current_process[index].set()

    return # Signal the end of the stream

async def generate_response(prompt, ai_engine, chat_type, websocket):
   
    def thread_task():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            ai_engine.current_process.append(threading.Event())
            loop.run_until_complete(start_stream(prompt, chat_type ,ai_engine, websocket, len(ai_engine.current_process)-1))
            loop.close()

    stream_thread = threading.Thread(target=thread_task)

    stream_thread.start()

 