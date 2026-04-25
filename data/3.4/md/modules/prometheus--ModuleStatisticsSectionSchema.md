# Prometheus Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5652592)

2.2. [Most recently active contributors(1) to this module](#idp5725696)

**List of Examples**

1.1. [Set `root` parameter](#idp109712)

1.2. [Set `prefix` parameter](#idp103216)

1.3. [Set `group_prefix` parameter](#idp171072)

1.4. [Set `delimiter` parameter](#idp176736)

1.5. [Set `group_label` parameter](#idp5578800)

1.6. [Set `group_mode` parameter](#idp5588736)

1.7. [Set `statistics` parameter](#idp5595056)

1.8. [Set `statistics` parameter](#idp5607504)

1.9. [Prometheus Scrape Config](#idp5613872)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a HTTP interface for the [Prometheus](https://prometheus.io/) monitoring system, allowing it to fetch different statistics from OpenSIPS.

In order to use it, you have to explicitely define the statistics you want to provide by listing them in the [statistics](#param_statistics "1.3.7.�statistics(string)") parameter.

Currently only _counter_ and _gauge_ metrics types are supported by the module, and whether to choose one or the other for a specific statistic is dictated by the way that statistic was defined either internally, or explicitely through the _variable_ parameter of the _statistics_ module.

Each exported statistic comes with a _group_ label that indicates the group it belongs to.

## 1.2.�Dependencies

### 1.2.1.�External Libraries or Applications

None

### 1.2.2.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _httpd_ module.
    

## 1.3.�Exported Parameters

### 1.3.1.�`root`(string)

Specifies the root metrics path Promethus uses to query the stats: http://\[opensips\_IP\]:\[opensips\_httpd\_port\]/\[root\]

_The default value is "metrics"._

**Example�1.1.�Set `root` parameter**

...
modparam("prometheus", "root", "prometheus")
...

  

### 1.3.2.�`prefix`(string)

Appends a prefix to each statistic exported.

_The default value is "opensips"._

**Example�1.2.�Set `prefix` parameter**

...
modparam("prometheus", "prefix", "opensips\_1")
...

  

### 1.3.3.�`group_prefix`(string)

Appends a prefix to the name of the group the statistic belongs to.

_The default value is "" (no group prefix)._

**Example�1.3.�Set `group_prefix` parameter**

...
modparam("prometheus", "group\_prefix", "opensips")
...

  

### 1.3.4.�`delimiter`(string)

Specifies the delimiter to be used to separate _prefix_ and _group\_prefix_.

_The default value is "\_"._

**Example�1.4.�Set `delimiter` parameter**

...
modparam("prometheus", "delimiter", "-")
...

  

### 1.3.5.�`group_label`(string)

Specifies the label used to store the group when _group\_mode_ is 2.

_The default value is "group"._

**Example�1.5.�Set `group_label` parameter**

...
modparam("prometheus", "group\_label", "grp")
...

  

### 1.3.6.�`group_mode`(int)

Specifies how the group of the statistic should be provisioned to Prometheus. Available modes are:

*   _0_ - do not send the statistics groups.
    
*   _1_ - send the group in the name of the statstic.
    
    For example, _timestamp_ statistic from the _core_ group would be exported as _opensips\_core\_timestamp_. Note that the _group\_prefix_ is still attached to the group's name.
*   _2_ - send the group as a label of the statstic.
    
    The name of the label is specified by the _group\_label_ parameter.

_The default value is 0 (do not specify the group)._

**Example�1.6.�Set `group_mode` parameter**

...
modparam("prometheus", "group\_mode", 1)
...

  

### 1.3.7.�`statistics`(string)

The statistics that are being exported by OpenSIPS, separated by space. The list can also contain statistics groups's names - to do that, you shall add a colon (_:_) at the end of the groups's name.

If the _all_ value is used, then the module will expose all available statistics - therefore any other settings of this parameter is useless;

This parameter can be defined multiple times.

_The default value is empty: no metric is exported._

**Example�1.7.�Set `statistics` parameter**

...
# export the number of active dialogs and the load statistics class
modparam("prometheus", "statistics", "active\_dialogs load:")
...

  

### 1.3.8.�`labels`(string)

Rules that define how to convert the name of a statistic within a group to obtain the name and set of labels to be pushed in Prometheus.

The format is _group: regex_, where _group_ represents the group of statistics for whom the regular expression should be applied for, and _regexp_ is a regular expression used to match the statistic's name and convert it to the desired name and labels.

The _regex_ format is _/matching\_expression/substitution\_expression/flags_. The _substitution\_expression_ resulted after the substituion should result in a string with the following format: _name:labels_, where _name_ represents the name of the statistic as it will be pushed towards Prometheus, and _labels_ the labels, expressed as _key=value_ pairs separated by comma, as they are received by Prometheus. _Note_ that the _labels_ string resulted is concatenated to the other labeles as plain string - no other transformations are performed.

If a statistic's name within the declared group does not match the regular, or the resulted format does not comply with the _name:labels_ format, the statistics transformations are ignored and it shall be printed as a regular statistic, as if the rule was not even used.

This parameter can be defined multiple times, even for a single group. However, if the statistic matches multiple regular expressions, only the first regular expression that matches is considered. The order they are checked is the order declared in the script.

_The default value is empty: statistic name is provided._

**Example�1.8.�Set `statistics` parameter**

...
# convert duration\_gateway to stat duration with gateway as a label
modparam("prometheus", "labels", "group: /^(.\*)\_(.\*)$/\\1:gateway=\\"\\2\\"/")
...

  

## 1.4.�Exported Functions

No function exported to be used from configuration file.

## 1.5.�Examples

In order to have Prometheus query OpenSIPS for statistics, you need to tell him where to get statistics from. To do that, you should define a scarpe job in Prometheus's _scrape\_configs_ config, indicating the IP and port you've configured the _httpd_ module to listen on (default: _0.0.0.0:8888_).

**Example�1.9.�Prometheus Scrape Config**

scrape\_configs:
  - job\_name: opensips

    static\_configs:
    - targets: \['localhost:8888'\]

  

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

31

17

1283

153

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

3

1

1

1

4.

OpenSIPS

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

Feb 2021 - Oct 2023

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Aug 2022 - Aug 2022

4.

OpenSIPS

Feb 2021 - Feb 2021

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), OpenSIPS.

_Documentation Copyrights:_

Copyright � 2021 [www.opensips-solutions.com](http://www.opensips-solutions.com/)