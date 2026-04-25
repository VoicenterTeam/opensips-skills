## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (str)

The database url.

_The default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("imc", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.2.�`rooms_table` (str)

The name of the table storing IMC rooms.

_The default value is "imc\_rooms"._

**Example�1.2.�Set `rooms_table` parameter**

...
modparam("imc", "rooms\_table", "rooms")
...

  

### 1.3.3.�`members_table` (str)

The name of the table storing IMC members.

_The default value is "imc\_members"._

**Example�1.3.�Set `members_table` parameter**

...
modparam("imc", "rooms\_table", "members")
...

  

### 1.3.4.�`hash_size` (integer)

The power of 2 to get the size of the hash table used for storing members and rooms.

_The default value is 4 (resultimg in hash size 16)._

**Example�1.4.�Set `hash_size` parameter**

...
modparam("imc", "hash\_size", 8)
...

  

### 1.3.5.�`imc_cmd_start_char` (str)

The character which indicates that the body of the message is a command.

_The default value is "#"._

**Example�1.5.�Set `imc_cmd_start_char` parameter**

...
modparam("imc", "imc\_cmd\_start\_char", "#")
...

  

### 1.3.6.�`outbound_proxy` (str)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for imc processing. If not set, the message will be sent to the address in destination URI.

_Default value is NULL._

**Example�1.6.�Set `outbound_proxy` parameter**

...
modparam("imc", "outbound\_proxy", "sip:opensips.org;transport=tcp")
...