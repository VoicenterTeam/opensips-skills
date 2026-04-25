# SIPREC Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp3938752)

2.2. [Most recently active contributors(1) to this module](#idp4754752)

**List of Examples**

1.1. [Set `skip_failover_codes` parameter](#idp5305936)

1.2. [Use `siprec_start_recording()` function with a single SRS](#idp4224672)

1.3. [Use `siprec_start_recording()` function with multiple SRS servers](#idp4622288)

1.4. [Use `siprec_start_recording()` function with custom XML values for participants](#idp3063104)

1.5. [Use `siprec_start_recording()` function with custom headers](#idp2407728)

1.6. [Use `siprec_pause_recording()`](#idp4889824)

1.7. [Use `siprec_resume_recording()`](#idp3804784)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides the means to do calls recording using an external recorder - the entity that records the call is not in the media path between the caller and callee, but it is completely separate, thus it can not affect by any means the quality of the conversation. This is done in a standardized manner, using the [SIPREC Protocol](https://tools.ietf.org/html/rfc7866), thus it can be used by any recorder that implements this protocol.

Since an external server is used to record calls, there are no constraints regarding the location of the recorder, thus it can be placed arbitrary. This offers huge flexibility to your architecture configuration and various means for scaling.

The work for this module has been sponsored by the [OrecX Company](http://www.orecx.com/). This module is fully integrated with the OrecX Call Recording products.

## 1.2.�How it works

The full architecture of a SIP Media Recording platform is documented in [RFC 7245](https://tools.ietf.org/html/rfc7245). According to this architecture, this OpenSIPS module implements a SRC (Session Recording Client) that instructs a SRS (Session Recording Server) when new calls are started, the participants of the calls and their profiles. Based on this data, the SRS can decide whether the call should be recorded or not.

From SIP signalling perspective, the module does not change the call flow between the caller and callee. The call is established just as any other calls that are not recorded. But for each call that has _SIPREC_ engaged, a completely separate SIP session is started by the SRC (OpenSIPS) towards the SRS, using the [OpenSIPS Back-2-Back module](b2b_entities). The _INVITE_ message sent to the SRS contains a multi-part body consisting of two parts:

*   _Recording SDP_ - the SDP of the Media Server that will _fork_ the RTP to the recorder.
    
*   _Participants Metadata_ - an XML-formatted document that contains information about the participants. The structure of the document is detailed in [RFC 7865](https://tools.ietf.org/html/rfc7865).
    

The SRS can respond with negative reply, indicating that the session does not need to be recorded, or with a positive reply (200 OK), indicating in the SDP body where the media RTP should be _sent/forked_. When the call ends, the SRC must send a _BYE_ message to the SRS, indicating that the recording should be completed.

Full examples of call flows can be found in [RFC 8068](https://tools.ietf.org/html/rfc8068).

## 1.3.�Media Handling

Since OpenSIPS is a SIP Proxy, it does not have any Media Capabilities by itself. Thus we need to rely on a different Media Server to capture the RTP traffic and fork it to the SRS. The current implementation supports both the [RTPProxy](http://www.rtpproxy.org/) (through the [RTPProxy module](rtpproxy)) and [RTPEngine](https://github.com/sipwise/rtpengine) (through the [RTEngine module](rtpengine)) Media Servers.

## 1.4.�SRS Failover

The _siprec_ module supports failover between multiple SRS servers - when calling the _[siprec\_start\_recording()](#func_siprec_start_recording "1.8.1.� siprec_start_recording(srs)")_ function, one can provision multiple SRS URIs, separated by comma. In this case, OpenSIPS will try to use them in the same order specified, one by one, until either one of them responds with a positive reply (200 OK), or the response code is one of the codes matched by the _[skip\_failover\_codes](#param_skip_failover_codes "1.7.1.�skip_failover_codes (string)")_ regular expression. In the latter case the call is not recorded at all.

## 1.5.�Limitations

This module only implements the SRC specifications of the [SIPREC RFC](https://tools.ietf.org/html/rfc7866). In order to have a full recording solution, you will also need a SRS solution such as [Oreka](http://oreka.sourceforge.net/) - an open-source project provided by [OrecX](http://www.orecx.com/).

Although this module provides all the necessary tools to do calls recording, it does not fully implement the entire _SIPREC_ SRC specifications. This list contains some of the module's limitations:

*   _There is no Recording Indicator played to the callee_ - since OpenSIPS continues to act as a proxy, there is no way for us to postpone the media between the caller and callee to play a Recording Indicator message.
    
*   _Cannot handle Recording Sessions initiated by SRS_ - we do not support the scenario when an SRS suddently decides to record a call in the middle of the dialog.
    
*   _OpenSIPS cannot be “queried” for ongoing recording sessions_ - this is scheduled to be implemented in further releases.
    

## 1.6.�Dependencies

### 1.6.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _TM_ - Transaction module.
    
*   _Dialog_ - Dialog module for keeping track of the call.
    
*   _RTP\_Relay_ - RTP Relay module used for controlling the Media Servers that will fork the media.
    
*   _B2B\_ENTITIES_ - Back-2-Back module used for communicating with the SRS.
    

### 1.6.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.7.�Exported Parameters

### 1.7.1.�`skip_failover_codes` (string)

A regular expression used to specify the codes that should prevent the module from failing over to a new SRS server.

_By default any negative reply generates a failover._

**Example�1.1.�Set `skip_failover_codes` parameter**

...
# do not failover on 408 reply codes
modparam("siprec", "skip\_failover\_codes", "408")

# do not failover on 408 or 487 reply codes
modparam("siprec", "skip\_failover\_codes", "408|487")

# do not failover on any 3xx or 4xx reply code
modparam("siprec", "skip\_failover\_codes", "\[34\]\[0-9\]\[0-9\]")
...
		

  

## 1.8.�Exported Functions

### 1.8.1.� `siprec_start_recording(srs)`

Calling this function on an initial _INVITE_ engages call recording to SRS(s) for that call. Note that it does not necessary mean that the call will be recorded - it just means that OpenSIPS will query instruct the SRS that a new call has started, but the SRS might decide that the recording is disabled for those participants.

_Note_ that the call recording is not started right away, but only when the callee provides an SDP as well (usually in a 200 OK, or possibly a 183 Ringing).

_Note_ if you only want to start recording when the call is established (200 OK is received), then you should call this function in the onreply route processing that 200 OK.

Parameters:

*   _srs_ (string) - a comma-separated list of SRS URIs. These URIs are used in the order specified. See [siprec\_srs\_failover](#siprec_srs_failover "1.4.�SRS Failover") for more information.
    

The function returns false when an internal error is triggered and the call recording setup fails. Otherwise, if all the internal mechanisms are activated, it returns true.

This function can be used from REQUEST\_ROUTE.

**Example�1.2.�Use `siprec_start_recording()` function with a single SRS**

	...
	if (!has\_totag() && is\_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1";
		xlog("Engage SIPREC call recording to $var(srs) for $ci\\n");
		siprec\_start\_recording($var(srs));
	}
	...
	

  

**Example�1.3.�Use `siprec_start_recording()` function with multiple SRS servers**

	...
	if (!has\_totag() && is\_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1, sip:127.0.0.1;transport=TCP";
		xlog("Engage SIPREC call recording to servers $var(srs) for $ci in inbound group\\n");
		siprec\_start\_recording($var(srs), "inbound");
	}
	...
	

  

**Example�1.4.�Use `siprec_start_recording()` function with custom XML values for participants**

	...
	$xml(caller\_xml) = "<nameID></nameID>";
	$xml(caller\_xml/nameID.attr/aor) = "sip:6024151234@10.0.0.11:5090";
	$xml(caller\_xml/nameID) = "<name>test</name>";
	$siprec(caller) = $xml(caller\_xml/nameID);
	siprec\_start\_recording($var(srs));
	...
	

  

**Example�1.5.�Use `siprec_start_recording()` function with custom headers**

	...
	$siprec(headers) = "X-MY-CUSTOM\_HDR: 1\\r\\n";
	siprec\_start\_recording($var(srs));
	...
	

  

### 1.8.2.� `siprec_pause_recording()`

Pauses the recording for the ongoing call. Should be called after the dialog has matched.

This function can be used from any route.

**Example�1.6.�Use `siprec_pause_recording()`**

	...
	if (has\_totag() && is\_method("INVITE")) {
		if (is\_audio\_on\_hold())
			siprec\_pause\_recording();
	}
	...
	

  

### 1.8.3.� `siprec_resume_recording()`

Resumes the recording for the ongoing call. Should be called after the dialog has matched.

This function can be used from any route.

**Example�1.7.�Use `siprec_resume_recording()`**

	...
	if (has\_totag() && is\_method("INVITE")) {
		if (!is\_audio\_on\_hold())
			siprec\_resume\_recording();
	}
	...
	

  

## 1.9.�Exported Pseudo-Variables

### 1.9.1.�`$siprec`

Used to modify/describe different siprec sessions parameters that should be taken into account by the [siprec\_start\_recording()](#func_siprec_start_recording "1.8.1.� siprec_start_recording(srs)") function.

The context of this variable is only limited to the current message processed - it is not available at the transaction or dialog level.

Any of this setting is optional.

Settings that can be provisioned:

*   _group_ - an apaque value that will be inserted in the SIPREC body and represents the name of the group that can be used to clasify calls in certain profiles. If missing, no group is added.
    
*   _caller_ - an XML block containing information about the caller. If absent, the _From_ header is used to build the value.
    
*   _callee_ - an XML block containing information about the callee. If absent, the _To_ header is used to build the value.
    
*   _media_ - the IP that RTPProxy will be streaming media from. If absent _127.0.0.1_ will be used. _NOTE:_ deprecated _media\_ip_ is an alias for this param.
    
*   _headers_ - extra headers that are to be added in the initial request towards the SRS. _NOTE:_ headers must be separated by _\\r\\n_ and must end with _\\r\\n_.
    
*   _socket_ - listening socket that the outgoing request towards SRS should be used.
    

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

155

84

4924

1831

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

16

11

166

149

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

35

53

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

3

2

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

4

4

6.

Norman Brandinger ([@NormB](https://github.com/NormB))

3

1

4

4

7.

Jupiter Tang

2

1

8

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Jupiter Tang

Dec 2025 - Dec 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2017 - Oct 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2018 - Aug 2023

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Feb 2018 - Mar 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

6.

Norman Brandinger ([@NormB](https://github.com/NormB))

Aug 2021 - Aug 2021

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2019 - Apr 2021

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Norman Brandinger ([@NormB](https://github.com/NormB)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)