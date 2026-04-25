# httpd Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5602656)

3.2. [Most recently active contributors(1) to this module](#idp5709920)

**List of Examples**

1.1. [Set `ip` parameter](#idp108848)

1.2. [Set `port` parameter](#idp5515792)

1.3. [Set `buf_size` parameter](#idp5520864)

1.4. [Set `post_buf_size` parameter](#idp5525472)

1.5. [Set `tls_cert_file` parameter](#idp5530032)

1.6. [Set `tls_key_file` parameter](#idp5534672)

1.7. [Set `tls_key_file` parameter](#idp5541056)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides an HTTP transport layer for OpenSIPS.

Implementation of httpd module's http server is based on libmicrohttpd library.

## 1.2.�Overview

TLS for the http server is enabled by setting the `tls_cert_file` and `tls_key_file` parameters. If this is enabled, support for plain http is disabled.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libmicrohttpd_, with EPOLL support. This typically means a version newer than **0.9.50**.
    

**WARNING!** Please be aware about an EPOLL support regression in the _libmicrohttpd_ library and packaging which affects the OpenSIPS httpd module, which was fixed according to the below timeline. The effect of the regression is that the HTTP reply body is _sometimes_ never written by the library, causing the client (e.g. opensips-cli) to hang indefinitely waiting for it:

*   versions **0.9.51** - **0.9.52** have been tested and work correctly
    
*   regression introduced in **0.9.53** (Apr 2017), lasting until **0.9.71** (May 2020)
    
*   regression is fixed since **0.9.72** (Dec 2020)
    

## 1.4.�Exported Parameters

### 1.4.1.�`ip`(string)

The IP address used by the HTTP server to listen for incoming requests.

_The default value is "\*"_ (bind to all IPv6 and IPv4 interfaces).

**Example�1.1.�Set `ip` parameter**

...
modparam("httpd", "ip", "127.0.0.1")
...

  

### 1.4.2.�`port`(integer)

The port number used by the HTTP server to listen for incoming requests.

_The default value is 8888._ Ports lower than 1024 are not accepted.

**Example�1.2.�Set `port` parameter**

...
modparam("httpd", "port", 8000)
...

  

### 1.4.3.�`buf_size` (integer)

It specifies the maximum length (in bytes) of the buffer used to write in the html response.

If the size of the buffer is set to zero, it will be automatically set to a quarter of the size of the pkg memory.

_The default value is 0._

**Example�1.3.�Set `buf_size` parameter**

...
modparam("httpd", "buf\_size", 524288)
...

  

### 1.4.4.�`post_buf_size` (integer)

It specifies the length (in bytes) of the POST HTTP requests processing buffer. For large POST request, the default value might require to be increased.

_The default value is 1024. The minumal value is 256._

**Example�1.4.�Set `post_buf_size` parameter**

...
modparam("httpd", "post\_buf\_size", 4096)
...

  

### 1.4.5.�`tls_cert_file` (string)

Public certificate file for httpd. It will be used as server-side certificate for incoming TLS connections.

_The default value is ""_

**Example�1.5.�Set `tls_cert_file` parameter**

...
modparam("httpd", "tls\_cert\_file", "/etc/opensips/tls/server.pem")
...

  

### 1.4.6.�`tls_key_file` (string)

Private key of the above certificate. I must be kept in a safe place with tight permissions!

_The default value is ""_

**Example�1.6.�Set `tls_key_file` parameter**

...
modparam("httpd", "tls\_key\_file", "/etc/opensips/tls/server.key")
...

  

### 1.4.7.�`tls_ciphers` (string)

You can specify the list of algorithms for authentication and encryption that you allow. To obtain a list of ciphers and then choose, use the gnutls-cli application:

*   gnutls-cli -l
    

### Warning

Do not use the NULL algorithms (no encryption) ... never!!!

_The default value is "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2"_

**Example�1.7.�Set `tls_key_file` parameter**

...
modparam("httpd", "tls\_ciphers", "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2")
...

  

## 1.5.�Exported MI Functions

### 1.5.1.�`httpd_list_root_path`

Lists all the registered http root paths into the httpd module. When a request comes in, if the root parth is in the list, the request will be sent to the module that register it.

Name: _httpd\_list\_root\_path_

Parameters: none

MI FIFO Command Format:

opensips-cli -x mi httpd\_list\_root\_path
		

## 1.6.�Exported Functions

No function exported to be used from configuration file.

## 1.7.�Known issues

Due to the fact that OpenSIPS is a multiprocess application, the microhttpd library is used in "external select" mode. This ensures that the library is not running in multithread mode and the library is entirely controled by OpenSIPS. Due to this particular mode of operations, for now, the entire http response is built in a pre-allocated buffer (see buf\_size parameter).

Future realeases of this module will address this issue.

Running the http daemon as non root on ports below 1024 is forbidden by default in linux (kernel>=2.6.24). To allow the port binding, one can use _setcap_ to give extra privilleges to opensips binary:

setcap 'cap\_net\_bind\_service=+ep' /usr/local/sbin/opensips
		

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

### 2.1.1.� `register_httpdcb (module, root_path, httpd_acces_handler_cb, httpd_flush_data_cb, httpd_init_proc_cb)`

Register a new http root with it's associated callbacks into the httpd module.

Meaning of the parameters is as follows:

*   _const char \*mod_ - name of the module that register an http root path to be handled;
    
*   _str \*root\_path_ - the registered root path;
    
*   _httpd\_acces\_handler\_cb f1_ - handler to the callback method to be called on root path match;
    
*   _httpd\_flush\_data\_cb f2_ - handler to the callback method to be called for sending extra data (at a later time);
    
*   _httpd\_init\_proc\_cb f3_ - handler to the callback method to be called during httpd process init;
    

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

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

47

30

1667

147

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

24

21

118

68

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

21

17

138

79

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

14

12

103

54

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

10

7

52

89

6.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

8

6

65

21

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

5

5

8.

Fabian Gast ([@fgast](https://github.com/fgast))

4

1

150

3

9.

Stephane Alnet

3

1

39

3

10.

Stas Kobzar

3

1

2

2

  

**All remaining contributors**: Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

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

Feb 2023 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Aug 2022

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2015 - Oct 2021

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2013 - Aug 2021

5.

Fabian Gast ([@fgast](https://github.com/fgast))

Aug 2020 - Aug 2020

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2012 - Jan 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jan 2017 - Feb 2017

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Stas Kobzar, Stephane Alnet.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Fabian Gast ([@fgast](https://github.com/fgast)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2012-2013 [VoIP Embedded, Inc.](http://www.voipembedded.com)