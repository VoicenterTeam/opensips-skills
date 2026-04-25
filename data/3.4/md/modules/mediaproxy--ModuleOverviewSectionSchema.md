# Mediaproxy Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5658832)

2.2. [Most recently active contributors(1) to this module](#idp5761824)

**List of Examples**

1.1. [Setting the `disable` parameter](#idp163520)

1.2. [Setting the `mediaproxy_socket` parameter](#idp168896)

1.3. [Setting the `mediaproxy_timeout` parameter](#idp5566496)

1.4. [Setting the `signaling_ip_avp` parameter](#idp5573072)

1.5. [Setting the `media_relay_avp` parameter](#idp5578384)

1.6. [Setting the `ice_candidate` parameter](#idp5583680)

1.7. [Setting the `ice_candidate_avp` parameter](#idp5589104)

1.8. [Using the `engage_media_proxy` function](#idp5596608)

1.9. [Using the `use_media_proxy` function](#idp5605424)

1.10. [Using the `end_media_session` function](#idp5610960)

## Chapter�1.�Admin Guide

## 1.1.�Overview

Mediaproxy is an OpenSIPS module that is designed to allow automatic NAT traversal for the majority of existing SIP clients. This means that there will be no need to configure anything in particular on the NAT box to allow these clients to work behind NAT when using the mediaproxy module.

## 1.2.�Principle of operation

This NAT traversal solution operates by placing a media relay in the middle between 2 SIP user-agents. It mangles the SDP messages for both of them in a way that will make the parties talk with the relay while they think they talk directly with each other.

Mediaproxy consists of 2 components:

*   The OpenSIPS mediaproxy module
    
*   An external application called MediaProxy which employs a dispatcher and multiple distributed media relays. This is available from http://ag-projects.com/MediaProxy.html (version 2.0.0 or newer is required by this module).
    

The mediaproxy dispatcher runs on the same machine as OpenSIPS and its purpose is to select a media relay for a call. The media relay may run on the same machine as the dispatcher or on multiple remote hosts and its purpose is to forward the streams between the calling parties. To find out more about the architecture of MediaProxy please read the documentation that comes with it.

To be able to act as a relay between the 2 user agents, the machine(s) running the module/proxy server must have a public IP address.

OpenSIPS will ask the media relay to allocate as many ports as there are media streams in the SDP offer and answer. The media relay will send back to OpenSIPS the IP address and port(s) for them. Then OpenSIPS will replace the original contact IP and RTP ports from the SDP messages with the ones provided by the media relay. By doing this, both user agents will try to contact the media relay instead of communicating directly with each other. Once the user agents contact the media relay, it will record the addresses they came from and will know where to forward packets received from the other endpoint. This is needed because the address/port the NAT box will allocate for the media streams is not known before they actually leave the NAT box. However the address of the media relay is always known (being a public IP) so the 2 endpoints know where to connect. After they do so, the relay learns their addresses and can forward packets between them.

The SIP clients that will work transparently behind NAT when using mediaproxy, are the so-called symmetric clients. The symmetric clients have the particularity that use the same port to send and receive data. This must be true for both signaling and media for a client to work transparently with mediaproxy without any configuration on the NAT box.

## 1.3.�Features

*   make symmetric clients work behind NAT transparently, with no configuration needed on the client's NAT box.
    
*   have the ability to distribute RTP traffic on multiple media relays running on multiple hosts.
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _dialog_ module - if engage\_media\_proxy is used (see below the description of engage\_media\_proxy).
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

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
        

  

## 1.6.�Exported Functions

### 1.6.1.�`engage_media_proxy()`

Trigger the use of MediaProxy for all the dialog requests and replies that have an SDP body. This needs to be called only once for the first INVITE in a dialog. After that it will use the dialog module to trace the dialog and automatically call use\_media\_proxy() on every request and reply that belongs to the dialog and has an SDP body. When the dialog ends it will also call automatically end\_media\_session(). All of these are called internally on dialog callbacks, so for this function to work, the dialog module must be loaded and configured.

This function is an advanced mechanism to use a media relay without having to manually call a function on each message that belongs to the dialog. However this method is less flexible, because once things were set in motion by calling this function on the first INVITE, it cannot be stopped, not even by calling end\_media\_session(). It will only stop when the dialog ends. Until then it will modify the SDP content of every in-dialog message to make it use a media relay. If one needs more control over the process, like starting to use mediaproxy only later in the failure route, or stopping to use mediaproxy in the failure route, then the use\_media\_proxy and end\_media\_session functions should be used, and manually called as appropriate. Using this function should NOT be mixed with either of use\_media\_proxy() or end\_media\_session().

This function can be used from REQUEST\_ROUTE.

**Example�1.8.�Using the `engage_media_proxy` function**

...
if (is\_method("INVITE") && !has\_totag()) {
    # We can also use a specific media relay if we need to
    #$avp(media\_relay) = "1.2.3.4";
    engage\_media\_proxy();
}
...
        

  

### 1.6.2.�`use_media_proxy()`

Will make a call to the dispatcher and replace the IPs and ports in the SDP body with the ones returned by the media relay for each supported media stream in the SDP body. This will force the media streams to be routed through the media relay. If a mix of supported and unsupported streams are present in the SDP, only the supported streams will be modified, while the unsupported streams will be left alone.

This function should NOT be mixed with engage\_media\_proxy().

This function has the following return codes:

*   +1 - successfully modified message (true value)
    
*   \-1 - error in processing message (false value)
    
*   \-2 - missing SDP body, nothing to process (false value)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.9.�Using the `use_media_proxy` function**

...
if (is\_method("INVITE")) {
    # We can also use a specific media relay if we need to
    #$avp(media\_relay) = "1.2.3.4";
    use\_media\_proxy();
}
...
        

  

### 1.6.3.�`end_media_session()`

Will call on the dispatcher to inform the media relay to end the media session. This is done when a call ends, to instruct the media relay to release the resources allocated to that call as well as to save logging information about the media session. Called on BYE, CANCEL or failures.

This function should NOT be mixed with engage\_media\_proxy().

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.10.�Using the `end_media_session` function**

...
if (is\_method("BYE")) {
    end\_media\_session();
}
...
        

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Dan Pascu ([@danpascu](https://github.com/danpascu))

130

55

4241

2404

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

39

31

688

88

3.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

21

14

504

71

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

12

41

49

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

13

11

37

33

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

22

41

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

4

2

8

4

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

4

2

7

12

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

6

31

10.

Andrei Pelinescu-Onciul

4

2

4

4

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Eric Tamme ([@etamme](https://github.com/etamme)), Marcus Hunger, Sergio Gutierrez, Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Jan Janak ([@janakj](https://github.com/janakj)), Konstantin Bokarius, Juli�n Moreno Pati�o, Klaus Darilion, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Adrian Georgescu, Elena-Ramona Modroiu, Sergio Gutierrez.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

Mar 2022 - Mar 2022

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Sep 2019

5.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Mar 2004 - Aug 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2005 - Apr 2019

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Eric Tamme ([@etamme](https://github.com/etamme))

Jul 2014 - Jul 2014

  

**All remaining contributors**: Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Sergio Gutierrez, Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Marcus Hunger, Klaus Darilion, Elena-Ramona Modroiu, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)), Adrian Georgescu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2004 Dan Pascu