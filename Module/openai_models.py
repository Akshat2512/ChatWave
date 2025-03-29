import os
import asyncio
import threading
from dotenv import load_dotenv # Load environment variables from .env file 
load_dotenv()


# print(generate_response(prompt_1, API_KEY, AIRoles()))
# threading.Thread(target=generate_response, args=(prompt_1, API_KEY, AutoCompletion())).start()


# import time
# time.sleep(2)  # Wait for a short period to simulate retriggering
# print("\nSecond request starts...")
# threading.Thread(target=generate_response, args=(prompt_2, API_KEY, AIRoles())).start()

# from gradio_client import Client
# # import gradio as gr
# # client = Client("KingNish/Realtime-FLUX")
# # result = client.predict(
# # 		prompt="generate an image of a dog",
# # 		seed=42,
# # 		width=1024,
# # 		height=1024,
# # 		randomize_seed=True,
# # 		num_inference_steps=1,
# # 		api_name="/generate_image_1"
# # )
# # print(result[0])

# client = Client("KingNish/OpenCHAT-mini2")
# result = client.predict(
# 		message={"text":"Hello","files":[]},
# 		api_name="/chat"
# )
# # print(gr.State())
# # print(result)



from together import Together
import time, json


class AIChatEngine():
    def __init__(self, user):
        self.current_process = []
        self.chat_recommendation = [
                {
                    "role": "system",
                    "content": "You are a Chat Recommendation System.",
                },
                {
                    "role": "system",
                    "content": "Keep responses short, concise, and within 10–12 words. Use emojis where appropriate. Only include recommendation part in your responses. Do not write keywords like Responds with, Responding ..",
                }, 
                {
                    "role": "system",
                    "content": "Identify user's language, tone, and style from conversation context and chat accordingly.",
                },
                {
                    "role": "system",
                    "content": f"Do not auto complete the previous conversations. Always generate new responses from the respective of {user}.",
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
                    "role": "user",
                    "content": json.dumps({ "sender": user, "message": "Hey there! How are you doi" })
                },
                {
                    "role": "assistant",
                    "content": "What do you mean by \"doi\"?"
                }
           ]
        
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

# def start_stream(prompt, pipe):
        
#         pipe.send("<stream>")
        
#         # stream = client.chat.completions.create(
#         # # model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
#         # model= "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
#         # messages = prompt,
#         # max_tokens=100,
#         # temperature=0.7,
#         # top_p=1,
#         # # top_k=50,
#         # # repetition_penalty=1,
#         # stop=["<|eot_id|>","<|eom_id|>"],
#         # stream=True
#         # )
#         # pipe.send("<stream>")
#         # for chunk in stream:  
#         #     time.sleep(0.1)
#         #     content = chunk.choices[0].delta.content or ""
#         #     pipe.send(content) 
#         #     # print(content, end="", flush=True)
#         pipe.send("</stream>")
#         pipe.send(None)  # Signal the end of the stream
#         pipe.close()     

# async def generate_response(prompt, ai_engine, chat_type, websocket):
#     # loop = asyncio.get_event_loop()
 
#     await websocket.send_json({"Type":"ai_generated", "stream":"<stream>"})
#     pipe_end, pipe_start = multiprocessing.Pipe()
        
#     await asyncio.sleep(0)
#     new_process = multiprocessing.Process(target = start_stream, args=(ai_engine.add_user_message(prompt, chat_type), pipe_start))
#     new_process.start()
 
#     ai_engine.current_process = new_process

#     while True:

#         if pipe_end.poll():
#             result = pipe_end.recv()  # Receive data from the child process
#             if result is None:  # Check if the stream is finished
#                 break
#             await websocket.send_json({"Type":"ai_generated", "stream":result})
#         await asyncio.sleep(0)

    # start_stream(stream, websocket)
    

# threading.Thread(target=generate_response, args=(prompt_1, ChatRecommendation())).start()

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
    # time.sleep(1)  # Simulate some processing
    await sendMessage("</stream>")
    ai_engine.current_process[index].set()

    return # Signal the end of the stream

