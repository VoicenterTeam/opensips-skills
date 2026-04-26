# msilo Module Reference
<!-- generated-from: data/4.0/modules/msilo.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 msilo module. Read this file when configuring or debugging the msilo module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

This modules provides offline message storage for the Open SIP Server. It stores received messages for an offline user and sends them when the user becomes online.

## How It Works

For each message, the modules stores “Request-URI” (“R-URI”) only if it is a complete address of record (“username@hostname”), URI from “To” header, URI from “From” header, incoming time, expiration time, content type and body of the message. If “R-URI” is not an address of record (it might be the contact address for current SIP session) the URI from “To” header will be used as R-URI.

When the expiration time passed, the message is discarded from database. Expiration time is computed based on incoming time and one of the module's parameters.

Every time when a user registers with OpenSIPS, the module is looking in database for offline messages intended for that user. All of them will be sent to contact address provided in REGISTER request.

It may happen the SIP user to be registered but his SIP User Agent to have no support for MESSAGE request. In this case it should be used the “failure_route” to store the undelivered requests.

Another functionality provided by the modules is to send messages at a certain time -- the reminder functionality. Using config logic, a received message can be stored and delivered at a time specified while storing with the 'snd_time_avp'.

## Dependencies

### OpenSIPs Modules

- `TM` — transaction module--is used to send SIP requests.
- `database module` — mysql, dbtext or other module that implements the “db” interface and provides support for storing/receiving data to/from a database system.

### External Libraries

None.

## Exported Parameters

### `add_date` (integer)

Wheter to add as prefix the date when the message was stored.

