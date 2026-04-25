# B2B\_ENTITIES

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6018160)

3.2. [Most recently active contributors(1) to this module](#idp6152880)

**List of Examples**

1.1. [Set `server_hsize` parameter](#idp165520)

1.2. [Set `client_hsize` parameter](#idp170832)

1.3. [Set `script_req_route` parameter](#idp5568048)

1.4. [Set `script_repl_route` parameter](#idp5571824)

1.5. [Set `db_url` parameter](#idp5575600)

1.6. [Set `cachedb_url` parameter](#idp5579376)

1.7. [Set `cachedb_key_prefix` parameter](#idp5584272)

1.8. [Set `update_period` parameter](#idp5589248)

1.9. [Set `b2b_key_prefix` parameter](#idp5594528)

1.10. [Set `db_mode` parameter](#idp5601584)

1.11. [Set `db_table` parameter](#idp5606352)

1.12. [Set `cluster_id` parameter](#idp5618528)

1.13. [Set `passthru_prack` parameter](#idp5623904)

1.14. [Set `advertised_contact` parameter](#idp5640832)

1.15. [Set `ua_default_timeout` parameter](#idp5646928)

1.16. [`ua_session_server_init` usage](#idp5669536)

1.17. [`ua_session_update` usage](#idp5681056)

1.18. [`ua_session_reply` usage](#idp5694016)

1.19. [`ua_session_terminate` usage](#idp5702256)

2.1. [`b2b_api_t` structure](#idp5979536)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The B2BUA implementation in OpenSIPS is separated in two layers:

*   a lower one(coded in this module)- which implements the basic functions of a UAS and UAC
*   a upper one - which represents the logic engine of B2BUA, responsible of actually implementing the B2BUA services using the functions offered by the low level.

This module stores records corresponding to the dialogs in which the B2BUA is involved. It exports an API to be called from other modules which offers functions for creating a new dialog record, for sending requests or replies in one dialog and will also notify the upper level module when a request or reply is received inside one stored dialog. The records are separated in two types: b2b server entities and b2b client entities depending on the mode they are created. An entity created for a received initial message will be a server entity, while a entity that will send an initial request(create a new dialog) will be a b2b client entity. The name corresponds to the behavior in the first transaction - if UAS - server entity and if UAC - client entity. This module does not implement a B2BUA alone, but needs a B2B logic implementing module.

The module is able to respond to authentication challanges if the uac\_auth module is loaded first. The list of credentials for b2b authentication is also provided by the uac\_auth module.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

*   _tm_
    
*   _a db module_
    
*   _uac\_auth_ (mandatory if authentication is required)
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`server_hsize` (int)

The size of the hash table that stores the b2b server entities. It is the 2 logarithmic value of the real size.

_Default value is “9”_ (512 records).

**Example�1.1.�Set `server_hsize` parameter**

...
modparam("b2b\_entities", "server\_hsize", 10)
...
	

  

### 1.3.2.�`client_hsize` (int)

The size of the hash table that stores the b2b client entities. It is the 2 logarithmic value of the real size.

_Default value is “9”_ (512 records).

**Example�1.2.�Set `client_hsize` parameter**

...
modparam("b2b\_entities", "client\_hsize", 10)
...
	

  

### 1.3.3.�`script_req_route` (str)

The name of the b2b script route that will be called when B2B requests are received.

**Example�1.3.�Set `script_req_route` parameter**

...
modparam("b2b\_entities", "script\_req\_route", "b2b\_request")
...
	

  

### 1.3.4.�`script_reply_route` (str)

The name of the b2b script route that will be called when B2B replies are received.

**Example�1.4.�Set `script_repl_route` parameter**

...
modparam("b2b\_entities", "script\_reply\_route", "b2b\_reply")
...
	

  

### 1.3.5.�`db_url` (str)

Database URL. It is not compulsory, if not set data is not stored in database.

**Example�1.5.�Set `db_url` parameter**

...
modparam("b2b\_entities", "db\_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
	

  

### 1.3.6.�`cachedb_url` (str)

URL of a NoSQL database to be used. Only Redis is supported at the moment.

**Example�1.6.�Set `cachedb_url` parameter**

...
modparam("b2b\_entities", "cachedb\_url", "redis://localhost:6379/")
...
	

  

### 1.3.7.�`cachedb_key_prefix` (string)

Prefix to use for every key set in the NoSQL database.

_Default value is “b2be$”._

**Example�1.7.�Set `cachedb_key_prefix` parameter**

...
modparam("b2b\_entities", "cachedb\_key\_prefix", "b2b")
...

  

### 1.3.8.�`update_period` (int)

The time interval at which to update the info in database.

_Default value is “100”._

**Example�1.8.�Set `update_period` parameter**

...
modparam("b2b\_entities", "update\_period", 60)
...
	

  

### 1.3.9.�`b2b_key_prefix` (string)

The string to use when generating the key ( it is inserted in the SIP messages as callid or to tag. It is useful to set this prefix if you use more instances of opensips B2BUA cascaded in the same architecture. Sometimes opensips B2BUA looks at the callid or totag to see if it has the format it uses to determine if the request was sent by it.

_Default value is “B2B”._

**Example�1.9.�Set `b2b_key_prefix` parameter**

...
modparam("b2b\_entities", "b2b\_key\_prefix", "B2B1")
...
	

  

### 1.3.10.�`db_mode` (int)

The B2B modules have support for the 3 type of database storage

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1
*   WRITE BACK (update in db from time to time) - set this parameter to 2

_Default value is “2” (WRITE BACK)._

**Example�1.10.�Set `db_mode` parameter**

...
modparam("b2b\_entities", "db\_mode", 1)
...
	

  

### 1.3.11.�`db_table` (str)

The name of the table that will be used for storing B2B entities

_Default value is “b2b\_entities”_

**Example�1.11.�Set `db_table` parameter**

...
modparam("b2b\_entities", "db\_table", "some table name")
...
	

  

### 1.3.12.�`cluster_id` (int)

The ID of the cluster this instance belongs to. Setting this parameter enables clustering support for the OpenSIPS B2BUA by replicating the B2B entities (B2B dialogs) between instances. This also ensures restart persistency through the _clusterer_ module's data "sync" mechanism.

This OpenSIPS cluster exposes the **"b2be-entities-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

_Default value is “0” (clustering disabled)_

**Example�1.12.�Set `cluster_id` parameter**

...
modparam("b2b\_entities", "cluster\_id", 10)
...
	

  

### 1.3.13.�`passthru_prack` (int)

This parameter allows to control, whether a PRACK should be generated locally (=0) or if we request it to be end-to-end (=1).

_Default value is “0” (generate PRACK locally)_

**Example�1.13.�Set `passthru_prack` parameter**

...
modparam("b2b\_entities", "passthru\_prack", 1)
...
	

  

### 1.3.14.�`advertised_contact` (str)

Contact to use in generated messages for UA session started with the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

**Example�1.14.�Set `advertised_contact` parameter**

...
modparam("b2b\_entities", "advertised\_contact", "opensips@10.10.10.10:5060")
...
	

  

### 1.3.15.�`ua_default_timeout` (str)

Default timeout, in seconds, for UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function. After this interval a BYE will be sent and the session will be deleted.

If not set the default is 43200 (12 hours).

**Example�1.15.�Set `ua_default_timeout` parameter**

...
modparam("b2b\_entities", "ua\_default\_timeout", 7200)
...
	

  

## 1.4.�Exported Functions

### 1.4.1.� `ua_session_server_init([key], [flags])`

This function initializes a new UA session by processing an initial INVITE. Further requests/replies received belonging to this session will only be handled via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.

Parameters:

*   _key (var, optional)_ - Variable to return the b2b entity key of the new UA session.
    
*   _flags (string, optional)_ - configures options for this UA session via the following flags:
    
    *   _t\[nn\]_ - maximum duration of this session in seconds. After this timeout a BYE will be sent and the session will be deleted. If this is not set, the default timeout, configured with [ua\_default\_timeout](#param_ua_default_timeout "1.3.15.�ua_default_timeout (str)") will be used. Example: _t3600_
        
    *   _a_ - report the receving of ACK requests via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _r_ - report the receving of replies via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _d_ - disable the automatic sending of ACK upon receving a 200 OK reply for INVITE (in case of UAC session) or re-INVITE.
        
    *   _h_ - provide the headers of the SIP request/reply in the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _b_ - provide the body of the SIP request/reply in the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _n_ - do not trigger the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event (with event\_type _NEW_) for initial INVITES handled with this function.
        
    

This function can be used from REQUEST\_ROUTE.

**Example�1.16.�`ua_session_server_init` usage**

...
if(is\_method("INVITE") && !has\_totag()) {
   ua\_session\_server\_init($var(b2b\_key), "arhb");

   ua\_session\_reply($var(b2b\_key), "INVITE", 200, "OK", $var(my\_sdp));
   
   exit;
}
...
		

  

### 1.4.2.� `ua_session_update(key, method, [body], [extra_headers], [content_type])`

Sends a sequential request for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Parameters:

*   _key (string)_ - b2b entity key of the UA session.
    
*   _method (string)_ - name of the SIP method for this request.
    
*   _body (string, optional)_ - body to include in the SIP message.
    
*   _extra\_headers (string, optional)_ - extra headers to include in the SIP message.
    
*   _content\_type (string, optional)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

This function can be used from REQUEST\_ROUTE, EVENT\_ROUTE.

**Example�1.17.�`ua_session_update` usage**

...
ua\_session\_update($var(b2b\_key), "OPTIONS");
...
		

  

### 1.4.3.� `ua_session_reply(key, method, code, [reason], [body], [extra_headers], [content_type])`

Sends a reply for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Parameters:

*   _key (string)_ - b2b entity key of the UA session.
    
*   _method (string)_ - name of the SIP method that is replied to.
    
*   _code (int)_ - reply code.
    
*   _reason (string, optional)_ - reply reason string.
    
*   _body (string, optional)_ - body to include in the SIP message.
    
*   _extra\_headers (string, optional)_ - extra headers to include in the SIP message.
    
*   _content\_type (string, optional)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

This function can be used from REQUEST\_ROUTE, EVENT\_ROUTE.

**Example�1.18.�`ua_session_reply` usage**

...
ua\_session\_reply($var(b2b\_key), "INVITE", 180, "Ringing");
...
		

  

### 1.4.4.� `ua_session_terminate(key, [extra_headers])`

Terminate a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Parameters:

*   _key (string)_ - b2b entity key of the UA session.
    
*   _extra\_headers (string, optional)_ - extra headers to include in the SIP message
    

This function can be used from REQUEST\_ROUTE, EVENT\_ROUTE.

**Example�1.19.�`ua_session_terminate` usage**

...
ua\_session\_terminate($var(b2b\_key));
...
		

  

## 1.5.�Exported MI Functions

### 1.5.1.� `b2be_list`

This command can be used to list the internals of the b2b entities.

Name: _b2be\_list_

Parameters: _none_

MI FIFO Command Format:

	opensips-cli -x mi b2be\_list
	

### 1.5.2.� `ua_session_client_start`

This command starts a new UAC session by sending an initial INVITE. Further requests/replies received belonging to this session will only be handled via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.

Name: _ua\_session\_client\_start_

Parameters:

*   _ruri_ - Request URI
    
*   _to_ - To URI; can also be specified as: _display\_name,uri_ in order to set a Display Name, eg. _Alice,sip:alice@opensips.org_.
    
*   _from_ - From URI; can also be specified as: _display\_name,uri_ in order to set a Display Name, eg. _Alice,sip:alice@opensips.org_
    
*   _proxy (optional)_ - URI of the outbound proxy to send the INVITE to
    
*   _body (optional)_ - message body
    
*   _content\_type (optional)_ - Content Type header to use. If missing and a body is provided, "Content-Type: application/sdp" will be used.
    
*   _extra\_headers (optional)_ - extra headers
    
*   _flags (optional)_ - flags with the same meaning as for the _flags_ paramater of [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])").
    
*   _socket (optional)_ - OpenSIPS sending socket
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_client\_start ruri=sip:bob@opensips.org \\
to=sip:bob@opensips.org from=sip:alice@opensips.org flags=arhb

### 1.5.3.� `ua_session_update`

Sends a sequential request for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_update_

Parameters:

*   _key_ - b2b entity key of the UA session.
    
*   _method_ - name of the SIP method for this request.
    
*   _body (optional)_ - body to include in the SIP message.
    
*   _extra\_headers (optional)_ - extra headers to include in the SIP message.
    
*   _content\_type (string)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_update key=B2B.436.1925389.1649338095 method=OPTIONS

### 1.5.4.� `ua_session_reply`

Sends a reply for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_reply_

Parameters:

*   _key_ \- b2b entity key of the UA session.
    
*   _method_ \- name of the SIP method that is replied to.
    
*   _code_ \- reply code
    
*   _reason_ - reply reason string
    
*   _body (optional)_ - body to include in the SIP message
    
*   _extra\_headers (optional)_ - extra headers to include in the SIP message
    
*   _content\_type (optional)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_reply key=B2B.436.1925389.1649338095 method=OPTIONS code=200 reason=OK

### 1.5.5.� `ua_session_terminate`

Terminate a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_terminate_

Parameters:

*   _key_ \- b2b entity key of the UA session.
    
*   _extra\_headers (optional)_ - extra headers to include in the SIP message
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_terminate key=B2B.436.1925389.1649338095

### 1.5.6.� `ua_session_list`

List information about UA sessions started with [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_list_

Parameters:

*   _key (optional)_ - b2b entity key of the UA session to list. If missing, all sessions will be listed.
    

MI FIFO Command Format:

	opensips-cli -x mi ua\_session\_list
	

## 1.6.�Exported Events

### 1.6.1.� `E_UA_SESSION`

This event is triggered for requests/replies belonging to an ongoing UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Note that replies will not be reported at all unless the _r_ flag was set when initiating the UA session. Also ACK requests are only reported if the _a_ flag was set.

Parameters:

*   _key_ - b2b entity key of the UA session.
    
*   _entity\_type_ - indicates whether this is a _UAS_ or _UAc_ entity.
    
*   _event\_type_ - the type of event:
    
    *   _NEW_ - for initial INVITE requests, handled with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function.
        
    *   _EARLY_ - for 1xx provisional responses
        
    *   _ANSWERED_ - for 2xx successful responses
        
    *   _REJECTED_ - for 3xx-6xx failure responses
        
    *   _UPDATED_ - for any sequential requests, including ACK but excluding BYE/CANCEL
        
    *   _TERMINATED_ - for BYE or CANCEL requests
        
    
*   _status_ - the reply status code if the message is a SIP reply
    
*   _reason_ - the reply reason if the message is a SIP reply
    
*   _method_ - the SIP method name
    
*   _body_ - SIP message body
    
*   _headers_ - full list of all SIP headers in the message.
    

## Chapter�2.�Developer Guide

The module provides an API that can be used from other OpenSIPS modules. The API offers the functions for creating and handing dialogs. A dialog can be created on a receipt initial message, and this will correspond to a b2b server entity, or initiated by the server and in this case a client entity will be created in b2b\_entities module.

## 2.1.� `b2b_load_api(b2b_api_t* api)`

This function binds the b2b\_entities modules and fills the structure the exported functions that will be described in detail.

**Example�2.1.�`b2b_api_t` structure**

...
typedef struct b2b\_api {
	b2b\_server\_new\_t          server\_new;
	b2b\_client\_new\_t          client\_new;

	b2b\_send\_request\_t        send\_request;
	b2b\_send\_reply\_t          send\_reply;

	b2b\_entity\_delete\_t       entity\_delete;

	b2b\_restore\_linfo\_t       restore\_logic\_info;
	b2b\_update\_b2bl\_param\_t   update\_b2bl\_param;
}b2b\_api\_t;
...

  

## 2.2.� `server_new`

Field type:

...
typedef str\* (\*b2b\_server\_new\_t) (struct sip\_msg\* , str\* local\_contact,
		b2b\_notify\_t , str \*mod\_name, str\* logic\_key, struct b2b\_tracer \*tracer,
		void \*param, b2b\_param\_free\_cb free\_param);
...

This function asks the b2b\_entities modules to create a new server entity record. The internal processing actually extracts the dialog information from the message and constructs a record that will be stored in a hash table. The second parameters is a pointer to a function that the b2b\_entities module will call when a event will come for that dialog (a request or reply). The third parameter is a pointer to a value that will be stored and given as a parameter when the notify function will be called(it has to be allocated in shared memory).

The return value is an identifier for the record that will be mentioned when calling other functions that represent actions in the dialog(send request, send reply).

The notify function has the following prototype:

...
typedef int (\*b2b\_notify\_t)(struct sip\_msg\* msg, str\* id, int type, void\* param);
...

This function is called when a request or reply is received for a dialog handled by b2b\_entities. The first parameter is the message, the second is the identifier for the dialog, the third is a flag that says which is the type of the message(it has two possible values - B2B\_REQUEST and B2B\_REPLY). The last parameter is the parameter by the upper module when the entity was created.

## 2.3.� `client_new`

Field type:

...
typedef str\* (\*b2b\_client\_new\_t) (client\_info\_t\* , b2b\_notify\_t b2b\_cback,
				b2b\_add\_dlginfo\_t add\_dlginfo\_f, str \*mod\_name, str \*logic\_key,
				struct b2b\_tracer \*tracer, void \*param, b2b\_param\_free\_cb free\_param);
...

This function asks the b2b\_entities modules to create a new client entity record and also create a new dialog by sending an initial message. The parameters are all the values needed for the initial request to which the notify function and parameter are added. The b2b\_cback parameter is a pointer to the callback that must be called when an event happens(receiving a reply or request) in the dialog created with this function. The add\_dlginfo\_f parameter is also a function pointer to a callback that will be called when a final success response will be received for the created dialog. The callback will receive as parameter the complete dialog information for the record. It should be stored and used when calling send\_request or send\_reply functions.

The return value is an identifier for the record that will be mentioned when calling other functions that represent actions in the dialog(send request, send reply).

## 2.4.� `send_request`

Field type:

...
typedef int (\*b2b\_send\_request\_t)(enum b2b\_entity\_type ,str\* b2b\_key, str\* method,
		str\* extra\_headers, str\* body, b2b\_dlginfo\_t\*);
...

This function asks the b2b\_entities modules to send a request inside a b2b dialog identified by b2b\_key. The first parameter is the entity type and can have two values: B2B\_SERVER and B2B\_CLIENT. The second is the identifier returned by the create function(server\_new or client\_new) and the next are the informations needed for the new request: method, extra\_headers, body. The last parameter contains the dialog information - callid, to tag, from tag. These are needed to make a perfect match to of b2b\_entities record for which a new request must be sent.

The return value is 0 for success and a negative value for error.

## 2.5.� `send_reply`

Field type:

...
typedef int (\*b2b\_send\_reply\_t)(enum b2b\_entity\_type et, str\* b2b\_key, int code, str\* text,
		str\* body, str\* extra\_headers, b2b\_dlginfo\_t\* dlginfo);
...

This function asks the b2b\_entities modules to send a reply inside a b2b dialog identified by b2b\_key. The first parameter is the entity type and can have two values: B2B\_SERVER and B2B\_CLIENT. The second is the identifier returned by the create function(server\_new or client\_new) and the next are the informations needed for the new reply: code, text, body, extra\_headers. The last parameter contains the dialog information used for matching the right record.

The return value is 0 for success and a negative value for error.

## 2.6.� `entity_delete`

Field type:

...
typedef void (\*b2b\_entity\_delete\_t)(enum b2b\_entity\_type et, str\* b2b\_key,
	 b2b\_dlginfo\_t\* dlginfo);
...

This function must be called by the upper level function to delete the records in b2b\_entities. The records are not cleaned up by the b2b\_entities module and the upper level module must take care to delete them.

## 2.7.� `restore_logic_info`

Field type:

...
typedef int (\*b2b\_restore\_linfo\_t)(enum b2b\_entity\_type type, str\* key,
		b2b\_notify\_t cback, void \*param, b2b\_param\_free\_cb free\_param);
...

This function is used at startup when loading the data from the database to restore the pointer to the callback function.

## 2.8.� `update_b2bl_param`

Field type:

...
typedef int (\*b2b\_update\_b2bl\_param\_t)(enum b2b\_entity\_type type, str\* key,
		str\* param, int replicate);
...

This function can be used to change the logic param stored for an entity ( useful in case an entity is moved between logic records).

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Anca Vamanu

183

94

6839

1860

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

127

62

5443

1147

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

86

70

794

523

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

60

51

515

202

5.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

57

42

987

348

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

21

17

97

128

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

6

4

74

47

8.

Carsten Bock

6

4

66

40

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

29

22

10.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

6

3

166

29

  

**All remaining contributors**: Giedrius, Stanislaw Pitucha, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), [@DMOsipov](https://github.com/DMOsipov), St�phane Alnet ([@shimaore](https://github.com/shimaore)), Henk Hesselink, Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Ibrahim Shahzad, Walter Doekes ([@wdoekes](https://github.com/wdoekes)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Aug 2009 - Dec 2025

2.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Nov 2010 - Nov 2025

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Dec 2010 - Oct 2025

4.

Ibrahim Shahzad

Jul 2025 - Jul 2025

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Sep 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jun 2023

8.

Giedrius

Apr 2023 - May 2023

9.

Carsten Bock

Mar 2022 - Apr 2022

10.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Jan 2013 - Feb 2022

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), [@DMOsipov](https://github.com/DMOsipov), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), St�phane Alnet ([@shimaore](https://github.com/shimaore)), Anca Vamanu, Henk Hesselink, Stanislaw Pitucha.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Carsten Bock, Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Anca Vamanu.

_Documentation Copyrights:_

Copyright � 2009 Anca-Maria Vamanu

Copyright � 2022 [ng-voice GmbH](https://www.ng-voice.com)