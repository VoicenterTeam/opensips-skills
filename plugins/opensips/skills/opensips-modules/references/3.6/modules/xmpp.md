# xmpp Module Reference
<!-- generated-from: data/3.6/modules/xmpp.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 xmpp module. Read this file when configuring or debugging the xmpp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This modules is a gateway between OpenSIPS and a jabber server. It enables the exchange of instant messages between SIP clients and XMPP(jabber) clients.

## How It Works

The gateway has two modes to run:

*   **the component-mode** - the gateway requires a standalone XMPP server amd the 'xmpp' module acts as a XMPP component
    
*   **the server-mode** - the module acts itself as a XMPP server, no requirement for another XMPP server in the system. NOTE: this is limited implementation of a XMPP server, it does not support SRV or TLS so far. This mode is in beta stage for the moment.
    
In the component mode, you need a local XMPP server (recommended jabberd2 or ejabberd); the xmpp module will relay all your connections to a tcp connection to the local jabber server.

After you have a running XMPP server, what you need to do is set the following parameters in the OpenSIPS configuration file:

*   xmpp\_domain and xmpp\_host, which are explained in the [Exported Parameters](#exported_parameters "1.3.�Exported Parameters") section;
    
*   socket= your ip;
    
*   alias=opensips domain and alias=gateway domain;
    
*   you can also change the jabber server password, which must be the same as the xmpp\_password parameter.
    
A use case, for the component-mode, would look like this:

*   OpenSIPS is running on sip-server.opensips.org;
    
*   the jabber server is running on xmpp.opensips.org;
    
*   the component is running on xmpp-sip.opensips.org.
    
In the server mode, the xmpp module is a minimal jabber server, thus you do not need to install another jabber server, the gateway will connect to the jabber servers, where the users you want to chat with have an account.

If you want to change to server-mode, you have to change the "backend" parameter, as shown in the [Exported Parameters](#exported_parameters "1.3.�Exported Parameters") section, from component to server.

A use case, for the server-mode, would look like this:

*   OpenSIPS is running on sip-server.opensips.org;
    
*   the "XMPP server" is running on xmpp-sip.opensips.org.

## Dependencies

### OpenSIPs Modules

- `tm` — Required module

### External Libraries

- `libexpat1-devel` — used for parsing/building XML

## Exported Parameters

### `backend` (string)

The mode you are using the module; it can be either component or server.

*Default value is component.*

**Possible values:**

- component
- server

**Example.** server.

```opensips
modparam("xmpp", "backend", "server")
```
### `outbound_proxy` (string)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for xmpp processing. If not set, the message will be sent to the address in destination URI.

*Default value is NULL.*

**Example.** sip:opensips.org;transport=tcp.

```opensips
modparam("xmpp", "outbound\_proxy", "sip:opensips.org;transport=tcp")
```
### `sip_domain` (string)

This parameter must be set only if the xmpp module is used in component mode and the domain that is the host for the jabber server is the same as the domain of the sip server(when using the same domain name for the SIP service and for the XMPP service). In this case, if we were to add buddies in xmpp accounts with that domain, then all the messages that will reach the jabber server will be considered to be for local xmpp users. It is necessary therefore to make a translate the sip domain name into another domain when sending messages in xmpp. This parameter is exactly the name that should be used as the SIP domain name in XMPP. Usage example: If the sip and xmpp domain is opensips.org and this parameter is set to sip.opensips.org, than in all the requests sent in xmpp the sip users will have the domain translated to sip.opensips.org. Also, in XMPP account the SIP buddies must have this domain: sip.opensips.org, and it will be translated to the real one opensips.org when traversing the gateway.

*Default value is NULL.*

**Example.** sip.opensips.org.

```opensips
modparam("xmpp", "sip\_domain", "sip.opensips.org")
```
### `xmpp_domain` (string)

The xmpp domain of the component or the server, depending on the mode we are in.

*Default value is 127.0.0.1.*

**Example.** xmpp.opensips.org.

```opensips
modparam("xmpp", "xmpp\_domain", "xmpp.opensips.org")
```
### `xmpp_host` (string)

The ip address or the name of the local jabber server, if the backend is set to "component"; or the address to bind to in the server mode.

*Default value is 127.0.0.1.*

**Example.** xmpp.opensips.org.

```opensips
modparam("xmpp", "xmpp\_host", "xmpp.opensips.org")
```
### `xmpp_password` (string)

The password of the local jabber server.

*Default value is secret.*

**Notes:** if changed here, it must also be changed in the c2s.xml, added by the jabber server. This is how the default configuration for the jabberd2 looks like:
		<router>
	............... 
	<!-- Username/password to authenticate as -->
    <user>jabberd</user>;          <!-- default: jabberd -->;
    <pass>secret</pass>;           <!-- default: secret -->;

**Example.** secret.

```opensips
modparam("xmpp", "xmpp\_password", "secret")
```
### `xmpp_port` (integer)

In the component mode, this is the port of the jabber router we connect to. In the server mode, it is the transport address to bind to.

*Default value is "5347", if backend is set to "component" and "5269", if backend is set to "server"..*

**Example.** 5269.

```opensips
modparam("xmpp", "xmpp\_port", 5269)
```

## Exported Functions

### `xmpp_send_message()`

Converts SIP messages to XMPP(jabber) messages, in order to be relayed to a XMPP(jabber) client.

**Example.** xmpp_send_message() usage.

```opensips
xmpp_send_message();
```

## Configuration Examples

### Set `backend` parameter

The mode you are using the module; it can be either component or server.

```opensips
...
 modparam("xmpp", "backend", "server")
...
```
### Set `xmpp_domain` parameter

The xmpp domain of the component or the server, depending on the mode we are in.

```opensips
...
 modparam("xmpp", "xmpp\_domain", "xmpp.opensips.org")
...
```
### Set `xmpp_host` parameter

The ip address or the name of the local jabber server, if the backend is set to "component"; or the address to bind to in the server mode.

```opensips
...
 modparam("xmpp", "xmpp\_host", "xmpp.opensips.org")
...
```
### Set `xmpp_host` parameter

This parameter must be set only if the xmpp module is used in component mode and the domain that is the host for the jabber server is the same as the domain of the sip server(when using the same domain name for the SIP service and for the XMPP service). In this case, if we were to add buddies in xmpp accounts with that domain, then all the messages that will reach the jabber server will be considered to be for local xmpp users. It is necessary therefore to make a translate the sip domain name into another domain when sending messages in xmpp. This parameter is exactly the name that should be used as the SIP domain name in XMPP. Usage example: If the sip and xmpp domain is opensips.org and this parameter is set to sip.opensips.org, than in all the requests sent in xmpp the sip users will have the domain translated to sip.opensips.org. Also, in XMPP account the SIP buddies must have this domain: sip.opensips.org, and it will be translated to the real one opensips.org when traversing the gateway.

```opensips
...
 modparam("xmpp", "sip\_domain", "sip.opensips.org")
...
```
### Set `xmpp_port` parameter

In the component mode, this is the port of the jabber router we connect to. In the server mode, it is the transport address to bind to.

```opensips
...
 modparam("xmpp", "xmpp\_port", 5269)
...
```
### Set `xmpp_password` parameter

The password of the local jabber server.

```opensips
...
 modparam("xmpp", "xmpp\_password", "secret")
...
```
### Set `outbound_proxy` parameter

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for xmpp processing. If not set, the message will be sent to the address in destination URI.

```opensips
...
 modparam("xmpp", "outbound\_proxy", "sip:opensips.org;transport=tcp")
...
```
### `xmpp_send_message()` usage

Converts SIP messages to XMPP(jabber) messages, in order to be relayed to a XMPP(jabber) client.

```opensips
...
xmpp\_send\_message();
...
```
### Configuration

Next is presented a sample configuration file one can use to implement a standalone SIP-to-XMPP gateway. You can run an instance of OpenSIPS on a separate machine or on different port with the following config, and have the main SIP server configured to forward all SIP requests for XMPP world to it.

```opensips
....
#
# simple quick-start config script for XMPP GW
#
# make sure in your main SIP server that you send
# only the adequate SIP MESSAGES to XMPP GW
#
#
# ----------- global configuration parameters ------------------------

log\_level=3        # debug level (cmd line: -dddddddddd)
stderror\_enabled=no
syslog\_enabled=yes

/* Uncomment these line to enter debugging mode */
#debug\_mode=yes

check\_via=no	# (cmd. line: -v)
dns=no          # (cmd. line: -r)
rev\_dns=no      # (cmd. line: -R)
udp\_workers=4

socket=udp:10.10.10.10:5076
alias=sip-xmpp.opensips.org

# ------------------ module loading ----------------------------------

mpath="/usr/local/opensips/lib/opensips/modules/"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "maxfwd.so"
loadmodule "textops.so"
loadmodule "mi\_fifo.so"

# XMPP
loadmodule "xmpp.so"

modparam("xmpp", "xmpp\_domain", "xmpp-sip.opensips.org")
modparam("xmpp", "xmpp\_host", "xmpp.opensips.org")

#modparam("xmpp", "backend", "server")
modparam("xmpp", "backend", "component")

# ----------------- setting module-specific parameters ---------------

# -- mi\_fifo params --

modparam("mi\_fifo", "fifo\_name", "/tmp/opensips\_fifo\_xmpp")

# -------------------------  request routing logic -------------------

# main routing logic

route{

	# initial sanity checks -- messages with
	# max\_forwards==0, or excessively long requests
	if (!mf\_process\_maxfwd\_header("10")) {
		sl\_send\_reply(483,"Too Many Hops");
		exit;
	};

	### absorb retransmissions ###
	if (!t\_newtran()) {
		sl\_reply\_error();
		return;
	}
	if (is\_method("MESSAGE")) {
		log("\*\*\* xmpp-handled MESSAGE message.\\n");
		if (xmpp\_send\_message()) {
			t\_reply(200, "Accepted");
		} else {
			t\_reply(404, "Not found");
		}
		return;
	}
		
	log("\*\*\* xmpp: unhandled message type\\n");
	t\_reply(503, "Service unavailable");
	return;
}

....
```