*Default value is 1.*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("msilo", "add_date", 0)
```
### `check_time` (integer)

Timer interval to check if dumped messages are sent OK - seconds. The module keeps each request send by itself for a new online user and if the reply is 2xx then the message is deleted from database.

*Default value is 30.*

**Example.** Set the `check_time` parameter.

```opensips
modparam("msilo", "check_time", 10)
```
### `clean_period` (integer)

Number of “check_time” cycles when to check if there are expired messages in database.

*Default value is 5.*

**Example.** 3.

```opensips
modparam("msilo", "clean_period", 3)
```
### `contact_hdr` (string)

The value of the Contact header (including header name and ending \r\n) to be added in notification messages. It can contain pseudo-variables.

*Default value is “NULL”.*

**Example.** Contact: <sip:null@example.com>\r\n.

```opensips
modparam("msilo", "contact_hdr", "Contact: <sip:null@example.com>\\r\\n")
```
### `content_type_hdr` (string)

The value of the Content-Type header (including header name and ending \r\n) to be added in notification messages. It must reflect what the 'offline_message' contains. It can contain pseudo-variables.

*Default value is NULL.*

**Example.** Set the `content_type_hdr` parameter.

```opensips
modparam("msilo", "content_type_hdr", "Content-Type: text/plain\\r\\n")
modparam("msilo", "content_type_hdr", "Content-Type: text/html\\r\\n")
```
### `db_table` (string)

The name of table where to store the messages.

*Default value is “silo”.*

**Example.** silo.

```opensips
modparam("msilo", "db_table", "silo")
```
### `db_url` (string)

Database URL.

*Default value is “mysql://opensips:opensipsrw@localhost/opensips”.*

**Example.** mysql://user:passwd@host.com/dbname.

```opensips
modparam("msilo", "db_url", "mysql://user:passwd@host.com/dbname")
```
### `expire_time` (integer)

Expire time of stored messages - seconds. When this time passed, the message is silently discarded from database.

*Default value is 259200 (72 hours = 3 days).*

**Example.** Set the `expire_time` parameter.

```opensips
modparam("msilo", "expire_time", 36000)
```
### `from_address` (string)

The SIP address used to inform users that destination of their message is not online and the message will be delivered next time when that user goes online. If the parameter is not set, the module will not send any notification. It can contain pseudo-variables.

*Default value is “NULL”.*

**Example.** sip:registrar@example.org.

```opensips
modparam("msilo", "from_address", "sip:registrar@example.org")
```
### `max_messages` (integer)

Maximum number of stored message for an AoR. Value 0 equals to no limit.

*Default value is 0.*

**Example.** 0.

```opensips
modparam("msilo", "max_messages", 0)
```
### `offline_message` (string)

The body of the notification message. It can contain pseudo-variables.

*Default value is “NULL”.*

**Example.** \*\*\* User $rU is offline!.

```opensips
modparam("msilo", "offline_message", "\*\*\* User $rU is offline!")
```
### `outbound_proxy` (string)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for msilo processing. If not set, the message will be sent to the address in destination URI.

*Default value is NULL.*

**Example.** Set the `outbound_proxy` parameter.

```opensips
modparam("msilo", "outbound_proxy", "sip:opensips.org;transport=tcp")
```
### `reminder` (string)

The SIP address used to send reminder messages. If this value is not set, the reminder feature is disabled.

*Default value is NULL.*

**Example.** Set the `reminder` parameter.

```opensips
modparam("msilo", "reminder", "sip:registrar@example.org")
```
### `sc_body` (string)

The name of the column storing the message body in silo table.

*Default value is body.*

**Example.** message_body.

```opensips
modparam("msilo", "sc_body", "message_body")
```
### `sc_ctype` (string)

The name of the column in silo table, storing content type.

*Default value is ctype.*

**Example.** content_type.

```opensips
modparam("msilo", "sc_ctype", "content_type")
```
### `sc_exp_time` (string)

The name of the column in silo table, storing the expire time of the message.

*Default value is exp_time.*

**Example.** expire_time.

```opensips
modparam("msilo", "sc_exp_time", "expire_time")
```
### `sc_from` (string)

The name of the column in silo table, storing the source address.

*Default value is src_addr.*

**Example.** source_address.

```opensips
modparam("msilo", "sc_from", "source_address")
```
### `sc_inc_time` (string)

The name of the column in silo table, storing the incoming time of the message.

*Default value is inc_time.*

**Example.** incoming_time.

```opensips
modparam("msilo", "sc_inc_time", "incoming_time")
```
### `sc_mid` (string)

The name of the column in silo table, storing message id.

*Default value is mid.*

**Example.** other_mid.

```opensips
modparam("msilo", "sc_mid", "other_mid")
```
### `sc_snd_time` (string)

The name of the column in silo table, storing the send time for the reminder.

*Default value is snd_time.*

**Example.** send_reminder_time.

```opensips
modparam("msilo", "sc_snd_time", "send_reminder_time")
```
### `sc_to` (string)

The name of the column in silo table, storing the destination address.

*Default value is dst_addr.*

**Example.** destination_address.

```opensips
modparam("msilo", "sc_to", "destination_address")
```
### `sc_uri_host` (string)

The name of the column in silo table, storing the domain.

*Default value is domain.*

**Example.** domain.

```opensips
modparam("msilo", "sc_uri_host", "domain")
```
### `sc_uri_user` (string)

The name of the column in silo table, storing the user name.

*Default value is username.*

**Example.** user.

```opensips
modparam("msilo", "sc_uri_user", "user")
```
### `send_time` (integer)

Timer interval in seconds to check if there are reminder messages. The module takes all reminder messages that must be sent at that moment or before that moment. If the value is 0, the reminder feature is disabled.

*Default value is 0.*

**Example.** 60.

```opensips
modparam("msilo", "send_time", 60)
```
### `snd_time_avp` (string)

The name of an AVP which may contain the time when to sent the received message as reminder.The AVP is used ony by m_store(). If the parameter is not set, the module does not look for this AVP. If the value is set to a valid AVP name, then the module expects in the AVP to be a time value in format YYYYMMDDHHMMSS (e.g., 20060101201500).

*Default value is null.*

**Example.** $avp(snd_time).

```opensips
modparam("msilo", "snd_time_avp", "$avp(snd_time)")
```
### `use_contact` (integer)

Turns on/off the usage of the Contact address to send notification back to sender whose message is stored by MSILO.

*Default value is 1 (0 = off, 1 = on).*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("msilo", "use_contact", 0)
```

## Exported Functions

### `m_dump([owner], [maxmsg])`

The method sends stored messages for the SIP user that is going to register to his actual contact address. The method should be called when a REGISTER request is received and the “Expire” header has a value greater than zero.

**Parameters:**

- `maxmsg` *(int, optional)* — is a maximum number of messages to be dumped.
- `owner` *(string, optional)* — a SIP URI whose inbox will be dumped. If "owner" is missing, the SIP address is taken from To URI.

**Usable from:** REQUEST_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** m_dump usage.

```opensips
...
m_dump();
m_dump($fu);
m_dump($fu, 10);
...
```

### `m_store([owner])`

The method stores certain parts of the current SIP request (it should be called when the request type is MESSAGE and the destination user is offline or his UA does not support MESSAGE requests). If the user is registered with a UA which does not support MESSAGE requests you should not use mode=“0” if you have changed the request uri with the contact address of user's UA.

**Parameters:**

