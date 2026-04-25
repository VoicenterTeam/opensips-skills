## 1.7.�Exported MI Functions

### 1.7.1.�`rtpproxy_enable`

Enables/Disables a rtp proxy.

Parameters:

*   _url_ - the rtp proxy url (exactly as defined in the config file).
    
*   _enable_ - 1 - enable, 0 - disable. the config file).
    
*   _setid_ (optional) - the rtpproxy set ID (used for better indentification of the rtpproxy instance to be enabled, for example when a rtpproxy is used in multiple sets).
    

NOTE: if a rtpproxy is defined multiple times (in the same or different set), all its instances will be enables/disabled IF no set ID provided (as second param).

**Example�1.24.� `rtpproxy_enable` usage**

...
## disable a RTPProxy by URL only
$ opensips-cli -x mi rtpproxy\_enable udp:192.168.2.133:8081 0
## disable a RTPProxy by URL and set ID (3)
$ opensips-cli -x mi rtpproxy\_enable udp:192.168.2.133:8081 0 3
...
			

  

### 1.7.2.�`rtpproxy_show`

Displays all the rtp proxies and their information: set and status (disabled or not, weight and recheck\_ticks).

No parameter.

**Example�1.25.� `rtpproxy_show` usage**

...
$ opensips-cli -x mi rtpproxy\_show
...
			

  

### 1.7.3.�`rtpproxy_reload`

Reload rtp proxies sets from database. The function will delete all previous records and populate the list with the entries from the database table. The db\_url parameter must be set if you want to use this command.

No parameter.

**Example�1.26.� `rtpproxy_reload` usage**

...
$ opensips-cli -x mi rtpproxy\_reload
...