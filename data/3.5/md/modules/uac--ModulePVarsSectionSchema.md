# UAC Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6038528)

3.2. [Most recently active contributors(1) to this module](#idp6159216)

**List of Examples**

1.1. [Set `restore_mode` parameter](#idp5924496)

1.2. [Set `restore_passwd` parameter](#idp5929104)

1.3. [Set `rr_from_store_param` parameter](#idp5934048)

1.4. [Set `rr_to_store_param` parameter](#idp5938992)

1.5. [Set `force_dialog` parameter](#idp5943040)

1.6. [`uac_replace_from`/`uac_replace_to` usage](#idp5951840)

1.7. [`uac_restore_from`/`uac_restore_to` usage](#idp5958816)

1.8. [`uac_auth` usage](#idp5970144)

1.9. [`uac_inc_cseq` usage](#idp5976064)

## Chapter�1.�Admin Guide

## 1.1.�Overview

UAC (User Agent Client) module provides some basic UAC functionalities like FROM / TO header manipulation (anonymization) or client authentication.

If the dialog module is loaded and a dialog can be created, then the auto mode can be done more efficiently.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _TM - Transaction Module_.
    
*   _RR - Record-Route Module_, but only if restore mode for FROM URI is set to “auto”.
    
*   _UAC\_AUTH - UAC Authentication Module_.
    
*   _Dialog Module_, if “force\_dialog” module parameter is enabled, or a dialog is created from the configuration script.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

## 1.3.�Exported Parameters

### 1.3.1.�`restore_mode` (string)

There are 3 mode of restoring the original headers (FROM/TO) URI:

*   “none” - no information about original URI is stored; restoration is not possible.
    
*   “manual” - all following replies will be restored, except for the sequential requests - these must be manually updated based on original URI.
    
*   “auto” - all sequential requests and replies will be automatically updated based on stored original URI.
    

_This parameter is optional, it's default value being “auto”._

**Example�1.1.�Set `restore_mode` parameter**

...
modparam("uac","restore\_mode","auto")
...
				

  

### 1.3.2.�`restore_passwd` (string)

String password to be used to encrypt the RR storing parameter (when replacing the TO/FROM headers). If empty, no encryption will be used.

_Default value of this parameter is empty._

**Example�1.2.�Set `restore_passwd` parameter**

...
modparam("uac","restore\_passwd","my\_secret\_passwd")
...
				

  

### 1.3.3.�`rr_from_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original FROM URI.

_This parameter is optional, it's default value being “vsf”._

**Example�1.3.�Set `rr_from_store_param` parameter**

...
modparam("uac","rr\_from\_store\_param","my\_Fparam")
...
				

  

### 1.3.4.�`rr_to_store_param` (string)

Name of Record-Route header parameter that will be used to store (encoded) the original TO URI.

_This parameter is optional, it's default value being “vst”._

**Example�1.4.�Set `rr_to_store_param` parameter**

...
modparam("uac","rr\_to\_store\_param","my\_Tparam")
...
				

  

### 1.3.5.�`force_dialog` (int)

Force create dialog if it is not created from the configuration script.

Default value is no.

**Example�1.5.�Set `force_dialog` parameter**

...
modparam("uac", "force\_dialog", yes)
...
				

  

## 1.4.�Exported Functions

### 1.4.1.� `uac_replace_from([display],uri)` `uac_replace_to([display],uri)`

Replace in FROM/TO header the _display_ name or/and the _URI_ part.

Both parameters are string. The _display_ is optional. If missing, only the URI will be changed in the message.

IMPORTANT: calling the function more than once per branch will lead to inconsistent changes over the request.Be sure you do the change only ONCE per branch. Note that calling the function from REQUEST ROUTE affects all the branches!, so no other change will be possible in the future. For per branch changes use BRANCH and FAILURE route.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.6.�`uac_replace_from`/`uac_replace_to` usage**

...
# replace both display and uri
uac\_replace\_from($avp(display),$avp(uri));
# replace only display and do not touch uri
uac\_replace\_from("batman","");
# remove display and replace uri
uac\_replace\_from("","sip:robin@gotham.org");
# remove display and do not touch uri
uac\_replace\_from("","");
# replace the URI without touching the display
uac\_replace\_from( , "sip:batman@gotham.org");
...
				

  

### 1.4.2.� `uac_restore_from()` `uac_restore_to()`

This function will check if the FROM/TO URI was modified and will use the information stored in header parameter to restore the original FROM/TO URI value.

NOTE - this function should be used only if you configured MANUAL restoring of the headers (see restore\_mode param). For AUTO and NONE, there is no need to use this function.

This function can be used from REQUEST\_ROUTE.

**Example�1.7.�`uac_restore_from`/`uac_restore_to` usage**

...
uac\_restore\_from();
...
				

  

### 1.4.3.� `uac_auth()`

This function can be called only from failure route and will build the authentication response header and insert it into the request without sending anything. Credentials for buiding the authentication response will be taken from the list of credentials provided by the uac\_auth module (static or via AVPs).

As optional parameter, the function may receive a list of auth algorithms to be considered / supported during authentication:

*   MD5, MD5-sess
    
*   SHA-256, SHA-256-sess (may be missing, depends on lib support)
    
*   SHA-512-256, SHA-512-256-sess (may be missing, depends on lib support)
    

Note that the CSeq is automatically increased during authentication.

This function can be used from FAILURE\_ROUTE.

_NOTE:_ when used without dialog support, the _uac\_auth()_ function cannot be used for authenticating in-dialog requests, as there is no mechanism to store the CSeq changes that are required for ensuring the correctness of the dialog. The only exception are _BYE_ messages, which are the last messages within a call, hence no further adjustments are needed. The function can still be used for authenticating the initial INVITE though.

**Example�1.8.�`uac_auth` usage**

...
uac\_auth();
...
failure\_route\[check\_auth\] {
    ...
    if ($T\_reply\_code==407) {
        if (uac\_auth("MD5,MD5-sess")) {
            # auth is succesful, just relay
            t\_relay();
            exit;
        }
        # auth failed (no credentials maybe)
        # so continue handling the 407 reply
    }
    ...
}
...
				

  

### 1.4.4.� `uac_inc_cseq()`

This function can be called to increase the CSeq of an ongoing request.

It receives as the _cseq_ parameter the value that the CSeq should be incremented with.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.9.�`uac_inc_cseq` usage**

...
uac\_inc\_cseq(1);
...
				

  

## Chapter�2.�Frequently Asked Questions

$

**2.1.**

What happened with auth\_username\_avp, auth\_realm\_avp and auth\_password\_avp parameters

Due some restructuring of the UAC auth modules, these parameters were moved into the "uac\_auth" module. This module is now responsible for handling all the credentials (static defined or dynamically defined via AVPs). The UAC module will still see the credentials defined via the AVPs.

**2.2.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.3.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.4.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

129

75

4208

1076

2.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

34

8

403

1351

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

32

24

560

148

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

26

18

302

295

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

15

11

138

88

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

10

5

150

175

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

10

3

168

294

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

9

5

243

18

9.

Andreas Heise

7

3

105

129

10.

Edson Gellert Schubert

5

1

0

201

  

**All remaining contributors**: Elena-Ramona Modroiu, Henning Westerholt ([@henningw](https://github.com/henningw)), Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Jesus Rodrigues, Sergio Gutierrez.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Oct 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2010 - Aug 2023

3.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2011 - Jun 2023

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2005 - Apr 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Mar 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Mar 2021 - Feb 2023

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Aug 2011 - Sep 2015

10.

Sergio Gutierrez

Nov 2008 - Nov 2008

  

**All remaining contributors**: Dan Pascu ([@danpascu](https://github.com/danpascu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Jesus Rodrigues, Andreas Heise, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jesus Rodrigues, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2005-2009 Voice Sistem SRL