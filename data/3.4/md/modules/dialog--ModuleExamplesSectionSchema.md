# dialog Module

---

**List of Tables**

4.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp7420240)

4.2. [Most recently active contributors(1) to this module](#idp7555872)

**List of Examples**

1.1. [Set `enable_stats` parameter](#idp5923472)

1.2. [Set `hash_size` parameter](#idp5929168)

1.3. [Set `hash_size` parameter](#idp5934288)

1.4. [Set `rr_param` parameter](#idp5939264)

1.5. [Set `default_timeout` parameter](#idp5944160)

1.6. [Set `dlf_extra_hdrs` parameter](#idp5949120)

1.7. [Set `dlg_match_mode` parameter](#idp5958768)

1.8. [Set `delete_delay` parameter](#idp5965216)

1.9. [Set `db_url` parameter](#idp5970032)

1.10. [Set `db_mode` parameter](#idp5980848)

1.11. [Set `db_update_period` parameter](#idp5986176)

1.12. [Set `options_ping_interval` parameter](#idp5991136)

1.13. [Set `reinvite_ping_interval` parameter](#idp5998304)

1.14. [Set `table_name` parameter](#idp6003248)

1.15. [Set `call_id_column` parameter](#idp6008144)

1.16. [Set `from_uri_column` parameter](#idp6013136)

1.17. [Set `from_tag_column` parameter](#idp6018144)

1.18. [Set `to_uri_column` parameter](#idp6023136)

1.19. [Set `to_tag_column` parameter](#idp6028176)

1.20. [Set `from_cseq_column` parameter](#idp6033168)

1.21. [Set `to_cseq_column` parameter](#idp6038160)

1.22. [Set `from_route_column` parameter](#idp6043184)

1.23. [Set `to_route_column` parameter](#idp6048208)

1.24. [Set `from_contact_column` parameter](#idp6053200)

1.25. [Set `to_contact_column` parameter](#idp6058208)

1.26. [Set `from_sock_column` parameter](#idp6063248)

1.27. [Set `to_sock_column` parameter](#idp6068288)

1.28. [Set `dlg_id_column` parameter](#idp6073280)

1.29. [Set `state_column` parameter](#idp6078272)

1.30. [Set `start_time_column` parameter](#idp6083280)

1.31. [Set `timeout_column` parameter](#idp6088256)

1.32. [Set `profiles_column` parameter](#idp6093248)

1.33. [Set `vars_column` parameter](#idp6098224)

1.34. [Set `sflags_column` parameter](#idp6103216)

1.35. [Set `mflags_column` parameter](#idp6108208)

1.36. [Set `flags_column` parameter](#idp6113184)

1.37. [Set `profiles_with_value` parameter](#idp6119072)

1.38. [Set `profiles_no_value` parameter](#idp6125024)

1.39. [Set `db_flush_vals_profiles` parameter](#idp6130096)

1.40. [Set `timer_bulk_del_no` parameter](#idp6135136)

1.41. [Set `race_condition_timeout` parameter](#idp6140224)

1.42. [Set `cachedb_url` parameter](#idp6145248)

1.43. [Set `profile_value_prefix` parameter](#idp6150336)

1.44. [Set `profile_no_value_prefix` parameter](#idp6155424)

1.45. [Set `profile_size_prefix` parameter](#idp6160512)

1.46. [Set `profile_timeout` parameter](#idp6165584)

1.47. [Set `dialog_replication_cluster` parameter](#idp6177728)

1.48. [Set `profile_replication_cluster` parameter](#idp6183680)

1.49. [Set `replicate_profiles_buffer` parameter](#idp6188960)

1.50. [Set `replicate_profiles_check` parameter](#idp6194160)

1.51. [Set `replicate_profiles_timer` parameter](#idp6199232)

1.52. [Set `replicate_profiles_expire` parameter](#idp6204464)

1.53. [Set `cluster_auto_sync` parameter](#idp6210080)

1.54. [`create_dialog()` usage](#idp6225360)

1.55. [`match_dialog()` usage](#idp6234208)

1.56. [`validate_dialog()` usage](#idp6246400)

1.57. [`fix_route_dialog()` usage](#idp6251904)

1.58. [`get_dialog_info` usage](#idp6264064)

1.59. [`get_dialog_vals` usage](#idp6274880)

1.60. [`get_dialog_vals` usage](#idp6285728)

1.61. [`get_dialog_vals` usage](#idp6296752)

1.62. [`load_dialog_ctx` usage](#idp6306352)

1.63. [`set_dlg_profile` usage](#idp6321056)

1.64. [`unset_dlg_profile` usage](#idp6329936)

1.65. [`is_in_profile` usage](#idp6338480)

1.66. [`get_profile_size` usage](#idp6347680)

1.67. [`set_dlg_flag` usage](#idp6355376)

1.68. [`test_and_set_dlg_flag` usage](#idp6363584)

1.69. [`reset_dlg_flag` usage](#idp6370944)

1.70. [`is_dlg_flag_set` usage](#idp6378304)

1.71. [`store_dlg_value` usage](#idp6387920)

1.72. [`fetch_dlg_value` usage](#idp6397248)

1.73. [`set_dlg_sharing_tag` usage](#idp6405680)

1.74. [`dlg_on_answer` usage](#idp6413248)

1.75. [`dlg_on_timeout` usage](#idp6421632)

1.76. [`dlg_on_hangup` usage](#idp6429568)

1.77. [`dlg_send_sequential` usage to convert DTMF codes](#idp6440960)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The dialog module provides dialog awareness to the OpenSIPS proxy. Its functionality is to keep trace of the current dialogs, to offer information about them (like how many dialogs are active).

Aside tracking, the dialog module offers functionalities like flags and attributes per dialog (persistent data across dialog), dialog profiling and dialog termination (on timeout base or external triggered).

The module, via an internal API, also provide the foundation to build on top of it more complex dialog-based functionalities via other OpenSIPS modules.

## 1.2.�How it works

To create the dialog associated with an initial request, you must call the create\_dialog() function, with or without parameter.

The dialog is automatically terminated when a “BYE” is received. In case of no “BYE”, the dialog lifetime is controlled via the default timeout (see “default\_timeout” - [default\_timeout](#param_default_timeout "1.6.5.�default_timeout (integer)")) and custom timeout (see “$DLG\_timeout” - [$DLG\_timeout](#pv_DLG_timeout "1.10.8.�$DLG_timeout")).

Once terminated, the in-memory dialog may be destroyed right away or, depending on the “delete\_delay” - [delete\_delay](#param_delete_delay "1.6.8.�delete_delay (integer)")) setting, it may be kept for a while in memory, in a read-only state (no action, no changes, nothing). This delaying may be used to help with the routing of late in-dialog request that may be received after the dialog terminted (like late BYE's due retransmissions, cross BYE requests, auth'ed BYE request, slow ACK on re-INVITEs, etc).

## 1.3.�Dialog profiling

Dialog profiling is a mechanism that helps in classifying, sorting and keeping trace of certain types of dialogs, using whatever properties of the dialog (like caller, destination, type of calls, etc). Dialogs can be dynamically added in different (and several) profile tables - logically, each profile table can have a special meaning (like dialogs outside the domain, dialogs terminated to PSTN, etc).

There are two types of profiles:

*   _with no value_ - a dialog simply belongs to a profile. (like outbound calls profile). There is no other additional information to describe the dialog's belonging to the profile;
    
*   _with value_ - a dialog belongs to a profile having a certain value (like in caller profile, where the value is the caller ID). The belonging of the dialog to the profile is strictly related to the value.
    

A dialog can be added to multiple profiles in the same time.

Profiles are visible (at the moment) in the request route (for initial and sequential requests) and in the branch, failure and reply routes of the original request.

Dialog profiles can also be used in distributed systems, using the OpenSIPS CacheDB Interface or the _clusterer_ module. This feature allows you to share dialog profile information with multiple OpenSIPS instaces that use the same CacheDB backend or are part of an OpenSIPS cluster. In order to do that, the **cachedb\_url** or **profile\_replication\_cluster** parameters must be defined. Also, the profile must be marked as shared, by adding one of the _'/s'_ or _'/b'_ suffixes to the name of the profile in the _profiles\_with\_value_ or _profiles\_no\_value_ parameters.

## 1.4.�Dialog clustering

**Dialog replication** is a mechanism used to mirror all dialog changes taking place in one OpenSIPS instance to one or multiple other instances. The process is simplified by using the _clusterer_ module which facilitates the management of a cluster of OpenSIPS nodes and the sending of replication-related BIN packets (binary-encoded, using _proto\_bin_). This feature is useful in achieving High Availability and/or Load Balancing for ongoing calls.

Configuring both receival and sending of dialog replication packets is trivial and can be done by using the **dialog\_replication\_cluster** parameter. But in addition to just sharing data, in order to properly cluster dialogs you will need to manage which node in the cluster is doing certain actions on certain dialogs using the **sharing tags** mechanism. For details and configuration examples on how this would work in different usage scenarios, see [this article](https://blog.opensips.org/2018/03/23/clustering-ongoing-calls-with-opensips-2-4/).

The following actions will **not** be performed for a dialog marked with a sharing tag that is in the "**backup**" state:

*   sending Re-Invite or OPTIONS pings to end-points
    
*   generating BYE requests or any other actions(like producing CDRs) upon dialog expiration
    
*   sending replication packets on dialog events(update, delete)
    
*   counting the dialog in the profiles that it belongs; only if profile replication is also enabled
    

In addition to the event-driven replication, an OpenSIPS instance will first try to learn all the dialog information from antoher node in the cluster at startup. The data synchronization mechanism requires defining one of the nodes in the cluster as a "**seed**" node. See the [clusterer](https://opensips.org/docs/modules/3.0.x/clusterer.html#capabilities) module for details on how to do this and why is it needed.

In the context of dialog replication, using a database as a failsafe for obtaining restart persistency for dialog data is useful in case all nodes in the cluster are down. This approach makes the most sense if a separate, local DB is used for each node in the cluster. Dialogs loaded from the database at startup, which are not reconfirmed through syncing, are dropped and also deleted from the database once the sync from cluster is complete.

Also configuring profile replication via the _profile\_replication\_cluster_ parameter is not necessary when dialog replication is already configured. The profile information is included in the dialog updates sent in the dialog replication cluster. The profiles must still be marked for sharing though in the _profiles\_with\_value_ or _profiles\_no\_value_ parameters.

A scenario were both profile and dialog replication should be configured is when a platform has multiple POPs, where separate dialog replication clusters are configured for HA purposes, and a cluster for globally shared profiles is also required. In this case, proper counting for dialogs is ensured by using the sharing tags mechanism(in order to avoid counting each dialog twice, both on the active and backup node for that dialog).

## 1.5.�Dependencies

### 1.5.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _TM_ - Transaction module
    
*   _RR_ - Record-Route module, optional, if Dialog ID matching is used in non Topo Hiding cases
    
*   _clusterer_ - if _replication\_cluster_ parameter is set (contact replication via clusterer module)
    

### 1.5.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.6.�Exported Parameters

### 1.6.1.�`enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the dialog processing. Set it to zero to disable or to non-zero to enable it.

_Default value is “1 (enabled)”._

**Example�1.1.�Set `enable_stats` parameter**

...
modparam("dialog", "enable\_stats", 0)
...

  

### 1.6.2.�`hash_size` (integer)

The size of the hash table internally used to keep the dialogs. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

IMPORTANT: If dialogs' information should be stored in a database, a constant hash\_size should be used, otherwise the restored process will not take place. If you really want to modify the hash\_size you must delete all table's rows before restarting OpenSIPS.

_Default value is “4096”._

**Example�1.2.�Set `hash_size` parameter**

...
modparam("dialog", "hash\_size", 1024)
...

  

### 1.6.3.�`log_profile_hash_size` (integer)

The size of the hash table internally used to store profile->dialog associations. A larger table can provide more parallel operations but consumes more memory. The hash size is provided as the base 2 logarithm(e.g. log\_profile\_hash\_size =4 means the table has 2^4 entries).

_Default value is “4”._

**Example�1.3.�Set `hash_size` parameter**

...
modparam("dialog", "log\_profile\_hash\_size", 5) #set a table size of 32
...

  

### 1.6.4.�`rr_param` (string)

Name of the Record-Route parameter to be added with the dialog cookie. It is used for fast dialog matching of the sequential requests.

_Default value is “did”._

**Example�1.4.�Set `rr_param` parameter**

...
modparam("dialog", "rr\_param", "xyz")
...

  

### 1.6.5.�`default_timeout` (integer)

The default dialog timeout (in seconds) if no custom one is set.

_Default value is “43200 (12 hours)”._

**Example�1.5.�Set `default_timeout` parameter**

...
modparam("dialog", "default\_timeout", 21600)
...

  

### 1.6.6.�`dlg_extra_hdrs` (string)

A string containing the extra headers (full format, with EOH) to be added in the requests generated by the module (like BYEs).

_Default value is “NULL”._

**Example�1.6.�Set `dlf_extra_hdrs` parameter**

...
modparam("dialog", "dlg\_extra\_hdrs", "Hint: credit expired\\r\\n")
...

  

### 1.6.7.�`dlg_match_mode` (integer)

How the seqential requests should be matched against the known dialogs. The modes are a combination between matching based on a cookie (DID) stored as cookie in Record-Route header and the matching based on SIP elements (as in RFC3261).

The supported modes are:

*   _0 - DID\_ONLY_ - the match is done exclusively based on DID;
    
*   _1 - DID\_FALLBACK_ - the match is first tried based on DID and if not present, it will fallback to SIP matching;
    
*   _2 - DID\_NONE_ - the match is done exclusively based on SIP elements; no DID information is added in RR.
    

_Default value is “1 (DID\_FALLBACK)”._

NOTE that if you have call looping on your OpenSIPS server (passing more than once through the same OpenSIPS instance), it is strongly suggested to use only DID\_ONLY mode, as the SIP based matching will have an undefined behavior - from SIP perspective, a sequential dialog will match all the loops of the call, as the Call-ID, To and From TAGs are the same.

**Example�1.7.�Set `dlg_match_mode` parameter**

...
modparam("dialog", "dlg\_match\_mode", 0)
...

  

### 1.6.8.�`delete_delay` (integer)

The interval (seconds) to delay a dialog deletion / removal from memory AFTER its termination. Once terminated, the dialog will be kept in a read only state (no action, no changes), but it will still be able to match and route late in-dialog requests.

This global value may be per-call changed via the DLG\_del\_delay “$DLG\_del\_delay” ([$DLG\_del\_delay](#pv_DLG_del_delay "1.10.9.�$DLG_del_delay")) script variable.

_Default value is “0” (disabled)._

**Example�1.8.�Set `delete_delay` parameter**

...
modparam("dialog", "delete\_delay", 10)
...

  

### 1.6.9.�`db_url` (string)

If you want to store the information about the dialogs in a database a database url must be specified.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.9.�Set `db_url` parameter**

...
modparam("dialog", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.6.10.�`db_mode` (integer)

Describe how to push into the DB the dialogs' information from memory.

The supported modes are:

*   _0 - NO\_DB_ - the memory content is not flushed into DB;
    
*   _1 - REALTIME_ - any dialog information changes will be reflected into the database immediately.
    
*   _2 - DELAYED_ - the dialog information changes will be flushed into the DB periodically, based on a timer routine.
    
*   _3 - SHUTDOWN_ - the dialog information will be flushed into DB only at shutdown - no runtime updates.
    

_Default value is “0”._

**Example�1.10.�Set `db_mode` parameter**

...
modparam("dialog", "db\_mode", 1)
...

  

### 1.6.11.�`db_update_period` (integer)

The interval (seconds) at which to update dialogs' information if you chose to store the dialogs' info at a given interval. A too short interval will generate intensive database operations, a too large one will not notice short dialogs.

_Default value is “60”._

**Example�1.11.�Set `db_update_period` parameter**

...
modparam("dialog", "db\_update\_period", 120)
...

  

### 1.6.12.�`options_ping_interval` (integer)

The interval (seconds) at which OpenSIPS will generate in-dialog OPTIONS pings for one or both of the involved parties.

_Default value is “30”._

**Example�1.12.�Set `options_ping_interval` parameter**

...
modparam("dialog", "options\_ping\_interval", 20)
...

  

### 1.6.13.�`reinvite_ping_interval` (integer)

The interval (seconds) at which OpenSIPS will generate in-dialog Re-INVITE pings for one or both of the involved parties.

**Important:** the ping timeout detection is performed every time this interval ticks, not when the re-INVITE transaction times out! Consequently, please make sure that the timeouts for re-INVITE transactions (e.g. the "fr\_timeout" modparam of the "tm" module or its $T\_fr\_timeout variable) are always **lower** than the value of this parameter! Failing to ensure this ordering of timeouts may possibly lead to re-INVITE pings never ending a disconnected dialog due to pings getting retried before getting a chance to properly time out.

_Default value is “300”._

**Example�1.13.�Set `reinvite_ping_interval` parameter**

...
modparam("dialog", "reinvite\_ping\_interval", 600)
...

  

### 1.6.14.�`table_name` (string)

If you want to store the information about the dialogs in a database a table name must be specified.

_Default value is “dialog”._

**Example�1.14.�Set `table_name` parameter**

...
modparam("dialog", "table\_name", "my\_dialog")
...

  

### 1.6.15.�`call_id_column` (string)

The column's name in the database to store the dialogs' callid.

_Default value is “callid”._

**Example�1.15.�Set `call_id_column` parameter**

...
modparam("dialog", "call\_id\_column", "callid\_c\_name")
...

  

### 1.6.16.�`from_uri_column` (string)

The column's name in the database to store the caller's sip address.

_Default value is “from\_uri”._

**Example�1.16.�Set `from_uri_column` parameter**

...
modparam("dialog", "from\_uri\_column", "from\_uri\_c\_name")
...

  

### 1.6.17.�`from_tag_column` (string)

The column's name in the database to store the From tag from the Invite request.

_Default value is “from\_tag”._

**Example�1.17.�Set `from_tag_column` parameter**

...
modparam("dialog", "from\_tag\_column", "from\_tag\_c\_name")
...

  

### 1.6.18.�`to_uri_column` (string)

The column's name in the database to store the calee's sip address.

_Default value is “to\_uri”._

**Example�1.18.�Set `to_uri_column` parameter**

...
modparam("dialog", "to\_uri\_column", "to\_uri\_c\_name")
...

  

### 1.6.19.�`to_tag_column` (string)

The column's name in the database to store the To tag from the 200 OK response to the Invite request, if present.

_Default value is “to\_tag”._

**Example�1.19.�Set `to_tag_column` parameter**

...
modparam("dialog", "to\_tag\_column", "to\_tag\_c\_name")
...

  

### 1.6.20.�`from_cseq_column` (string)

The column's name in the database to store the cseq from caller side.

_Default value is “caller\_cseq”._

**Example�1.20.�Set `from_cseq_column` parameter**

...
modparam("dialog", "from\_cseq\_column", "from\_cseq\_c\_name")
...

  

### 1.6.21.�`to_cseq_column` (string)

The column's name in the database to store the cseq from callee side.

_Default value is “callee\_cseq”._

**Example�1.21.�Set `to_cseq_column` parameter**

...
modparam("dialog", "to\_cseq\_column", "to\_cseq\_c\_name")
...

  

### 1.6.22.�`from_route_column` (string)

The column's name in the database to store the route records from caller side (proxy to caller).

_Default value is “caller\_route\_set”._

**Example�1.22.�Set `from_route_column` parameter**

...
modparam("dialog", "from\_route\_column", "from\_route\_c\_name")
...

  

### 1.6.23.�`to_route_column` (string)

The column's name in the database to store the route records from callee side (proxy to callee).

_Default value is “callee\_route\_set”._

**Example�1.23.�Set `to_route_column` parameter**

...
modparam("dialog", "to\_route\_column", "to\_route\_c\_name")
...

  

### 1.6.24.�`from_contact_column` (string)

The column's name in the database to store the caller's contact uri.

_Default value is “caller\_contact”._

**Example�1.24.�Set `from_contact_column` parameter**

...
modparam("dialog", "from\_contact\_column", "from\_contact\_c\_name")
...

  

### 1.6.25.�`to_contact_column` (string)

The column's name in the database to store the callee's contact uri.

_Default value is “callee\_contact”._

**Example�1.25.�Set `to_contact_column` parameter**

...
modparam("dialog", "to\_contact\_column", "to\_contact\_c\_name")
...

  

### 1.6.26.�`from_sock_column` (string)

The column's name in the database to store the information about the local interface receiving the traffic from caller.

_Default value is “caller\_sock”._

**Example�1.26.�Set `from_sock_column` parameter**

...
modparam("dialog", "from\_sock\_column", "from\_sock\_c\_name")
...

  

### 1.6.27.�`to_sock_column` (string)

The column's name in the database to store information about the local interface receiving the traffic from callee.

_Default value is “callee\_sock”._

**Example�1.27.�Set `to_sock_column` parameter**

...
modparam("dialog", "to\_sock\_column", "to\_sock\_c\_name")
...

  

### 1.6.28.�`dlg_id_column` (string)

The column's name in the database to store the dialogs' id information.

_Default value is “dlg\_id”._

**Example�1.28.�Set `dlg_id_column` parameter**

...
modparam("dialog", "dlg\_id\_column", "dlg\_id\_c\_name")
...

  

### 1.6.29.�`state_column` (string)

The column's name in the database to store the dialogs' state information.

_Default value is “state”._

**Example�1.29.�Set `state_column` parameter**

...
modparam("dialog", "state\_column", "state\_c\_name")
...

  

### 1.6.30.�`start_time_column` (string)

The column's name in the database to store the dialogs' start time information.

_Default value is “start\_time”._

**Example�1.30.�Set `start_time_column` parameter**

...
modparam("dialog", "start\_time\_column", "start\_time\_c\_name")
...

  

### 1.6.31.�`timeout_column` (string)

The column's name in the database to store the dialogs' timeout.

_Default value is “timeout”._

**Example�1.31.�Set `timeout_column` parameter**

...
modparam("dialog", "timeout\_column", "timeout\_c\_name")
...

  

### 1.6.32.�`profiles_column` (string)

The column's name in the database to store the dialogs' profiles.

_Default value is “profiles”._

**Example�1.32.�Set `profiles_column` parameter**

...
modparam("dialog", "profiles\_column", "profiles\_c\_name")
...

  

### 1.6.33.�`vars_column` (string)

The column's name in the database to store the dialogs' vars.

_Default value is “vars”._

**Example�1.33.�Set `vars_column` parameter**

...
modparam("dialog", "vars\_column", "vars\_c\_name")
...

  

### 1.6.34.�`sflags_column` (string)

The column's name in the database to store the dialogs' script flags.

_Default value is “script\_flags”._

**Example�1.34.�Set `sflags_column` parameter**

...
modparam("dialog", "sflags\_column", "sflags\_c\_name")
...

  

### 1.6.35.�`mflags_column` (string)

The column's name in the database to store the dialogs' module flags.

_Default value is “module\_flags”._

**Example�1.35.�Set `mflags_column` parameter**

...
modparam("dialog", "mflags\_column", "mflags\_c\_name")
...

  

### 1.6.36.�`flags_column` (string)

The column's name in the database to store the dialogs' flags.

_Default value is “flags”._

**Example�1.36.�Set `flags_column` parameter**

...
modparam("dialog", "flags\_column", "flags\_c\_name")
...

  

### 1.6.37.�`profiles_with_value` (string)

List of names (alphanumerical) for profiles with values. Flags _/b_ or _/s_ allow sharing profiles between OpenSIPS instances using the clusterer module or a CacheDB backend, respectively.

_Default value is “empty”._

**Example�1.37.�Set `profiles_with_value` parameter**

...
modparam("dialog", "profiles\_with\_value", "callerCC; gatewayCC; clientChannels/s; codecUsed/b;")
...

  

### 1.6.38.�`profiles_no_value` (string)

List of names (alphanumerical) for profiles without values. Flags _/b_ or _/s_ allow sharing profiles between OpenSIPS instances using the clusterer module or a CacheDB backend, respectively.

_Default value is “empty”._

**Example�1.38.�Set `profiles_no_value` parameter**

...
modparam("dialog", "profiles\_no\_value", "inbound ; outbound ; shared/s; repl/b;")
...

  

### 1.6.39.�`db_flush_vals_profiles` (int)

Pushes dialog values, profiles and flags into the database along with other dialog state information (see db\_mode 1 and 2).

_Default value is “empty”._

**Example�1.39.�Set `db_flush_vals_profiles` parameter**

...
modparam("dialog", "db\_flush\_vals\_profiles", 1)
...

  

### 1.6.40.�`timer_bulk_del_no` (int)

The number of dialogs that should be attempted to be deleted at the same time ( a single query ) from the DB back-end.

_Default value is “1”._

**Example�1.40.�Set `timer_bulk_del_no` parameter**

...
modparam("dialog", "timer\_bulk\_del\_no", 10)
...

  

### 1.6.41.�`race_condition_timeout` (int)

If dialog is created using the 'E' flag, and a SIP Race condition happens, then the dialog will be terminated after 'race\_condition\_timeout' seconds. Currently, the only supported race conditions are (200OK vs CANCEL) and (early BYE vs 200OK)

_Default value is “5” seconds._

**Example�1.41.�Set `race_condition_timeout` parameter**

...
modparam("dialog", "race\_condition\_timeout", 1)
...

  

### 1.6.42.�`cachedb_url` (string)

Enables distributed dialog profiles and specifies the backend that should be used by the CacheDB interface.

_Default value is “empty”._

**Example�1.42.�Set `cachedb_url` parameter**

...
modparam("dialog", "cachedb\_url", "redis://127.0.0.1:6379")
...

  

### 1.6.43.�`profile_value_prefix` (string)

Specifies what prefix should be added to the profiles with value when they are inserted into CacheDB backed. This is only used when distributed profiles are enabled.

_Default value is “dlg\_val\_”._

**Example�1.43.�Set `profile_value_prefix` parameter**

...
modparam("dialog", "profile\_value\_prefix", "dlgv\_")
...

  

### 1.6.44.�`profile_no_value_prefix` (string)

Specifies what prefix should be added to the profiles without value when they are inserted into CacheDB backed. This is only used when distributed profiles are enabled.

_Default value is “dlg\_noval\_”._

**Example�1.44.�Set `profile_no_value_prefix` parameter**

...
modparam("dialog", "profile\_no\_value\_prefix", "dlgnv\_")
...

  

### 1.6.45.�`profile_size_prefix` (string)

Specifies what prefix should be added to the entity that holds the profiles with value size in CacheDB backed. This is only used when distributed profiles are enabled.

_Default value is “dlg\_size\_”._

**Example�1.45.�Set `profile_size_prefix` parameter**

...
modparam("dialog", "profile\_size\_prefix", "dlgs\_")
...

  

### 1.6.46.�`profile_timeout` (int)

Specifies how long a dialog profile should be kept in the CacheDB until it expires. This is only used when distributed profiles are enabled.

_Default value is “86400”._

**Example�1.46.�Set `profile_timeout` parameter**

...
modparam("dialog", "profile\_timeout", "43200")
...

  

### 1.6.47.�`dialog_replication_cluster` (int)

Specifies the cluster ID for dialog replication using the _clusterer_ module. This enables sending and receiving all the dialog-related events (creation, update and deletion) in the cluster.

This OpenSIPS cluster exposes the **"dialog-dlg-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

_Default value is “0” (no replication)._

**Example�1.47.�Set `dialog_replication_cluster` parameter**

...
modparam("dialog", "dialog\_replication\_cluster", 1)
...

  

### 1.6.48.�`profile_replication_cluster` (int)

Specifies the cluster ID for profile replication using the _clusterer_ module. This enables sending and receiving the profile information (value, dialog count) in the cluster.

_Default value is “0” (no replication)._

**Example�1.48.�Set `profile_replication_cluster` parameter**

...
modparam("dialog", "profile\_replication\_cluster", 1)
...

  

### 1.6.49.�`replicate_profiles_buffer` (string)

Used to specify the length of the buffer used by the binary replication, in bytes. Usually this should be big enough to hold as much data as possible, but small enough to avoid UDP fragmentation. The recommended value is the smallest MTU between all the replication instances.

_Default value is 1400 bytes._

**Example�1.49.�Set `replicate_profiles_buffer` parameter**

...
modparam("dialog", "replicate\_profiles\_buffer", 500)
...

  

### 1.6.50.�`replicate_profiles_check` (string)

Timer in seconds, used to specify how often the module should check whether old, replicated profiles values are obsolete and should be removed. should replicate its profiles to the other instances.

_Default value is 10 s._

**Example�1.50.�Set `replicate_profiles_check` parameter**

...
modparam("dialog", "replicate\_profiles\_check", 100)
...

  

### 1.6.51.�`replicate_profiles_timer` (string)

Timer in milliseconds, used to specify how often the module should replicate its profiles to the other instances.

_Default value is 200 ms._

**Example�1.51.�Set `replicate_profiles_timer` parameter**

...
modparam("dialog", "replicate\_profiles\_timer", 100)
...

  

### 1.6.52.�`replicate_profiles_expire` (string)

Timer in seconds, used to specify when the profiles counters received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

_Default value is 10 s._

**Example�1.52.�Set `replicate_profiles_expire` parameter**

...
modparam("dialog", "replicate\_profiles\_expire", 10)
...

  

### 1.6.53.�`cluster_auto_sync` (string)

Specifies whether to automatically issue a sync request (for dialogs marked with a sharing tag in backup state) when a node becomes reachable. A value of _1_ means enabled and _0_ disabled.

_Default value is 1 (enabled)._

**Example�1.53.�Set `cluster_auto_sync` parameter**

...
modparam("dialog", "cluster\_auto\_sync", 0)
...

  

## 1.7.�Exported Functions

### 1.7.1.� `create_dialog([flags])`

The function creats the dialog for the currently processed request. The request must be an initial request. Optionally,the function also receives a string parameter, which specifies special behavior to be done for the current dialog.

Parameters:

*   _flags (string, optional)_ Possible values here are :
    
    *   B - Upon reaching dialog lifetime, BYEs will be triggered both ways
        
    *   P - Ping caller side with OPTIONS messages, once every options\_ping\_interval seconds
        
    *   p - Ping callee side with OPTIONS messages, once every options\_ping\_interval seconds
        
    *   R - Ping caller side with RE-INVITE messages, once every reinvite\_ping\_interval seconds
        
    *   r - Ping callee side with RE-INVITE messages, once every reinvite\_ping\_interval seconds
        
    *   E - Upon detecting a SIP Race condition (see RFC 5407), end the call after race\_condition\_timeout seconds
        
    
    Multiple string flags can be used at the same time, ie. passing "BPp" flags will enable all 3 flags.
    

NOTE: both RE-INVITE and OPTIONS pinging cannot be enabled at the same time for a single dialog leg. If both flags ("_PR_" or "_pr_") are provided only RE-INVITE pinging will be used.

The function returns true if the dialog was successfully created or if the dialog was previously created.

This function can be used from REQUEST\_ROUTE.

**Example�1.54.�`create_dialog()` usage**

...
create\_dialog();
...
#ping caller
create\_dialog("P");
...
#ping caller and callee
create\_dialog("Pp");

#bye on timeout
create\_dialog("B");
...

  

### 1.7.2.� `match_dialog([dlg_match_mode])`

This function is to be used to match a sequential (in-dialog) request to an ongoing dialog.

By default, dialog matching is performed according to the [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg_match_mode (integer)") module parameter. A specific matching mode may be enforced by specifying the optional "dlg\_match\_mode" parameter. Possible values for this parameter are "DID\_ONLY", "DID\_FALLBACK" and "DID\_NONE".

As sequential requests are automatically matched to the dialog when doing "loose\_route()" from script, this function is intended to: (A) control the place in your script where the dialog matching is done and (B) to cope with bogus sequential requests that do not have Route headers, so they are not handled by loose\_route().

Parameters:

*   _dlg\_match\_mode (string, optional)_
    

The function returns true if a dialog exists for the request.

This function can be used from REQUEST\_ROUTE.

**Example�1.55.�`match_dialog()` usage**

...
    if (has\_totag()) {
        loose\_route();

        # example 1: match according to [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg_match_mode (integer)")
        if ($DLG\_status == NULL && !match\_dialog())
            xlog("cannot match request to a dialog\\n");

        # example 2: override [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg_match_mode (integer)")
        if ($DLG\_status == NULL && !match\_dialog("DID\_FALLBACK"))
            xlog("cannot match request to a dialog\\n");
    }
...

  

### 1.7.3.� `validate_dialog()`

The function checks the current received requests against the dialog (internal data) it belongs to. Performing several tests, the function will help to detect the bogus injected in-dialog requests (like malicious BYEs).

The performed tests are related to CSEQ sequence checking and routing information checking (contact and route set).

The function returns true if a dialog exists for the request and if the request is valid (according to dialog data). If the request is invalid, the following return codes are returned :

*   _\-1_ - invalid cseq
    
*   _\-2_ - invalid remote target
    
*   _\-3_ - invalid route set
    
*   _\-4_ - other errors ( parsing, no dlg, etc )
    

This function can be used from REQUEST\_ROUTE.

**Example�1.56.�`validate_dialog()` usage**

...
    if (has\_totag()) {
        loose\_route();
        if ($DLG\_status!=NULL && !validate\_dialog() ) {
            xlog(" in-dialog bogus request \\n");
        } else {
            xlog(" in-dialog valid request - $DLG\_dir !\\n");
        }
    }
...

  

### 1.7.4.� `fix_route_dialog()`

The function forces an in dialog SIP message to contain the ruri, route headers and dst\_uri, as specified by the internal data of the dialog it belongs to. The function will prevent the existence of bogus injected in-dialog requests ( like malicious BYEs )

This function can be used from REQUEST\_ROUTE.

**Example�1.57.�`fix_route_dialog()` usage**

...
    if (has\_totag()) {
        loose\_route();
        if ($DLG\_status!=NULL)
            if (!validate\_dialog())
                fix\_route\_dialog();
    }
...

  

### 1.7.5.� `get_dialog_info(attr,avp,key,key_val,no_dlgs)`

The function extracts a dialog value from another dialog. It first searches through all existing (ongoing) dialogs for all dialogs that have a dialog variable named "key" with the value "key\_val" (so a dialog where $dlg\_val(key)=="key\_val"). If found, it returns the value of the dialog variable "attr" from all the founds dialog in the "avp" pseudo-variable, otherwise nothing is written in "avp", and a negative error code is returned.

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _attr (string)_ - the name of the dialog variable (from the found dialog) to be returned;
    
*   _avp (var)_ - an avp where to store the values of the "attr" dialog variable. Since the function checks through all dialogs, this needs to be an actual AVP in order to support pushing values from all matched dialogs.
    
*   _key (string)_ - name of a dialog variable to be used a search key (when looking after the target dialog)
    
*   _key\_val (var)_ - the value of the dialog variable that is used as key in searching the target dialog.
    
*   _no\_dlgs (var)_ - the total number of dialogs containing the key variable
    

This function can be used from ALL ROUTES.

**Example�1.58.�`get_dialog_info` usage**

...
if ( get\_dialog\_info("callee",$avp(callee\_array),"caller",$fu,$var(dlg\_no)) ) {
	xlog("caller $fu has $var(dlg\_no) other ongoing calls, talking with :");	
	$var(it) = 0;
	while ($var(it) < $var(dlg\_no)) {
		$var(current\_callee) = $(avp(callee\_array)\[$var(it)\]);
		xlog(" $var(current\_callee) ");
		$var(it) = $var(it) + 1;
	}

	xlog("\\n");
}

# create dialog for current call and place the caller and callee attributes
create\_dialog();
$dlg\_val(caller) = $fu;
$dlg\_val(callee) = $ru;
...

  

### 1.7.6.� `get_dialog_vals(names,vals,callid)`

The function fetches all the dialog variables of another dialog. It first searches through all existing (ongoing) dialogs based on the given SIP CallID. If found, it returns all the dialog variables as two parallel arrays of names and values (using the given variables "names" and "vals"). As these variables have to hold arrays, they must be AVPs.

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _names (var)_ - an AVP variable to hold all the names of the variables from the found dialog.
    
*   _vals (var)_ - an AVP variable to hold all the values of the variables from the found dialog.
    
*   _callid (string)_ - the callid of a dialog to be searched (and have the variables fetched).
    

This function can be used from any type of route.

**Example�1.59.�`get_dialog_vals` usage**

...
if ( get\_dialog\_vals($avp(d\_names),$avp(d\_vals),$var(callid)) ) {
	xlog("the call $var(callid) has the variables:\\n);
	$var(i) = 0;
	while ( $(avp(d\_names)\[$var(i)\])!=NULL ) {
		xlog("var $var(i) is $(avp(d\_names)\[$var(i)\])='$(avp(d\_vals)\[$var(i)\])'\\n");
		$var(i) = $var(i) + 1;
	}
}
...

  

### 1.7.7.� `get_dialogs_by_val(name,value,out_avp,out_dlg_no)`

The function looks up through the whole dialog table for dialogs containing a $dlg\_val with the provided name and value, and returns all the $DLG\_ctx\_json variables for the matched dialogs, storing them in the provided out\_avp. The total number of matched dialogs is returned in the out\_dlgs\_no variable

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _name (string)_ - the name of the dialog variable used for the lookup
    
*   _value (var)_ - the value of the above dialog val
    
*   _out\_avp (var)_ - the AVP which will be populated will the dialog JSONs for all the matched calls
    
*   _dlg\_no (var)_ - the out var which will contain the total number of matched dialogs
    

This function can be used from any type of route.

**Example�1.60.�`get_dialog_vals` usage**

...
if ( get\_dialogs\_by\_val("caller",$fU,$avp(dlg\_jsons),$avp(dlg\_no)) ) {
	xlog("Caller $fU has $avp(dlg\_no) other calls \\n);
	$var(i) = 0;
	while ( $(avp(dlg\_jsons)\[$var(i)\])!=NULL ) {
		$json(dlg\_info) := $(avp(dlg\_jsons)\[$var(i)\]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
...

  

### 1.7.8.� `get_dialogs_by_profile(name,value,out_avp,out_dlg_no)`

The function looks up through the whole dialog table for dialogs configured to be within the provided dialog profile name, and optionally with the provided profile value. The function returns all the $DLG\_ctx\_json variables for the matched dialogs, storing them in the provided out\_avp. The total number of matched dialogs is returned in the out\_dlgs\_no variable

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

Meaning of the parameters is as follows:

*   _name (string)_ - the name of the dialog profile used for the lookup
    
*   _value (string)_ - the value of the above dialog profile ( optional )
    
*   _out\_avp (var)_ - the AVP which will be populated will the dialog JSONs for all the matched calls
    
*   _dlg\_no (var)_ - the out var which will contain the total number of matched dialogs
    

This function can be used from any type of route.

**Example�1.61.�`get_dialog_vals` usage**

...
if ( get\_dialogs\_by\_profile("caller",$fU,$avp(dlg\_jsons),$avp(dlg\_no)) ) {
	xlog("Caller $fU has $avp(dlg\_no) other calls \\n);
	$var(i) = 0;
	while ( $(avp(dlg\_jsons)\[$var(i)\])!=NULL ) {
		$json(dlg\_info) := $(avp(dlg\_jsons)\[$var(i)\]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
...

  

### 1.7.9.� `load_dialog_ctx( dialog [, id_type])`

The function loads and switches to the context of the given dialog. The context of a dialog is given by the dialog flags, variables, profiles and any other value/state related to the dialog. By switching to the context of another dialog, you will see at the script level, by default, all the data from the new dialog.

NOTE: you cannot perform a new load until doing an unload - no nested loadings are possible.

Meaning of the parameters is as follows:

*   _dialog (string)_ - the identifier of the dialog to be loaded, it may be a SIP Call-ID or a Dialog ID.
    
*   _id\_type (string,optional)_ - what kind of dialog identified was used in the first parameter. It can be _callid_ (SIP Call-ID) or _did_ (internal Dialog ID). By default callid will be assumed.
    

This function can be used from any type of route.

**Example�1.62.�`load_dialog_ctx` usage**

...
if (load\_dialog\_ctx("$var(callid)")) {
	xlog("The dialog '$var(callid)' already has a duration "
	     "of $DLG\_lifetime seconds\\n");
	if (is\_in\_profile("inboundCall"))
		xlog("this dialog is an inbound call\\n");
	unload\_dialog\_ctx();
}
...

  

### 1.7.10.� `unload_dialog_ctx()`

The function off-loads the loaded context of another dialog, exposing whatever dialog context was present before doing the load.

NOTE: you MUST perform from script an explicit unload for each load you did, otherwise the loaded dialog will remain hanged for ever.

This function can be used from any type of route.

For usage example, see the [load\_dialog\_ctx()](#func_load_dialog_ctx "1.7.9.� load_dialog_ctx( dialog [, id_type])")

### 1.7.11.� `set_dlg_profile(profile, [value], [clear_values])`

Inserts the current dialog into a profile. Note that if the profile does not support values, this will be silently discarded. A dialog may be inserted in the same profile multiple times.

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to be added to.
    
*   _value (string, optional)_ - string value to define the belonging of the dialog to the profile - note that the profile must support values.
    
*   _clear\_values (boolean, optional)_ - if set to _true_ (1), all values of the profile will be cleared before setting the given value. Default: _false_.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.63.�`set_dlg_profile` usage**

...
set\_dlg\_profile("inboundCall");

# Set a new value (all other values are kept intact)
set\_dlg\_profile("caller", $fu);

# Set a new value while removing all previous values
set\_dlg\_profile("caller", $fu, true);
...

  

### 1.7.12.� `unset_dlg_profile(profile, [value])`

Removes the current dialog from a profile.

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to be removed from.
    
*   _value (string, optional)_ - string value to define the belonging of the dialog to the profile - note that the profile must support values.
    
    NEW in 3.4: for profiles with value, by omitting this parameter you can now clear all values of the given profile.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.64.�`unset_dlg_profile` usage**

...
unset\_dlg\_profile("inboundCall");
unset\_dlg\_profile("caller", $fu);
...
# Remove all values in a profile
unset\_dlg\_profile("caller");
...

  

### 1.7.13.� `is_in_profile(profile,[value])`

Checks if the current dialog belongs to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - if the dialog was inserted into the profile for a specific value. If no value is passed, only simply belonging of the dialog to the profile is checked. Note that if the profile does not support values, this will be silently discarded.

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to be checked against.
    
*   _value (string. optional)_ - string value to toughen the check.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.65.�`is_in_profile` usage**

...
if (is\_in\_profile("inboundCall")) {
	log("this request belongs to a inbound call\\n");
}
...
if (is\_in\_profile("caller","XX")) {
	log("this request belongs to a call of user XX\\n");
}
...

  

### 1.7.14.� `get_profile_size(profile,[value],size)`

Returns the number of dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - how many dialogs were inserted into the profile with a specific value. If not value is passed, only simply belonging of the dialog to the profile is checked. Note that the profile does not supports values, this will be silently discarded.

Meaning of the parameters is as follows:

*   _profile (string)_ - name of the profile to get the size for.
    
*   _value (string, optional)_ - string value to toughen the check.
    
*   _size (var)_ - an AVP or script variable to return the profile size in.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.66.�`get_profile_size` usage**

modparam("dialog", "profiles\_no\_value", "inboundCalls")
modparam("dialog", "profiles\_with\_value", "caller")
...
get\_profile\_size("inboundCalls",,$var(size));
xlog("inboundCalls: $var(size)\\n");
...
get\_profile\_size("caller", $fu, $var(size));
xlog("currently, the user $fu has $var(size) active outgoing calls\\n");
...

  

### 1.7.15.� `set_dlg_flag(flag)`

Sets the dialog flag named _flag_ to true. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

Parameters:

*   _flag (string, static)_ - The flag name.
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.67.�`set_dlg_flag` usage**

...
set\_dlg\_flag("MY\_DLG\_FLAG");
...

  

### 1.7.16.� `test_and_set_dlg_flag(flag, value)`

Atomically checks if the dialog flag named _flag_ is equal to _value_. If true, changes the value with the opposite one. This operation is done under the dialog lock.

*   _flag (string, static)_ - The flag name.
    
*   _value (int)_ - The value should be 0 (false) or 1 (true).
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.68.�`test_and_set_dlg_flag` usage**

...
test\_and\_set\_dlg\_flag("MY\_DLG\_FLAG", 0);
...

  

### 1.7.17.� `reset_dlg_flag(flag)`

Resets the dialog flag named _flag_ to false. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

Parameters:

*   _flag (string, static)_ - The flag name.
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.69.�`reset_dlg_flag` usage**

...
reset\_dlg\_flag("MY\_DLG\_FLAG");
...

  

### 1.7.18.� `is_dlg_flag_set(flag)`

Returns true if the dialog flag named _flag_ is set. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

Parameters:

*   _flag (string, static)_ - The flag name.
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.70.�`is_dlg_flag_set` usage**

...
if (is\_dlg\_flag\_set("MY\_DLG\_FLAG")) {
	xlog("dialog flag MY\_DLG\_FLAG is set\\n");
}
...

  

### 1.7.19.� `store_dlg_value(name,val)`

Attaches to the dialog the value from the variable _val_ under the name _name_. The values attached to dialogs are dialog persistent and they can be accessed (read and write) for all requests belonging to the dialog.

Parameters:

*   _name (string)_
    
*   _val (var)_
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Same functionality may be obtain by assigning a value to pseudo variable _$dlg\_val(name)_.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.71.�`store_dlg_value` usage**

...
store\_dlg\_value("inv\_src\_ip",$si);
store\_dlg\_value("account type",$var(account));
# or
$dlg\_val(account\_type) = "prepaid";
...

  

### 1.7.20.� `fetch_dlg_value(name,val)`

Fetches from the dialog the value of attribute named _name_. The values attached to dialogs are dialog persistent and they can be accessed (read and write) for all requests belonging to the dialog.

Parameters:

*   _name (string)_
    
*   _val (var)_
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

Same functionality may be obtain by reading the pseudo variable _$dlg\_val(name)_.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.72.�`fetch_dlg_value` usage**

...
fetch\_dlg\_value("inv\_src\_ip",$avp(2));
fetch\_dlg\_value("account type",$var(account));
# or
$var(account) = $dlg\_val(account\_type);
...

  

### 1.7.21.� `set_dlg_sharing_tag(tag_name)`

Marks the current dialog with the sharing tag _tag\_name_. From this point on, actions like in-dialog pinging, BYEs on timeout etc. will depend on the tag state(no action in "backup" state, normal operation in "active" state).

For more details see the [Dialog clustering](#dialog-clustering "1.4.�Dialog clustering") chapter.

Parameters:

*   _tag\_name (string)_
    

NOTE: the dialog must be created before using this function (use create\_dialog() function before).

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.73.�`set_dlg_sharing_tag` usage**

...
set\_dlg\_sharing\_tag("vip1");
...

  

### 1.7.22.� `dlg_on_answer([route_name])`

The function arms a script route to be executed when the current dialog will be later answered. When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one).

You must use this function AFTER creating the dialog and before the dialog being answered.

If the parameter is missing, the function does a reset of any route previously set; there will be no triggering.

Parameters:

*   _route\_name (string,optional)_ - the name of the script route to be executed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.74.�`dlg_on_answer` usage**

...
create\_dialog();
dlg\_on\_answer("dlg\_answered");
...
route\[dlg\_answered\] {
	xlog("The dialog $DLG\_did was answered\\n");
}

  

### 1.7.23.� `dlg_on_timeout([route_name])`

The function arms a script route to be executed when (and if) the current dialog will timeout (as duration). When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one)

When the route is executed, the dialog is not yet terminated, just its lifetime reached the set limit. In the timeout route you can increase the dialog expiration timeout (and the dialog will continue) or you can let the dialog to be terminated (after the end of this route).

You must use this function AFTER creating the dialog and before the dialog being answered.

You must use this function AFTER creating the dialog and before the dialog being answered.

Parameters:

*   _route\_name (string,optional)_ - the name of the script route to be executed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.75.�`dlg_on_timeout` usage**

...
create\_dialog();
$DLG\_timeout=120;
dlg\_on\_timeout("dlg\_timeout");
...
route\[dlg\_timeout\] {
	xlog("The dialog $DLG\_did timed out\\n");
	if (\_some\_prolongation\_condition)
		$DLG\_timeout = 60; # give it 1 min more
}

  

### 1.7.24.� `dlg_on_hangup([route_name])`

The function arms a script route to be executed when the current dialog will be terminated. When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one). Note that the dialog will be already terminated and there is nothing you can do about it besides reading data from its context.

You must use this function AFTER creating the dialog and before the dialog being answered.

If the parameter is missing, the function does a reset of any route previously set; there will be no triggering.

Parameters:

*   _route\_name (string,optional)_ - the name of the script route to be executed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, REPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.76.�`dlg_on_hangup` usage**

...
create\_dialog();
dlg\_on\_hangup("dlg\_hangup");
...
route\[dlg\_hangup\] {
	xlog("The dialog $DLG\_did terminated after $DLG\_lifetime secs\\n");
}

  

### 1.7.25.� `dlg_send_sequential(method, leg, [, body] [, content-type] [, headers])`

Used to send an in-dialog request towards one if the dialog's legs. The function assumes that is runs inside a dialog context - if you are running it from a different context (such as an event\_route), make sure you first load the dialog context using the [load\_dialog\_ctx()](#func_load_dialog_ctx "1.7.9.� load_dialog_ctx( dialog [, id_type])") function.

Parameters:

*   _method (string)_ - the method of the request sent.
    
*   _leg (string)_ - the leg where the request is sent. Must be either _caller_ or _callee_.
    
*   _body (string, optional)_ - an optional body sent in the request. If missing, no body is sent.
    
*   _content-type (string, optional)_ - the content type of the body sent. Make sure you specify this every time you send a request with a body, otherwise there are high changes that your UAC will reject the request.
    
*   _headers (string, optional)_ - additional headers attached to the request sent.
    

This function can be used from ANY route.

**Example�1.77.�`dlg_send_sequential` usage to convert DTMF codes**

...
event\_route\[E\_RTPPROXY\_DTMF\] {
    if (load\_dialog\_ctx("$param(id)", "did")) {
        if ($param(stream) == 0) {
            $var(direction) = "callee";
        } else {
            $var(direction) = "caller";
        }
        dlg\_send\_sequential($var(direction), "INFO",
                "Signal=$param(digit)\\nDuration=160",
                "application/dtmf-relay");
        unload\_dialog\_ctx();
    }
}
...

  

## 1.8.�Exported Statistics

### 1.8.1.�`active_dialogs`

Returns the number of current active dialogs (may be confirmed or not).

### 1.8.2.�`early_dialogs`

Returns the number of early dialogs.

### 1.8.3.�`processed_dialogs`

Returns the total number of processed dialogs (terminated, expired or active) from the startup.

### 1.8.4.�`expired_dialogs`

Returns the total number of expired dialogs from the startup.

### 1.8.5.�`failed_dialogs`

Returns the number of failed dialogs ( dialogs were never established due to whatever reasons - internal error, negative reply, cancelled, etc )

### 1.8.6.�`create_sent`

Returns the number of replicated dialog **create** requests send to other OpenSIPS instances.

### 1.8.7.�`update_sent`

Returns the number of replicated dialog **update** requests send to other OpenSIPS instances.

### 1.8.8.�`delete_sent`

Returns the number of replicated dialog **delete** requests send to other OpenSIPS instances.

### 1.8.9.�`create_recv`

Returns the number of dialog **create** events received from other OpenSIPS instances.

### 1.8.10.�`update_recv`

Returns the number of dialog **update** events received from other OpenSIPS instances.

### 1.8.11.�`delete_recv`

Returns the number of dialog **delete** events received from other OpenSIPS instances.

## 1.9.�Exported MI Functions

### 1.9.1.� `dlg_list`

Lists the description of the dialogs (calls). If no parameter is given, all dialogs will be listed. If a dialog identifier is passed as parameter (callid and fromtag), only that dialog will be listed. If a index and conter parameter is passed, it will list only a number of "counter" dialogs starting with index (as offset) - this is used to get only section of dialogs.

Name: _dlg\_list_

Parameters (with dialog idetification):

*   _callid_ (optional) - callid if a single dialog to be listed.
    
*   _from\_tag_ (optional, but cannot be present without the callid parameter) - fromtag (as per initial request) of the dialog to be listed. entry
    

Parameters (with dialog counting):

*   _index_ - offset where the dialog listing should start.
    
*   _counter_ - how many dialogs should be listed (starting from the offset)
    

MI FIFO Command Format:

		## list all ongoing dialogs
		opensips-cli -x mi dlg\_list
		## list the dialog by callid and From TAG
		opensips-cli -x mi dlg\_list callid=abcdrssfrs122444@192.168.1.1 from\_tag=AAdfeEFF33
		## list 10 dialogs, starting from the position 40
		## (in the list of all ongoing dialogs)
		opensips-cli -x mi dlg\_list index=40 counter=10
		

### 1.9.2.�`dlg_list_ctx`

The same as the “dlg\_list” but including in the dialog description the associated context from modules sitting on top of the dialog module. This function also prints the dialog's values. In case of binary values, the non-printable chars are represented in hex (e.g. \\x00)

Name: _dlg\_list\_ctx_

Parameters: _see “dlg\_list”_

MI FIFO Command Format:

		opensips-cli -x mi dlg\_list\_ctx
		

### 1.9.3.�`dlg_end_dlg`

Terminates an ongoing dialog. If dialog is established, BYEs are sent in both directions. If dialog is in unconfirmed or early state, a CANCEL will be sent to the callee side, that will trigger a 487 from the callee, which, when relayed, will also end the dialog on the caller's side.

Name: _dlg\_end\_dlg_

Parameters are:

*   _dialog\_id_ - this is an identifier of the dialog - it can be either (1) the unique ID of the dialog (as provided by dlg\_list), either (2) the SIP Call-ID of the dialog.
    
*   _extra\_hdrs_ - (optional) string containg the extra headers (full format) to be added to the BYE requests.
    

The "dialog\_id" value can be get via the "dlg\_list" MI command.

MI FIFO Command Format:

		# terminate the dialog via the internal Dialog-ID
		opensips-cli -x mi dlg\_end\_dlg 6ae.4b38d013
		# terminate the dialog via its SIP Call-ID
		opensips-cli -x mi dlg\_end\_dlg Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY
		

### 1.9.4.�`profile_get_size`

Returns the number of dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - how many dialogs were inserted into the profile with a specific value. If not value is passed, only simply belonging of the dialog to the profile is checked. Note that the profile does not supports values, this will be silently discarded.

Name: _profile\_get\_size_

Parameters:

*   _profile_ - name of the profile to get the value for.
    
*   _value_ (optional)- string value to toughen the check;
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_get\_size inboundCalls
		

### 1.9.5.�`profile_list_dlgs`

Lists all the dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - list only the dialogs that were inserted into the profile with that specific value. If not value is passed, all dialogs belonging to the profile will be listed. Note that the profile does not supports values, this will be silently discarded. Also, when using shared profiles using the CacheDB interface, this command will only display the local dialogs.

Name: _profile\_list\_dlgs_

Parameters:

*   _profile_ - name of the profile to list the dialog for.
    
*   _value_ (optional)- string value to toughen the check;
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_list\_dlgs inboundCalls
		

### 1.9.6.�`profile_get_values`

Lists all the values belonging to a profile along with their count. If the profile does not support values a total count will be returned. Note that this function does not work for shared profiles over the CacheDB interface.

Name: _profile\_get\_values_

Parameters:

*   _profile_ - name of the profile to list the dialog for.
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_get\_values inboundCalls
		

### 1.9.7.�`profile_end_dlgs`

Terminate all ongoing dialogs from a specified profile, on a single dialog it performs the same operations as the command **[dlg\_end\_dlg](#mi_dlg_end_dlg "1.9.3.�dlg_end_dlg")**

Name: _profile\_end\_dlgs_

Parameters:

*   _profile_ - name of the profile that will have its dialogs termianted
    
*   _value_ - (optional) if the profile supports values terminate only the dialogs with the specified value
    

MI FIFO Command Format:

		opensips-cli -x mi profile\_end\_dlgs inboundCalls
		

### 1.9.8.�`dlg_db_sync`

Will load all the information about the dialogs from the database in the OpenSIPS internal memory. If a dialog is already found in memory and has the same/an older state, it will be updated with the values from DB. Otherwise, the newer in-memory version will not be changed.

Name: _dlg\_db\_sync_

It takes no parameters

MI FIFO Command Format:

		opensips-cli -x mi dlg\_db\_sync
		

### 1.9.9.�`dlg_cluster_sync`

This command will only take effect if dialog replication is enabled.

Fully synchronize the dialog information in memory from a suitable donor node within the [dialog\_replication\_cluster](#param_dialog_replication_cluster "1.6.47.�dialog_replication_cluster (int)"). Dialogs that already exist in memory which are not reconfirmed through syncing will be discarded. A sharing tag can be specified in order to sync only dialogs marked with that sharing tag.

Name: _dlg\_cluster\_sync_

Parameters:

*   _sharing\_tag_ - name of the sharing tag that dialogs have to be marked with in order to be synced
    

MI FIFO Command Format:

		opensips-cli -x mi dlg\_cluster\_sync vip1
		

### 1.9.10.�`dlg_restore_db`

Restores the dialog table after a potential desynchronization event. The table is truncated, then populated with CONFIRMED dialogs from memory.

Name: _dlg\_restore\_db_

It takes no parameters

MI FIFO Command Format:

		opensips-cli -x mi dlg\_restore\_db
		

### 1.9.11.�`list_all_profiles`

Lists all the dialog profiles, along with 1 or 0 if the given profile has/does not have an associated value.

Name: _list\_all\_profiles_

Parameters: _It takes no parameters_

MI FIFO Command Format:

		opensips-cli -x mi list\_all\_profiles
		

### 1.9.12.�`dlg_push_var`

Push or update a dialog value for the given list of dialog IDs / Call-IDs.

Name: _dlg\_push\_var_

Parameters: _It takes 3 or more parameters_

*   _dlg\_val\_name_ - name of the dialog value that needs to be inserted/updated
    
*   _dlg\_val\_value_ - value to be inserted/updated
    
*   _DID_ - dialog identifier. Can be either the $DLG\_did or the actual Call-ID.
    

MI FIFO Command Format:

		opensips-cli -x mi dlg\_push\_var var\_name var\_value DID1 \[ DID2 DID3 ...  DIDN \]
		

### 1.9.13.�`dlg_send_sequential`

Sends a sequential request within an ongoing dialog.

Name: _dlg\_send\_sequential_

Parameters:

*   _callid_ - the callid of the dialog you need to trigger the sequential message for.
    
*   _method_ - (optional) the method used for the sequential message. Default value is _INVITE_.
    
*   _mode_ - (optional) can be used to tune the behavior of the sequential message. Possible values for the _mode_ are:
    
    *   _caller_ - (default) sends the sequential message to the caller. This mode can be useful in high availability scenarios when you want to update the upstream's routing set, specifically the contact.
        
    *   _callee_ - same as caller, but sends the sequential message to the callee.
        
    *   _challenge_ - sends a sequential INVITE (or UPDATE) to the caller to challenge it for its advertised SDP body. When the body is received, it is forwarded to the callee. This mode is useful when trying to change both endpoints (upstream and downstream) routing set. It can also be useful when trying to trigger a re-negotiation for SDP body.
        
    *   _challenge-caller_ - same as _challenge_
        
    *   _challenge-callee_ - same as _challenge-caller_, only that it first challenges the callee, instead of the caller.
        
    
*   _body_ - (optional) can be used to specify a body for the initial sequential message. Possible values for the _body_ parameter are:
    
    *   _none_ - (default) no body added to the sequential message.
        
    *   _inbound_ - advertises in the body of the sequential message generated the last body received from its pair. For example, if the _mode=challenge-caller_, the message will contain the body sent to OpenSIPS by the callee. This is useful when you need to alter the body previously sent to the caller, because you want to re-negotiate a different media proxy for the call. This can be achieved by catching the generated request in _local\_route_, and re-engage the Media proxy.
        
    *   _outbound_ - advertises in the body of the sequential message generated the last body sent to that UAC. For example, if the _mode=challenge-caller_, the message will contain the last body sent by OpenSIPS to the caller. This is useful in a high availability scenario when trying to re-negotiate the contact of the server, but there is no need to alter the body sent earlier.
        
    *   _custom:CONTENT\_TYPE:BODY_ - this can be used to specify a specific Content-Type ehader and body for the sequential message generated.
        
    

This functions runs asynchronously and returns the status code and reason of the last reply received for either the _challenge_ or normal mode.

MI Command Format:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=5291231-testing@127.0.0.1
		

MI Command used to trigger media re-negotiation:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=5291231-testing@127.0.0.1 \\
				mode=challenge \\
				body=inbound
		

MI Command used to UPDATE the callee's remote Contact after a server failover:

			opensips-cli -x mi dlg\_send\_sequential \\
				callid=5291231-testing@127.0.0.1 \\
				mode=challenge-callee \\
				body=outbound \\
				method=UPDATE
		

## 1.10.�Exported Pseudo-Variables

### 1.10.1.�`$DLG_count`

Returns the number of current active dialogs (may be confirmed or not).

### 1.10.2.�`$DLG_status`

Returns the status of the dialog corresponding to the processed sequential request. This PV will be available only for sequential requests, after doing loose\_route().

Value may be:

*   _NULL_ - Dialog not found.
    
*   _1_ - Dialog unconfirmed (created but no reply received at all)
    
*   _2_ - Dialog in early state (created provisional reply received, but no final reply received yet)
    
*   _3_ - Confirmed by a final reply but no ACK received yet.
    
*   _4_ - Confirmed by a final reply and ACK received.
    
*   _5_ - Dialog ended.
    

### 1.10.3.�`$DLG_lifetime`

Returns the duration (in seconds) of the dialog corresponding to the processed sequential request. The duration is calculated from the dialog confirmation and the current moment. This PV will be available only for sequential requests, after doing loose\_route().

NULL will be returned if there is no dialog for the request.

### 1.10.4.�`$DLG_flags`

Returns the dialog flags (as a list of flag names separted by space) of the dialog corresponding to the processed sequential request. This PV will be available only for sequential requests, after doing loose\_route().

NULL will be returned if there is no dialog for the request.

### 1.10.5.�`$DLG_dir`

Returns the direction of the request in dialog (as "upstream" string if the request is generated by callee or "downstream" string if the request is generated by caller) - to be used for sequential request. This PV will be available only for sequential requests (not for replies), after doing loose\_route().

NULL will be returned if there is no dialog for the request.

### 1.10.6.�`$DLG_did`

Returns the id of the dialog corresponding to the processed sequential request. The output format is a string identical to the one returned by the dlg\_list MI function. This PV will be available only for sequential requests, after doing loose\_route().

NULL will be returned if there is no dialog for the request.

### 1.10.7.�`$DLG_end_reason`

Returns the reason for the dialog termination. It can be one of the following :

*   _Upstream BYE_ - Callee has sent a BYE
    
*   _Downstream BYE_ - Caller has sent a BYE
    
*   _Lifetime Timeout_ - Dialog lifetime expired
    
*   _MI Termination_ - Dialog ended via the MI interface
    
*   _Ping Timeout_ - Dialog ended because no reply to option pings
    
*   _ReINVITE Ping Timeout_ - Dialog ended because no reply to reinvite pings
    
*   _RTPProxy Timeout_ - Media timeout signaled by RTPProxy
    
*   _SIP Race Condition_ - SIP Race Condition occurred
    

NULL will be returned if there is no dialog for the request, or if the dialog is not ended in the current context.

### 1.10.8.�`$DLG_timeout`

Used to set the dialog lifetime (in seconds). When read, the variable returns the number of seconds until the dialog expires and is destroyed. Note that reading the variable is only possible after the dialog is created (for initial requests) or after doing loose\_route() (for sequential requests). Important notice: using this variable with a REALTIME db\_mode is very inefficient, because every time the dialog value is changed, a database update is done.

NULL will be returned if there is no dialog for the request, otherwise the number of seconds until the dialog expiration.

### 1.10.9.�`$DLG_del_delay`

Used to set the dialog deletion delay (in seconds) for the current dialog (in a per-call manner). When read, the variable returns the number of seconds that were set for the call or the default value ( see the “delete\_delay” - [delete\_delay](#param_delete_delay "1.6.8.�delete_delay (integer)")) module param) for the delete delaying.

The variable must be used when the context of a dialog is available in script.

### 1.10.10.�`$DLG_json`

The variable is read-only and exposes a JSON variable containing all the information that the dlg\_list MI function contains

NULL will be returned if there is no dialog for the request, otherwise the JSON will be returned.

### 1.10.11.�`$DLG_ctx_json`

The variable is read-only and exposes a JSON variable containing all the information that the dlg\_list\_ctx MI function contains ( on top of $DLG\_json, this will expose the full list of dialog vars and profile links for the current dialog )

NULL will be returned if there is no dialog for the request, otherwise the JSON will be returned.

### 1.10.12.�`$dlg_val(name)`

This is a read/write variable that allows access to the dialog attribute named _name_. It can hold a string or integer value. This PV will be available only for sequential requests, after doing loose\_route().

NULL will be returned if there is no dialog for the request.

## 1.11.�Exported Events

### 1.11.1.� `E_DLG_STATE_CHANGED`

This event is raised when the dialog state is changed.

Parameters:

*   _id_ - the hex representation of the dialog id.
    
*   _db\_id_ - the integer representation of the dialog id, as it is stored in the database _dlg\_id_ field.
    
*   _callid_ - the callid.
    
*   _from\_tag_ - the From tag.
    
*   _to\_tag_ - the To tag.
    
*   _old\_state_ - the old state of the dialog.
    
*   _new\_state_ - the new state of the dialog.
    

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

### 2.1.1.� `register_dlgcb (dialog, type, cb, param, free_param_cb)`

Register a new callback to the dialog.

Meaning of the parameters is as follows:

*   _struct dlg\_cell\* dlg_ - dialog to register callback to. If maybe NULL only for DLG\_CREATED callback type, which is not a per dialog type.
    
*   _int type_ - types of callbacks; more types may be register for the same callback function; only DLG\_CREATED must be register alone. Possible types:
    
    *   _DLGCB\_LOADED_ - called when a dialog is loaded from the database, or received by a node using the cluster replication.
        
    *   _DLGCB\_SAVED_
        
    *   _DLG\_CREATED_ - called when a new dialog is created - it's a global type (not associated to any dialog)
        
    *   _DLG\_FAILED_ - called when the dialog was negatively replied (non-2xx) - it's a per dialog type.
        
    *   _DLG\_CONFIRMED_ - called when the dialog is confirmed (2xx replied) - it's a per dialog type.
        
    *   _DLG\_REQ\_WITHIN_ - called when the dialog matches a sequential request - it's a per dialog type.
        
    *   _DLG\_TERMINATED_ - called when the dialog is terminated via BYE, or by the mi dlg\_end\_dlg command - it's a per dialog type.
        
    *   _DLG\_EXPIRED_ - called when the dialog expires without receiving a BYE - it's a per dialog type. Note that when using replication sharing tags, this callback is only executed by the node that has the Active tag.
        
    *   _DLGCB\_EARLY_ - called when the dialog is created in an early state (18x replied) - it's a per dialog type.
        
    *   _DLGCB\_RESPONSE\_FWDED_ - called when the dialog matches a reply to the initial INVITE request - it's a per dialog type.
        
    *   _DLGCB\_RESPONSE\_WITHIN_ - called when the dialog matches a reply to a subsequent in dialog request - it's a per dialog type.
        
    *   _DLGCB\_MI\_CONTEXT_ - called when the mi dlg\_list\_ctx command is invoked - it's a per dialog type.
        
    *   _DLGCB\_DESTROY_
        
    
*   _dialog\_cb cb_ - callback function to be called. Prototype is: “void (dialog\_cb) (struct dlg\_cell\* dlg, int type, struct dlg\_cb\_params \* params); ”
    
*   _void \*param_ - parameter to be passed to the callback function.
    
*   _param\_free callback\_param\_free_ - callback function to be called to free the param. Prototype is: “void (param\_free\_cb) (void \*param);”
    

## Chapter�3.�Frequently Asked Questions

**3.1.**

What happened with “topology\_hiding()” function?

The respective functionality was moved into the topology\_hiding module. Function prototype has remained the same.

**3.2.**

What happened with “use\_tight\_match” parameter?

The parameter was removed with version 1.3 as the option of tight matching became mandatory and not configurable. Now, the tight matching is done all the time (when using DID matching).

**3.3.**

What happened with “bye\_on\_timeout\_flag” parameter?

The parameter was removed in a dialog module parameter restructuring. To keep the bye on timeout behavior, you need to provide a "B" string parameter to the create\_dialog() function.

**3.4.**

What happened with “dlg\_flag” parameter?

The parameter is considered obsolete. The only way to create a dialog is to call the create\_dialog() function

**3.5.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**3.6.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**3.7.**

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

454

287

13284

3533

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

289

217

5242

1738

3.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

255

146

7208

3027

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

198

104

4330

3514

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

179

132

2959

1298

6.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

34

26

601

161

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

30

25

233

179

8.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

18

6

722

341

9.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

16

13

76

66

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

16

10

172

187

  

**All remaining contributors**: Anca Vamanu, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Andrei Dragus, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), John Riordan, Hugues Mitonneau, Carsten Bock, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Jerome Martin, Klaus Darilion, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Zero King ([@l2dy](https://github.com/l2dy)), Michel Bensoussan, Richard Revels, Elena-Ramona Modroiu, Tavis Paquette, Ryan Bullock, Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Jeffrey Magder, Ron Winacott, David Trihy, Andy Pyles, Juli�n Moreno Pati�o, Konstantin Bokarius, sergei lavrov, Alex Massover, Damien Sandras ([@dsandras](https://github.com/dsandras)), Alex Hermann, Alexandra Titoc, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Norman Brandinger ([@NormB](https://github.com/NormB)), UnixDev, Eliot Gable, Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 4.2.�By Commit Activity

**Table�4.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

David Trihy

Jan 2026 - Jan 2026

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2006 - Dec 2025

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2010 - Sep 2025

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Oct 2010 - Sep 2024

5.

Alexandra Titoc

Sep 2024 - Sep 2024

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2016 - Jun 2023

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Feb 2008 - Jun 2023

8.

Ryan Bullock

May 2023 - May 2023

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Nov 2020 - Feb 2023

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Sep 2022

  

**All remaining contributors**: Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), sergei lavrov, Zero King ([@l2dy](https://github.com/l2dy)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Norman Brandinger ([@NormB](https://github.com/NormB)), Damien Sandras ([@dsandras](https://github.com/dsandras)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Anca Vamanu, Alex Massover, Andrei Dragus, John Riordan, Hugues Mitonneau, Richard Revels, UnixDev, Alex Hermann, Henning Westerholt ([@henningw](https://github.com/henningw)), Carsten Bock, Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jerome Martin, Tavis Paquette, Michel Bensoussan, Eliot Gable, Andy Pyles, Elena-Ramona Modroiu, Jeffrey Magder, Ron Winacott.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�5.�Documentation

## 5.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Ryan Bullock, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Zero King ([@l2dy](https://github.com/l2dy)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Juli�n Moreno Pati�o, Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Norman Brandinger ([@NormB](https://github.com/NormB)), Anca Vamanu, Andrei Dragus, Hugues Mitonneau, Klaus Darilion, Henning Westerholt ([@henningw](https://github.com/henningw)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Michel Bensoussan, Andy Pyles, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2006-2009 Voice Sistem SRL