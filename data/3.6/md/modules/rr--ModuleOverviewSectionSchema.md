# rr Module

---

**List of Tables**

4.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5808336)

4.2. [Most recently active contributors(1) to this module](#idp5930240)

**List of Examples**

1.1. [Dialog support in RR module](#idp3982288)

1.2. [Set `append_fromtag` parameter](#idp210000)

1.3. [Set `enable_double_rr` parameter](#idp5577680)

1.4. [Set `add_username` parameter](#idp5582240)

1.5. [`enable_socket_mismatch_warning` usage](#idp5587072)

1.6. [`loose_route` usage](#idp5598176)

1.7. [`record_route` usage](#idp5604432)

1.8. [`record_route_preset` usage](#idp5612832)

1.9. [`add_rr_param` usage](#idp5620656)

1.10. [`check_route_param` usage](#idp5627904)

1.11. [`is_direction` usage](#idp5638352)

2.1. [Loading RR module's API from another module](#idp5782560)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module contains record routing logic

## 1.2.�Dialog support

OpenSIPS is basically _only_ a transaction statefull proxy, without any dialog support build in. There are many features/services which actually require dialog awareness, like storing the information in the dialog creation stage, information which will be used during the whole dialog existence.

The most urging example is NAT traversal, in dealing with the within the dialog INVITEs (re-INVITEs). When processing the initial INVITE, the proxy detects if the caller or callee is behind some NAT and fixes the signalling and media parts - since not all the detection mechanism are available for within the dialog requests (like usrloc), to be able to fix correspondingly the sequential requests, the proxy must remember that the original request was NAT processed. There are many other cases where dialog awareness fixes or helps.

The solution is to store additional dialog-related information in the routing set (Record-Route/Route headers), headers which show up in all sequential requests. So any information added to the Record-Route header will be found (with no direction dependencies) in Route header (corresponding to the proxy address).

As storage container, the parameters of the Record-Route / Route header will be used - Record-Route parameters mirroring are reinforced by RFC 3261 (see 12.1.1 UAS behavior).

For this purpose, the modules offers the following functions:

*   add\_rr\_param() - see [add\_rr\_param()](#func_add_rr_param "1.5.4.� add_rr_param(param)")
    
*   check\_route\_param() - see [check\_route\_param()](#func_check_route_param "1.5.5.� check_route_param(re)")
    

**Example�1.1.�Dialog support in RR module**

  
UAC                       OpenSIPS PROXY                          UAS

---- INVITE ------>       record\_route()          ----- INVITE ---->
                     add\_rr\_param(";foo=true")

--- reINVITE ----->        loose\_route()          ---- reINVITE --->
                    check\_route\_param(";foo=true")

<-- reINVITE ------        loose\_route()          <--- reINVITE ----
                    check\_route\_param(";foo=true")

<------ BYE -------        loose\_route()          <----- BYE -------
                    check\_route\_param(";foo=true")
  

  

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`append_fromtag` (integer)

If turned on, request's from-tag is appended to record-route; that's useful for understanding whether subsequent requests (such as BYE) come from caller (route's from-tag==BYE's from-tag) or callee (route's from-tag==BYE's to-tag)

_Default value is 1 (yes)._

**Example�1.2.�Set `append_fromtag` parameter**

...
modparam("rr", "append\_fromtag", 0)
...

  

### 1.4.2.�`enable_double_rr` (integer)

There are some situations when the server needs to insert two Record-Route header fields instead of one. For example when using two disconnected networks or doing cross-protocol forwarding from UDP->TCP. This parameter enables inserting of 2 Record-Routes. The server will later remove both of them.

_Default value is 1 (yes)._

**Example�1.3.�Set `enable_double_rr` parameter**

...
modparam("rr", "enable\_double\_rr", 0)
...

  

### 1.4.3.�`add_username` (integer)

If set to a non 0 value (which means yes), the username part will be also added in the Record-Route URI.

_Default value is 0 (no)._

**Example�1.4.�Set `add_username` parameter**

...
modparam("rr", "add\_username", 1)
...

  

### 1.4.4.�`enable_socket_mismatch_warning` (integer)

When a preset record-route header is forced in OpenSIPS config and the host from the record-route header is not the same as the host server, a warning will be printed out in the logs. The 'enable\_socket\_mismatch\_warning' parameter enables or disables the warning. When OpenSIPS is behind a NATed firewall, we don't want this warning to be printed for every bridged call.

_Default value is 1 (yes)._

**Example�1.5.�`enable_socket_mismatch_warning` usage**

...
modparam("rr", "enable\_socket\_mismatch\_warning", 0)
...

  

## 1.5.�Exported Functions

### 1.5.1.� `loose_route()`

The function performs routing of SIP requests which contain a route set. The name is a little bit confusing, as this function also routes requests which are in the “strict router” format.

This function is usually used to route in-dialog requests (like ACK, BYE, reINVITE). Nevertheless also out-of-dialog requests can have a “pre-loaded route set” and my be routed with loose\_route. It also takes care of translating between strict-routers and loose-router.

The loose\_route() function analyzes the Route headers in the requests. If there is no Route header, the function returns FALSE and routing should be done exclusivly via RURI. If a Route header is found, the function returns TRUE and behaves as described in section 16.12 of RFC 3261. The only exception is for requests with preload Route headers (intial requests, carrying a Route header): if there is only one Route header indicating the local proxy, then the Route header is removed and the function returns FALSE.

The function is able to automatically detecting if it deals with a 'strict' or 'loose' routing scenario (the difference is how the SIP path is stored across the RURI and Route hdrs). To make the difference between the two scenarios OpenSIPS has to determine which SIP URI holds its address/domain - the RURI (then it is a strict routing scenario) or the top Route URI (then it is a loose route scenario). In order to check if the SIP URI holds its address/domain, OpenSIPS checks the host URI against the listening IPs/interfaces (as a static component) and the domains listed from the "domain" module/table (as the dynamic component).

If there is a Route header but other parsing errors occur ( like parsing the TO header to get the TAG ), the function also returns FALSE.

Make sure your loose\_routing function can't be used by attackers to bypass proxy authorization.

The loose\_routing topic is very complex. See the RFC3261 for more details (grep for “route set” is a good starting point in this comprehensive RFC).

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�`loose_route` usage**

...
loose\_route();
...

  

### 1.5.2.� `record_route()` and `record_route(string)`

The function adds a new Record-Route header field. The header field will be inserted in the message before any other Record-Route header fields.

If any string is passed as parameter, it will be appended as URI parameter to the Record-Route header. The string must follow the “;name=value” scheme.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.7.�`record_route` usage**

...
record\_route();
...

  

### 1.5.3.� `record_route_preset(string [, string2])`

This function will put the string into Record-Route, don't use unless you know what you are doing.

Meaning of the parameters is as follows:

*   _string_ - String to be inserted into the first header field; it may contain pseudo-variables.
    
*   _string2_ (optional) - String to be inserted into the second header field.
    

Note: If 'string2' is present, then the 'string' param is pointing to the outbound interface and the 'string2' param is pointing to the inbound interface.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.8.�`record_route_preset` usage**

...
record\_route\_preset("1.2.3.4:5090");
...

  

### 1.5.4.� `add_rr_param(param)`

Adds a parameter to the Record-Route URI (param must be in “;name=value” format. The function may be called also before or after the record\_route() call (see [record\_route()](#func_record_route "1.5.2.� record_route() and record_route(string)")).

Meaning of the parameters is as follows:

*   _param_ (string) - the URI parameter to be added. It must follow the “;name=value” scheme.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.9.�`add_rr_param` usage**

...
add\_rr\_param(";nat=yes");
...

  

### 1.5.5.� `check_route_param(re)`

The function checks if the URI parameters of the local Route header (corresponding to the local server) matches the given regular expression. It must be call after loose\_route() (see [loose\_route()](#func_loose_route "1.5.1.� loose_route()")).

Meaning of the parameters is as follows:

*   _re_ (string) - regular expression to check against the Route URI parameters.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.10.�`check_route_param` usage**

...
if (check\_route\_param("nat=yes")) {
    setflag(6);
}
...

  

### 1.5.6.� `is_direction(dir)`

The function checks the flow direction of the request. As for checking it's used the “ftag” Route header parameter, the append\_fromtag (see [append\_fromtag](#param_append_fromtag "1.4.1.�append_fromtag (integer)") module parameter must be enabled. Also this must be called only after loose\_route() (see [loose\_route()](#func_loose_route "1.5.1.� loose_route()")).

The function returns true if the “dir” is the same with the request's flow direction.

The “downstream” (UAC to UAS) direction is relative to the initial request that created the dialog.

Meaning of the parameters is as follows:

*   _dir_ (string) - the direction to be checked. It may be “upstream” (from UAS to UAC) or “downstream” (UAC to UAS).
    

This function can be used from REQUEST\_ROUTE.

**Example�1.11.�`is_direction` usage**

...
if (is\_direction("upstream")) {
    xdbg("upstream request ($rm)\\n");
}
...

  

### 1.5.7.�Exported Pseudo-Variables

Exported pseudo-variables are listed in the next sections.

#### 1.5.7.1.�$rr\_params

_$rr\_params_ - the whole string of the Route parameters - this is available only after calling loose\_route()

## Chapter�2.�Developer Guide

The RR module provides an internal API to be used by other OpenSIPS modules. The API offers support for SIP dialog based functionalities - for more about the dialog support offered by RR module, see [Section�1.2, “Dialog support”](#RR-dialog-id "1.2.�Dialog support").

For internal(non-script) usage, the RR module offers to other module the possibility to register callback functions to be executed each time a local Route header is processed. The callback function will receive as parameter the register parameter and the Route header parameter string.

## 2.1.�Available Functions

### 2.1.1.� `add_rr_param( msg, param)`

Adds a parameter to the requests's Record-Route URI (param must be in “;name=value” format).

The function returns 0 on success. Otherwise, -1 is returned.

Meaning of the parameters is as follows:

*   _struct sip\_msg\* msg_ - request that will has the parameter “param” added to its Record-Route header.
    
*   _str\* param_ - parameter to be added to the Record-Route header - it must be in “;name=value” format.
    

### 2.1.2.� `check_route_param( msg, re)`

The function checks for the request “msg” if the URI parameters of the local Route header (corresponding to the local server) matches the given regular expression “re”. It must be call after the loose\_route was done.

The function returns 0 on success. Otherwise, -1 is returned.

Meaning of the parameters is as follows:

*   _struct sip\_msg\* msg_ - request that will has the Route header parameters checked.
    
*   _regex\_t\* param_ - compiled regular expression to be checked against the Route header parameters.
    

### 2.1.3.� `is_direction( msg, dir)`

The function checks the flow direction of the request “msg”. As for checking it's used the “ftag” Route header parameter, the append\_fromtag (see [append\_fromtag](#param_append_fromtag "1.4.1.�append_fromtag (integer)") module parameter must be enables. Also this must be call only after the loose\_route is done.

The function returns 0 if the “dir” is the same with the request's flow direction. Otherwise, -1 is returned.

Meaning of the parameters is as follows:

*   _struct sip\_msg\* msg_ - request that will have the direction checked.
    
*   _int dir_ - direction to be checked against. It may be “RR\_FLOW\_UPSTREAM” or “RR\_FLOW\_DOWNSTREAM”.
    

### 2.1.4.� `get_route_param( msg, name, val)`

The function search in to the “msg”'s Route header parameters the parameter called “name” and returns its value into “val”. It must be call only after the loose\_route is done.

The function returns 0 if parameter was found (even if it has no value). Otherwise, -1 is returned.

Meaning of the parameters is as follows:

*   _struct sip\_msg\* msg_ - request that will have the Route header parameter searched.
    
*   _str \*name_ - contains the Route header parameter to be serached.
    
*   _str \*val_ - returns the value of the searched Route header parameter if found. It might be empty string if the parameter had no value.
    

### 2.1.5.� `register_rrcb( callback, param, prior)`

The function register a new callback (along with its parameter). The callback will be called when a loose route will be performed for the local address.

The function returns 0 on success. Otherwise, -1 is returned.

Meaning of the parameters is as follows:

*   _rr\_cb\_t callback_ - callback function to be registered.
    
*   _void \*param_ - parameter to be passed to the callback function.
    
*   _short prior_ - parameter to set the priority. If the callback depends on another module, this parameter should be greater than that module's priority. Otherwise, it should be 0.
    

## 2.2.�Examples

**Example�2.1.�Loading RR module's API from another module**

...
#include "../rr/api.h"
...
struct rr\_binds my\_rrb;
...
...
/\* load the RR API \*/
if (load\_rr\_api( &my\_rrb )!=0) {
    LM\_ERR("can't load RR API\\n");
    goto error;
}
...
...
/\* register a RR callback \*/
if (my\_rrb.register\_rrcb(my\_callback,0,0))!=0) {
    LM\_ERR("can't register RR callback\\n");
    goto error;
}
...

  

## Chapter�3.�Frequently Asked Questions

**3.1.**

What happened with old enable\_full\_lr parameter

The parameter is considered obsolete. It was only introduced to allow compatibility with older SIP entities, that complained about a lr parameter without a value. This behavior breaks RFC 3261, and since nowadays most SIP stacks are fixed to conform with the RFC, the parameter was removed.

**3.2.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**3.3.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**3.4.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

## Chapter�4.�Contributors

## 4.1.�By Commit Statistics

**Table�4.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Jan Janak ([@janakj](https://github.com/janakj))

142

59

4374

2763

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

96

65

1915

843

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

19

16

72

105

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

19

14

244

92

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

15

10

333

88

6.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

15

10

250

64

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

83

47

8.

Andrei Pelinescu-Onciul

12

9

61

92

9.

Anca Vamanu

9

3

191

206

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

4

115

73

  

**All remaining contributors**: Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Konstantin Bokarius, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Jesus Rodrigues, Juli�n Moreno Pati�o, Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Elena-Ramona Modroiu.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 4.2.�By Commit Activity

**Table�4.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2013 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2002 - Nov 2022

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2010 - Sep 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Oct 2010 - Jan 2015

9.

Norman Brandinger ([@NormB](https://github.com/NormB))

Sep 2014 - Sep 2014

10.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

Mar 2012 - Mar 2012

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Dan Pascu ([@danpascu](https://github.com/danpascu)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jesus Rodrigues, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�5.�Documentation

## 5.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2005 Voice Sistem SRL

Copyright � 2003 FhG FOKUS