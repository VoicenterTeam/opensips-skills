## 1.3.�Exported Parameters

### 1.3.1.�`include_callid` (int)

If this parameter is set, the optional call-id will be put into the dialog element. This is needed for call-pickup features.

_Default value is “1”._

**Example�1.1.�Set `include_callid` parameter**

...
modparam("pua\_dialoginfo", "include\_callid", 0)
...

  

### 1.3.2.�`include_tags` (int)

If this parameter is set, the local and remote tag will be put into the dialog element. This is needed for call-pickup features.

_Default value is “1”._

**Example�1.2.�Set `include_tags` parameter**

...
modparam("pua\_dialoginfo", "include\_tags", 0)
...

  

### 1.3.3.�`include_localremote` (int)

If this parameter is set, the optional local and remote elements will be put into the dialog element. This is needed for call-pickup features.

_Default value is “1”._

**Example�1.3.�Set `include_localremote` parameter**

...
modparam("pua\_dialoginfo", "include\_localremote", 0)
...

  

### 1.3.4.�`caller_confirmed` (int)

Usually the dialog-info of the caller will be "trying -> early -> confirmed" and the dialog-info of the callee will be "early -> confirmed". On some phones the function LED will start blinking if the state is early, regardless if is is the caller or the callee (indicated with the "direction" parameter). To avoid blinking LEDs for the caller, you can enable this parameter. Then the state of the caller will be singaled as "confirmed" even in "early" state. This is a workaround for the buggy Linksys SPA962 phones. SNOM phones work well with the default setting.

_Default value is “0”._

**Example�1.4.�Set `caller_confirmed` parameter**

...
modparam("pua\_dialoginfo", "caller\_confirmed", 1)
...

  

### 1.3.5.�`publish_on_trying` (int)

Usually the dialog-info of the caller will be "trying -> early -> confirmed". The "trying" state will be triggered as soon as you call [dialoginfo\_set()](#func_dialoginfo_set "1.4.1.� dialoginfo_set([side])") on the caller, while "early" is triggered as soon as the callee is ringing (triggered by a 180 or 183 provisional reply). Sometimes, it is advisable to be notified only when the callee reaches the early state and not before. In other cases, it is advisable to notify the early state. This setting allows controlling the behavior.

The intended purpose of this parameter is to reduce the rate of notifications (see RFC4235, section 3.10. Rate of Notifications).

_Default value is “0”._

**Example�1.5.�Set `publish_on_trying` parameter to 0**

...
modparam("pua\_dialoginfo", "publish\_on\_trying", 0)

# Successful call scenario:
#
# UAC       proxy       UAS     presence server
#  |--INVITE->|          |            |
#  |<-100-----|--INVITE->|            |
#  |          |<-100-----|            |
#  |          |          |            |
#  |          |<-18x-----|            |
#  |<-18x-----|--PUBLISH(early)------>|
#  |          |          |            |
#  |          |<-200-----|            |
#  |<-200-----|--PUBLISH(confirmed)-->|
#  |--ACK---->|          |            |
#  |          |--ACK---->|            |
#  |          |          |            |
#
#
# Unsuccessful call scenario:
#
# UAC       proxy       UAS     presence server
#  |--INVITE->|          |            |
#  |<-100-----|--INVITE->|            |
#  |          |<-100-----|            |
#  |          |          |            |
#  |          |<-456xx---|            |
#  |<-456xx---|--ACK---->|            |
#  |--ACK---->|          |            |
...

  

**Example�1.6.�Set `publish_on_trying` parameter to 1**

...
modparam("pua\_dialoginfo", "publish\_on\_trying", 1)

# Successful call scenario:
#
# UAC       proxy       UAS     presence server
#  |--INVITE->|          |            |
#  |<-100-----|--INVITE->|            |
#  |          |--PUBLISH(trying)----->|
#  |          |<-100-----|            |
#  |          |          |            |
#  |          |<-18x-----|            |
#  |<-18x-----|--PUBLISH(early)------>|
#  |          |          |            |
#  |          |<-200-----|            |
#  |<-200-----|--PUBLISH(confirmed)-->|
#  |--ACK---->|          |            |
#  |          |--ACK---->|            |
#  |          |          |            |
#
#
# Unsuccessful call scenario:
#
# UAC       proxy       UAS     presence server
#  |--INVITE->|          |            |
#  |<-100-----|--INVITE->|            |
#  |          |--PUBLISH(trying)----->|
#  |          |<-100-----|            |
#  |          |          |            |
#  |          |<-456xx---|            |
#  |          |--PUBLISH(terminated)->|
#  |<-456xx---|--ACK---->|            |
#  |--ACK---->|          |            |
...

  

### 1.3.6.�`nopublish_flag` (str)

By default, reINVITEs will trigger a PUBLISH. They are actually the only in-dialog request for which it makes sense. In some cases, it does not make sense to republish a dialog state. (e.g. when handling a B2BUA reINVITE). This setting defines the flag that needs to be set in the request route to prevent the generation of a PUBLISH request in case of a specific reINVITE.

**Example�1.7.�Set `nopublish_flag` parameter**

...
modparam("pua\_dialoginfo", "nopublish\_flag", "no\_publish")
...

  

### 1.3.7.�`presence_server` (string)

The address of the presence server, where the PUBLISH messages should be sent (not compulsory).

**Example�1.8.�Set `presence_server` parameter**

...
modparam("pua\_dialoginfo", "presence\_server", "sip:ps@opensips.org:5060")
...

  

### 1.3.8.�`caller_spec_param` (string)

The name of the pseudovariable that will hold a custom caller URI. If this variable is not set, the information in From header is used. If you want to use another caller definition, you have to fill in this pseudovariable before calling [dialoginfo\_set()](#func_dialoginfo_set "1.4.1.� dialoginfo_set([side])") function. The format of the string resemples the format of To/From SIP headers: "display\_name<sip\_uri>" or "sip\_uri".

**Example�1.9.�Set `caller_spec_param` parameter**

...
modparam("pua\_dialoginfo", "caller\_spec\_param", "$avp(10)")
...
		

  

### 1.3.9.�`callee_spec_param` (string)

The name of the pseudovariable that will hold the callee URI. If this variable will not be set, the callee information used will be made of To display uri + RURI. the. The format of the string to set this pseudovariable to is the same as described in caller\_spec\_param section.

**Example�1.10.�Set `caller_spec_param` parameter**

...
modparam("pua\_dialoginfo", "callee\_spec\_param", "$avp(11)")
...
		

  

### 1.3.10.�`osips_ps` (int)

It is advisable to specify if you use a different presence server than OpenSIPS presence server, by setting this parameter to 0. By default, a trick (version in the Publish body is set '0000000') is used when working with Opensips Presence Server to make the processing faster and this might not be accepted by other presence servers.

_Default value is “1”._

**Example�1.11.�Set `osips_ps` parameter**

...
modparam("pua\_dialoginfo", "osips\_ps", 0)
...