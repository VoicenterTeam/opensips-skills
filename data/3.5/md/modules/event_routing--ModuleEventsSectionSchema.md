# Event (based) Routing Module

---

**List of Tables**

4.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5625616)

4.2. [Most recently active contributors(1) to this module](#idp5743472)

**List of Examples**

1.1. [`notify_on_event()` usage](#idp5570864)

1.2. [`wait_for_event` usage](#idp5577360)

1.3. [Push Notification script](#idp5583808)

1.4. [Call Pickup script](#idp5590032)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The Event (based) Routing module, or shortly the EBR module, provides a mechanism that allows different SIP processings (of messages in script) to communicate and synchronize between through OpenSIPS Events (see https://opensips.org/Documentation/Interface-Events-2-3).

This mechanism is based on the Subscribe-Notify concept. Any SIP processing may subscribe to various OpenSIPS Events Upon Event raising, the subscriber will be notified, so it will be able to make use of the data attached to the Event. Note that the Event raising may take place in a completely different SIP processing context, completely unrelated to the subscriber processing.

Also, the Events are generated either internally by OpenSIPS (predefined Events), either from the script level (custom Events). Please refer to the Event Interface documentation for more on how the Events are generated (https://opensips.org/Documentation/Interface-Events-2-3).

Depending on how the notification is handled by the subscribing processing, we distinguish two main scenarios:

*   The subscriber waits in async. mode for the receiving the notification; the processing of the subscriber will suspend and it will be fully resumed when the notification is received (or a timeout occurs).
    
*   The subscriber continues its processing after subscription, without any waiting. Whenever a notification is received, a script route (armed by the subscription) will be executed. Note that this notification route is executed outside any context of the original processing (nothing is inherited in this route). The Event triggering the notification is exposed in the notification route, via AVP variables.
    

So, EBR allows your SIP processing to synchronize or the exchange info between, even if these processings are completely unrelated from SIP, time or handling perspective.

With the help of the EBR support, more advanced routing scenarios are possible now, scenarios where you need to handle and put together different processing as type and time, like the handling of various calls with the handling of registrations or with the DTMF extraction. For more, see the [Examples](#Examples "1.6.�Usage Examples") section.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules are required by this module:

*   _TM_ - Transaction module
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

This module does not provide any script parameters.

## 1.4.�Exported Functions

### 1.4.1.� `notify_on_event(event, filter, route, timeout)`

This function creates a subscription to a given Event. A filter can be used (over the attributes of the Event) in order to filter even more the needed notifications (only Events matching the filter will be notified to this subscriber).

Upon Event notification, the given script route (usually called notification route) will be executed. No variables, SIP message, SIP transaction/dialog or any other context related to subscriber will be inherited from subscriber processing into this notification route.

The Event attributes will be exposed in the notification route via AVP variables as _$avp(attr\_name) = attr\_value_.

As an exception, in the notification route, the EBR module will make available the transaction ID from the subscriber context. Note that it's not the transaction itself, but its ID. There are some TM functions (like _t\_inject\_branches_) which can operate on transactions based on their ID. Of course, you need to have a transaction create in the subscriber processing before calling the _notify\_on\_event()_ function.

This function can be used from REQUEST\_ROUTE.

Parameters:

*   _event_ (string) -the name of the Event to subscribe for
    
*   _filter_ (var) - a AVP variable holding (as multi value array) all the filters to be applied on the event (before notification). The filter value has the format "key=value" where the "key" must match an attribute name of the Event. The "value" is the desired value for the attribute; it may be a shell wildcard pattern. Ex: "aor=bob@\*"
    
*   _route_ (string) -the name of the script route to be executed upon Event notification
    
*   _timeout_ (int) - for how long the subscription is active before expiring (integer in seconds). Note: during its lifetime, a subscription may be notified several or zero times.
    

**Example�1.1.�`notify_on_event()` usage**

...
$avp(filter) = "aor=\*@opensips.org"
notify\_on\_event("E\_UL\_AOR\_INSERT",$avp(filter),"reg\_done",60);
...
route\[reg\_done\] {
	xlog("a new user $avp(aor) registered with opensips.org domain\\n");
}

  

## 1.5.�Exported Asynchronous Functions

### 1.5.1.� `wait_for_event(event,filter,timeout)`

Similar to the _notify\_on\_event_, this function creates an Event subscriber for the given event and filter. But this function will do async waiting (with suspend and resume) for receiving the notification on the desired Event.

The meaning of the parameters is the same as for _notify\_on\_event_.

**Example�1.2.�`wait_for_event` usage**

...
# wait for callee to register
$avp(filter) = "aor="+$rU+"@"+$rd
async( wait\_for\_event("E\_UL\_AOR\_INSERT",$avp(filter), 40),  resume\_call);
# done
...
route\[resume\_call\] {
	xlog("user $avp(aor) is now registered\\n");
	lookup("location");
	t\_relay();
}

  

## 1.6.�Usage Examples

### 1.6.1.� `Push Notification`

We use _notify\_on\_event_ to capture the events on new contact registrations for callee. Once the call is sent to callee, based on the notification (for new contacts) we inject the newly registered contacts as new branches in the ongoing transaction.

Schematics : when we send a call to a user, we subscribe to see any new contacts being registered by the user. On such a notification, we add the new contact as a new branch to the ongoing transaction (ringing) to user.

**Example�1.3.�Push Notification script**

...
route\[route\_to\_user\] {

    # prepare transaction for branch injection; it is mandatory
    # to create the transaction before the subscription, otherwise
    # the EBR module will not pass the transaction ID into the
    # notification route
    t\_newtran();

    # keep the transaction alive (even if all branches will 
    # terminate) until the FR INVITE timer hits (we want to wait
    # for new possible contacts being registered)
    t\_wait\_for\_new\_branches();

    # subscribe to new contact registration event,
    # but for our callee only
    $avp(filter) = "aor="+$rU;
    notify\_on\_event("E\_UL\_CONTACT\_INSERT",$avp(filter),
        "fork\_call", 20);

    # fetch already registered contacts and relay if any
    if (lookup("location"))
        route(relay);
    # if there were no contacts available (so no branches 
    # created so far), the created transaction will still be 
    # waiting for new branches due to the usage of the 
    # t\_wait\_for\_new\_branches() function

    exit;
}

route\[fork\_call\]
{
    xlog("user $avp(aor) registered a new "
        "contact $avp(uri), injecting\\n");
    # take the contact described by the E\_UL\_CONTACT\_INSERT
    # event and inject it as a new branch into the original
    # transaction
    t\_inject\_branches("event");
}
...

  

### 1.6.2.� `Call pickup`

The scenario is Alice calling to bob, Bob does not pickup and Charlie is performing call pickup (to get the call from Alice)

We use _notify\_on\_event_ to link the two calls: the one from Alice to Bob and the one from Charlie to call pickup service.

Schematics: when we send a call to a user within a pickup group, we subscribe to see if there is any call to the pickup service (from another member of the same pickup group). When we have a call to the pickup service, we raise from script an event - this event will be notified to the first call and we cancel the branches to Bob and inject the registered contacts for the user calling to pickup group (Charlie).

**Example�1.4.�Call Pickup script**

...
route\[handle\_call\]
    if ($rU=="33") {
        ## this is a call to the pickup service
        ## (Charlie calling 33)

        # reject incoming call as we will generate an back call
        # from the original call (Alice to Bob)
        t\_newtran();
        send\_reply(480, "Gone");

        # raise the pickup custom event
        # with pickup group 1 and picker being Charlie (caller)
        $avp(attr-name) = "group";
        $avp(attr-val) = "1";
        $avp(attr-name) = "picker";
        $avp(attr-val) = $fu;
        raise\_event("E\_CALL\_PICKUP", $avp(attr-name), $avp(attr-val));

        exit;
    } else {

        ## this is a call to a subscriber
        ## (Alice calls Bob)

        # apply user location
        if (!lookup("location", "method-filtering")) {
            send\_reply(404, "Not Found");
            exit;
        }

        # prepare transaction for branch injection; it is mandatory
        # to create the transaction before the subscription, otherwise
        # the EBR module will not pass the transaction ID into the
        # notification route
        t\_newtran();

        # subscribe to a call pickup event, but for our group only
        $avp(filter) = "group=1";
        notify\_on\_event("E\_CALL\_PICKUP",$avp(filter),
            "handle\_pickup", 20);

        t\_relay();
    }
    exit;
}

route\[handle\_pickup\]
{
    xlog("call picked by $avp(picker), fetching its contacts\\n");
    if (lookup("location","", $avp(picker))) {
        # take the contacts retured by lookup() (for Charlie)
        # and inject them into the original call, but also cancel
        # any existing ongoing branch (ringing to Bob)
        t\_inject\_branches("msg","cancel");
    }
}

  

## Chapter�2.�Developer Guide

This modules does not export any internal API.

## Chapter�3.�Frequently Asked Questions

**3.1.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**3.2.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**3.3.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

## Chapter�4.�Contributors

## 4.1.�By Commit Statistics

**Table�4.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

30

13

1802

53

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

29

20

494

220

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

5

75

148

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

6

4

9

5

5.

Fabian Gast ([@fgast](https://github.com/fgast))

4

2

27

7

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

5

6

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

3

1

8

1

8.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

2

2

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 4.2.�By Commit Activity

**Table�4.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2017 - Aug 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Sep 2017 - Nov 2024

3.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Nov 2024 - Nov 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2020

6.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Apr 2017 - Sep 2019

8.

Fabian Gast ([@fgast](https://github.com/fgast))

Nov 2018 - Dec 2018

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�5.�Documentation

## 5.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Zero King ([@l2dy](https://github.com/l2dy)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Fabian Gast ([@fgast](https://github.com/fgast)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)).

_Documentation Copyrights:_

Copyright � 2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)