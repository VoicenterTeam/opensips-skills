## 1.8.�Exported MI Functions

### 1.8.1.�`rtpengine_enable`

Enables/disables a RTP proxy.

Parameters:

*   _url_ - the RTP proxy url (exactly as defined in the config file).
    
*   _enable_ - 1 - enable, 0 - disable the RTP proxy, 2 - put the RTP node in probing mode.
    
*   _setid_ (optional) the set ID of the nodes to be updated. If provided, only nodes in the provided set will be updated.
    

NOTE: if a RTP proxy is defined multiple times (in the same or different set), all of its instances will be enabled/disabled IF no set ID is provided.

**Example�1.44.� `rtpengine_enable` usage**

...
## disable all rtpengines by URL
$ opensips-cli -x mi rtpengine\_enable udp:192.168.2.133:8081 0
## enable rtpengine by URL and set ID (3)
$ opensips-cli -x mi rtpengine\_enable url=udp:192.168.2.133:8081 enable=1 setid=3
...
			

  

### 1.8.2.�`rtpengine_show`

Displays all the RTP proxies and their information: set and status (disabled or not, weight and recheck\_ticks).

No parameter.

**Example�1.45.� `rtpengine_show` usage**

...
$ opensips-cli -x mi rtpengine\_show
...
			

  

### 1.8.3.�`rtpengine_reload`

Reloads all rtpengine sets from the database. Used only when the “[db\_url](#param_db_url "1.4.10.�db_url (string)")” parameter is set.

Parameters:

*   _type_ (optional) soft - when reloading nodes from the database, reuse any existing sockets and keep existing node disabled state. If not provided, then all nodes and sockets will first be torndown and then nodes will be loaded from the database.
    

No parameter.

**Example�1.46.� `rtpengine_reload` usage**

...
$ opensips-cli -x mi rtpengine\_reload
$ opensips-cli -x mi rtpengine\_reload type=soft
...
			

  

### 1.8.4.�`teardown`

Terminates the SIP dialog by the SIP Call-ID given as parameter.

Parameters:

*   _callid_ - SIP Call-ID.
    

Note this is a just a wrapper function over the “dlg\_end\_dlg” MI function provided by the “dialog” module. This wrapping is done just to make rtpengine happy when trying to terminate SIP calls based on RTP timeouts.

**Example�1.47.� `teardown` usage**

...
$ opensips-cli -x mi teardown Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY0ZDQ
...