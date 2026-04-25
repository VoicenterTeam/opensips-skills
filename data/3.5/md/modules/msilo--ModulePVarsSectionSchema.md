# MSILO Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5822976)

2.2. [Most recently active contributors(1) to this module](#idp5926224)

**List of Examples**

1.1. [Set the “db\_url” parameter](#idp162928)

1.2. [Set the “db\_table” parameter](#idp168624)

1.3. [Set the “from\_address” parameter](#idp5517616)

1.4. [Set the “contact\_hdr” parameter](#idp5522640)

1.5. [Set the “offline\_message” parameter](#idp5527568)

1.6. [Set the “content\_type\_hdr” parameter](#idp5532848)

1.7. [Set the “reminder” parameter](#idp5538336)

1.8. [Set the “outbound\_proxy” parameter](#idp5543808)

1.9. [Set the “expire\_time” parameter](#idp5548768)

1.10. [Set the “check\_time” parameter](#idp5553808)

1.11. [Set the “send\_time” parameter](#idp5559200)

1.12. [Set the “clean\_period” parameter](#idp5564400)

1.13. [Set the “use\_contact” parameter](#idp5569360)

1.14. [Set the “sc\_mid” parameter](#idp5573792)

1.15. [Set the “sc\_from” parameter](#idp5578224)

1.16. [Set the “sc\_to” parameter](#idp5582752)

1.17. [Set the “sc\_uri\_user” parameter](#idp5587184)

1.18. [Set the “sc\_uri\_host” parameter](#idp5591696)

1.19. [Set the “sc\_body” parameter](#idp5596208)

1.20. [Set the “sc\_ctype” parameter](#idp5600720)

1.21. [Set the “sc\_exp\_time” parameter](#idp5605248)

1.22. [Set the “sc\_inc\_time” parameter](#idp5609856)

1.23. [Set the “sc\_snd\_time” parameter](#idp5614464)

1.24. [Set the “snd\_time\_avp” parameter](#idp5620128)

1.25. [Set the “add\_date” parameter](#idp5625104)

1.26. [Set the “max\_messages” parameter](#idp5629632)

1.27. [`m_store` usage](#idp5638784)

1.28. [`m_dump` usage](#idp5647920)

1.29. [OpenSIPS config script - sample msilo usage](#idp5660736)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This modules provides offline message storage for the Open SIP Server. It stores received messages for an offline user and sends them when the user becomes online.

For each message, the modules stores “Request-URI” (“R-URI”) only if it is a complete address of record (“username@hostname”), URI from “To” header, URI from “From” header, incoming time, expiration time, content type and body of the message. If “R-URI” is not an address of record (it might be the contact address for current SIP session) the URI from “To” header will be used as R-URI.

When the expiration time passed, the message is discarded from database. Expiration time is computed based on incoming time and one of the module's parameters.

Every time when a user registers with OpenSIPS, the module is looking in database for offline messages intended for that user. All of them will be sent to contact address provided in REGISTER request.

It may happen the SIP user to be registered but his SIP User Agent to have no support for MESSAGE request. In this case it should be used the “failure\_route” to store the undelivered requests.

Another functionality provided by the modules is to send messages at a certain time -- the reminder functionality. Using config logic, a received message can be stored and delivered at a time specified while storing with the 'snd\_time\_avp'.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS modules

The following modules must be loaded before this module:

*   _database module_ - mysql, dbtext or other module that implements the “db” interface and provides support for storing/receiving data to/from a database system.
    
*   _TM_\--transaction module--is used to send SIP requests.
    

### 1.2.2.�External libraries or applications

The following libraries or applications must be installed before running OpenSIPS with this module:

*   _none_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Database URL.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set the “db\_url” parameter**

...
modparam("msilo", "db\_url", "mysql://user:passwd@host.com/dbname")
...

  

### 1.3.2.�`db_table` (string)

The name of table where to store the messages.

_Default value is “silo”._

**Example�1.2.�Set the “db\_table” parameter**

...
modparam("msilo", "db\_table", "silo")
...

  

### 1.3.3.�`from_address` (string)

The SIP address used to inform users that destination of their message is not online and the message will be delivered next time when that user goes online. If the parameter is not set, the module will not send any notification. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.3.�Set the “from\_address” parameter**

...
modparam("msilo", "from\_address", "sip:registrar@example.org")
modparam("msilo", "from\_address", "sip:$rU@example.org")
...

  

### 1.3.4.�`contact_hdr` (string)

The value of the Contact header (including header name and ending \\r\\n) to be added in notification messages. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.4.�Set the “contact\_hdr” parameter**

...
modparam("msilo", "contact\_hdr", "Contact: <sip:null@example.com>\\r\\n")
...

  

### 1.3.5.�`offline_message` (string)

The body of the notification message. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.5.�Set the “offline\_message” parameter**

...
modparam("msilo", "offline\_message", "\*\*\* User $rU is offline!")
modparam("msilo", "offline\_message", "<em>I am offline!</em>")
...

  

### 1.3.6.�`content_type_hdr` (string)

The value of the Content-Type header (including header name and ending \\r\\n) to be added in notification messages. It must reflect what the 'offline\_message' contains. It can contain pseudo-variables.

_Default value is “NULL”._

**Example�1.6.�Set the “content\_type\_hdr” parameter**

...
modparam("msilo", "content\_type\_hdr", "Content-Type: text/plain\\r\\n")
modparam("msilo", "content\_type\_hdr", "Content-Type: text/html\\r\\n")
...

  

### 1.3.7.�`reminder` (string)

The SIP address used to send reminder messages. If this value is not set, the reminder feature is disabled.

_Default value is “NULL”._

**Example�1.7.�Set the “reminder” parameter**

...
modparam("msilo", "reminder", "sip:registrar@example.org")
...

  

### 1.3.8.�`outbound_proxy` (string)

The SIP address used as next hop when sending the message. Very useful when using OpenSIPS with a domain name not in DNS, or when using a separate OpenSIPS instance for msilo processing. If not set, the message will be sent to the address in destination URI.

_Default value is “NULL”._

**Example�1.8.�Set the “outbound\_proxy” parameter**

...
modparam("msilo", "outbound\_proxy", "sip:opensips.org;transport=tcp")
...

  

### 1.3.9.�`expire_time` (int)

Expire time of stored messages - seconds. When this time passed, the message is silently discarded from database.

_Default value is “259200 (72 hours = 3 days)”._

**Example�1.9.�Set the “expire\_time” parameter**

...
modparam("msilo", "expire\_time", 36000)
...

  

### 1.3.10.�`check_time` (int)

Timer interval to check if dumped messages are sent OK - seconds. The module keeps each request send by itself for a new online user and if the reply is 2xx then the message is deleted from database.

_Default value is “30”._

**Example�1.10.�Set the “check\_time” parameter**

...
modparam("msilo", "check\_time", 10)
...

  

### 1.3.11.�`send_time` (int)

Timer interval in seconds to check if there are reminder messages. The module takes all reminder messages that must be sent at that moment or before that moment.

If the value is 0, the reminder feature is disabled.

_Default value is “0”._

**Example�1.11.�Set the “send\_time” parameter**

...
modparam("msilo", "send\_time", 60)
...

  

### 1.3.12.�`clean_period` (int)

Number of “check\_time” cycles when to check if there are expired messages in database.

_Default value is “5”._

**Example�1.12.�Set the “clean\_period” parameter**

...
modparam("msilo", "clean\_period", 3)
...

  

### 1.3.13.�`use_contact` (int)

Turns on/off the usage of the Contact address to send notification back to sender whose message is stored by MSILO.

_Default value is “1 (0 = off, 1 = on)”._

**Example�1.13.�Set the “use\_contact” parameter**

...
modparam("msilo", "use\_contact", 0)
...

  

### 1.3.14.�`sc_mid` (string)

The name of the column in silo table, storing message id.

Default value is “mid”.

**Example�1.14.�Set the “sc\_mid” parameter**

...
modparam("msilo", "sc\_mid", "other\_mid")
...

  

### 1.3.15.�`sc_from` (string)

The name of the column in silo table, storing the source address.

Default value is “src\_addr”.

**Example�1.15.�Set the “sc\_from” parameter**

...
modparam("msilo", "sc\_from", "source\_address")
...

  

### 1.3.16.�`sc_to` (string)

The name of the column in silo table, storing the destination address.

Default value is “dst\_addr”.

**Example�1.16.�Set the “sc\_to” parameter**

...
modparam("msilo", "sc\_to", "destination\_address")
...

  

### 1.3.17.�`sc_uri_user` (string)

The name of the column in silo table, storing the user name.

Default value is “username”.

**Example�1.17.�Set the “sc\_uri\_user” parameter**

...
modparam("msilo", "sc\_uri\_user", "user")
...

  

### 1.3.18.�`sc_uri_host` (string)

The name of the column in silo table, storing the domain.

Default value is “domain”.

**Example�1.18.�Set the “sc\_uri\_host” parameter**

...
modparam("msilo", "sc\_uri\_host", "domain")
...

  

### 1.3.19.�`sc_body` (string)

The name of the column storing the message body in silo table.

Default value is “body”.

**Example�1.19.�Set the “sc\_body” parameter**

...
modparam("msilo", "sc\_body", "message\_body")
...

  

### 1.3.20.�`sc_ctype` (string)

The name of the column in silo table, storing content type.

Default value is “ctype”.

**Example�1.20.�Set the “sc\_ctype” parameter**

...
modparam("msilo", "sc\_ctype", "content\_type")
...

  

### 1.3.21.�`sc_exp_time` (string)

The name of the column in silo table, storing the expire time of the message.

Default value is “exp\_time”.

**Example�1.21.�Set the “sc\_exp\_time” parameter**

...
modparam("msilo", "sc\_exp\_time", "expire\_time")
...

  

### 1.3.22.�`sc_inc_time` (string)

The name of the column in silo table, storing the incoming time of the message.

Default value is “inc\_time”.

**Example�1.22.�Set the “sc\_inc\_time” parameter**

...
modparam("msilo", "sc\_inc\_time", "incoming\_time")
...

  

### 1.3.23.�`sc_snd_time` (string)

The name of the column in silo table, storing the send time for the reminder.

Default value is “snd\_time”.

**Example�1.23.�Set the “sc\_snd\_time” parameter**

...
modparam("msilo", "sc\_snd\_time", "send\_reminder\_time")
...

  

### 1.3.24.�`snd_time_avp` (str)

The name of an AVP which may contain the time when to sent the received message as reminder.The AVP is used ony by m\_store().

If the parameter is not set, the module does not look for this AVP. If the value is set to a valid AVP name, then the module expects in the AVP to be a time value in format YYYYMMDDHHMMSS (e.g., 20060101201500).

_Default value is “null”._

**Example�1.24.�Set the “snd\_time\_avp” parameter**

...
modparam("msilo", "snd\_time\_avp", "$avp(snd\_time)")
...

  

### 1.3.25.�`add_date` (int)

Wheter to add as prefix the date when the message was stored.

_Default value is “1” (1==on/0==off)._

**Example�1.25.�Set the “add\_date” parameter**

...
modparam("msilo", "add\_date", 0)
...

  

### 1.3.26.�`max_messages` (int)

Maximum number of stored message for an AoR. Value 0 equals to no limit.

_Default value is 0._

**Example�1.26.�Set the “max\_messages” parameter**

...
modparam("msilo", "max\_messages", 0)
...

  

## 1.4.�Exported Functions

### 1.4.1.�`m_store([owner])`

The method stores certain parts of the current SIP request (it should be called when the request type is MESSAGE and the destination user is offline or his UA does not support MESSAGE requests). If the user is registered with a UA which does not support MESSAGE requests you should not use mode=“0” if you have changed the request uri with the contact address of user's UA.

Meaning of the parameters is as follows:

*   _owner_ (string, optional) - a SIP URI in whose inbox the message will be stored. If "owner" is missing, the SIP address is taken from R-URI.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.27.�`m_store` usage**

...
m\_store();
m\_store($tu);
...

  

### 1.4.2.�`m_dump([owner], [maxmsg])`

The method sends stored messages for the SIP user that is going to register to his actual contact address. The method should be called when a REGISTER request is received and the “Expire” header has a value greater than zero.

Meaning of the parameters is as follows:

*   _owner_ (string, optional) - a SIP URI whose inbox will be dumped. If "owner" is missing, the SIP address is taken from To URI.
    
*   _maxmsg_ (int, optional) - is a maximum number of messages to be dumped.
    

This function can be used from REQUEST\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.28.�`m_dump` usage**

...
m\_dump();
m\_dump($fu);
m\_dump($fu, 10);
...

  

## 1.5.�Exported Statistics

### 1.5.1.�stored\_messages

The number of messages stored by msilo.

### 1.5.2.�dumped\_messages

The number of dumped messages.

### 1.5.3.�failed\_messages

The number of failed dumped messages.

### 1.5.4.�dumped\_reminders

The number of dumped reminder messages.

### 1.5.5.�failed\_reminders

The number of failed reminder messages.

## 1.6.�Installation and Running

### 1.6.1.�OpenSIPS config file

Next picture displays a sample usage of msilo.

**Example�1.29.�OpenSIPS config script - sample msilo usage**

...
#
# MSILO usage example
#
#


# running in debug mode (log level 4, log to stderr, stay in foreground)
debug\_mode=yes

check\_via=no      # (cmd. line: -v)
dns=off           # (cmd. line: -r)
rev\_dns=off       # (cmd. line: -R)
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

modparam("registrar", "default\_expires", 120)

# -- registrar params --

modparam("usrloc", "db\_mode", 0)

# -- msilo params --

modparam("msilo","db\_url","mysql://opensips:opensipsrw@localhost/opensips")
modparam("msilo","from\_address","sip:registrar@opensips.org")
modparam("msilo","contact\_hdr","Contact: registrar@192.168.1.2:5060;msilo=yes\\r\\n")
modparam("msilo","content\_type\_hdr","Content-Type: text/plain\\r\\n")
modparam("msilo","offline\_message","\*\*\* User $rU is offline!")

# -- tm params --

modparam("tm", "fr\_timer", 10 )
modparam("tm", "fr\_inv\_timer", 15 )
modparam("tm", "wt\_timer", 10 )


route{
    if ( !mf\_process\_maxfwd\_header(10) )
    {
        sl\_send\_reply(483, "Too Many Hops");
        exit;
    };


    if (is\_myself("$rd")) {
    {
        # for testing purposes, simply okay all REGISTERs
        if ($rm=="REGISTER")
        {
            save("location");
            log("REGISTER received -> dumping messages with MSILO\\n");

            # MSILO - dumping user's offline messages
            if (m\_dump())
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
            if (! t\_newtran())
            {
                sl\_reply\_error();
                exit;
            };
            # we do not care about anything else but MESSAGEs
            if (!$rm=="MESSAGE")
            {
                if (!t\_reply(404, "Not found")) 
                {
                    sl\_reply\_error();
                };
                exit;
            };
            log("MESSAGE received -> storing using MSILO\\n");
            # MSILO - storing as offline message
            if (m\_store("$ru"))
            {
                log("MSILO: offline message stored\\n");
                if (!t\_reply(202, "Accepted")) 
                {
                    sl\_reply\_error();
                };
            }else{
                log("MSILO: offline message NOT stored\\n");
                if (!t\_reply(503, "Service Unavailable")) 
                {
                    sl\_reply\_error();
                };
            };
            exit;
        };
        # if the downstream UA does not support MESSAGE requests
        # go to failure\_route\[1\]
        t\_on\_failure("1");
        t\_relay();
        exit;
    };

    # forward anything else
    t\_relay();
}

failure\_route\[1\] {
    # forwarding failed -- check if the request was a MESSAGE 
    if (!$rm=="MESSAGE")
    {
        exit;
    };
    
    log(1,"MSILO:the downstream UA doesn't support MESSAGEs\\n");
    # we have changed the R-URI with the contact address, ignore it now
    if (m\_store("$ou"))
    {
        log("MSILO: offline message stored\\n");
        t\_reply(202, "Accepted"); 
    }else{
        log("MSILO: offline message NOT stored\\n");
        t\_reply(503, "Service Unavailable");
    };
}



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

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

124

66

4163

1410

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

45

38

191

277

3.

Andrei Pelinescu-Onciul

18

10

115

382

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

17

14

73

89

5.

Jan Janak ([@janakj](https://github.com/janakj))

16

11

126

168

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

33

28

7.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

9

6

180

33

8.

Henning Westerholt ([@henningw](https://github.com/henningw))

9

6

114

110

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

5

69

123

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

7

4

90

80

  

**All remaining contributors**: Juha Heinanen ([@juha-h](https://github.com/juha-h)), Andrea Giordana, Ancuta Onofrei, Elena-Ramona Modroiu, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Aron Rosenberg, John Riordan, Konstantin Bokarius, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Juli�n Moreno Pati�o, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Sergio Gutierrez, UnixDev, Zero King ([@l2dy](https://github.com/l2dy)), Edson Gellert Schubert, Stanislaw Pitucha.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Apr 2022 - Apr 2022

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Sep 2002 - Oct 2021

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Jan 2021

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Aug 2011 - Mar 2015

  

**All remaining contributors**: Stanislaw Pitucha, John Riordan, UnixDev, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Ancuta Onofrei, Aron Rosenberg, Elena-Ramona Modroiu, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Andrea Giordana, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Andrea Giordana, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS