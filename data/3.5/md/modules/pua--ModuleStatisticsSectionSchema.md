# Presence User Agent Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5743760)

3.2. [Most recently active contributors(1) to this module](#idp5845088)

**List of Examples**

1.1. [Set `hash_size` parameter](#idp5568768)

1.2. [Set `db_url` parameter](#idp5573456)

1.3. [Set `db_table` parameter](#idp5578912)

1.4. [Set `min_expires` parameter](#idp5584400)

1.5. [Set `default_expires` parameter](#idp5589536)

1.6. [Set `update_period` parameter](#idp5595056)

1.7. [Set `cluster_id` parameter](#idp5601360)

1.8. [Set `cluster_sharing_tag` parameter](#idp5607824)

1.9. [`pua_update_contact` usage](#idp5617376)

2.1. [`pua_api` structure](#idp5665632)

2.2. [`pua_is_dialog` usage example](#idp5725920)

2.3. [`register_puacb` usage example](#idp5731440)

2.4. [`add_event` usage example](#idp5739024)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module offer the internal support for OpenSIPS to act as a Presence User Agent client, by sending Subscribe and Publish messages.

Note that the module does NOT provide any functionality to be used directly from the script, but it is providing this PUA client support (via an internal API) for other event-specific modules to do PUA client operations.

Some of modules build on top of the PUA module are pua\_mi, pua\_usrloc, pua\_dialoginfo, pua\_bla and pua\_xmpp. The pua\_mi offer the possibility to publish any kind of information or subscribing to a resource through fifo. The pua\_usrloc module calls a function exported by pua modules to publish elementary presence information, such as basic status "open" or "closed", for clients that do not implement client-to-server presence. The pua\_dialoginfo provideds BLF support, by publishing the status of the participants into a call (like ringing, established, terminated). Through pua\_bla , BRIDGED LINE APPEARANCE features are added to OpenSIPs. The pua\_xmpp module represents a gateway between SIP and XMPP, so that jabber and SIP clients can exchange presence information.

The module use cache to store presentity list and writes to database on timer to be able to recover upon restart.

Notice: This module must not be used in no fork mode (the locking mechanism used may cause deadlock in no fork mode).

## 1.2.�PUA clustering

Starting 3.2, the module was extended with clustering support also. This means multiple OpenSIPS instance, configured with PUA module, may work together. For example, the publishing for a certain presentity may be done via different node (PUA OpenSIPS instance) in the cluster.

The clustering support is a mixture of DB sharing and OpenSIPS clustering. The OpenSIPS clustering layer is used for broadcasting notifications with the cluster when a presentity is modified by one of the nodes (so that, the other nodes in cluster may refresh the presentity via DB.

The shared DB is used by sharing between the nodes the actual presentity data. A node caches into memory only the presentities created by the node or the presentitites the node worked with. A presentity record may be loaded into memory (from DB) if the node needs to perform an operation with that presentity.

IMPORTANT: because the actual presentity data is shared between the nodes via DB (the clustering layer is used for notifications only), it is important to set a very low update interval for the DB (for data being flushed from memoryc cache into DB), to get the DB content updated as realtime as possible. See the the [update\_period](#param_update_period "1.4.6.�update_period (int)"), module parameter, with recomanded values like 2-5 seconds.

On the OpenSIPS clustering layer, the PUA module use the sharing-tags mechanism in order to control (between all the nodes in the cluster) which node is responsible for performing the expiring operation on the presentity (like sending the PUBLISH with expires 0).

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database modules_.
    
*   _tm_.
    
*   _clusterer_, if the cluster\_id module parameter is set and clustering support activated.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`hash_size` (int)

The size of the hash table used for storing Subscribe and Publish information. This parameter will be used as the power of 2 when computing table size.

_Default value is “9”._

**Example�1.1.�Set `hash_size` parameter**

...
modparam("pua", "hash\_size", 11)
...

  

### 1.4.2.�`db_url` (str)

Database url.

_Default value is “\>mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.2.�Set `db_url` parameter**

...
modparam("pua", "db\_url" "dbdriver://username:password@dbhost/dbname")
...

  

### 1.4.3.�`db_table` (str)

The name of the database table.

_Default value is “pua”._

**Example�1.3.�Set `db_table` parameter**

...
modparam("pua", "db\_table", "pua")
...

  

### 1.4.4.�`min_expires` (int)

The inferior expires limit for both Publish and Subscribe.

_Default value is “300”._

**Example�1.4.�Set `min_expires` parameter**

...
modparam("pua", "min\_expires", 0)
...

  

### 1.4.5.�`default_expires` (int)

The default expires value used in case this information is not provisioned.

_Default value is “3600”._

**Example�1.5.�Set `default_expires` parameter**

...
modparam("pua", "default\_expires", 3600)
...

  

### 1.4.6.�`update_period` (int)

The interval at which the information in database and hash table should be updated. In the case of the hash table updating is deleting expired messages.

_Default value is “30”._

IMPORTANT - if you use clustering support for this module, set a low value here, like 2-5, see the clustering chapter above.

**Example�1.6.�Set `update_period` parameter**

...
modparam("pua", "update\_period", 100)
...

  

### 1.4.7.�`cluster_id` (int)

The cluster ID where the PUA data should be replicated/shared. This parameter is to be used only if clustering mode is needed. In order to understand the concept of a cluster ID, please see the _clusterer_ module.

For more on PUA clustering see the [Section�1.2, “PUA clustering”](#pua_clustering "1.2.�PUA clustering") chapter.

_Default value is “None”._

**Example�1.7.�Set `cluster_id` parameter**

...
modparam("pua", "cluster\_id", 10)
...

  

### 1.4.8.�`cluster_sharing_tag` (int)

The clustering share-tag to be used by the PUA module when creating any new presentity record. The tag will by used to decide which OpenSIPS instance (owning the tag as active) will be responsible for expiring this presentity. This parameter is to be used only if clustering mode is needed. In order to understand the concept of sharing TAG, please see the _clusterer_ module.

For more on PUA clustering see the [Section�1.2, “PUA clustering”](#pua_clustering "1.2.�PUA clustering") chapter.

_Default value is “NULL”._

**Example�1.8.�Set `cluster_sharing_tag` parameter**

...
modparam("pua", "cluster\_sharing\_tag", "vip")
...

  

## 1.5.�Exported Functions

### 1.5.1.� `pua_update_contact()`

The remote target can be updated by the Contact of a subsequent in dialog request. In the PUA watcher case (sending a SUBSCRIBE messages), this means that the remote target for the following Subscribe messages can be updated at any time by the contact of a Notify message. If this function is called on request route on receiving a Notify message, it will try to update the stored remote target.

This function can be used from REQUEST\_ROUTE.

_Return code:_

*   _1 - if success_.
    
*   _\-1 - if error_.
    

**Example�1.9.�`pua_update_contact` usage**

...
if($rm=="NOTIFY")
    pua\_update\_contact();
...

  

## 1.6.�Installation

The module requires 1 table in OpenSIPS database: pua. The SQL syntax to create it can be found in presence\_xml-create.sql script in the database directories in the opensips/scripts folder. You can also find the complete database documentation on the project webpage, [https://opensips.org/docs/db/db-schema-devel.html](https://opensips.org/docs/db/db-schema-devel.html).

## Chapter�2.�Developer Guide

The module provides the following functions that can be used in other OpenSIPS modules.

## 2.1.� `bind_pua(pua_api_t* api)`

This function binds the pua modules and fills the structure with the two exported function.

**Example�2.1.�`pua_api` structure**

...
typedef struct pua\_api {
	send\_subscribe\_t send\_subscribe;
	send\_publish\_t send\_publish;
	query\_dialog\_t is\_dialog;
	register\_puacb\_t register\_puacb;
	add\_pua\_event\_t add\_event;
} pua\_api\_t;
...

  

## 2.2.� `send_publish`

Field type:

...
typedef int (\*send\_publish\_t)(publ\_info\_t\* publ);
...
				

This function receives as a parameter a structure with Publish required information and sends a Publish message.

The structure received as a parameter:

...
typedef struct publ\_info

  str id;             /\*  (optional )a value unique for one combination
                          of pres\_uri and flag \*/
  str\* pres\_uri;      /\*  the presentity uri \*/	
  str\* body;          /\*  the body of the Publish message; 
                          can be NULL in case of an update expires\*/ 	
  int  expires;       /\*  the expires value that will be used in
                          Publish Expires header\*/	
  int flag;           /\*  it can be : INSERT\_TYPE or UPDATE\_TYPE
                          if missing it will be established according 
                          to the result of the search in hash table\*/ 	
  int source\_flag;    /\*  flag identifying the resource ;
                          supported values: UL\_PUBLISH, MI\_PUBLISH,
                          BLA\_PUBLISH, XMPP\_PUBLISH\*/
  int event;          /\*  the event flag;
                          supported values: PRESENCE\_EVENT, BLA\_EVENT,
                          MWI\_EVENT \*/
  str content\_type;   /\*  the content\_type of the body if present
                          (optional if the same as the default value
                          for that event)\*/
  str\* etag;          /\*  (optional) the value of the etag the request
                          should match \*/
  str\* extra\_headers  /\*  (optional) extra\_headers that should be added
                          to Publish msg\*/
  publrpl\_cb\_t\* cbrpl;/\*  callback function to be called when receiving
                          the reply for the sent request \*/
  void\* cbparam;      /\*  extra parameter for tha callback function \*/

  str outbound\_proxy; /\*  the outbound proxy to be used when sending
							the Publish request\*/

}publ\_info\_t;
...
		

The callback function type:

...
typedef int (publrpl\_cb\_t)(struct sip\_msg\* reply, void\*  extra\_param);
...
		

## 2.3.� `send_subscribe`

Field type:

...
typedef int (\*send\_subscribe\_t)(subs\_info\_t\* subs);
...

This function receives as a parameter a structure with Subscribe required information and sends a Subscribe message.

The structure received as a parameter:

...
typedef struct subs\_info

  str id;              /\*  an id value unique for one combination
                           of pres\_uri and flag \*/
  str\* pres\_uri;       /\*  the presentity uri \*/	
  str\* watcher\_uri;    /\*  the watcher uri \*/
  str\* contact;        /\*  the uri that will be used in
                           Contact header\*/  
  str\* remote\_target;  /\*  the uri that will be used as R-URI
                           for the Subscribe message(not compulsory;
                           if not set the value of the pres\_uri field
                           is used) \*/
  str\* outbound\_proxy; /\*  the outbound\_proxy to use when sending the 
                           Subscribe request\*/
  int event;           /\*  the event flag; supported value: 
                           PRESENCE\_EVENT, BLA\_EVENT, PWINFO\_EVENT\*/ 
  int expires;         /\*  the expires value that will be used in
                           Subscribe Expires header \*/	
  int flag;            /\*  it can be : INSERT\_TYPE or UPDATE\_TYPE
                           not compulsory \*/	
  int source\_flag;     /\*  flag identifying the resource ;
                           supported values:  MI\_SUBSCRIBE, 
                           BLA\_SUBSCRIBE, XMPP\_SUBSCRIBE,
                           XMPP\_INITIAL\_SUBS \*/
}subs\_info\_t;
...

## 2.4.� `is_dialog`

Field type:

...
typedef int  (\*query\_dialog\_t)(ua\_pres\_t\* presentity);
...
				

This function checks is the parameter corresponds to a stored Subscribe initiated dialog.

**Example�2.2.�`pua_is_dialog` usage example**

...	
	if(pua\_is\_dialog(dialog) < 0)
	{
		LM\_ERR("querying dialog\\n");
		goto error;
	}
...	

  

## 2.5.� `register_puacb`

Field type:

...
typedef int (\*register\_puacb\_t)(int types, pua\_cb f, void\* param );
...
				

This function registers a callback to be called on receiving the reply message for a sent Subscribe request. The type parameter should be set the same as the source\_flag for that request. The function registered as callback for pua should be of type pua\_cb , which is: typedef void (pua\_cb)(ua\_pres\_t\* hentity, struct msg\_start \* fl); The parameters are the dialog structure for that request and the first line of the reply message.

**Example�2.3.�`register_puacb` usage example**

...
	if(pua.register\_puacb(XMPP\_SUBSCRIBE, Sipreply2Xmpp, NULL) & 0)
	{
		LM\_ERR("Could not register callback\\n");
		return -1;
	}
...	
	

  

## 2.6.� `add_event`

Field type:

...
typedef int (\*add\_pua\_event\_t)(int ev\_flag, char\* name, 
   char\* content\_type,evs\_process\_body\_t\* process\_body);

- ev\_flag     : an event flag defined as a macro in pua module		
- name        : the event name to be used in Event request headers
- content\_type: the default content\_type for Publish body for 
                that event (NULL if winfo event)
- process\_body: function that processes the received body before 
                using it to construct the PUBLISH request
                (NULL if winfo event)
...
				

This function allows registering new events to the pua module. Now there are 4 events supported by the pua module: presence, presence;winfo, message-summary, dialog;sla. These events are registered from within the pua module.

Filed type for process\_body:

...
typedef int (evs\_process\_body\_t)(struct publ\_info\* publ, 
  str\*\* final\_body, int ver, str\* tuple);
- publ      : the structure received as a parameter in send\_publish 
              function ( initial body found in publ->body)
- final\_body: the pointer where the result(final\_body) should be stored 
- ver       : a counter for the sent Publish requests
              (used for winfo events)
- tuple     : a unique identifier for the resource;
              if an initial Publish it should be returned as a result
              and it will be stored  for that record, otherwise it will
              be given as a parameter;    
...
				

**Example�2.4.�`add_event` usage example**

...
	if(pua.add\_event((PRESENCE\_EVENT, "presence", "application/pidf+xml", 
				pres\_process\_body) & 0)
	{
		LM\_ERR("Could not register new event\\n");
		return -1;
	}
...	
	

  

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

277

106

11549

4540

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

72

53

1114

550

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

22

12

256

395

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

17

13

230

109

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

12

8

144

97

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

7

76

83

7.

Edson Gellert Schubert

10

1

0

501

8.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

9

5

243

31

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

4

86

76

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

30

20

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Denis Bilenko, Vallimamod Abdullah, Alex Hermann, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Damien Sandras ([@dsandras](https://github.com/dsandras)), Sergio Gutierrez, Konstantin Bokarius, Elena-Ramona Modroiu, John Riordan, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), UnixDev, Zero King ([@l2dy](https://github.com/l2dy)), Carsten Bock, Stanislaw Pitucha, Dan Pascu ([@danpascu](https://github.com/danpascu)), Julien Blache.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2007 - Apr 2024

3.

Carsten Bock

Mar 2024 - Mar 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Sep 2021

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Jan 2021

7.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Nov 2010 - Feb 2016

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Damien Sandras ([@dsandras](https://github.com/dsandras)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Vallimamod Abdullah, Alex Hermann, Stanislaw Pitucha, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), John Riordan, UnixDev, Sergio Gutierrez, Denis Bilenko, Henning Westerholt ([@henningw](https://github.com/henningw)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Konstantin Bokarius, Edson Gellert Schubert, Julien Blache, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Anca Vamanu, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2006 Voice Sistem SRL