- `owner` *(string, optional)* — a SIP URI in whose inbox the message will be stored. If "owner" is missing, the SIP address is taken from R-URI.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** m_store usage.

```opensips
...
m_store();
m_store($tu);
...
```

## Exported Statistics

### `dumped_messages`

The number of dumped messages.

- **Type:** counter
### `dumped_reminders`

The number of dumped reminder messages.

- **Type:** counter
### `failed_messages`

The number of failed dumped messages.

- **Type:** counter
### `failed_reminders`

The number of failed reminder messages.

- **Type:** counter
### `stored_messages`

The number of messages stored by msilo.

- **Type:** counter

## Configuration Examples

### Set the “db_url” parameter

Set the “db_url” parameter

```opensips
...
modparam("msilo", "db_url", "mysql://user:passwd@host.com/dbname")
...
```
### Set the “db_table” parameter

Set the “db_table” parameter

```opensips
...
modparam("msilo", "db_table", "silo")
...
```
### Set the “from_address” parameter

Set the “from_address” parameter

```opensips
...
modparam("msilo", "from_address", "sip:registrar@example.org")
modparam("msilo", "from_address", "sip:$rU@example.org")
...
```
### Set the “contact_hdr” parameter

Set the “contact_hdr” parameter

```opensips
...
modparam("msilo", "contact_hdr", "Contact: <sip:null@example.com>\\r\\n")
...
```
### Set the “offline_message” parameter

Set the “offline_message” parameter

```opensips
...
modparam("msilo", "offline_message", "\*\*\* User $rU is offline!")
modparam("msilo", "offline_message", "<em>I am offline!</em>")
...
```
### Set the “content_type_hdr” parameter

Set the “content_type_hdr” parameter

```opensips
...
modparam("msilo", "content_type_hdr", "Content-Type: text/plain\\r\\n")
modparam("msilo", "content_type_hdr", "Content-Type: text/html\\r\\n")
...
```
### Set the “reminder” parameter

Set the “reminder” parameter

```opensips
...
modparam("msilo", "reminder", "sip:registrar@example.org")
...
```
### Set the “outbound_proxy” parameter

Set the “outbound_proxy” parameter

```opensips
...
modparam("msilo", "outbound_proxy", "sip:opensips.org;transport=tcp")
...
```
### Set the “expire_time” parameter

Set the “expire_time” parameter

```opensips
...
modparam("msilo", "expire_time", 36000)
...
```
### Set the “check_time” parameter

Set the “check_time” parameter

```opensips
...
modparam("msilo", "check_time", 10)
...
```
### Set the “send_time” parameter

Set the “send_time” parameter

```opensips
...
modparam("msilo", "send_time", 60)
...
```
### Set the “clean_period” parameter

Set the “clean_period” parameter

```opensips
...
modparam("msilo", "clean_period", 3)
...
```
### Set the “use_contact” parameter

Set the “use_contact” parameter

```opensips
...
modparam("msilo", "use_contact", 0)
...
```
### Set the “sc_mid” parameter

Set the “sc_mid” parameter

```opensips
...
modparam("msilo", "sc_mid", "other_mid")
...
```
### Set the “sc_from” parameter

Set the “sc_from” parameter

```opensips
...
modparam("msilo", "sc_from", "source_address")
...
```
### Set the “sc_to” parameter

Set the “sc_to” parameter

```opensips
...
modparam("msilo", "sc_to", "destination_address")
...
```
### Set the “sc_uri_user” parameter

Set the “sc_uri_user” parameter

```opensips
...
modparam("msilo", "sc_uri_user", "user")
...
```
### Set the “sc_uri_host” parameter

Set the “sc_uri_host” parameter

```opensips
...
modparam("msilo", "sc_uri_host", "domain")
...
```
### Set the “sc_body” parameter

Set the “sc_body” parameter

```opensips
...
modparam("msilo", "sc_body", "message_body")
...
```
### Set the “sc_ctype” parameter

Set the “sc_ctype” parameter

```opensips
...
modparam("msilo", "sc_ctype", "content_type")
...
```
### Set the “sc_exp_time” parameter

Set the “sc_exp_time” parameter

```opensips
...
modparam("msilo", "sc_exp_time", "expire_time")
...
```
### Set the “sc_inc_time” parameter

Set the “sc_inc_time” parameter

```opensips
...
modparam("msilo", "sc_inc_time", "incoming_time")
...
```
### Set the “sc_snd_time” parameter

Set the “sc_snd_time” parameter

```opensips
...
modparam("msilo", "sc_snd_time", "send_reminder_time")
...
```
### Set the “snd_time_avp” parameter

