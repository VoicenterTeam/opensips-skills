# Media Exchange Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5795264)

2.2. [Most recently active contributors(1) to this module](#idp5884368)

**List of Examples**

1.1. [Use `media_fork_to_uri()` function to fork media to a Media Server](#idp5527216)

1.2. [Use `media_fork_from_call()` function to fork all media streams of a call](#idp5542128)

1.3. [Use `media_fork_from_call()` function to fork only the first caller's stream](#idp5544400)

1.4. [Use `media_fork_pause()` function to temporarily stop the entire media stream of the call](#idp5554656)

1.5. [Use `media_fork_resume()` function to resume a forking previously stopped](#idp5564896)

1.6. [Use `media_exchange_from_uri()` function to fetch media from a Media Server's call](#idp5577552)

1.7. [Use `media_exchange_to_call()` function to make an announcement](#idp5588672)

1.8. [Use `media_terminate()` function to terminate an announcement](#idp5600240)

1.9. [Use `media_terminate()` function to terminate an announcement](#idp5610512)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides the means to exchange media SDP between different SIP proxied calls, and calls started or received from a Media Server. The module itself does not have any media capabilities, it simply exposes primitives to exchange the SDP body between two or more different calls.

The module can both originate calls, pushing an existing SDP to a media server, to playback, or simply record an existing RTP, as well as take the SDP of a new call and inject the SDP into an existing, proxied sip call. In order to manipulate the new calls, either generated, or terminated, the module behaves as a back-to-back user agent with the aim of the [OpenSIPS B2B entities module](b2b_entities).

In terms of the SDP media exchanged, the module can have two different modes:

*   _Two way Media_ - in this mode, the media of a new call will be pushed towards one of the legs of an existing call. This will result in a party of the call talking with the Media Server. By default, the other participant of the call will be put on hold, but this behavior can be tuned when the new leg is originated.
    
*   _Fork Media_ - the new B2B call, either originated or terminated, will just have a copy of the RTP forked by the media proxy engine. In this mode, the proxied call should have had the RTP relay engaged path before the forked call starts. One can fork only one media leg, or both legs. _NOTE:_ RTPProxy currently does not support stopping media streaming, therefore if the streaming call terminates, RTPProxy will continue streaming, even if there is no one listening on the other end.
    

This module can provide different functionalities and can be used in various use cases, such as:

*   _Call Recording_ - similar to the [OpenSIPS SIPREC](siprec) module, it can be used to fork the RTP media to a new SIP destination, but without the SIPREC payload.
    
*   _Call Listening_ - one might want to call into OpenSIPS and start listening an existing call.
    
*   _Call Announcements_ - inject an announcement from a Media Server to the participants of an ongoing call.
    

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _TM_ - Transaction module.
    
*   _Dialog_ - Dialog module for keeping track of the proxied calls.
    
*   _RTP Relay_ - optional, when the initial call either uses RTP Relay, or when using the media forking mode.
    
*   _B2B\_ENTITIES_ - Back-2-Back module used form manipulating calls with the Media Server.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Functions

### 1.3.1.� `media_fork_to_uri(URI[, leg][, headers][, medianum][, instance])`

Behaves as a B2B user agent client to initiate a call to a SIP URI and then stream the media to the SDP received in the 200 OK response.

Can be called multiple times, and will create a new call for each invocation. The generated calls can be identified using the _instance_ parameter.

Parameters:

*   _URI_ (string) - destination where to push the current call's media
    
*   _leg_ (string, optional) - the leg that will be streamed. Possible values are _caller_, _callee_ and _both_. If missing, the direction of the indialog request is used.
    
*   _headers_ (string, optional) - optional headers added to the generated request.
    
*   _medianum_ (integer, optional) - the media stream that will be forked within the call. First index is 0. If missing, all media streams of that leg(s) are streamed.
    
*   _instance_ (string, optional) - a unique name for identifying the forking instance. If missing, the _default_ name is assumed.
    

This function can be used from any route.

**Example�1.1.�Use `media_fork_to_uri()` function to fork media to a Media Server**

...
if (!has\_totag() && is\_method("INVITE"))
	media\_fork\_to\_uri("sip:record@127.0.0.1:5080");
...
	

  

### 1.3.2.� `media_fork_from_call(callid[, leg][, medianum][, instance])`

Starts streaming the media of an existing proxied call, identified by the _callid_ parameter to the SDP in the request's body.

Can be called multiple times, and will accept a new call for each invocation. The calls can be identified using the _instance_ parameter.

Parameters:

*   _callid_ (string) - the identifier of the callid to stream/fork media from
    
*   _leg_ (string, optional) - the leg that will be streamed. Possible values are _caller_, _callee_ and _both_. If missing, both legs will be streamed.
    
*   _medianum_ (integer, optional) - the media stream that will be forked within the call. First index is 0. If missing, all media streams of that leg(s) are streamed, as long as the body has enough streams.
    
    _Note:_ RTPProxy does not do any media mixing, therefore you need to make sure that the INVITE has enough SDP streams to handle all the media streams selected to fork.
    
*   _instance_ (string, optional) - a unique name for identifying the forking instance. If missing, the _default_ name is assumed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

_NOTE:_ the request of this call is completely handled by the B2B engine. Therefore, after running this function, please make sure you do not relay the message further, otherwise you will run into an unexpected behavior. Best thing to do is to exit the processing after running the function.

**Example�1.2.�Use `media_fork_from_call()` function to fork all media streams of a call**

...
if (!has\_totag() && is\_method("INVITE") && $hdr(X-CallID) != NULL)
	media\_fork\_from\_call($hdr(X-CallID));
...
	

  

**Example�1.3.�Use `media_fork_from_call()` function to fork only the first caller's stream**

...
if (!has\_totag() && is\_method("INVITE") && $hdr(X-CallID) != NULL)
	media\_fork\_from\_call($hdr(X-CallID), "caller", 0);
...
	

  

### 1.3.3.� `media_fork_pause([leg][, medianum][, instance])`

Pauses an existing RTP media streaming session. This function does not terminate the forking call, but only stops sending the RTP. It also re-invites the Media Server to inform about the change.

Parameters:

*   _leg_ (string, optional) - the leg that will be paused. Possible values are _caller_, _callee_ and _both_. If missing, all ongoing media sessions will be paused.
    
*   _medianum_ (integer, optional) - the media stream to be paused. First index is 0. If missing, all ongoing media streams associated to the selected leg will be paused.
    
*   _instance_ (string, optional) - the forking instance to be paused. If missing, all instances are paused.
    

This function can be used from any route.

**Example�1.4.�Use `media_fork_pause()` function to temporarily stop the entire media stream of the call**

...
if (has\_totag() && is\_method("INVITE"))
	media\_fork\_pause();
...
	

  

### 1.3.4.� `media_fork_resume([leg][, medianum][, instance])`

Resumes the RTP media stream of an existing session/call. This function relies on the fact that a media fork session has been previously started.

Parameters:

*   _leg_ (string, optional) - the leg that will be resumed. Possible values are _caller_, _callee_ and _both_. If missing, all existing media legs that are stopped will be started.
    
*   _medianum_ (integer, optional) - the media stream to be paused. First index is 0. If missing, all ongoing media streams associated to the selected leg will be paused.
    
*   _instance_ (string, optional) - the forking instance to be resumed. If missing, all instances are resumed.
    

This function can be used from any route.

**Example�1.5.�Use `media_fork_resume()` function to resume a forking previously stopped**

...
if (has\_totag() && is\_method("INVITE"))
	media\_fork\_resume();
...
	

  

### 1.3.5.� `media_exchange_from_uri(URI[, leg][, body][, headers][, nohold])`

Originates a call to the specified URI. The SDP in the response is fetched and pushed towards one of the call's legs, resulting in two way audio between the participant of the ongoing call, and the new call. By default, the other participant leg is put on hold.

Can be called for an in-dialog request, such as a re-INVITE (for example when putting an entity on hold), or for an INFO request (triggered for example by a DTMF).

Parameters:

*   _URI_ (string) - destination used to originate the new call.
    
*   _leg_ (string, optional) - the leg where the new media SDP will be pushed. Possible values are _caller_ and _callee_. If missing, the module considers it is an hold re-INVITE, and exchanges the media SDP of the other leg.
    
*   _body_ (string, optional) - custom body used for the generated INVITE. If missing, the body stored in the dialog associated with the involved leg will be used.
    
*   _headers_ (string, optional) - optional headers added to the generated request.
    
*   _nohold_ (integer, optional) - if set to true, the other participant will not be put on hold. This is useful when a new call will be generated for the other leg as well.
    

This function can be used from any route.

**Example�1.6.�Use `media_exchange_from_uri()` function to fetch media from a Media Server's call**

...
if (has\_totag() && is\_method("INVITE") && is\_audio\_on\_hold())
	media\_exchange\_from\_uri("sip:moh@127.0.0.1:5080");
...
	

  

### 1.3.6.� `media_exchange_to_call(callid[, leg][, nohold])`

Pushes the SDP of a new call received in an existing proxied call, resulting in two-way audio between a Media Server that originated the call, and the existing participant of the ongoing proxied call.

Parameters:

*   _callid_ (string) - the identifier of the callid to exchange media.
    
*   _leg_ (string) - the leg that will be streamed. Possible values are _caller_ and _callee_.
    
*   _nohold_ (integer, optional) - if set to true, the other participant will not be put on hold. This is useful when a new call will be generated for the other leg as well.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

_NOTE:_ the request of this call is completely handled by the B2B engine. Therefore, after running this function, please make sure you do not relay the message further, otherwise you will run into an unexpected behavior. Best thing to do is to exit the processing after running the function.

**Example�1.7.�Use `media_exchange_to_call()` function to make an announcement**

...
if (!has\_totag() && is\_method("INVITE") && $hdr(X-CallID) != NULL)
	media\_exchange\_to\_call($hdr(X-CallID), "caller");
...
	

  

### 1.3.7.� `media_terminate([leg][, nohold][, instance])`

Terminates an ongoing media session exchange, whether the media is only streamed, or two way audio is flowing. If the participant leg is involved in a different media exchange, the current leg is put on hold.

Parameters:

*   _leg_ (string, optional) - the leg to terminate the media exchange. Possible values are _caller_ and _callee_. If missing, the direction of the indialog request is used.
    
*   _nohold_ (integer, optional) - if set to true, and the other participant is involved in a different media exchange, the current leg is no longer put on hold. _Note:_ if the request that terminates the media exchange is a re-INVITE within the dialog, this function will not un-hold the other leg, as the re-INVITE itself should be relayed further to do that. This behavior can be changed by explicitly setting the _nohold_ parameter
    
*   _instance_ (string, optional) - should only be used when terminating a forking instance, and represents the instance to terminate. It must be ommitted when terminating an streaming session. However, for fallback compatibility, if the parameter is missing, and no streaming session is found, the command terminates the _default_ forking instance, if it exists.
    

This function can be used from any route.

**Example�1.8.�Use `media_terminate()` function to terminate an announcement**

...
if (has\_totag() && is\_method("INVITE") && !is\_audio\_on\_hold())
	media\_terminate();
...
	

  

### 1.3.8.� `media_handle_indialog()`

Searches for an existing media session started for any leg, and if there is ongoing session found, it performs additional logic for handling that request. For example, if media has been started in forking mode, and the INVITE is for activating on-hold, then the function will also pause the forked stream.

Depending on the return code of this function, one has to perform additional logic in the script. Possible return codes are:

*   _1_ - indicates that the message has been handled, but there's no additional tasks to be performed in the script.
    
*   _\-1_ - indicates that there is no ongoing media exchange or fork happening for that call, or that there was no additional logic to do for that request.
    
*   _\-2_ - indicates that all additional handling of the request was performed, and that the request should not be forwarded to the user agent, but instead it should be dropped.
    
*   _\-3_ - signals an internal error.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and ONREPLY\_ROUTE.

**Example�1.9.�Use `media_terminate()` function to terminate an announcement**

...
if (has\_totag() && loose\_route()) {
	# handling sequential
	media\_handle\_indialog();
	switch ($rc) {
	case -2:
		drop;
	case -1:
		xlog("no ongoing media session for $ci!\\n");
	case 1:
		break;
}
...
	

  

## 1.4.�Exported MI Functions

### 1.4.1.� `media_fork_from_call_to_uri`

MI command that has the same behavior as [media\_fork\_to\_uri()](#func_media_fork_to_uri "1.3.1.� media_fork_to_uri(URI[, leg][, headers][, medianum][, instance])"), only that the triggering is not script driven, but exterior driven. Useful for starting listening a call.

Name: _media\_fork\_from\_call\_to\_uri_

Parameters

*   _callid_ (string) - the callid of the dialog that will have its RTP streamed to the new call towards the Media Server
    
*   _uri_ (string) - the destination URI of the new call
    
*   _leg_ (string, optional) - indicates the participant leg that will have its RTP streamed in the new call. Possible values are “caller”, “callee” or “both”. If missing, both media streams are forked
    
*   _headers_ (string, optional) - extra headers to add to the outgoing request
    
*   _medianum_ (integer, optional) - the media stream that will be forked within the call. First index is 0. If missing, all media streams of that leg(s) are streamed.
    
*   _instance_ (string, optional) - the unique name of the forking instance. If missing, the _default_ name is assumed.
    

MI FIFO Command Format:

\# start streaming a callid to record media server
opensips-cli -x mi media\_fork\_from\_call\_to\_uri \\
	callid=c6fdb0f9-47dc-495d-8d38-0f37e836a531 \\
	uri=sip:record@127.0.0.1:5080
		

### 1.4.2.� `media_exchange_from_call_to_uri`

MI command that has the same behavior as [media\_exchange\_from\_uri()](#func_media_exchange_from_uri "1.3.5.� media_exchange_from_uri(URI[, leg][, body][, headers][, nohold])"), only that the triggering is not script driven, but exterior driven. Useful for injecting media announcements during a call.

Name: _media\_exchange\_from\_call\_to\_uri_

Parameters

*   _callid_ (string) - the callid of the dialog that will have it's leg mixed with the new call to the Media Server
    
*   _uri_ (string) - the destination URI of the new call
    
*   _leg_ (string) - indicates the participant that will have its media pined into the new call. Possible values are “caller” and “callee”.
    
*   _headers_ (string, optional) - extra headers to add to the outgoing request
    
*   _nohold_ (integer, optional) - if set to a non-zero value, the module avoids putting the other participant on hold when the media exchanging starts
    

MI FIFO Command Format:

\# start playing back an annoucement to caller
opensips-cli -x mi media\_exchange\_from\_call\_to\_uri \\
	callid=c6fdb0f9-47dc-495d-8d38-0f37e836a531 \\
	uri=sip:announcement@127.0.0.1:5080 \\
	leg=caller
		

### 1.4.3.� `media_exchange_from_call_to_uri_body`

MI command that does the same thing as the [media\_exchange\_from\_call\_to\_uri](#mi_media_exchange_from_call_to_uri "1.4.2.� media_exchange_from_call_to_uri") MI function, but also allows you to specify a custom body in the outgoing request. The body has to be specified in the mandatory _body_ parameter, all the other parameters being the same as the ones of [media\_exchange\_from\_call\_to\_uri](#mi_media_exchange_from_call_to_uri "1.4.2.� media_exchange_from_call_to_uri").

### 1.4.4.� `media_terminate`

MI command to terminate an ongoing media exchange.

Name: _media\_terminate_

Parameters

*   _callid_ (string) - the callid of the dialog that will have the media exchange terminated.
    
*   _leg_ (string, optional) - the leg for whom to terminate the media exchange. Accepted values are _caller_, _callee_ and _both_. If missing, all media sessions are terminated.
    
*   _nohold_ (integer, optional) - if specified and has a non-zero value, the leg that is being terminated is not put on hold if the other participant still has an ongoing media session.
    
*   _instance_ (string, optional) - should only be used when terminating a forking instance, and represents the instance to terminate. It must be ommitted when terminating an streaming session. However, for fallback compatibility, if the parameter is missing, and no streaming session is found, the command terminates the _default_ forking instance, if it exists.
    

MI FIFO Command Format:

\# terminate a caller announcement
opensips-cli -x mi media\_terminate \\
	callid=c6fdb0f9-47dc-495d-8d38-0f37e836a531 \\
	leg=caller
		

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

170

71

6539

2618

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

4

19

11

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

12

12

4.

Alexandra Titoc

4

2

6

4

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

4

2

6

3

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

4

4

7.

Norman Brandinger ([@NormB](https://github.com/NormB))

3

1

1

1

8.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2020 - May 2025

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2022 - Jul 2024

4.

Norman Brandinger ([@NormB](https://github.com/NormB))

Jun 2024 - Jun 2024

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Mar 2020 - Jul 2021

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2021 - Apr 2021

8.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2020 [www.opensips-solutions.com](http://www.opensips-solutions.com/)