async def generate_response(prompt, ai_engine, chat_type, websocket):
    # Simulated pipe using a thread-safe list
    # pipe = []
    # pipe_lock = threading.Lock()

    # Thread to handle the start_stream function
    def thread_task():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            ai_engine.current_process.append(threading.Event())
            loop.run_until_complete(start_stream(prompt, chat_type ,ai_engine, websocket, len(ai_engine.current_process)-1))
            loop.close()

    stream_thread = threading.Thread(target=thread_task)

    stream_thread.start()

    # while True:
    #     with pipe_lock:
    #         if pipe:
    #             result = pipe.pop(0)  # Retrieve data from the "pipe"
    #             if result is None:  # Check if the stream is finished
    #                 break
    #             await websocket.send_json({"Type": "ai_generated", "stream": result})
    #     await asyncio.sleep(0.1)

    # stream_thread.join()  



# def start_stream(prompt, pipe):
#     # Simulate streaming data
#     pipe.append("<stream>")
#     time.sleep(0.1)
    
#     stream = client.chat.completions.create(
#     # model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
#     model= "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
#     messages = prompt,
#     max_tokens=100,
#     temperature=0.7,
#     top_p=1,
#     # top_k=50,
#     # repetition_penalty=1,
#     stop=["<|eot_id|>","<|eom_id|>"],
#     stream=True
#     )
#     # pipe.send("<stream>")
#     for chunk in stream:  
#         time.sleep(0.1)
#         content = chunk.choices[0].delta.content or ""
#         pipe.append(content) 
#         # print(content, end="", flush=True)
#     time.sleep(1)  # Simulate some processing
#     pipe.append("</stream>")
#     pipe.append(None)  # Signal the end of the stream




# async def generate_response(prompt, ai_engine, chat_type, websocket):
#     # Simulated pipe using a thread-safe list
#     pipe = []
#     pipe_lock = threading.Lock()

#     await websocket.send_json({"Type": "ai_generated", "stream": "<stream>"})
    
#     loop = asyncio.get_event_loop()
#     executor = ThreadPoolExecutor(max_workers=1)
#     future = await loop.run_in_executor(
#             executor,
#             start_stream,
#             ai_engine.add_user_message(prompt, chat_type),  # Arguments for start_stream
#             pipe,
#         )
#     ai_engine.current_process = executor

#     # Process data from pipe asynchronously
#     while True:
#         with pipe_lock:
#             if pipe:
#                 result = pipe.pop(0)  # Retrieve data
#                 if result is None:  # End of stream
#                     break
#                 await websocket.send_json({"Type": "ai_generated", "stream": result})
#         await asyncio.sleep(0.1)




# import asyncio

# # Define an asynchronous start_stream function
# async def start_stream(prompt, pipe):
#     try:
#         await pipe.put("<stream>")
#         # # Simulate streaming data from an API
#         # for i in range(5):  # Simulate 5 chunks of data
#         #     await asyncio.sleep(0.5)  # Simulate async delay
#         #     chunk_content = f"Chunk {i}"  # Simulated streamed content
#         #     await pipe.put(chunk_content)
#         #     print(f"Streamed: {chunk_content}")

#         # await pipe.put("</stream>")
#         # await pipe.put(None)  # Signal the end of the stream
#         stream = client.chat.completions.create(
#         # model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
#         model= "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
#         messages = prompt,
#         max_tokens=100,
#         temperature=0.7,
#         top_p=1,
#         # top_k=50,
#         # repetition_penalty=1,
#         stop=["<|eot_id|>","<|eom_id|>"],
#         stream=True
#         )
#         # pipe.send("<stream>")
#         for chunk in stream:  
#             await asyncio.sleep(0.1)
#             content = chunk.choices[0].delta.content or ""
#             await pipe.put(content) 

#     except asyncio.CancelledError:
#         print(f"Stream Cancelled!")
#         raise

# # Asynchronous function to generate responses
# async def generate_response(prompt, ai_engine, chat_type, websocket):
#     # Simulated pipe using an asyncio.Queue
#     pipe = asyncio.Queue()

#     await websocket.send_json({"Type": "ai_generated", "stream": "<stream>"})

#     # Cancel the previous task if it's still running
#     if ai_engine.current_process and not ai_engine.current_process.done():
#         print("Canceling previous task...")
#         ai_engine.current_process.cancel()
#         try:
#             await ai_engine.current_process  # Wait for the cancellation
#         except asyncio.CancelledError:
#             print("Previous task canceled successfully.")

#     # Create and track the new task
#     ai_engine.current_process = asyncio.create_task(start_stream(ai_engine.add_user_message(prompt, chat_type), pipe))

#     # Process data from the pipe asynchronously
#     while True:
#         result = await pipe.get()  # Asynchronously retrieve data from the pipe
#         if result is None:  # Check for end of the stream
#             break
#         await websocket.send_json({"Type": "ai_generated", "stream": result})

