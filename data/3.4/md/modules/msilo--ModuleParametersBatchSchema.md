## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Database URL.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set the “db\_url” parameter**

...
modparam("msilo", "db\_url", "mysql://user:passwd@host.com/dbname")
...

  

### 1.3.2.�`db_table` (string)

The name of table where to store the messages.

_Default value is “silo”._

**Example�1.2.�Set the “db\_table” parameter**

...
modparam("msilo", "db\_table", "silo")
...

  

### 1.3.3.�`from_address` (string)

The SIP address used to inform users that destination of their message is not online and the message will be delivered next time when that user goes online. If the parameter is not set, the module will not send any notification. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.3.�Set the “from\_address” parameter**

...
modparam("msilo", "from\_address", "sip:registrar@example.org")
modparam("msilo", "from\_address", "sip:$rU@example.org")
...

  

### 1.3.4.�`contact_hdr` (string)

The value of the Contact header (including header name and ending \\r\\n) to be added in notification messages. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.4.�Set the “contact\_hdr” parameter**

...
modparam("msilo", "contact\_hdr", "Contact: <sip:null@example.com>\\r\\n")
...

  

### 1.3.5.�`offline_message` (string)

The body of the notification message. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.5.�Set the “offline\_message” parameter**

...
modparam("msilo", "offline\_message", "\*\*\* User $rU is offline!")
modparam("msilo", "offline\_message", "<em>I am offline!</em>")
...

  

### 1.3.6.�`content_type_hdr` (string)

The value of the Content-Type header (including header name and ending \\r\\n) to be added in notification messages. It must reflect what the 'offline\_message' contains. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.6.�Set the “content\_type\_hdr” parameter**

...
modparam("msilo", "content\_type\_hdr", "Content-Type: text/plain\\r\\n")
modparam("msilo", "content\_type\_hdr", "Content-Type: text/html\\r\\n")
...

  

### 1.3.7.�`reminder` (string)

The SIP address used to send reminder messages. If this value is not set, the reminder feature is disabled.

_Default value is “NULL”._

**Example�1.7.�Set the “reminder” parameter**

...
modparam("msilo", "reminder", "sip:registrar@example.org")
...

  

### 1.3.8.�`outbound_proxy` (string)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for msilo processing. If not set, the message will be sent to the address in destination URI.

_Default value is “NULL”._

**Example�1.8.�Set the “outbound\_proxy” parameter**

...
modparam("msilo", "outbound\_proxy", "sip:opensips.org;transport=tcp")
...

  

### 1.3.9.�`expire_time` (int)

Expire time of stored messages - seconds. When this time passed, the message is silently discarded from database.

_Default value is “259200 (72 hours = 3 days)”._

**Example�1.9.�Set the “expire\_time” parameter**

...
modparam("msilo", "expire\_time", 36000)
...

  

### 1.3.10.�`check_time` (int)

Timer interval to check if dumped messages are sent OK - seconds. The module keeps each request send by itself for a new online user and if the reply is 2xx then the message is deleted from database.

_Default value is “30”._

**Example�1.10.�Set the “check\_time” parameter**

...
modparam("msilo", "check\_time", 10)
...

  

### 1.3.11.�`send_time` (int)

Timer interval in seconds to check if there are reminder messages. The module takes all reminder messages that must be sent at that moment or before that moment.

If the value is 0, the reminder feature is disabled.

_Default value is “0”._

**Example�1.11.�Set the “send\_time” parameter**

...
modparam("msilo", "send\_time", 60)
...

  

### 1.3.12.�`clean_period` (int)

Number of “check\_time” cycles when to check if there are expired messages in database.

_Default value is “5”._

**Example�1.12.�Set the “clean\_period” parameter**

...
modparam("msilo", "clean\_period", 3)
...

  

### 1.3.13.�`use_contact` (int)

Turns on/off the usage of the Contact address to send notification back to sender whose message is stored by MSILO.

