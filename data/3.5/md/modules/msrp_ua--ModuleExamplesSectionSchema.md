# MSRP UA Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5870784)

3.2. [Most recently active contributors(1) to this module](#idp5947712)

**List of Examples**

1.1. [Set `hash_size` parameter](#idp5579680)

1.2. [Set `cleanup_interval` parameter](#idp5584624)

1.3. [max\_duration parameter example](#idp5588672)

1.4. [`my_uri` parameter usage](#idp5593328)

1.5. [`advertised_contact` parameter usage](#idp5597968)

1.6. [`relay_uri` parameter usage](#idp5603232)

1.7. [`msrp_ua_answer()` usage](#idp5611280)

2.1. [`struct msrp_ua_handler` structure](#idp5818336)

2.2. [`msrp_ua_notify_cb_f` prototype](#idp5820624)

2.3. [`struct msrp_ua_notify_params` structure](#idp5822624)

2.4. [`enum msrp_ua_event_type`](#idp5824800)

2.5. [`msrp_ua_req_cb_f` prototype](#idp5826848)

2.6. [`msrp_ua_rpl_cb_f` prototype](#idp5828736)

2.7. [`enum msrp_failure_report_type`](#idp5852256)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements an User Agent capable of establishing messaging sessions using the MSRP(RFC 4976) protocol.

Through an internal API and exported script and MI functions, the module allows OpenSIPS to set up MSRP sessions via SIP and exchange messages as an MSRP endpoint.

The module makes use of the _proto\_msrp_ module for the MSRP protocol stack and the _b2b\_entities_ module for the SIP UAC/UAS functionalities.

## 1.2.�Usage from Script and External API

In order to start a SIP call carying MSRP from OpenSIPS you can use the [msrp\_ua\_start\_session](#mi_msrp_ua_start_session "1.6.2.� msrp_ua_start_session") MI function. Alternatively, to answer a SIP session with MSRP you can use the [msrp\_ua\_answer()](#func_msrp_ua_answer "1.5.1.� msrp_ua_answer(content_types)") script function.

When a UAC or UAS session is successfully established(ACK sent/received) the [E\_MSRP\_SESSION\_NEW](#event_E_MSRP_SESSION_NEW "1.7.1.� E_MSRP_SESSION_NEW") event is triggered. After this point, you may receive MSRP messages or Reports, signaled by the [E\_MSRP\_MSG\_RECEIVED](#event_E_MSRP_MSG_RECEIVED "1.7.3.� E_MSRP_MSG_RECEIVED") and [E\_MSRP\_REPORT\_RECEIVED](#event_E_MSRP_REPORT_RECEIVED "1.7.4.� E_MSRP_REPORT_RECEIVED") events.

Note that the _E\_MSRP\_REPORT\_RECEIVED_ event covers both actual MSRP REPORT requests as well as negative MSRP transaction responses and local send timeouts(which should be treated the same as a received timeout transaction response).

You can send MSRP messages to the peer with the [msrp\_ua\_send\_message](#mi_msrp_ua_send_message "1.6.1.� msrp_ua_send_message") MI function.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _proto\_msrp_
    
*   _b2b\_entities_
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`hash_size` (int)

The size of the hash table that stores the MSRP session information. It is the 2 logarithmic value of the real size.

_Default value is “10”_ (1024 records).

**Example�1.1.�Set `hash_size` parameter**

...
modparam("msrp\_ua", "hash\_size", 16)
...
		

  

### 1.4.2.�`cleanup_interval` (int)

The interval between full iterations of the sessions table in order to clean up expired MSRP sessions.

_Default value is “60”._

**Example�1.2.�Set `cleanup_interval` parameter**

...
modparam("msrp\_ua", "cleanup\_interval", 30)
...
		

  

### 1.4.3.�`max_duration` (integer)

The maximum duration of a call. If set to 0, there will be no limitation.

The default value is 12 \* 3600 seconds (12 hours).

**Example�1.3.�max\_duration parameter example**

...
modparam("msrp\_ua", "max\_duration", 7200)
...

  

### 1.4.4.�`my_uri` (string)

The MSRP URI of the OpenSIPS endpoint. This URI will be advertised in the SDP offer provided to peers when setting up a session and should match one of the MSRP listeners defined in the script.

The _session-id_ part of the URI should be ommited.

If the port is not set explicitly, the default value of 2855 wil be assumed

**Example�1.4.�`my_uri` parameter usage**

...
modparam("msrp\_ua", "my\_uri", "msrp://opensips.org:2855;tcp")
...

  

### 1.4.5.�`advertised_contact` (string)

Contact to be used in the generated SIP requests. For sessions answered by OpenSIPS, if it is not set, it is constructed dynamically from the socket where the initiating request was received.

This parameter is mandatory when using the [msrp\_ua\_start\_session](#mi_msrp_ua_start_session "1.6.2.� msrp_ua_start_session") MI function.

**Example�1.5.�`advertised_contact` parameter usage**

...
modparam("msrp\_ua", "advertised\_contact", "sip:oss@opensips.org")
...

  

### 1.4.6.�`relay_uri` (string)

URI of an MSRP relay to use for both accepted and initiated sessions.

Credentials for the MSRP client are provided via the _uac\_auth_ module by setting the _credential_ module parameter.

If not set, no relay will be used.

**Example�1.6.�`relay_uri` parameter usage**

...
modparam("msrp\_ua", "relay\_uri", "msrp://opensips.org:2856;tcp")
...

  

## 1.5.�Exported Functions

### 1.5.1.� `msrp_ua_answer(content_types)`

This functions answers an initial INVITE offering a new MSRP messaging session. After this function is used to initialize the session, the call will be completely handled by the B2B engine.

Parameters:

*   _content\_types_ (string) - content types adevertised in the _accept-types_ SDP attribute. At least one of the content types in this list must match the types offered by the peer in its SDP offer.
    

This function can be used only from a request route.

**Example�1.7.�`msrp_ua_answer()` usage**

...
if (!has\_totag() && is\_method("INVITE")) {
	msrp\_ua\_answer("text/plain");
	exit;
}
...

  

## 1.6.�Exported MI Functions

### 1.6.1.� `msrp_ua_send_message`

Sends a new MSRP message to the peer.

Name: _msrp\_ua\_send\_message_

Parameters

*   _session\_id_ (string) - the MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _mime_ (string, optional) - MIME content type of this message. If missing, an empty message will be sent.
    
*   _body_ (string, optional) - actual message body. If missing, an empty message will be sent.
    
*   _success\_report_ (string, optional) - string indicating whether to request an MSRP Success Report. Possible values are _yes_ or _no_. If the parameter is missing or is set to "no" the SEND request will not include a Success-Report header.
    
*   _failure\_report_ (string, optional) - string indicating whether to request an MSRP Failure Report. Possible values are _yes_, _no_ or _partial_, as specified in MSRP. If the parameter is missing or is set to "yes" the SEND request will not include a Failure-Report header. Note that if the header field is not present, the receving MSRP endpoint must treat it the same as a Failure-Report header with a value of "yes".
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_send\_message \\
	session\_id=5addd9e7b74fa44fbace68a4fc562293 \\
	mime=text/plain body=Hello success\_report=yes
		

### 1.6.2.� `msrp_ua_start_session`

Starts a MSRP session.

The [advertised\_contact](#param_advertised_contact "1.4.5.�advertised_contact (string)") is mandatory if this function is used.

Name: _msrp\_ua\_start\_session_

Parameters

*   _content\_types_ (string) - content types adevertised in the _accept-types_ SDP attribute.
    
*   _from\_uri_ (string) - From URI to be used in the INVITE.
    
*   _to\_uri_ (string) - To URI to be used in the INVITE.
    
*   _ruri_ (string) - Request URI and destination of the INVITE.
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_start\_session \\
	text/plain sip:oss@opensips.org \\
	sip:alice@opensips.org sip:alice@opensips.org
		

### 1.6.3.� `msrp_ua_list_sessions`

Lists information about ongoing MSRP sessions.

Name: _msrp\_ua\_list\_sessions_

Parameters

*   _None_.
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_list\_sessions
		

### 1.6.4.� `msrp_ua_end_session`

Terminate an ongoing MSRP session.

Name: _msrp\_ua\_end\_session_

Parameters

*   _session\_id_ (string) - the MSRP session identifier ("session-id" part of the MSRP URI).
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_end\_session \\
	5addd9e7b74fa44fbace68a4fc562293
		

## 1.7.�Exported Events

### 1.7.1.� `E_MSRP_SESSION_NEW`

This event is triggered when a new MSRP session is successfully established(ACK sent/received).

Parameters:

*   _from\_uri_ - The URI in the SIP From header of the answered INVITE.
    
*   _to\_uri_ - The URI in the SIP To header of the answered INVITE.
    
*   _ruri_ - The SIP Request URI of the answered INVITE.
    
*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _content\_types_ - The content types offered by the peer in the _accept-types_ SDP attribute.
    

### 1.7.2.� `E_MSRP_SESSION_END`

This event is triggered when an ongoing MSRP session is terminted (session expires or BYE is received; terminating a session via the _msrp\_ua\_end\_session_ MI function is not included).

Parameters:

*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    

### 1.7.3.� `E_MSRP_MSG_RECEIVED`

This event is triggered when receiving a new, non-empty MSRP SEND request from the peer.

Parameters:

*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _content\_type_ - The content type of this message.
    
*   _body_ - The actual message body.
    

### 1.7.4.� `E_MSRP_REPORT_RECEIVED`

This event is triggered when:

*   a MSRP REPORT request is received
    
*   a failure transaction response is received
    
*   a local timeout for a SEND request occured.
    

Parameters:

*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _message\_id_ - The value of the Message-ID header field.
    
*   _status_ - The value of the Status header field.
    
*   _byte\_range_ - The value of the Byte-Range header field.
    

## Chapter�2.�Developer Guide

## 2.1.�Overview

In order to answer a SIP session carying MSRP the [init\_uas()](#func_init_uas "2.2.1.� init_uas(msg, accept_types, hdl)") function should be used. Conversely for starting a MSRP call as a UAC, one can use the [init\_uac()](#func_init_uac "2.2.2.� init_uac(accept_types, from_uri, to_uri, ruri, hdl)") function.

After initializing the session with either of the above functions, the SIP call will be further handled by the module and notifications regarding significant SIP level events and received MSRP requests and responses will be delivered via registering callback functions.

MSRP SEND requests can be sent with the [send\_message()](#func_send_message "2.2.4.� send_message(session_id, mime, body, failure_report, success_report)") function after the sessions is established, which will be signaled by the _msrp\_ua\_notify\_cb\_f_ callback with the _MSRP\_UA\_SESS\_ESTABLISHED_ event.

Received MSRP requests, transaction responses and local send timeouts will be signaled via the _msrp\_ua\_req\_cb\_f_ and _msrp\_ua\_rpl\_cb\_f_ callbacks.

## 2.2.�Available Functions

### 2.2.1.� `init_uas(msg, accept_types, hdl)`

This function will intialize a MSRP UA session based on a received SIP INVITE.

Meaning of the parameters is as follows:

*   _struct sip\_msg \*msg_ - the SIP message
    
*   _str \*accept\_types_ - the value of the "accept-types" attribute to include in the SDP offer.
    
*   _struct msrp\_ua\_handler \*hdl_ - handler structure used to register the callbacks for SIP level and MSRP level notifications.
    

**Example�2.1.�`struct msrp_ua_handler` structure**

struct msrp\_ua\_handler {
	/\* name of this registration \*/
	str \*name;
	/\* parameter to be passed to msrp\_req\_cb and msrp\_rpl\_cb callbacks \*/
	void \*param;
	/\* callback for SIP level notifications \*/
	msrp\_ua\_notify\_cb\_f notify\_cb;
	/\* callback for receving MSRP requests \*/
	msrp\_ua\_req\_cb\_f msrp\_req\_cb;
	/\* callback for receving MSRP responses \*/
	msrp\_ua\_rpl\_cb\_f msrp\_rpl\_cb;
};

  

**Example�2.2.�`msrp_ua_notify_cb_f` prototype**

typedef int (\*msrp\_ua\_notify\_cb\_f)(struct msrp\_ua\_notify\_params \*params,
	void \*hdl\_param);

  

**Example�2.3.�`struct msrp_ua_notify_params` structure**

struct msrp\_ua\_notify\_params {
	/\* event type \*/
	enum msrp\_ua\_event\_type event;
	/\* SIP message \*/
	struct sip\_msg \*msg;
	/\* SDP "accept-types" attribute in case of MSRP\_UA\_SESS\_ESTABLISHED event \*/
	str \*accept\_types;
	/\* MSRP UA session ID \*/
	str \*session\_id;
};

  

**Example�2.4.�`enum msrp_ua_event_type`**

enum msrp\_ua\_event\_type {
	/\* session established (ACK sent/received) \*/
	MSRP\_UA\_SESS\_ESTABLISHED = 1,
	/\* failed to establish session (negative reply/timeout etc.) \*/
	MSRP\_UA\_SESS\_FAILED,
	/\* BYE received/sent(in case of session timeout) \*/
	MSRP\_UA\_SESS\_TERMINATED
};

  

**Example�2.5.�`msrp_ua_req_cb_f` prototype**

typedef int (\*msrp\_ua\_req\_cb\_f)(struct msrp\_msg \*req, void \*hdl\_param);

  

**Example�2.6.�`msrp_ua_rpl_cb_f` prototype**

/\* an MSRP transaction timeout will be signaled by calling this callback
 \* with a NULL rpl parameter \*/
typedef int (\*msrp\_ua\_rpl\_cb\_f)(struct msrp\_msg \*rpl, void \*hdl\_param);

  

### 2.2.2.� `init_uac(accept_types, from_uri, to_uri, ruri, hdl)`

This function will intialize a MSRP UA session by sending a SIP INVITE to a destination.

Meaning of the parameters is as follows:

*   _str \*accept\_types_ - the value of the "accept-types" attribute to include in the SDP offer.
    
*   _str \*from\_uri_ - URI to use in the From header of the INVITE.
    
*   _str \*to\_uri_ - URI to use in the To header of the INVITE.
    
*   _str \*ruri_ - Request URI to use in the for the INVITE.
    
*   _struct msrp\_ua\_handler \*hdl_ - handler structure used to register the callbacks for SIP level and MSRP level notifications.
    

### 2.2.3.� `end_session(session_id)`

This function terminates an MSRP session.

Meaning of the parameters is as follows:

*   _str \*session\_id_ - MSRP UA session ID.
    

### 2.2.4.� `send_message(session_id, mime, body, failure_report, success_report)`

This functions sends an MSRP SEND request to the peer.

Meaning of the parameters is as follows:

*   _str \*session\_id_ - MSRP UA session ID.
    
*   _str \*mime_ - MIME content type of this message. If NULL, an empty message will be sent.
    
*   _str \*body_ - actual message body. If NULL, an empty message will be sent.
    
*   _enum msrp\_failure\_report\_type failure\_report_ - MSRP Failure Report type - yes, no or partial.
    
*   _int success\_report_ - indication whether to request an MSRP Failure Report or not.
    

**Example�2.7.�`enum msrp_failure_report_type`**

enum msrp\_failure\_report\_type {
	MSRP\_FAILURE\_REPORT\_YES,
	MSRP\_FAILURE\_REPORT\_PARTIAL,
	MSRP\_FAILURE\_REPORT\_NO
};

  

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

55

16

4038

293

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

6

6

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

3

1

11

1

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

3

1

8

8

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2022 - Jan 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2022 - Aug 2022

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2022 - Jul 2022

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

May 2022 - May 2022

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2022 [www.opensips-solutions.com](http://www.opensips-solutions.com/)