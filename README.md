
# AI-Based Chat App Overview
An AI-powered real-time chat application for Android users, designed to make communication social, engaging, and fun! Inspired by Instagram Stories, ChatWave offers features like AI-assisted messaging, stickers/GIFs sharing, and more.

📦 [Download APK file](https://github.com/Akshat2512/ChatWave/releases/download/v1.0-preview/AI-Chatwave-preview-version.apk)

**Note**: This app is not Google Play verified, so users may encounter a warning when installing it. Please proceed only if you trust this source.

## Features
- **Account**: Users can easily create and login their personal accounts.
<p align="center">
<img src="Extras/account.jpg" alt="Not found" style="height: 400px; width: 200px" >&nbsp&nbsp&nbsp
<img src="Extras/Login.gif" alt="Not found" style="height: 400px; width: 200px">
<br>
</p>

- **Real time updates**: Allows Real-time messaging and profile synchronization. Any updates to user details, such as name or profile image, are instantly reflected for connected users. User can see their friend's status in real time (whether they are currently online or when they were last active).

<p align="center">
<img src="Extras/Realtimemessage.gif" alt="Not found" style="height: 400px; width: 400px" >
<br>
</p>

- **Gif/Sticker Sharing**: Allows users to enhance their conversations by sharing GIFs or stickers effortlessly using a drag-and-drop interface. In gif search, on long pressing the gif or stickers user can add them in their Favourite section. 

https://github.com/user-attachments/assets/710047a8-c0a6-48e4-a92d-70afd47f623c

- **AI Chat Recommendations**: Integrates an advanced AI model that assists with conversations by analyzing user communication styles and personas.
<p align="center">
<img src="Extras/Ai_assists.gif" alt="Not found" style="height: 580px; width: 340px" >
</p>

- **Font Styling**: Enables users to change font styles.
<p align="center">
<img src="Extras/Fontstyles.gif" alt="Not found" style="height: 250px; width: 400px" >
</p>

- **Switch Theme**: User can switch between light and dark theme.
<p align="center">
<img src="Extras/Theme.gif" alt="Not found" style="height: 400px; width: 250px" >
</p>


## Tech Stack 🛠️
### Backend
- **Python FastAPI**: Framework for handling multiple user requests efficiently and manage multiple websocket connections on server side.
- **Websocket**: To handle Real Time messaging between users with robust server-client synchronization.

### Frontend
- **React Native or Expo Dev**: Frameworks for developing android, ios or web application
- **EAS Cli**: Continuous Integration and Continuous Delivery for creating production-ready application.

### Services
- **AI Integration**: Integrated TogetherAI's meta-llama/Llama-3.3-70B-Instruct-Turbo-Free model for AI assisted chat recommendation, ensuring conversational relevance and coherence.
- **Git/GitHub**: Utilized for version control, enabling efficient tracking of code changes, and supporting Continuous Integration/Deployment (CI/CD).
- **Giphy API service**: Utilized the Giphy API to retrieve public GIF URLs based on user input. This integration enhances user engagement by enabling users to search for specific GIFs, stickers, or emojis and share them seamlessly with their friends through API integration
- **Azure Web Service**: Hosted backend using Azure's Free SKU instance for CI/CD and public accessibility. Only allows 5 concurrent websocket connection at a time due to limited resource usage.
- **PostgreSQL Service (via Vercel)**: For maintaining data integrity and securely stores user-related data, including credentials and messages.

Below diagram shows how WebSocket server manages real-time, bidirectional communication between connected users, ensuring seamless message delivery via specific WebSocket URLs.

<p align="center">
<img src="Extras/websocket.drawio.png" alt="Not found" style="height: 450px; width: 700px"><br>
</p>

The image below demonstrates the database structure

<p align="center">
<img src="Extras/ERDiagram.drawio.png" alt="Not found" style="height: 850px; width: 700px"><br>
</p>




## Key Responsibilities and Achievements

### Design and Development
- Designed both architecture of the application, ensuring real time messaging and AI integration.
- Developed the front-end using frameworks like react native, expo dev, creating an intuitive and user-friendly interface
- Used FastAPI Framework and websocket to handle realtime messaging.
- Managed and optimized the backend processes to handle real-time user interactions efficiently.
- Implemented chat memory management feature for AI to read users conversations style or identify persona using their past conversations. 
- Ensured smooth communication between the UI and the AI models, reducing latency and improving performance.

### Memory Retention
 Chat conversations are managed both on server side using psql database and on client side using redux persists.

## Impact
- Improved UI/UX design, making the application user-friendly.



## Installation and Setup Instruction 🖥️
- ### Clone the Repository 
If you have a repository for your project, clone it using git: 
```bash
     git clone https://github.com/Akshat2512/Chatwave.git 
     cd Chatwave # move to the root folder of the application
```
Next, create a separate virtual environment for python dependencies
```bash
     python -m venv my_env &&
     my_env/Script/activate
```
Then install required libraries
```bash
     pip install -r requirements.txt
```

Then for starting application, first start the fastapi server i.e., app.py, run directly using this script in the terminal:
```bash
    uvicorn app:app --host localhost --port 5000 --reload
```

this, endpoint will accept all app requests Go to https://localhost:5000.

<!-- CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_on TIMESTAMP,
    privacy VARCHAR(7),
    friend_lists JSON,
    group_ids JSON
);


CREATE TABLE user_updates (
    user_update_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    full_name TIMESTAMP ,
    profile_img TIMESTAMP ,
    last_seen TIMESTAMP,
    messages TIMESTAMP
);


CREATE TABLE messages (
    msg_id SERIAL PRIMARY KEY,
    uname_1 VARCHAR(50) NOT NULL REFERENCES users(username),
    uname_2 VARCHAR(50) NOT NULL REFERENCES users(username),
    messages JSON  
);

SET CLIENT_ENCODING TO 'UTF8';
<!-- SET client_encoding = 'UTF8'; -->

<!-- CREATE TABLE images (img_id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, base64_string TEXT NULL);


ALTER SEQUENCE images_img_id_seq RESTART WITH 1001;
ALTER SEQUENCE messages_msg_id_seq RESTART WITH 1;
ALTER SEQUENCE users_user_id_seq RESTART WITH 101;
ALTER SEQUENCE user_updates_user_update_id_seq RESTART WITH 101;



SELECT pg_size_pretty(pg_total_relation_size('images')) AS total_size; --> 




 <!-- uvicorn app:app --host 0.0.0.0 --port 5000 --reload -->
