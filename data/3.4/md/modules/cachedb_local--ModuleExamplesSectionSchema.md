# cachedb\_local Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5684848)

3.2. [Most recently active contributors(1) to this module](#idp5786176)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp5573344)

1.2. [Set `cache_collections` parameter](#idp5579824)

1.3. [Set `cache_clean_period` parameter](#idp5585248)

1.4. [Setting the `cluster_id` parameter](#idp5595792)

1.5. [Set `cluster_persistency` parameter](#idp5604528)

1.6. [Set `enable_restart_persistency` parameter](#idp5611120)

1.7. [`cache_remove_chunk` usage](#idp5621216)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a local cache system designed as a hash table. It uses the Key-Value interface exported by OpenSIPS core. Starting with version 2.3, the module can have multiple hash tables, called collections. Each url for cachedb\_local module points to one collection. One collection can be shared between multiple urls.

## 1.2.�Clustering

Cachedb\_local clustering is a mechanism used to mirror local cache changes taking place in one OpenSIPS instance to one or multiple other instances without the need of third party dependencies. The process is simplified by using the clusterer module which facilitates the management of a cluster of OpenSIPS noeds and the sending of replication-related BIN packets (binary-encoded, using proto\_bin). This might be usefull for implementing a hot stand-by system, where the stand-by instance can take over without the need of filling the cache by its own.

The following cache operations will be distributet within the cluster:

*   cache\_store
    
*   cache\_remove
    
*   cache\_add
    
*   cache\_sub
    

In addition to the event-driven replication, an OpenSIPS instance will first try to learn all the local cache information from antoher node in the cluster at startup. The data synchronization mechanism requires defining one of the nodes in the cluster as a "**seed**" node. See the [clusterer](https://opensips.org/docs/modules/3.0.x/clusterer.html#capabilities) module for details on how to do this and why is it needed.

_Note:_ You have to explicitly specify which collections you want to replicate when you set [cache\_collections](#param_cache_collections "1.4.2.�cache_collections (string)").

**Limitations:** The clustering operations are not atomic and constistency over the cluster nodes is not guaranteed.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _clusterer, if [cluster\_id](#param_cluster_id "1.4.4.�cluster_id (int)") is set._
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.4.�Exported Parameters

### 1.4.1.�`cachedb_url` (string)

URLs of local cache groups to be used used for the script and MI cacheDB operations. The parameter can be set multiple times.

One collection can belong to multiple URLs, but one URL can have only one collection. Redefining an URL with the same schema and group name will result in overwriting that URL. Each collection used in URL definition must be defined using _cachedb\_collection_ parameter. The collection shall be defined as a normal database, at the end of the URL as in the examples. In the script the collection shall be identified using the schema and, if exists, the group name.

_“If no URL defined, the url with no group name and collection "default" will be used.”._

**Example�1.1.�Set `cachedb_url` parameter**

...
### for this example, if no collection is defined, the default collection named
### "default" shall be used
modparam("cachedb\_local", "cachedb\_url", "local://")
### this URL will use the collection named collection1; it will overwrite the
### previous url definition which was using the "default" collection
modparam("cachedb\_local", "cachedb\_url", "local:///collection1")
### this URL will use collection2; it will be referenced from the script
### with "local:group2"
modparam("cachedb\_local", "cachedb\_url", "local:group2:///collection2")

## how to use the URLs from the script
## as defined above, this call will use collection1
cache\_store("local", ...)
## as defined above, this call will use collection2
cache\_store("local:group2", ...)
...
	

  

### 1.4.2.�`cache_collections` (string)

Using this parameter, collections(hash tables) and their sizes can be defined. Each collection definition must be separated one from another using ';'. Default size for a hash is 512. The size must be separated from the name of the collection using '='.

If clustering is enabled you have to specify which collections you want to replicate with the _/r_ suffix to the collection name.

The _"default"_ collection always gets created, even when not included in this list of collections.

**Example�1.2.�Set `cache_collections` parameter**

...
## creating collection1 with default size (512) and collection2 with custom size
## 2^5 (32); we also changed the size of the default collection, which would have been
## created anyway from 2^9 - 512 (default value) to 2^4 - 16
## also, collection1 and collection2 will be replicated in the cluster, while the
## default collection will be local to this node
modparam("cachedb\_local", "cache\_collections", "collection1/r; collection2/r = 5; default = 4")
...
	

  

### 1.4.3.�`cache_clean_period` (int)

The time interval in seconds at which to go through all the records and delete the expired ones.

_Default value is “600 (10 minutes)”._

**Example�1.3.�Set `cache_clean_period` parameter**

...
modparam("cachedb\_local", "cache\_clean\_period", 1200)
...
	

  

### 1.4.4.�`cluster_id` (int)

Specifies the cluster ID which this instance will send to and receive cache data.

This OpenSIPS cluster exposes the **"cachedb-local-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

Default value is 0 (replication disabled).

**Example�1.4.�Setting the `cluster_id` parameter**

...
modparam("cachedb\_local", "cluster\_id", 1)
...
		

  

### 1.4.5.�`cluster_persistency` (string)

Controls the behavior of the OpenSIPS local cachedb clustering following a restart.

This parameter may take the following values:

*   _"none"_ - no explicit data synchronization following a restart. The node starts empty.
    
*   _"sync-from-cluster"_ - enable cluster-based restart persistency. Following a restart, an OpenSIPS cluster node will search for a healthy "donor" node from which to mirror the entire user location dataset via direct cluster sync (TCP-based, binary-encoded data transfer). This will require the configuration of one or multiple "seed" nodes in the cluster.
    

_Default value is _"sync-from-cluster"_._

**Example�1.5.�Set `cluster_persistency` parameter**

...
modparam("cachedb\_local", "cluster\_persistency", "sync-from-cluster")
...
		

  

### 1.4.6.�`enable_restart_persistency` (int)

Enable restart persistency using the persistent memory mechanism. Data is stored in a cache file that is mapped against OpenSIPS memory.

Note that you have to keep the same collection definitions from a previous run in order to use the cached data for the respective collections.

If cluster persistency is enabled as well, keys loaded from the persistent cache will be discarded if they are not received in the cluster sync data.

_Default value is “0 (disabled)”._

**Example�1.6.�Set `enable_restart_persistency` parameter**

...
modparam("cachedb\_local", "enable\_restart\_persistency", yes)
...

  

## 1.5.�Exported Functions

### 1.5.1.� `cache_remove_chunk([collection,] glob)`

Remove all keys from local cache that match the _glob_ pattern corresponding to a certain _collection_ or the 'default' collection if none defined. Keep in mind that collection name is different than group name, which identifies the engine in cachedb operations.

Parameters:

*   _collection_ (string, optional)
    
*   _glob_ (string)
    

This function can be used from all routes

**Example�1.7.�`cache_remove_chunk` usage**

	...
	cache\_remove\_chunk("myinfo\_\*");
	cache\_remove\_chunk("collection1", "myinfo\_\*");
	...
	

  

## 1.6.�Exported MI Functions

### 1.6.1.� `cache_remove_chunk`

Removes all local cache entries that match the provided glob param.

Parameters :

*   _glob_ - keys that match glob will be removed
    
*   _collection(optional)_ - collection from which the keys shall be removed; if no collection set, the default collection will be used;
    

MI FIFO Command Format:

opensips-cli -x mi cache\_remove\_chunk "keyprefix\*" collection
		

## Chapter�2.�Frequently Asked Questions

**2.1.**

What happened with old cache\_table\_size parameter?

The parameter was removed because it was redundant. Since the addition of collections, the old hash now belongs to the default collection. This collection is created every time and it has a default size of 512. The size can be changed by setting the default collection size using cache\_collections paramter.

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

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

32

10

1155

693

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

25

16

509

226

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

23

17

132

191

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

16

14

46

50

5.

Anca Vamanu

13

5

739

54

6.

Andrei Dragus

9

4

182

181

7.

Fabian Gast ([@fgast](https://github.com/fgast))

9

3

517

48

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

9

3

513

55

9.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

7

5

8

6

10.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

9

10

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Juli�n Moreno Pati�o, Zero King ([@l2dy](https://github.com/l2dy)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Sep 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jan 2017 - Oct 2022

4.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2009 - Apr 2019

8.

Fabian Gast ([@fgast](https://github.com/fgast))

Dec 2018 - Dec 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jan 2017 - Jan 2017

10.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

  

**All remaining contributors**: Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Andrei Dragus, Anca Vamanu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Zero King ([@l2dy](https://github.com/l2dy)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Fabian Gast ([@fgast](https://github.com/fgast)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Andrei Dragus, Anca Vamanu.

_Documentation Copyrights:_

Copyright � 2009 Anca-Maria Vamanu