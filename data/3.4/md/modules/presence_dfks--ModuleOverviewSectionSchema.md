# presence\_dfks Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5597360)

2.2. [Most recently active contributors(1) to this module](#idp5674288)

**List of Examples**

1.1. [Set parameter](#idp161424)

1.2. [Set parameter](#idp166608)

1.3. [`dfks` usage](#idp5558656)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module enables the handling of the "as-feature-event" event package (as defined by Broadsoft's [Device Feature Key Synchronization](https://h30434.www3.hp.com/psg/attachments/psg/Desk_IP_Conference_Phones/1740/1/DeviceFeatureKeySynchronizationFD.pdf) protocol) by the presence module. This can be used to synchronize the status of features such as Do Not Disturb and different forwarding types between a SIP phone and a SIP server.

The module supports synchronization for the following features: Do Not Disturb, Call Forwarding Always, Call Forwarding Busy and Call Forwarding No Answer. Feature status can be changed either from the SIP phone or the OpenSIPS Server( by running an MI command).

When handling a SUBSCRIBE message without a body, the module will run a script route for each feature, that will be used to retrieve the current status of that feature. Conversely, a SUBSCRIBE with a body will trigger a script route where the updated status of a specific feature is available. This route might also be run if the feature update was triggered from OpenSIPS via MI.

Note that the module does not automatically cache or persist any feature information as this is left for the script writer to implement in the routes triggered by the module.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _presence_.
    

### 1.2.2.�External Libraries or Applications

*   _libxml2-dev_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`get_route` (string)

The name of the script route to be run in order to retrieve the status of a feature.

_Default value is “dfks\_get”._

**Example�1.1.�Set parameter**

...
modparam("presence\_dfks", "get\_route", "dfks\_get")
...

  

### 1.3.2.�`set_route` (string)

The name of the script route to be run when a feature status update from a SIP phone is received.

_Default value is “dfks\_get”._

**Example�1.2.�Set parameter**

...
modparam("presence\_dfks", "set\_route", "dfks\_set")
...

  

## 1.4.�Exported Functions

None.

## 1.5.�Exported MI Functions

### 1.5.1.� `dfks_set_feature`

Triggers the sending of NOTIFY messages containing a feature status update to all watchers.

_Note:_ calling this MI function also triggers the _set\_route_ run. One can determine if the route is triggered by an MI function by checking the existence of the _$dfks(param)_ variable.

Name: _dfks\_set\_feature_

Parameters:

*   _presentity_: the URI of the user whose feature status should be updated
    
*   _feature_: The name of the feature to update. Takes one of the following values:
    
    *   _DoNotDisturb_
        
    *   _CallForwardingAlways_
        
    *   _CallForwardingBusy_
        
    *   _CallForwardingNoAnswer_
        
    
*   _status_: the new status of the feature: _0_ - disabled, _1_ - enabled
    
*   _route\_param_: optional string parameter passed to the _$dfks(param)_ variable in _set\_route_.
    
*   _values_: an array of extra values that can be updated for a feature. The format of an array element is: _field_/_value_. Supported fields are:
    
    *   _forwardTo_ - for all forwarding types
        
    *   _ringCount_ - for _CallForwardingNoAnswer_
        
    

MI FIFO Command Format:

opensips-cli -x mi dfks\_set\_feature sip:alice@10.0.0.11 CallForwardingNoAnswer 1 1 \\
ringCount/4 forwardTo/sip:bob@10.0.0.11

## 1.6.�Exported Pseudo-Variables

### 1.6.1.� `$dfks(field)`

This pseudo-variable can be used in the routes triggered by the module to handle the feature information through the following subnames:

*   _assigned_ - inform the SIP phone that a feature is unassigned by setting this to _0_ (the NOTIFY response will contain no XML data for the corresponding feature) By default, features are assigned.
    
*   _notify_ - suppress the sending of the NOTIFY message by setting this to _0_. By default, the NOTIFY is sent.
    
*   _presentity_ - read-only, returns the current presentity URI.
    
*   _feature_ - read-only, returns the current feature name. Possible values are:
    
    *   _DoNotDisturb_
        
    *   _CallForwardingAlways_
        
    *   _CallForwardingBusy_
        
    *   _CallForwardingNoAnswer_
        
    
*   _status_ - read or write the feature status. A value of _1_ means enabled and _0_ disabled.
    
*   _param_ - returns the parameter passed by the _mi\_dfks\_set\_feature_ MI function. This field will be _NULL_ if the parameter was not specified, or if the _set\_route_ is not triggered by an MI command, but by SIP signalling.
    
*   _value/field_ - read or write extra feature values. _field_ can be one of:
    
    *   _forwardTo_ - for all forwarding types
        
    *   _ringCount_ - for _CallForwardingNoAnswer_
        
    

**Example�1.3.�`dfks` usage**

...
route\[dfks\_set\] {
    # CallForwardingAlways is not allowed
    if ($dfks(feature) == "CallForwardingAlways")
        $dfks(status) = 0;

    xlog("New status: $dfks(status) for feature '$dfks(feature)' of user '$dfks(presentity)'\\n");
}
route\[dfks\_get\] {
    if ($dfks(feature) == "CallForwardingNoAnswer") {
        $dfks(status) = 1;
        $dfks(value/forwardTo) = "sip:bob@10.0.0.11";
        $dfks(value/ringCount) = "3";
    } else if ($dfks(feature) == "CallForwardingAlways")
        $dfks(assigned) = 0;
    } else {
        ...
    }
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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

23

7

1641

92

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

15

20

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

6

4

31

26

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

4

2

2

2

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

3

1

67

21

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2020 - Jan 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Nov 2020 - Jan 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Dec 2019 - Sep 2020

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2020 - Feb 2020

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2019 [www.opensips-solutions.com](http://www.opensips-solutions.com/)