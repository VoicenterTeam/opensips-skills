## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (str)

The URL to connect to database for loading values in mqueue table at start up and/or saving values at shutdown.

_Default value is NULL (do not connect)._

**Example�1.1.�Set `db_url` parameter**

...
modparam("mqueue", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips")

# Example of table in sqlite,
# you have the set the fields to support the length according
# to the data that will be present in the mqueue
CREATE TABLE mqueue\_name (
id INTEGER PRIMARY KEY AUTOINCREMENT,
key character varying(64) DEFAULT "" NOT NULL,
val character varying(4096) DEFAULT "" NOT NULL
);
...

  

### 1.3.2.�`mqueue` (string)

Definition of a memory queue

_Default value is “none”._

Value must be a list of parameters: attr=value;...

*   Mandatory attributes:
    
    *   _name_: name of the queue.
        
    
*   Optional attributes:
    
    *   _size_: size of the queue. Specifies the maximum number of items in queue. If exceeded the oldest one is removed. If not set the queue will be limitless.
        
    *   _dbmode_: If set to 1, the content of the queue is written to database table when the SIP server is stopped (i.e., ensure persistency over restarts). If set to 2, it is written at shutdown but not read at startup. If set to 3, it is read at sartup but not written at shutdown. Default value is 0 (no db table interaction).
        
    *   _addmode_: how to add new (key,value) pairs.
        
        *   _0_: Will push all new (key,value) pairs at the end of the queue. (default)
            
        *   _1_: Will keep oldest (key,value) pair in the queue, based on the key.
            
        *   _2_: Will keep newest (key,value) pair in the queue, based on the key.
            
        
    

The parameter can be set many times, each holding the definition of one queue.

**Example�1.2.�Set `mqueue` parameter**

...
modparam("mqueue", "mqueue", "name=myq;size=20;")
modparam("mqueue", "mqueue", "name=myq;size=10000;addmode=2")
modparam("mqueue", "mqueue", "name=qaz")
modparam("mqueue", "mqueue", "name=qaz;addmode=1")
...