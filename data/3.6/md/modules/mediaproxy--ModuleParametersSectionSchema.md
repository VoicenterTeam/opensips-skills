## 1.5.�Exported parameters

### 1.5.1.�`disable` (int)

Boolean flag that specifies if mediaproxy should be disabled. This is useful when you want to use the same OpenSIPS configuration in two different context, one using mediaproxy, the other not. In the case mediaproxy is disabled, calls to its functions will have no effect, allowing you to use the same configuration without changes.

_Default value is “0”._

**Example�1.1.�Setting the `disable` parameter**

...
modparam("mediaproxy", "disable", 1)
...
        

  

### 1.5.2.�`mediaproxy_socket` (string)

It is the path to the filesystem socket where the mediaproxy dispatcher listens for commands from the module.

_Default value is “/run/mediaproxy/dispatcher.sock”._

**Example�1.2.�Setting the `mediaproxy_socket` parameter**

...
modparam("mediaproxy", "mediaproxy\_socket", "/run/mediaproxy/dispatcher.sock")
...
        

  

### 1.5.3.�`mediaproxy_timeout` (int)

How much time (in milliseconds) to wait for an answer from the mediaproxy dispatcher.

_Default value is “500”._

**Example�1.3.�Setting the `mediaproxy_timeout` parameter**

...
modparam("mediaproxy", "mediaproxy\_timeout", 500)
...
        

  

### 1.5.4.�`signaling_ip_avp` (string)

Specification of the AVP which holds the IP address from where the SIP signaling originated. If this AVP is set it will be used to get the signaling IP address, else the source IP address from where the SIP message was received will be used. This AVP is meant to be used in cases where there are more than one proxy in the call setup path and the proxy that actually starts mediaproxy doesn't receive the SIP messages directly from the UA and it cannot determine the NAT IP address from where the signaling originated. In such a case attaching a SIP header at the first proxy and then copying that header's value into the signaling\_ip\_avp on the proxy that starts mediaproxy will allow it to get the correct NAT IP address from where the SIP signaling originated.

_Default value is “$avp(signaling\_ip)”._

**Example�1.4.�Setting the `signaling_ip_avp` parameter**

...
modparam("mediaproxy", "signaling\_ip\_avp", "$avp(nat\_ip)")
...
        

  

### 1.5.5.�`media_relay_avp` (string)

Specification of the AVP which holds an optional application defined media relay IP address of a particular media relay that is preferred to be used for the current call. If an IP address is written to this AVP before calling use\_media\_proxy(), it will be preferred by the dispatcher over the normal selection algorithm.

_Default value is “$avp(media\_relay)”._

**Example�1.5.�Setting the `media_relay_avp` parameter**

...
modparam("mediaproxy", "media\_relay\_avp", "$avp(media\_relay)")
...
        

  

### 1.5.6.�`ice_candidate` (string)

Indicates the type of ICE candidate that will be added to the SDP. It can take 3 values: 'none', 'low-priority' or 'high-priority'. If 'none' is selected no candidate will be added to the SDP. If 'low-priority' is selected then a low priority candidate will be added and if 'high-priority' is selected a high priority one.

_Default value is “none”._

**Example�1.6.�Setting the `ice_candidate` parameter**

...
modparam("mediaproxy", "ice\_candidate", "low-priority")
...
        

  

### 1.5.7.�`ice_candidate_avp` (string)

Specification of the AVP which holds the ICE candidate that will be inserted in the SDP. The value specified in this AVP will override the value in ice\_candidate module parameter. Note that if use\_media\_proxy() and end\_media\_session() functions are being used, the AVP will not be available in the reply route unless you set onreply\_avp\_mode from the tm module to '1', and if the AVP is not set, the default value will be used.

_Default value is “$avp(ice\_candidate)”._

**Example�1.7.�Setting the `ice_candidate_avp` parameter**

...
modparam("mediaproxy", "ice\_candidate\_avp", "$avp(ice\_candidate)")
...