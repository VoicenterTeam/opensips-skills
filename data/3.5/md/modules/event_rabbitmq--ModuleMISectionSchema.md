# event\_rabbitmq Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5693104)

3.2. [Most recently active contributors(1) to this module](#idp5816720)

**List of Examples**

1.1. [Set `heartbeat` parameter](#idp5576592)

1.2. [Setting the `connect_timeout` parameter](#idp5581792)

1.3. [Set the `use_tls` parameter](#idp5588880)

1.4. [Set the `timeout` parameter](#idp5595680)

1.5. [E\_PIKE\_BLOCKED event](#idp5600576)

1.6. [RabbitMQ socket](#idp5602256)

1.7. [OpenSIPS config script - sample event\_rabbitmq usage](#idp5605504)

2.1. [Event subscription](#idp5703136)

2.2. [Event subscription](#idp5705312)

## Chapter�1.�Admin Guide

## 1.1.�Overview

_RabbitMQ_ ([http://www.rabbitmq.com/](http://www.rabbitmq.com/)) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

This module provides the implementation of a RabbitMQ client for the Event Interface. It is used to send AMQP messages to a RabbitMQ server each time the Event Interface triggers an event subscribed for.

The AMQP protocol is only used as the transport layer for notifications. The content of a message is presented in the next section.

## 1.2.�RabbitMQ events syntax

The event payload is formated as a JSON-RPC notification, with the event name as the _method_ field and the event parameters as the _params_ field.

## 1.3.�RabbitMQ socket syntax

_'rabbitmq:' \[user\[':'password\] '@' host \[':' port\] '/' \[params '?'\] routing\_key_

Meanings:

*   _'rabbitmq:'_ - informs the Event Interface that the events sent to this subscriber should be handled by the _event\_rabbitmq_ module.
    
*   _user_ - username used for RabbitMQ server authentication. The default value is 'guest'.
    
*   _password_ - password used for RabbitMQ server authentication. The default value is 'guest'.
    
*   _host_ - host name of the RabbitMQ server.
    
*   _port_ - port of the RabbitMQ server. The default value is '5672'.
    
*   _params_ - extra parameters specified as _key\[=value\]_, separated by ';':
    
    *   _exchange_ - exchange of the RabbitMQ server. The default value is ''.
        
    *   _tls\_domain_ - indicates which TLS domain (as defined using the _tls\_mgm_ module) to use for this connection. The [use\_tls](#param_use_tls "1.5.3.�use_tls (integer)") module parameter must be enabled.
        
    *   _persistent_ - indicates that the message should be published as persistent _delivery\_mode=2_. This parameter does not have a value.
        
    
*   _routing\_key_ - this is the routing key used by the AMQP protocol and it is used to identify the queue where the event should be sent.
    
    NOTE: if the queue does not exist, this module will not try to create it.
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_mgm_ if [use\_tls](#param_use_tls "1.5.3.�use_tls (integer)") is enabled.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _librabbitmq-dev_
    

## 1.5.�Exported Parameters

### 1.5.1.�`heartbeat` (integer)

Enables heartbeat support for the AMQP communication. If the client does not receive a heartbeat from server within the specified interval, the socket is automatically closed by the rabbitmq-client. This prevents OpenSIPS from blocking while waiting for a response from a dead rabbitmq-server. The value represents the heartbit interval in seconds.

_Default value is “0 (disabled)”._

**Example�1.1.�Set `heartbeat` parameter**

...
modparam("event\_rabbitmq", "heartbeat", 3)
...

  

### 1.5.2.�`connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

_Default value is “500” (milliseconds)._

**Example�1.2.�Setting the `connect_timeout` parameter**

...
modparam("event\_rabbitmq", "connect\_timeout", 1000)
...
	

  

### 1.5.3.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" parameter in the configuration specified through the [RabbitMQ socket syntax](#socket_syntax "1.3.�RabbitMQ socket syntax").

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

_Default value is **0** (not enabled)_

**Example�1.3.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "rmq")
modparam("tls\_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls\_mgm", "private\_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls\_mgm", "ca\_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("event\_rabbitmq", "use\_tls", 1)
...

  

### 1.5.4.�`timeout` (integer)

Indicates the timeout (in milliseconds) of any command (i.e. publish) sent to the RabbitMQ server.

_NOTE_ that this parameter is available only starting with RabbitMQ library version _0.9.0_; setting it when using an earlier version will have no effect, and the publish command will run in blocking mode.

_Default value is **0** (no timeout - blocking mode)_

**Example�1.4.�Set the `timeout` parameter**

...
modparam("event\_rabbitmq", "timeout", 1000) # timeout after 1s
...

  

## 1.6.�Exported Functions

No function exported to be used from configuration file.

## 1.7.�Example

This is an example of an event raised by the pike module when it decides an ip should be blocked:

**Example�1.5.�E\_PIKE\_BLOCKED event**

{
  "jsonrpc": "2.0",
  "method": "E\_PIKE\_BLOCKED",
  "params": {
    "ip": "192.168.2.11"
  }
}

  

**Example�1.6.�RabbitMQ socket**

	rabbitmq:guest:guest@127.0.0.1:5672/pike

	# same socket can be written as
	rabbitmq:127.0.0.1/pike

	# TLS broker connection
	rabbitmq:127.0.0.1/tls\_domain=rmq?pike

  

## 1.8.�Installation and Running

### 1.8.1.�OpenSIPS config file

This configuration file presents the usage of the event\_rabbitmq module. In this scenario, a message is sent to a RabbitMQ server everytime OpenSIPS receives a MESSAGE request. The parameters passed to the server are the R-URI username and the message body.

**Example�1.7.�OpenSIPS config script - sample event\_rabbitmq usage**

...
loadmodule "signaling.so"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "maxfwd.so"
loadmodule "usrloc.so"
loadmodule "registrar.so"
loadmodule "textops.so"
loadmodule "uri.so"
loadmodule "acc.so"
loadmodule "event\_rabbitmq.so"

startup\_route {
	if (!subscribe\_event("E\_SIP\_MESSAGE", "rabbitmq:127.0.0.1/sipmsg")) {
		xlog("L\_ERR","cannot the RabbitMQ server to the E\_SIP\_MESSAGE event\\n");
	}
}

route{

	if (!mf\_process\_maxfwd\_header(10)) {
		sl\_send\_reply(483,"Too Many Hops");
		exit;
	}

	if (has\_totag()) {
		if (loose\_route()) {
			if (is\_method("INVITE")) {
				record\_route();
			}
			route(1);
		} else {
			if ( is\_method("ACK") ) {
				if ( t\_check\_trans() ) {
					t\_relay();
					exit;
				} else {
					exit;
				}
			}
			sl\_send\_reply(404,"Not here");
		}
		exit;
	}

	if (is\_method("CANCEL"))
	{
		if (t\_check\_trans())
			t\_relay();
		exit;
	}

	t\_check\_trans();

	if (loose\_route()) {
		xlog("L\_ERR",
		"Attempt to route with preloaded Route's \[$fu/$tu/$ru/$ci\]");
		if (!is\_method("ACK"))
			sl\_send\_reply(403,"Preload Route denied");
		exit;
	}

	if (!is\_method("REGISTER|MESSAGE"))
		record\_route();

	if (!is\_myself("$rd"))
	{
		append\_hf("P-hint: outbound\\r\\n"); 
		route(1);
	}

	if (is\_method("PUBLISH"))
	{
		sl\_send\_reply(503, "Service Unavailable");
		exit;
	}
	

	if (is\_method("REGISTER"))
	{
		if (!save("location"))
			sl\_reply\_error();

		exit;
	}

	if ($rU==NULL) {
		sl\_send\_reply(484,"Address Incomplete");
		exit;
	}

	if (is\_method("MESSAGE")) {
		$avp(attrs) = "user";
		$avp(vals) = $rU;
		$avp(attrs) = "msg";
		$avp(vals) = $rb;
		if (!raise\_event("E\_SIP\_MESSAGE", $avp(attrs), $avp(vals)))
			xlog("L\_ERR", "cannot raise E\_SIP\_MESSAGE event\\n");
	}

	if (!lookup("location", "method-filtering")) {
		switch ($retcode) {
			case -1:
			case -3:
				t\_newtran();
				t\_reply(404, "Not Found");
				exit;
			case -2:
				sl\_send\_reply(405, "Method Not Allowed");
				exit;
		}
	}

	route(1);
}


route\[1\] {
	if (is\_method("INVITE")) {
		t\_on\_failure("1");
	}

	if (!t\_relay()) {
		sl\_reply\_error();
	};
	exit;
}


failure\_route\[1\] {
	if (t\_was\_cancelled()) {
		exit;
	}
}

...

  

## Chapter�2.�Frequently Asked Questions

**2.1.**

What is the maximum lenght of a AMQP message?

The maximum length of a datagram event is 16384 bytes.

**2.2.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.3.**

What is the vhost used by the AMQP server?

Currently, the only vhost supported is _'/'_.

**2.4.**

How can I set a vhost in the socket?

This version doesn't support a different vhost.

**2.5.**

How can I send an event to my RabbitMQ server?

This module acts as a transport module for the OpenSIPS Event Interface. Therefore, this module should follow the Event Interface behavior:

The first step is to subscribe the RabbitMQ server to the OpenSIPS Event Interface. This can be done using the _subscribe\_event_ core function:

**Example�2.1.�Event subscription**

startup\_route {
	subscribe\_event("E\_RABBITMQ\_EVENT", "rabbitmq:127.0.0.1/queue");
}
		

  

The next step is to raise the event from the script, using the _raise\_event_ core function:

**Example�2.2.�Event subscription**

route {
	...
	/\* decided that an event should be raised \*/
	raise\_event("E\_RABBITMQ\_EVENT");
	...
}
		

  

NOTE that the event used above is only to exemplify the usage from the script. Any event published through the OpenSIPS Event Interface can be raised using this module.

**2.6.**

Where can I find more information about RabbitMQ?

You can find more information about RabbitMQ on their official website ( [http://www.rabbitmq.com/](http://www.rabbitmq.com/)).

**2.7.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.8.**

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

62

39

1995

310

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

22

12

504

266

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

23

40

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

5

3

35

7

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

8

9

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

7

7

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

5

3

2

3

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

4

2

52

25

9.

franklyfox

4

2

44

5

10.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

4

2

2

2

  

**All remaining contributors**: Eric Tamme ([@etamme](https://github.com/etamme)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Mar 2024

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2015 - Jun 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Aug 2020

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

7.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

Apr 2015 - Mar 2016

8.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

9.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jun 2015 - Jun 2015

10.

Eric Tamme ([@etamme](https://github.com/etamme))

May 2015 - May 2015

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), franklyfox.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)).

_Documentation Copyrights:_

Copyright � 2011 [www.opensips-solutions.com](http://www.opensips-solutions.com/)