Set the “snd_time_avp” parameter

```opensips
...
modparam("msilo", "snd_time_avp", "$avp(snd_time)")
...
```
### Set the “add_date” parameter

Set the “add_date” parameter

```opensips
...
modparam("msilo", "add_date", 0)
...
```
### Set the “max_messages” parameter

Set the “max_messages” parameter

```opensips
...
modparam("msilo", "max_messages", 0)
...
```
### `m_store` usage

`m_store` usage

```opensips
...
m_store();
m_store($tu);
...
```
### `m_dump` usage

`m_dump` usage

```opensips
...
m_dump();
m_dump($fu);
m_dump($fu, 10);
...
```
### OpenSIPS config script - sample msilo usage

Next picture displays a sample usage of msilo.

```opensips
...
#
# MSILO usage example
#
#

# running in debug mode (log level 4, log to stderr, stay in foreground)
debug_mode=yes

check_via=no      # (cmd. line: -v)
dns=off           # (cmd. line: -r)
rev_dns=off       # (cmd. line: -R)
port=5060

socket=10.0.0.2   # listen address

# ------------------ module loading ----------------------------------
mpath="/usr/local/lib/opensips/modules/"

loadmodule "textops.so"

loadmodule "sl.so"
loadmodule "mysql.so"
loadmodule "maxfwd.so"
loadmodule "msilo.so"
loadmodule "tm.so"
loadmodule "registrar.so"
loadmodule "usrloc.so"

# ----------------- setting module-specific parameters ---------------

# -- registrar params --

modparam("registrar", "default_expires", 120)

# -- registrar params --

modparam("usrloc", "working_mode_preset", "single-instance-no-db")

# -- msilo params --

modparam("msilo","db_url","mysql://opensips:opensipsrw@localhost/opensips")
modparam("msilo","from_address","sip:registrar@opensips.org")
modparam("msilo","contact_hdr","Contact: registrar@192.168.1.2:5060;msilo=yes\\r\\n")
modparam("msilo","content_type_hdr","Content-Type: text/plain\\r\\n")
modparam("msilo","offline_message","\*\*\* User $rU is offline!")

# -- tm params --

modparam("tm", "fr_timer", 10 )
modparam("tm", "fr_inv_timer", 15 )
modparam("tm", "wt_timer", 10 )

route{
    if ( !mf_process_maxfwd_header(10) )
    {
        sl_send_reply(483, "Too Many Hops");
        exit;
    };

if (is_myself("$rd")) {
    {
        # for testing purposes, simply okay all REGISTERs
        if ($rm=="REGISTER")
        {
            save("location");
            log("REGISTER received -> dumping messages with MSILO\\n");

            # MSILO - dumping user's offline messages
            if (m_dump())
            {
                log("MSILO: offline messages dumped - if they were\\n");
            }else{
                log("MSILO: no offline messages dumped\\n");
            };
            exit;
        };

        # domestic SIP destinations are handled using our USRLOC DB
        
        if(!lookup("location")) 
        {
            if (! t_newtran())
            {
                sl_reply_error();
                exit;
            };
            # we do not care about anything else but MESSAGEs
            if (!$rm=="MESSAGE")
            {
                if (!t_reply(404, "Not found")) 
                {
                    sl_reply_error();
                };
                exit;
            };
            log("MESSAGE received -> storing using MSILO\\n");
            # MSILO - storing as offline message
            if (m_store("$ru"))
            {
                log("MSILO: offline message stored\\n");
                if (!t_reply(202, "Accepted")) 
                {
                    sl_reply_error();
                };
            }else{
                log("MSILO: offline message NOT stored\\n");
                if (!t_reply(503, "Service Unavailable")) 
                {
                    sl_reply_error();
                };
            };
            exit;
        };
        # if the downstream UA does not support MESSAGE requests
        # go to failure_route\[1\]
        t_on_failure("1");
        t_relay();
        exit;
    };

    # forward anything else
    t_relay();
}

failure_route\[1\] {
    # forwarding failed -- check if the request was a MESSAGE 
    if (!$rm=="MESSAGE")
    {
        exit;
    };
    
    log(1,"MSILO:the downstream UA doesn't support MESSAGEs\\n");
    # we have changed the R-URI with the contact address, ignore it now
    if (m_store("$ou"))
    {
        log("MSILO: offline message stored\\n");
        t_reply(202, "Accepted"); 
    }else{
        log("MSILO: offline message NOT stored\\n");
        t_reply(503, "Service Unavailable");
    };
}

...
```
