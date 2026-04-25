# proto\_smpp module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp1611968)

2.2. [Most recently active contributors(1) to this module](#idp5893008)

**List of Examples**

1.1. [Set `db_url` parameter](#idp5599312)

1.2. [Set `smpp_port` variable](#idp4568256)

1.3. [Set `smpp_max_msg_chunks` parameter](#idp3637424)

1.4. [Set `smpp_send_timeout` parameter](#idp5529344)

1.5. [Set `outbound_uri` parameter](#idp2471824)

1.6. [Set `smpp_table` parameter](#idp5326000)

1.7. [Set `name_col` parameter](#idp4104528)

1.8. [Set `ip_col` parameter](#idp3693200)

1.9. [Set `port_col` parameter](#idp1467824)

1.10. [Set `system_id_col` parameter](#idp5575136)

1.11. [Set `password_col` parameter](#idp3941744)

1.12. [Set `system_type_col` parameter](#idp3519312)

1.13. [Set `src_ton_col` parameter](#idp3756240)

1.14. [Set `src_npi_col` parameter](#idp4172208)

1.15. [Set `dst_ton_col` parameter](#idp4433616)

1.16. [Set `dst_npi_col` parameter](#idp4152048)

1.17. [Set `session_type_col` parameter](#idp5497888)

1.18. [`send_smpp_message()` usage](#idp3797136)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module offers interoperability between SIP and SMPP (Short Message Peer-to-Peer) protocols. It provides the means to build a messaging gateway/bridge between the two protocols, being able to convert messages from both directions.

*   SIP to SMPP - messages coming from SIP can be converted to a SMPP PDU (Protocol Data Unit) message and sent further to a SMSC (Short Message Service Center).
    
*   SMPP to SIP - the module can act as an ESME (External Short Messaging Entity), receiving messages from a SMSC and converting them to a SIP Message that is sent further to a SIP proxy.
    

The module is compatible with the [SMPP v3.4](http://opensmpp.org/specs/SMPP_v3_4_Issue1_2.pdf) specifications.

## 1.2.�SIP to SMPP bridging

In order to convert a SIP message to a SMPP all you need to do is to call the [send\_smpp\_message()](#func_send_smpp_message "1.7.1.� send_smpp_message(smsc_name, [from],[to],[body],[utf-16],[delivery_receipt])") function, indicating the SMSc you want to send the message to. The module will build the PDU according to the parameters provisioned in the database.

## 1.3.�SMPP to SIP bridging

When bridging a message received over the SMPP interface, OpenSIPS builds a SIP Message and sends it to the outbound proxy identified by the [outbound\_uri](#param_smpp_outbound_uri "1.6.5.�outbound_uri (string)") module's parameter.

## 1.4.�SMSC binding

In order to be able to deliver messages to SMSc, an ESME needs to first bind to the SMSc. This is done at OpenSIPS startup by sending a SMPP _bind\_transciever_ command to connect to the SMSc, or an _outbind_ command to inform an SMSc it can now bind to our gateway.

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

Each SMPP connection is periodically pinged (currently every 5 seconds) using _enquire\_link_ SMPP commands to keep the connection active.

## 1.5.�Dependencies

### 1.5.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _database_ -- Any database module
    

### 1.5.2.�Dependencies of external libraries

*   _None_.
    

## 1.6.�OpenSIPS Exported parameters

All these parameters can be used from the opensips.cfg file, to configure the behavior of OpenSIPS-SMPP gateway.

### 1.6.1.�`db_url` (string)

The database handler where the SMPP connection will be stored. This parameter is mandatory.

_Default value is _unset_._

**Example�1.1.�Set `db_url` parameter**

...
modparam("proto\_smpp", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.6.2.�`smpp_port` (integer)

Used to change the default value of the SMPP port used to listen for new connections.

_Default value is 2775._

**Example�1.2.�Set `smpp_port` variable**

...
modparam("proto\_smpp", "smpp\_port", 27775)
...
		

  

### 1.6.3.�`smpp_max_msg_chunks` (integer)

The maximum number of chunks in which a SMPP message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 8._

**Example�1.3.�Set `smpp_max_msg_chunks` parameter**

...
modparam("proto\_smpp", "smpp\_max\_msg\_chunks", 32)
...

  

### 1.6.4.�`smpp_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is 100 ms._

**Example�1.4.�Set `smpp_send_timeout` parameter**

...
modparam("proto\_smpp", "smpp\_send\_timeout", 200)
...

  

### 1.6.5.�`outbound_uri` (string)

This parameter represents the URI of the outbound proxy used to send a message converted from SMPP to SIP.

_Default value is _None_._

**Example�1.5.�Set `outbound_uri` parameter**

...
modparam("proto\_smpp", "outbound\_uri", "sip:127.0.0.1:5060")
...

  

### 1.6.6.�`smpp_table` (string)

The name of the database table containing definitions of the SMSc servers used to connect to.

_Default value is “smpp”._

**Example�1.6.�Set `smpp_table` parameter**

...
modparam("proto\_smpp", "smpp\_table", "smsc")
...

  

### 1.6.7.�`name_col` (string)

The name of the column that holds the SMSc identifier used by the _send\_smpp\_message()_ function.

_Default value is “name”._

**Example�1.7.�Set `name_col` parameter**

...
modparam("proto\_smpp", "name\_col", "smsc\_name")
...

  

### 1.6.8.�`ip_col` (string)

The name of the column that holds the IP of the SMSc.

_Default value is “ip”._

**Example�1.8.�Set `ip_col` parameter**

...
modparam("proto\_smpp", "ip\_col", "smsc\_ip")
...

  

### 1.6.9.�`port_col` (string)

The name of the column that holds the SMSc port.

_Default value is “port”._

**Example�1.9.�Set `port_col` parameter**

...
modparam("proto\_smpp", "port\_col", "smsc\_port")
...

  

### 1.6.10.�`system_id_col` (string)

The name of the column that holds the SMSc System ID.

_Default value is “system\_id”._

**Example�1.10.�Set `system_id_col` parameter**

...
modparam("proto\_smpp", "system\_id\_col", "smsc\_system\_id")
...

  

### 1.6.11.�`password_col` (string)

The name of the password column used to authenticate the SMSc.

_Default value is “password”._

**Example�1.11.�Set `password_col` parameter**

...
modparam("proto\_smpp", "password\_col", "smsc\_password")
...

  

### 1.6.12.�`system_type_col` (string)

The name of the System Type column used to bind the SMSc.

_Default value is “system\_type”._

**Example�1.12.�Set `system_type_col` parameter**

...
modparam("proto\_smpp", "system\_type\_col", "smsc\_system\_type")
...

  

### 1.6.13.�`src_ton_col` (string)

The name of the column that holds the Source TON values.

_Default value is “src\_ton”._

**Example�1.13.�Set `src_ton_col` parameter**

...
modparam("proto\_smpp", "src\_ton\_col", "smsc\_src\_ton")
...

  

### 1.6.14.�`src_npi_col` (string)

The name of the column that holds the Source NPI values.

_Default value is “src\_npi”._

**Example�1.14.�Set `src_npi_col` parameter**

...
modparam("proto\_smpp", "src\_npi\_col", "smsc\_src\_npi")
...

  

### 1.6.15.�`dst_ton_col` (string)

The name of the column that holds the Destination TON values.

_Default value is “dst\_ton”._

**Example�1.15.�Set `dst_ton_col` parameter**

...
modparam("proto\_smpp", "dst\_ton\_col", "smsc\_dst\_ton")
...

  

### 1.6.16.�`dst_npi_col` (string)

The name of the column that holds the Destination NPI values.

_Default value is “dst\_npi”._

**Example�1.16.�Set `dst_npi_col` parameter**

...
modparam("proto\_smpp", "dst\_npi\_col", "smsc\_dst\_npi")
...

  

### 1.6.17.�`session_type_col` (string)

The name of the column that holds the Session Type of the SMSc.

_Default value is “session\_type”._

**Example�1.17.�Set `session_type_col` parameter**

...
modparam("proto\_smpp", "session\_type\_col", "smsc\_session\_type")
...

  

## 1.7.�Exported Functions

### 1.7.1.� `send_smpp_message(smsc_name, [from],[to],[body],[utf-16],[delivery_receipt])`

This function is used to convert a SIP message received in the OpenSIPS script to a SMPP PDU and send it to the _smsc\_name (string)_ received as parameter. The SMPP parameters used to construct the PDU are provisione in the database, and the command sent is either _submit\_sm_ or _deliver\_sm_, depending on the type of the SMSc.

The function returns _\-2_ if the SMSc the message should be sent does not exist in the database, _\-1_ if there was an internal error, or positive value in case of success.

Meaning of the parameters is as follows:

*   _sms\_name (string)_ - name of the SMS to be used for sending the SMPP traffic.
    
*   _from (string, optional)_ - the source number. If missing, the SIP message from username is used.
    
*   _to (string, optional)_ - the destination number. If missing, the SIP request URI username is used.
    
*   _body (string, optional)_ - the body of the SMS. If missing, the SIP message body is used.
    
*   _UTF-16 (int, optional)_ - set to _1_ if the body of the message is in UTF-16. format. If missing or _0_, UTF-8 is used.
    
*   _delivery\_receipt (int, optional)_ - Whether the SMSC should confirm delivery for this SMS or not
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE or BRANCH\_ROUTE.

**Example�1.18.�`send_smpp_message()` usage**

...
    if (is\_method("MESSAGE"))
			send\_smpp\_message("MY\_SMSC");
...

  

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

87

52

2175

918

2.

Victor Ciurel ([@victor-ciurel](https://github.com/victor-ciurel))

81

21

3760

1658

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

49

37

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

8

5

234

37

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

12

13

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

7

3

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

4

2

10

13

8.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

4

2

9.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

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

Jan 2019 - Mar 2026

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

May 2020 - Apr 2022

4.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2021 - May 2021

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2019 - Apr 2021

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

May 2019 - Sep 2019

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Apr 2019 - Apr 2019

9.

Victor Ciurel ([@victor-ciurel](https://github.com/victor-ciurel))

Sep 2017 - Jan 2019

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_