## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

An SQL database URL which the module will use in order to load a set of FreeSWITCH ESL sockets and their event subscriptions.

_Default value is “NULL” (DB support disabled)._

**Example�1.1.�Setting the `db_url` parameter**

...
modparam("freeswitch\_scripting", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.2.�`db_table` (string)

The SQL table name for this module.

_Default value is “freeswitch”._

**Example�1.2.�Setting the `db_table` parameter**

...
modparam("freeswitch\_scripting", "db\_table", "freeswitch\_sockets")
...

  

### 1.3.3.�`db_col_username` (string)

The SQL column name for the "username" ESL connect information.

_Default value is “username”._

**Example�1.3.�Setting the `db_col_username` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_username", "user")
...

  

### 1.3.4.�`db_col_password` (string)

The SQL column name for the "password" ESL connect information.

_Default value is “password”._

**Example�1.4.�Setting the `db_col_password` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_password", "pass")
...

  

### 1.3.5.�`db_col_ip` (string)

The SQL column name for the "ip" ESL connect information.

_Default value is “ip”._

**Example�1.5.�Setting the `db_col_ip` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_ip", "ip\_addr")
...

  

### 1.3.6.�`db_col_port` (string)

The SQL column name for the "port" ESL connect information.

_Default value is “port”._

**Example�1.6.�Setting the `db_col_port` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_port", "tcp\_port")
...

  

### 1.3.7.�`db_col_events` (string)

The SQL column name for the comma-separated, case-sensitive FreeSWITCH event names which OpenSIPS will subscribe to.

_Default value is “events\_csv”._

**Example�1.7.�Setting the `db_col_events` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_events", "fs\_events")
...

  

### 1.3.8.�`fs_subscribe` (string)

Add a FreeSWITCH ESL URL to which OpenSIPS will connect at startup. The URL syntax includes support for specifying a list of events to subscribe to and follows this pattern: **\[fs://\]\[\[username\]:password@\]host\[:port\]\[?event1\[,event2\]...\]**

_This parameter can be set multiple times._

**Example�1.8.�Setting the `fs_subscribe` parameter**

...
modparam("freeswitch\_scripting", "fs\_subscribe", ":ClueCon@10.0.0.10?CHANNEL\_STATE")
modparam("freeswitch\_scripting", "fs\_subscribe", ":ClueCon@10.0.0.11:8021?DTMF,BACKGROUND\_JOB")
...