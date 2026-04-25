# proto_smpp Module Reference
<!-- generated-from: data/3.6/modules/proto_smpp.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 proto_smpp module. Read this file when configuring or debugging the proto_smpp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module offers interoperability between SIP and SMPP (Short Message Peer-to-Peer) protocols. It provides the means to build a messaging gateway/bridge between the two protocols, being able to convert messages from both directions.

*   SIP to SMPP - messages coming from SIP can be converted to a SMPP PDU (Protocol Data Unit) message and sent further to a SMSC (Short Message Service Center).
    
*   SMPP to SIP - the module can act as an ESME (External Short Messaging Entity), receiving messages from a SMSC and converting them to a SIP Message that is sent further to a SIP proxy.
    
The module is compatible with the [SMPP v3.4](http://opensmpp.org/specs/SMPP_v3_4_Issue1_2.pdf) specifications.

## How It Works

In order to convert a SIP message to a SMPP all you need to do is to call the [send_smpp_message()](#func_send_smpp_message "1.7.1.� send_smpp_message(smsc_name, [from],[to],[body],[utf-16],[delivery_receipt])") function, indicating the SMSc you want to send the message to. The module will build the PDU according to the parameters provisioned in the database.

When bridging a message received over the SMPP interface, OpenSIPS builds a SIP Message and sends it to the outbound proxy identified by the [outbound_uri](#param_smpp_outbound_uri "1.6.5.�outbound_uri (string)") module's parameter.

In order to be able to deliver messages to SMSc, an ESME needs to first bind to the SMSc. This is done at OpenSIPS startup by sending a SMPP _bind_transciever_ command to connect to the SMSc, or an _outbind_ command to inform an SMSc it can now bind to our gateway.

The description of all SMSc servers is provisioned in the database. For each server, one can cofigure the following information:

*   _Name_ - an unique name given to the SMSc that is used to reference this SMSc in the OpenSIPS script.
    
*   _IP_ - The IP the SMSc is listening on for new bindings/connections.
    
*   _Port_ - The TCP port that the SMSc is listening on for new bindings/connections.
    
*   _System ID_ - Also known as the User name that is used to authenticate to the SMSc.
    
*   _Password_ - A password used to authenticate to the SMSc.
    
*   _System Type_ - Usually “SMPP”, this field is required by some SMPP providers.
    
*   _Source Type of Number (TON)_ - Specifies the format of the number used to send messages from. Some comon values are:
    
    *   _0_ - Unknown
        
    *   _1_ - International
        
    *   _2_ - National
        
    *   _3_ - Network Specific
        
    *   _4_ - Subscriber Number
        
    *   _5_ - Alphanumeric
        
    *   _6_ - Abbreviated

Default value is _0 - Unknown_.
    
*   _Source Number Plan Indicator (NPI)_ - Specifies the numbering scheme of the number used to send messages from. Some comon values are:
    
    *   _0_ - Unknown
        
    *   _1_ - ISDN/telephone numbering plan (E163/E164)
        
    *   _3_ - Data numbering plan (X.121)
        
    *   _4_ - Telex numbering plan (F.69)
        
    *   _6_ - Land Mobile (E.212)
        
    *   _8_ - National numbering plan
        
    *   _9_ - Private numbering plan
        
    *   _10_ - ERMES numbering plan (ETSI DE/PS 3 01-3)
        
    *   _13_ - Internet (IP)
        
    *   _18_ - WAP Client Id (to be defined by WAP Forum)

Default value is _0 - Unknown_.
    
*   _Destination Type of Number (TON)_ - Specifies the format of the number used to send messages to. Can have the same values as _Source Type of Number (TON)_ and default value is _0 - Unknown_.
    
*   _Destination Number Plan Indicator (NPI)_ - Specifies the numbering scheme of the number used to send messages to. Can have the same values as _Source Number Plan Indicator (NPI)_ and default value is _0 - Unknown_.
    
*   _Session Type_ - Specifies what type of session should be used to connecto th the SMSc. Possible values are:
    
    *   _1_ - Transciever
        
    *   _2_ - Transmitter
        
    *   _3_ - Receiver
        
    *   _4_ - Outbind

Default value is _1 - Transciever_.
    
When OpenSIPS starts up, it reads all SMSc specifications from the database and triggers a binding with them. _Note:_ reloading the SMSc database is not yet supported, but it is a work in progress.

Each SMPP connection is periodically pinged (currently every 5 seconds) using _enquire_link_ SMPP commands to keep the connection active.

## Dependencies

### OpenSIPs Modules

- `database` — Any database module

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

The database handler where the SMPP connection will be stored. This parameter is mandatory.

*Default value is unset.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("proto_smpp", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `dst_npi_col` (string)

The name of the column that holds the Destination NPI values.

*Default value is dst_npi.*

**Example.** smsc_dst_npi.

```opensips
...
modparam("proto_smpp", "dst_npi_col", "smsc_dst_npi")
...
```
### `dst_ton_col` (string)

The name of the column that holds the Destination TON values.

*Default value is dst_ton.*

**Example.** Set the `dst_ton_col` parameter.

```opensips
...
modparam("proto\_smpp", "dst\_ton\_col", "smsc\_dst\_ton")
...
```
### `ip_col` (string)

The name of the column that holds the IP of the SMSc.

*Default value is “ip”.*

**Example.** smsc_ip.

```opensips
...
modparam("proto_smpp", "ip_col", "smsc_ip")
...
```
### `name_col` (string)

The name of the column that holds the SMSc identifier used by the _send_smpp_message()_ function.

*Default value is “name”.*

**Example.** smsc_name.

```opensips
...
modparam("proto_smpp", "name_col", "smsc_name")
...
```
### `outbound_uri` (string)

This parameter represents the URI of the outbound proxy used to send a message converted from SMPP to SIP.

*Default value is None.*

**Example.** sip:127.0.0.1:5060.

```opensips
modparam("proto_smpp", "outbound_uri", "sip:127.0.0.1:5060")
```
### `password_col` (string)

The name of the password column used to authenticate the SMSc.

*Default value is password.*

**Example.** Set the `password_col` parameter.

```opensips
...
modparam("proto\_smpp", "password\_col", "smsc\_password")
...
```
### `port_col` (string)

The name of the column that holds the SMSc port.

*Default value is “port”.*

**Example.** smsc_port.

```opensips
...
modparam("proto_smpp", "port_col", "smsc_port")
...
```
### `session_type_col` (string)

The name of the column that holds the Session Type of the SMSc.

*Default value is session_type.*

**Example.** smsc_session_type.

```opensips
...
modparam("proto_smpp", "session_type_col", "smsc_session_type")
...
```
### `smpp_max_msg_chunks` (integer)

The maximum number of chunks in which a SMPP message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

*Default value is 8.*

**Example.** 32.

```opensips
modparam("proto_smpp", "smpp_max_msg_chunks", 32)
```
### `smpp_port` (integer)

Used to change the default value of the SMPP port used to listen for new connections.

*Default value is 2775.*

**Example.** 27775.

```opensips
modparam("proto_smpp", "smpp_port", 27775)
```
### `smpp_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

*Default value is 100 ms.*

**Example.** 200.

```opensips
modparam("proto_smpp", "smpp_send_timeout", 200)
```
### `smpp_table` (string)

The name of the database table containing definitions of the SMSc servers used to connect to.

*Default value is “smpp”.*

**Example.** smsc.

```opensips
...
modparam("proto_smpp", "smpp_table", "smsc")
...
```
### `src_npi_col` (string)

The name of the column that holds the Source NPI values.

*Default value is src_npi.*

**Example.** Set the `src_npi_col` parameter.

```opensips
...
modparam("proto\_smpp", "src\_npi\_col", "smsc\_src\_npi")
...
```
### `src_ton_col` (string)

The name of the column that holds the Source TON values.

*Default value is src_ton.*

**Example.** Set the `src_ton_col` parameter.

```opensips
...
modparam("proto\_smpp", "src\_ton\_col", "smsc\_src\_ton")
...
```
### `system_id_col` (string)

The name of the column that holds the SMSc System ID.

*Default value is “system_id”.*

**Example.** smsc_system_id.

```opensips
...
modparam("proto_smpp", "system_id_col", "smsc_system_id")
...
```
### `system_type_col` (string)

The name of the System Type column used to bind the SMSc.

*Default value is system_type.*

**Example.** Set the `system_type_col` parameter.

```opensips
...
modparam("proto\_smpp", "system\_type\_col", "smsc\_system\_type")
...
```

## Exported Functions

### `send_smpp_message(smsc_name, [from],[to],[body],[utf-16],[delivery_receipt])`

This function is used to convert a SIP message received in the OpenSIPS script to a SMPP PDU and send it to the _smsc\_name (string)_ received as parameter. The SMPP parameters used to construct the PDU are provisione in the database, and the command sent is either _submit\_sm_ or _deliver\_sm_, depending on the type of the SMSc.

**Parameters:**

- `body` *(string, optional)* — the body of the SMS.
- `delivery_receipt` *(int, optional)* — Whether the SMSC should confirm delivery for this SMS or not
- `from` *(string, optional)* — the source number.
- `smsc_name` *(string, required)* — name of the SMS to be used for sending the SMPP traffic.
- `to` *(string, optional)* — the destination number.
- `utf-16` *(int, optional)* — set to 1 if the body of the message is in UTF-16. format.
  - `0`
  - `1`

**Return codes:**

- `-2` — the SMSc the message should be sent does not exist in the database
- `-1` — there was an internal error
- `positive value` — success

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** send_smpp_message() usage.

```opensips
if (is\_method("MESSAGE"))
		send\_smpp\_message("MY\_SMSC");
```

## Configuration Examples

### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("proto\_smpp", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `smpp_port` variable

Set `smpp_port` variable

```opensips
...
modparam("proto\_smpp", "smpp\_port", 27775)
...
```
### Set `smpp_max_msg_chunks` parameter

Set `smpp_max_msg_chunks` parameter

```opensips
...
modparam("proto\_smpp", "smpp\_max\_msg\_chunks", 32)
...
```
### Set `smpp_send_timeout` parameter

Set `smpp_send_timeout` parameter

```opensips
...
modparam("proto\_smpp", "smpp\_send\_timeout", 200)
...
```
### Set `outbound_uri` parameter

Set `outbound_uri` parameter

```opensips
...
modparam("proto\_smpp", "outbound\_uri", "sip:127.0.0.1:5060")
...
```
### Set `smpp_table` parameter

Set `smpp_table` parameter

```opensips
...
modparam("proto\_smpp", "smpp\_table", "smsc")
...
```
### Set `name_col` parameter

Set `name_col` parameter

```opensips
...
modparam("proto\_smpp", "name\_col", "smsc\_name")
...
```
### Set `ip_col` parameter

Set `ip_col` parameter

```opensips
...
modparam("proto\_smpp", "ip\_col", "smsc\_ip")
...
```
### Set `port_col` parameter

Set `port_col` parameter

```opensips
...
modparam("proto\_smpp", "port\_col", "smsc\_port")
...
```
### Set `system_id_col` parameter

Set `system_id_col` parameter

```opensips
...
modparam("proto\_smpp", "system\_id\_col", "smsc\_system\_id")
...
```
### Set `password_col` parameter

Set `password_col` parameter

```opensips
...
modparam("proto\_smpp", "password\_col", "smsc\_password")
...
```
### Set `system_type_col` parameter

Set `system_type_col` parameter

```opensips
...
modparam("proto\_smpp", "system\_type\_col", "smsc\_system\_type")
...
```
### Set `src_ton_col` parameter

Set `src_ton_col` parameter

```opensips
...
modparam("proto\_smpp", "src\_ton\_col", "smsc\_src\_ton")
...
```
### Set `src_npi_col` parameter

Set `src_npi_col` parameter

```opensips
...
modparam("proto\_smpp", "src\_npi\_col", "smsc\_src\_npi")
...
```
### Set `dst_ton_col` parameter

Set `dst_ton_col` parameter

```opensips
...
modparam("proto\_smpp", "dst\_ton\_col", "smsc\_dst\_ton")
...
```
### Set `dst_npi_col` parameter

Set `dst_npi_col` parameter

```opensips
...
modparam("proto\_smpp", "dst\_npi\_col", "smsc\_dst\_npi")
...
```
### Set `session_type_col` parameter

Set `session_type_col` parameter

```opensips
...
modparam("proto\_smpp", "session\_type\_col", "smsc\_session\_type")
...
```
### `send_smpp_message()` usage

`send_smpp_message()` usage

```opensips
...
    if (is\_method("MESSAGE"))
			send\_smpp\_message("MY\_SMSC");
...
```
