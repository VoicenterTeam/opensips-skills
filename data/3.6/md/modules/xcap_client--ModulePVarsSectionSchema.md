# XCAP\_Client Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5926688)

3.2. [Most recently active contributors(1) to this module](#idp6030400)

**List of Examples**

1.1. [Set `periodical_query` parameter](#idp171744)

1.2. [Set `query_period` parameter](#idp5873136)

2.1. [`xcap_client_api` structure](#idp5887808)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The modules is an XCAP client for OpenSIPS that can be used by other modules. It fetches XCAP elements, either documents or part of them, by sending HTTP GET requests. It also offers support for conditional queries. It uses libcurl library as a client-side HTTP transfer library.

The module offers an xcap client interface with general functions that allow requesting for an specific element from an xcap server. In addition to that it also offers the service of storing and update in database the documents it receives. In this case only an initial request to the module is required - xcapGetNewDoc-which is like a request to the module to handle from that point on the referenced document so as to promise that the newest version will always be present in database.

The update method is also configurable, either through periodical queries, applicable to any kind of xcap server or with an MI command that should be sent by the server upon an update.

The module is currently used by the presence\_xml module, if the 'integrated\_xcap\_server' parameter is not set.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _xcap_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml-dev_.
    
*   _libcurl-dev_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`periodical_query`(int)

A flag to disable periodical query as an update method for the documents the module is responsible for. It could be disabled when the xcap server is capable to send the exported MI command when a change occurs or when another module in OpenSIPS handles updates.

To disable it set this parameter to 0.

_Default value is “1”._

**Example�1.1.�Set `periodical_query` parameter**

...
modparam("xcap\_client", "periodical\_query", 0)
...

  

### 1.3.2.�`query_period`(int)

Should be set if periodical query is not disabled. Represents the time interval the xcap servers should be queried for an update

To disable it set this parameter to 0.

_Default value is “100”._

**Example�1.2.�Set `query_period` parameter**

...
modparam("xcap\_client", "query\_period", 50)
...

  

## 1.4.�Exported Functions

None to be used in configuration file.

## 1.5.�Exported MI Functions

### 1.5.1.� `refreshXcapDoc`

MI command that should be sent by an xcap server when a stored document changes.

Name: _refreshXcapDoc_

Parameters:

*   doc\_uri: the uri of the document
    
*   port: the port of the xcap server
    

MI FIFO Command Format:

...
opensips-cli -x mi refreshXcapDoc /xcap-root/resource-lists/users/eyebeam/buddies-resource-list.xml 8000
...
		

## Chapter�2.�Developer Guide

The module exports a number of functions that allow selecting and retrieving an element from an xcap server and also registering a callback to be called when a MI command refreshXcapDoc is received and the document in question is retrieved.

## 2.1.� `bind_xcap_client_api(xcap_client_api_t* api)`

This function allows binding the needed functions.

**Example�2.1.�`xcap_client_api` structure**

...
typedef struct xcap\_client\_api {
	
	/\* xcap node selection and retrieving functions\*/
	xcap\_get\_elem\_t get\_elem;
	xcap\_nodeSel\_init\_t int\_node\_sel;
	xcap\_nodeSel\_add\_step\_t add\_step;
	xcap\_nodeSel\_add\_terminal\_t add\_terminal;
	xcap\_nodeSel\_free\_t free\_node\_sel;
	xcapGetNewDoc\_t getNewDoc; /\* an initial request for the module 
	fo fetch this document that does not exist in xcap db table
	and handle its update\*/

	/\* function to register a callback to document changes\*/
	register\_xcapcb\_t register\_xcb;
}xcap\_client\_api\_t;
...
			

  

## 2.2.� `get_elem`

Field type:

...
typedef char\* (\*xcap\_get\_elem\_t)(char\* xcap\_root,
xcap\_doc\_sel\_t\* doc\_sel, xcap\_node\_sel\_t\* node\_sel);
...
				

This function sends a HTTP request and gets the specified information from the xcap server.

The parameters signification:

*   _xcap\_root_\- the XCAP server address;
    
*   _doc\_sel_\- structure with document selection info;
    
    Parameter type:
    ...
    typedef struct xcap\_doc\_sel
    {
    	str auid; /\* application defined Unique ID\*/
    	int type; /\* the type of the path segment
    				after the AUID  which must either
    				be GLOBAL\_TYPE (for "global") or
    				USERS\_TYPE (for "users") \*/ 
    	str xid; /\* the XCAP User Identifier 
    				if type is USERS\_TYPE \*/
    	str filename; 
    }xcap\_doc\_sel\_t;
    ...
    
*   _node\_sel_\- structure with node selection info;
    
    Parameter type:
    ...
    typedef struct xcap\_node\_sel
    {
    	step\_t\* steps;
    	step\_t\* last\_step;
    	int size;
    	ns\_list\_t\* ns\_list;
    	ns\_list\_t\* last\_ns;
    	int ns\_no;
    
    }xcap\_node\_sel\_t;
    
    typedef struct step
    {
    	str val;
    	struct step\* next;
    }step\_t;
    
    typedef struct ns\_list
    {
    	int name;
    	str value;
    	struct ns\_list\* next;
    }ns\_list\_t;
    ...
    
    The node selector is represented like a list of steps that will be represented in the path string separated by '/' signs. The namespaces for the nodes are stored also in a list, as an association of name and value, where the value is to be included in the respective string val field of the step.
    
    To construct the node structure the following functions in the xcap\_api structure should be used: 'int\_node\_sel', 'add\_step' and if needed, 'add\_terminal'.
    
    If the intention is to retrieve the whole document this argument must be NULL.
    

## 2.3.� `register_xcb`

Field type:

...
typedef int (\*register\_xcapcb\_t)(int types, xcap\_cb f);
...
	

\- 'types' parameter can have a combined value of PRES\_RULES, RESOURCE\_LISTS, RLS\_SERVICES, OMA\_PRES\_RULES and PIDF\_MANIPULATION.

\-the callback function has type :

...
typedef int (xcap\_cb)(int doc\_type, str xid, char\* doc);
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

37

14

2155

193

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

18

15

56

63

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

10

30

50

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

18

18

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

22

19

6.

Henning Westerholt ([@henningw](https://github.com/henningw))

8

6

60

49

7.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

6

3

55

89

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

20

33

9.

Dan Pascu ([@danpascu](https://github.com/danpascu))

4

2

8

9

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

4

4

  

**All remaining contributors**: Romanov Vladimir, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Konstantin Bokarius, Ken Rice, UnixDev, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Oct 2025

2.

Ken Rice

Sep 2025 - Sep 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Sep 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2008 - Apr 2019

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Dec 2018

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Mar 2014 - Mar 2014

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

10.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

Nov 2012 - Jan 2013

  

**All remaining contributors**: Anca Vamanu, Romanov Vladimir, UnixDev, Henning Westerholt ([@henningw](https://github.com/henningw)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Anca Vamanu, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2007 Voice Sistem SRL