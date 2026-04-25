## 1.6.�Exported Functions

### 1.6.1.� `jab_send_message()`

Converts SIP MESSAGE message to a Jabber message and sends it to Jabber server.

This function can be used from REQUEST\_ROUTE.

**Example�1.15.�`jab_send_message()` usage**

...
jab\_send\_message();
...

  

### 1.6.2.� `jab_join_jconf()`

Join a Jabber conference--the nickname, room name and conference server address should be included in To header as: nickname%roomname%conference\_server@jdomain . If the nickname is missing, then the SIP username is used.

This function can be used from REQUEST\_ROUTE.

**Example�1.16.�`jab_join_jconf()` usage**

...
jab\_join\_jconf();
...

  

### 1.6.3.� `jab_exit_jconf()`

Leave a Jabber conference--the nickname, room name and conference server address should be included in To header as: nickname%roomname%conference\_server@jdomain .

This function can be used from REQUEST\_ROUTE.

**Example�1.17.�`jab_exit_jconf()` usage**

...
jab\_exit\_jconf();
...

  

### 1.6.4.� `jab_go_online()`

Register to the Jabber server with associated Jabber ID of the SIP user.

This function can be used from REQUEST\_ROUTE.

**Example�1.18.�`jab_go_online()` usage**

...
jab\_go\_online();
...

  

### 1.6.5.� `jab_go_offline()`

Log off from Jabber server the associated Jabber ID of the SIP user.

This function can be used from REQUEST\_ROUTE.

**Example�1.19.�`jab_go_offline()` usage**

...
jab\_go\_offline();
...