_Default value is “1 (0 = off, 1 = on)”._

**Example�1.13.�Set the “use\_contact” parameter**

...
modparam("msilo", "use\_contact", 0)
...

  

### 1.3.14.�`sc_mid` (string)

The name of the column in silo table, storing message id.

Default value is “mid”.

**Example�1.14.�Set the “sc\_mid” parameter**

...
modparam("msilo", "sc\_mid", "other\_mid")
...

  

### 1.3.15.�`sc_from` (string)

The name of the column in silo table, storing the source address.

Default value is “src\_addr”.

**Example�1.15.�Set the “sc\_from” parameter**

...
modparam("msilo", "sc\_from", "source\_address")
...

  

### 1.3.16.�`sc_to` (string)

The name of the column in silo table, storing the destination address.

Default value is “dst\_addr”.

**Example�1.16.�Set the “sc\_to” parameter**

...
modparam("msilo", "sc\_to", "destination\_address")
...

  

### 1.3.17.�`sc_uri_user` (string)

The name of the column in silo table, storing the user name.

Default value is “username”.

**Example�1.17.�Set the “sc\_uri\_user” parameter**

...
modparam("msilo", "sc\_uri\_user", "user")
...

  

### 1.3.18.�`sc_uri_host` (string)

The name of the column in silo table, storing the domain.

Default value is “domain”.

**Example�1.18.�Set the “sc\_uri\_host” parameter**

...
modparam("msilo", "sc\_uri\_host", "domain")
...

  

### 1.3.19.�`sc_body` (string)

The name of the column storing the message body in silo table.

Default value is “body”.

**Example�1.19.�Set the “sc\_body” parameter**

...
modparam("msilo", "sc\_body", "message\_body")
...

  

### 1.3.20.�`sc_ctype` (string)

The name of the column in silo table, storing content type.

Default value is “ctype”.

**Example�1.20.�Set the “sc\_ctype” parameter**

...
modparam("msilo", "sc\_ctype", "content\_type")
...

  

### 1.3.21.�`sc_exp_time` (string)

The name of the column in silo table, storing the expire time of the message.

Default value is “exp\_time”.

**Example�1.21.�Set the “sc\_exp\_time” parameter**

...
modparam("msilo", "sc\_exp\_time", "expire\_time")
...

  

### 1.3.22.�`sc_inc_time` (string)

The name of the column in silo table, storing the incoming time of the message.

Default value is “inc\_time”.

**Example�1.22.�Set the “sc\_inc\_time” parameter**

...
modparam("msilo", "sc\_inc\_time", "incoming\_time")
...

  

### 1.3.23.�`sc_snd_time` (string)

The name of the column in silo table, storing the send time for the reminder.

Default value is “snd\_time”.

**Example�1.23.�Set the “sc\_snd\_time” parameter**

...
modparam("msilo", "sc\_snd\_time", "send\_reminder\_time")
...

  

### 1.3.24.�`snd_time_avp` (str)

The name of an AVP which may contain the time when to sent the received message as reminder.The AVP is used ony by m\_store().

If the parameter is not set, the module does not look for this AVP. If the value is set to a valid AVP name, then the module expects in the AVP to be a time value in format YYYYMMDDHHMMSS (e.g., 20060101201500).

_Default value is “null”._

**Example�1.24.�Set the “snd\_time\_avp” parameter**

...
modparam("msilo", "snd\_time\_avp", "$avp(snd\_time)")
...

  

### 1.3.25.�`add_date` (int)

Wheter to add as prefix the date when the message was stored.

_Default value is “1” (1==on/0==off)._

**Example�1.25.�Set the “add\_date” parameter**

...
modparam("msilo", "add\_date", 0)
...

  

### 1.3.26.�`max_messages` (int)

Maximum number of stored message for an AoR. Value 0 equals to no limit.

_Default value is 0._

**Example�1.26.�Set the “max\_messages” parameter**

...
modparam("msilo", "max\_messages", 0)
...