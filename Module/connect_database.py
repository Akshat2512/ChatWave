# import psycopg2, os


# def CONNECT_DB():
#     # connection = psycopg2.connect("postgres://postgres:password@localhost:5432/verceldb")
#     connection = psycopg2.connect(os.getenv('POSTGRES_URL'))
#     return connection

# def retrieve_database(query):
   
#     connection = CONNECT_DB()

#     cursor = connection.cursor()
#     cursor.execute(query)
#     output = cursor.fetchall()
   
#     cursor.close()
#     connection.close()
#     return output


# def update_database(query, params, return_id=False):
#     connection = CONNECT_DB()
#     connection.autocommit = True
#     cursor = connection.cursor()
    
#     try:
#         # Execute the query (insert or update)
#         cursor.execute(query, params)
#         # If return_id is True, fetch the msg_id
#         if return_id:
#             msg_id = cursor.fetchone()[0]
#         else:
#             msg_id = None
        
#     except Exception as e: 
#         print(f"An error occurred: {e}")
#         msg_id = "An error occurred"
    
#     finally:
#         cursor.close()
#         connection.close()
    
#     return msg_id

# CREATE TABLE users (  
#               id SERIAL PRIMARY KEY ,
#               first_name VARCHAR(30), 
#               middle_name VARCHAR(30), 
#               last_name VARCHAR(30), 
#               age INT, 
#               phone BIGINT, 
#               email VARCHAR(30), 
#               country VARCHAR(5), 
#               username VARCHAR(30), 
#               passhash VARCHAR, 
#               salt VARCHAR,
#               sess_id VARCHAR,
#               sess_start TIMESTAMP);


from concurrent.futures import ThreadPoolExecutor
import psycopg2
import asyncio
import os

# ThreadPoolExecutor for blocking operations
executor = ThreadPoolExecutor(max_workers=10)  # Tune max_workers as needed

def CONNECT_DB():
    connection = psycopg2.connect(os.getenv('POSTGRES_URL'))
    return connection

# Offload database retrieval to a thread
async def retrieve_database(query):
    def async_retrieve_database():
        connection = CONNECT_DB()
        cursor = connection.cursor()
        cursor.execute(query)
        output = cursor.fetchall()
        cursor.close()
        connection.close()
        return output

    # Offload the query to ThreadPoolExecutor
    result = await asyncio.get_event_loop().run_in_executor(executor, async_retrieve_database)
    return result

# Offload database updates to a thread
async def update_database(query, params, return_id=False):
    def async_update_database():
        connection = CONNECT_DB()
        connection.autocommit = True
        cursor = connection.cursor()
        try:
            cursor.execute(query, params)
            if return_id:
                return cursor.fetchone()[0]
        except Exception as e:
            print(f"An error occurred: {e},\n {query, params}")
            return "An error occurred"
        finally:
            cursor.close()
            connection.close()

    # Offload the update to ThreadPoolExecutor
    result = await asyncio.get_event_loop().run_in_executor(executor, async_update_database)
    return result