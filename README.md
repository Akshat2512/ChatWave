
+-------------+                                     +-------------+
|   User A    |                                     |   User B    |
|             |                                     |             |
|  [Client]   |                                     |  [Client]   |
+-----+-------+                                     +------+------+
      |                                                  |
      |                                                  |
      |  Connect to WebSocket Server                     |  Connect to WebSocket Server
      |  ws://example.com/ws/user_a                      |  ws://example.com/ws/user_b
      +--------------------------+                       +---------------------------+
                                 |                       |
                                 |                       |
                                 V                       V
                    +------------+-----------------------+-------------+
                    |                 WebSocket Server                   |
                    |                 (Connection Manager)               |
                    +----------------------------------------------------+
                                 |                       |
                                 |                       |
        Broadcast message to all clients             Broadcast message to all clients
        (including User B)                           (including User A)
                                 |                       |
                                 |                       |
                                 V                       V
                      +----------+------------+   +----------+------------+
                      |   Message: "Hello"    |   |   Message: "Hi there" |
                      |   from User A         |   |   from User B         |
                      +-----------------------+   +-----------------------+

const conversation = [
  { "name": "Saint Joseph", "message": "Hey there! How are you doing today?" },
  { "name": "You", "message": "I'm doing great, thanks! How about you?" },
  { "name": "Saint Joseph", "message": "I'm good as well. Have you started working on that project?" },
  { "name": "You", "message": "Yes, I just began this morning. There's a lot to do!" },
  { "name": "Saint Joseph", "message": "I can imagine. Need any help with it?" },
  { "name": "You", "message": "Thanks, I might take you up on that! I'll let you know if I get stuck." },
  { "name": "Saint Joseph", "message": "No problem. Just give me a shout anytime." },
  { "name": "You", "message": "Will do! What are you up to today?" },
  { "name": "Saint Joseph", "message": "Just catching up on some reading. Have you read any good books lately?" },
  { "name": "You", "message": "Not recently, but I'm looking for recommendations. Got any" },
  { "name": "Saint Joseph", "message": "Absolutely. You should check out 'Sapiens' by Yuval Noah Harari. It's fascinating." },
  { "name": "You", "message": "Sounds interesting! I'll add it to my list." }
];

CREATE TABLE users (
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


<!-- CREATE TABLE messages (
    msg_id SERIAL PRIMARY KEY,
    uname_1 VARCHAR(50) NOT NULL,
    uname_2 VARCHAR(50) NOT NULL,
    messages JSON  
); -->
SET CLIENT_ENCODING TO 'UTF8';
<!-- SET client_encoding = 'UTF8'; -->

CREATE TABLE images (img_id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, base64_string TEXT NOT NULL);


ALTER SEQUENCE images_img_id_seq RESTART WITH 1001;
ALTER SEQUENCE messages_msg_id_seq RESTART WITH 1;
ALTER SEQUENCE users_user_id_seq RESTART WITH 101;
ALTER SEQUENCE user_updates_user_update_id_seq RESTART WITH 101;



SELECT pg_size_pretty(pg_total_relation_size('images')) AS total_size;



CREATE TABLE contacts (
    contact_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    contact_user_id INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (contact_user_id) REFERENCES users(user_id),
    UNIQUE (user_id, contact_user_id)
);


-- Groups Table
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    creator_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (creator_id) REFERENCES users(user_id)
);

-- Group Members Table
CREATE TABLE group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Messages Table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    conversation_type VARCHAR(20) CHECK (conversation_type IN ('individual', 'group')) NOT NULL,
    recipient_id INTEGER,
    group_id INTEGER,
    message_content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (recipient_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    CHECK (
        (conversation_type = 'individual' AND recipient_id IS NOT NULL AND group_id IS NULL) OR
        (conversation_type = 'group' AND group_id IS NOT NULL AND recipient_id IS NULL)
    )
);

-- Optional: Create indexes for performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_group ON messages(group_id);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

 <!-- uvicorn app:app --host 0.0.0.0 --port 5000 --reload -->