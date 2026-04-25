# Core Parameters Reference
<!-- generated-from: data/3.6/core/parameters.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: core_parameter -->

Reference for OpenSIPs 3.6 core global parameters. Read this file when tuning startup-time configuration values that govern the SIP processor itself rather than any single module.

## Contents

- [`abort_on_assert` (boolean)](#abort_on_assert-boolean)
- [`advertised_address` (string)](#advertised_address-string)
- [`advertised_port` (integer)](#advertised_port-integer)
- [`alias` (string)](#alias-string)
- [`auto_aliases` (boolean)](#auto_aliases-boolean)
- [`auto_scaling_cycle` (integer)](#auto_scaling_cycle-integer)
- [`auto_scaling_profile` (string)](#auto_scaling_profile-string)
- [`check_via` (integer)](#check_via-integer)
- [`chroot` (string)](#chroot-string)
- [`db_default_url` (string)](#db_default_url-string)
- [`db_max_async_connections` (integer)](#db_max_async_connections-integer)
- [`db_version_table` (string)](#db_version_table-string)
- [`debug_mode` (boolean)](#debug_mode-boolean)
- [`disable_503_translation` (boolean)](#disable_503_translation-boolean)
- [`disable_core_dump` (boolean)](#disable_core_dump-boolean)
- [`disable_dns_blacklist` (boolean)](#disable_dns_blacklist-boolean)
- [`disable_dns_failover` (boolean)](#disable_dns_failover-boolean)
- [`disable_stateless_fwd` (boolean)](#disable_stateless_fwd-boolean)
- [`dns` (boolean)](#dns-boolean)
- [`dns_retr_no` (integer)](#dns_retr_no-integer)
- [`dns_retr_time` (integer)](#dns_retr_time-integer)
- [`dns_servers_no` (integer)](#dns_servers_no-integer)
- [`dns_try_ipv6` (boolean)](#dns_try_ipv6-boolean)
- [`dns_try_naptr` (boolean)](#dns_try_naptr-boolean)
- [`dns_use_search_list` (boolean)](#dns_use_search_list-boolean)
- [`dst_blacklist` (string)](#dst_blacklist-string)
- [`enable_asserts` (boolean)](#enable_asserts-boolean)
- [`event_pkg_threshold` (integer)](#event_pkg_threshold-integer)
- [`event_shm_threshold` (integer)](#event_shm_threshold-integer)
- [`exec_dns_threshold` (integer)](#exec_dns_threshold-integer)
- [`exec_msg_threshold` (integer)](#exec_msg_threshold-integer)
- [`import_file` (string)](#import_file-string)
- [`include_file` (string)](#include_file-string)
- [`log_event_enabled` (boolean)](#log_event_enabled-boolean)
- [`log_event_level_filter` (integer)](#log_event_level_filter-integer)
- [`log_json_buf_size` (integer)](#log_json_buf_size-integer)
- [`log_level` (integer)](#log_level-integer)
- [`log_msg_buf_size` (integer)](#log_msg_buf_size-integer)
- [`log_prefix` (string)](#log_prefix-string)
- [`log_stdout` (boolean)](#log_stdout-boolean)
- [`max_while_loops` (integer)](#max_while_loops-integer)
- [`maxbuffer` (integer)](#maxbuffer-integer)
- [`mcast_loopback` (boolean)](#mcast_loopback-boolean)
- [`mcast_ttl` (integer)](#mcast_ttl-integer)
- [`mem-group` (string)](#mem-group-string)
- [`mem_warming` (boolean)](#mem_warming-boolean)
- [`mem_warming_pattern_file` (string)](#mem_warming_pattern_file-string)
- [`mem_warming_percentage` (integer)](#mem_warming_percentage-integer)
- [`memdump` (integer)](#memdump-integer)
- [`memlog` (integer)](#memlog-integer)
- [`mhomed` (integer)](#mhomed-integer)
- [`mpath` (string)](#mpath-string)
- [`open_files_limit` (integer)](#open_files_limit-integer)
- [`poll_method` (string)](#poll_method-string)
- [`port` (integer)](#port-integer)
- [`pv_print_buf_size` (integer)](#pv_print_buf_size-integer)
- [`query_buffer_size` (integer)](#query_buffer_size-integer)
- [`query_flush_time` (integer)](#query_flush_time-integer)
- [`restart_persistency_cache_file` (string)](#restart_persistency_cache_file-string)
- [`restart_persistency_size` (integer)](#restart_persistency_size-integer)
- [`rev_dns` (boolean)](#rev_dns-boolean)
- [`server_header` (string)](#server_header-string)
- [`server_signature` (boolean)](#server_signature-boolean)
- [`shm_hash_split_percentage` (integer)](#shm_hash_split_percentage-integer)
- [`shm_memlog_size` (integer)](#shm_memlog_size-integer)
- [`shm_secondary_hash_size` (integer)](#shm_secondary_hash_size-integer)
- [`sip_warning` (integer)](#sip_warning-integer)
- [`socket` (string)](#socket-string)
- [`stderror_enabled` (boolean)](#stderror_enabled-boolean)
- [`stderror_level_filter` (integer)](#stderror_level_filter-integer)
- [`stderror_log_format` (string)](#stderror_log_format-string)
- [`syslog_enabled` (boolean)](#syslog_enabled-boolean)
- [`syslog_facility` (string)](#syslog_facility-string)
- [`syslog_level_filter` (integer)](#syslog_level_filter-integer)
- [`syslog_log_format` (string)](#syslog_log_format-string)
- [`syslog_name` (string)](#syslog_name-string)
- [`tcp_accept_aliases` (integer)](#tcp_accept_aliases-integer)
- [`tcp_connect_timeout` (integer)](#tcp_connect_timeout-integer)
- [`tcp_connection_lifetime` (integer)](#tcp_connection_lifetime-integer)
- [`tcp_keepalive` (boolean)](#tcp_keepalive-boolean)
- [`tcp_keepcount` (integer)](#tcp_keepcount-integer)
- [`tcp_keepidle` (integer)](#tcp_keepidle-integer)
- [`tcp_keepinterval` (integer)](#tcp_keepinterval-integer)
- [`tcp_max_connections` (integer)](#tcp_max_connections-integer)
- [`tcp_max_msg_time` (integer)](#tcp_max_msg_time-integer)
- [`tcp_no_new_conn_bflag` (string)](#tcp_no_new_conn_bflag-string)
- [`tcp_no_new_conn_rplflag` (string)](#tcp_no_new_conn_rplflag-string)
- [`tcp_parallel_read_on_workers` (boolean)](#tcp_parallel_read_on_workers-boolean)
- [`tcp_socket_backlog` (integer)](#tcp_socket_backlog-integer)
- [`tcp_threshold` (integer)](#tcp_threshold-integer)
- [`tcp_workers` (integer)](#tcp_workers-integer)
- [`timer_workers` (integer)](#timer_workers-integer)
- [`tos` (string)](#tos-string)
- [`udp_workers` (integer)](#udp_workers-integer)
- [`user_agent_header` (string)](#user_agent_header-string)
- [`wdir` (string)](#wdir-string)
- [`xlog_buf_size` (integer)](#xlog_buf_size-integer)
- [`xlog_force_color` (boolean)](#xlog_force_color-boolean)
- [`xlog_level` (integer)](#xlog_level-integer)
- [`xlog_print_level` (integer)](#xlog_print_level-integer)

## `abort_on_assert` (boolean)

Only relevant if asserts are enabled. Set to true in order to make OpenSIPS shut down immediately in case a script assert fails.

*Default value is false.*
## `advertised_address` (string)

It can be an IP address or string and represents the address advertised in Via header and other destination lumps (e.g RR header). If empty or not set (default value) the socket address from where the request will be sent is used.

*Default value is null.*
## `advertised_port` (integer)

The port advertised in Via header and other destination lumps (e.g. RR). If empty or not set (default value) the port from where the message will be sent is used.

*Default value is null.*
## `alias` (string)

Parameter to set alias hostnames for the server. It can be set many times, each value being added in a list to match the hostname when 'myself' is checked.

*Default value is null.*
## `auto_aliases` (boolean)

This parameter controls if aliases should be automatically discovered and added during fixing listening sockets.

*Default value is 0.*
## `auto_scaling_cycle` (integer)

The number of seconds defining a auto-scaling cycle - the auto-scaling engine, at each cycle, is evaluating the internal load of the groups.

*Default value is 1.*
## `auto_scaling_profile` (string)

Defines the behavior of the auto-scaling support, in terms of how many processes should be allowed and when to terminate or create new processes.

*Default value is null.*
## `check_via` (integer)

Check if the address in top most via of replies is local.

*Default value is 0.*
## `chroot` (string)

The value must be a valid path in the system. If set, OpenSIPS will chroot to its value.

*Default value is null.*
## `db_default_url` (string)

The default DB URL to be used by modules if no per-module URL is given.

*Default value is null.*
## `db_max_async_connections` (integer)

Maximum number of TCP connections opened from a single OpenSIPS worker to each individual SQL backend.

*Default value is 10.*
## `db_version_table` (string)

The name of the table version to be used by the DB API to check the version of the used tables.

*Default value is "version".*
## `debug_mode` (boolean)

Enabling the debug_mode option is a fast way to debug your OpenSIPS. Forces foreground, log level 4, core dumping, and limited workers.

*Default value is false.*
## `disable_503_translation` (boolean)

If 'yes', OpenSIPS will not translate the received 503 replies into 500 replies.

*Default value is 'no'.*
## `disable_core_dump` (boolean)

Set this config variable to 'yes' to disable core dump-ing.

*Default value is 'no'.*
## `disable_dns_blacklist` (boolean)

Controls if the DNS resolver should automatically store failed destinations in a temporary blacklist.

*Default value is 'yes'.*
## `disable_dns_failover` (boolean)

Set this config variable to 'yes' to disable the DNS-based failover.

*Default value is 'no'.*
## `disable_stateless_fwd` (boolean)

Controls the handling of stateless replies.

*Default value is 'yes'.*
## `dns` (boolean)

Controls if the SIP server should attempt to lookup its own domain name in DNS.

*Default value is no.*
## `dns_retr_no` (integer)

Number of dns retransmissions before giving up.

*Default value is 4.*
## `dns_retr_time` (integer)

Time in seconds before retrying a dns request.

*Default value is 5.*
## `dns_servers_no` (integer)

How many dns servers from the ones defined in '/etc/resolv.conf' will be used.

*Default value is null.*
## `dns_try_ipv6` (boolean)

If set to 'yes' and a DNS lookup fails, it will retry it for ipv6 (AAAA record).

*Default value is 'no'.*
## `dns_try_naptr` (boolean)

Disables the NAPTR lookups when doing DNS based routing for SIP requests.

*Default value is 'yes'.*
## `dns_use_search_list` (boolean)

If set to 'no', the search list in '/etc/resolv.conf' will be ignored.

*Default value is 'yes'.*
## `dst_blacklist` (string)

Definition of a IP/destination blacklist for filtering outgoing requests.

*Default value is null.*
## `enable_asserts` (boolean)

Set to true in order to enable the assert script statement.

*Default value is false.*
## `event_pkg_threshold` (integer)

Percentage threshold above which the E_CORE_PKG_THRESHOLD event is raised.

*Default value is 0.*
## `event_shm_threshold` (integer)

Percentage threshold above which the E_CORE_SHM_THRESHOLD event is raised.

*Default value is 0.*
## `exec_dns_threshold` (integer)

Maximum number of microseconds a DNS query is expected to last before triggering a warning.

*Default value is 0.*
## `exec_msg_threshold` (integer)

Maximum number of microseconds the processing of a SIP msg is expected to last before triggering a warning.

*Default value is 0.*
## `import_file` (string)

Same as include_file.

*Default value is null.*
## `include_file` (string)

Load additional routes/blocks from a file.

*Default value is null.*
## `log_event_enabled` (boolean)

Enables the triggering of the E_CORE_LOG event for every log message.

*Default value is no.*
## `log_event_level_filter` (integer)

Extra log level filtering for the E_CORE_LOG event.

*Default value is 0.*
## `log_json_buf_size` (integer)

Size of the buffer used for printing the JSON document corresponding to a log message.

*Default value is 6144.*
## `log_level` (integer)

Set the logging level (how verbose OpenSIPS should be).

*Default value is 2.*
## `log_msg_buf_size` (integer)

Size of the buffer used for printing the log message's payload.

*Default value is 4096.*
## `log_prefix` (string)

A string prefix which will be prepended to all logs produced by OpenSIPS.

*Default value is "".*
## `log_stdout` (boolean)

Enables passing through all standard output logs.

*Default value is "no".*
## `max_while_loops` (integer)

Maximum loops that can be done within a "while" to avoid infinite loops.

*Default value is 100.*
## `maxbuffer` (integer)

Size in bytes not to be exceeded during auto-probing of maximum UDP buffer size.

*Default value is 262144.*
## `mcast_loopback` (boolean)

If set to 'yes', multicast datagram are sent over loopback.

*Default value is 'no'.*
## `mcast_ttl` (integer)

Set the value for multicast ttl.

*Default value is 1.*
## `mem-group` (string)

Defines a group of modules to get separate memory statistics.

*Default value is null.*
## `mem_warming` (boolean)

If set to "on", OpenSIPS will attempt to restore the memory fragmentation pattern it had before the stop/restart.

*Default value is off.*
## `mem_warming_pattern_file` (string)

File containing the memory fragmentation pattern of a previous OpenSIPS run.

*Default value is "CFG_DIR/mem_warming_pattern".*
## `mem_warming_percentage` (integer)

How much of OpenSIPS's memory should be fragmented with the pattern of the previous run.

*Default value is 75.*
## `memdump` (integer)

Log level to print memory status information.

*Default value is 4.*
## `memlog` (integer)

Log level to print memory debug info.

*Default value is 4.*
## `mhomed` (integer)

Set the server to try to locate outbound interface on multihomed host.

*Default value is 0.*
## `mpath` (string)

Set the module search path.

*Default value is null.*
## `open_files_limit` (integer)

Try to increase the open file limit to this number.

*Default value is null.*
## `poll_method` (string)

The poll method to be used by the I/O internal reactor.

*Default value is null.*
## `port` (integer)

The port the SIP server listens to.

*Default value is 5060.*
## `pv_print_buf_size` (integer)

The maximum size of an expanded formatted string containing variables.

*Default value is 20000.*
## `query_buffer_size` (integer)

If > 1, inserts to DB will be buffered until this size is reached.

*Default value is 1.*
## `query_flush_time` (integer)

Timer to flush buffered DB queries.

*Default value is null.*
## `restart_persistency_cache_file` (string)

Name of the cache file used to store restart persistence memory.

*Default value is ".restart_persistency.cache".*
## `restart_persistency_size` (integer)

Size of the restart persistency cache file.

*Default value is 32MB.*
## `rev_dns` (boolean)

Controls if the SIP server should attempt to lookup its own IP address in DNS.

*Default value is no.*
## `server_header` (string)

Body of Server header field generated by OpenSIPS as UAS.

*Default value is "OpenSIPS (<version> (<arch>/<os>))".*
## `server_signature` (boolean)

Controls the "Server" header in any locally generated message.

*Default value is yes.*
## `shm_hash_split_percentage` (integer)

Controls how many memory buckets will be optimized in HP_MALLOC.

*Default value is 1.*
## `shm_memlog_size` (integer)

Configures the maximum number of shm operations to keep in the in-memory history.

*Default value is 0.*
## `shm_secondary_hash_size` (integer)

Optimization factor of a single bucket in HP_MALLOC.

*Default value is 8.*
## `sip_warning` (integer)

If set to 1, a 'Warning' header is added to each reply generated by OpenSIPS.

*Default value is 0.*
## `socket` (string)

Set the network addresses/sockets the OpenSIPS server should listen on.

*Default value is null.*
## `stderror_enabled` (boolean)

Enables writing log messages to standard error.

*Default value is yes.*
## `stderror_level_filter` (integer)

Extra log level filtering for messages written to standard error.

*Default value is 0.*
## `stderror_log_format` (string)

Format of the log messages printed to standard error.

*Default value is plain_text.*
## `syslog_enabled` (boolean)

Enables writing log messages to syslog.

*Default value is no.*
## `syslog_facility` (string)

Control the facility for syslog logging.

*Default value is LOG_DAEMON.*
## `syslog_level_filter` (integer)

Extra log level filtering for messages sent to syslog.

*Default value is 0.*
## `syslog_log_format` (string)

Format of the log messages sent to syslog.

*Default value is plain_text.*
## `syslog_name` (string)

Set the id to be printed in syslog.

*Default value is argv[0].*
## `tcp_accept_aliases` (integer)

Enforce RFC 5923 behaviour for TCP connection reusage.

*Default value is 0.*
## `tcp_connect_timeout` (integer)

Time in milliseconds before an ongoing blocking attempt to connect will be aborted.

*Default value is 100.*
## `tcp_connection_lifetime` (integer)

Lifetime in seconds for TCP sessions.

*Default value is 120.*
## `tcp_keepalive` (boolean)

Enable or disable TCP keepalive (OS level).

*Default value is 1.*
## `tcp_keepcount` (integer)

Number of keepalives to send before closing the connection.

*Default value is 9.*
## `tcp_keepidle` (integer)

Amount of time before OpenSIPS will start to send keepalives if the connection is idle.

*Default value is 7200.*
## `tcp_keepinterval` (integer)

Interval between keepalive probes, if the previous one failed.

*Default value is 75.*
## `tcp_max_connections` (integer)

Maximum number of active TCP accepted connections.

*Default value is 2048.*
## `tcp_max_msg_time` (integer)

Maximum number of seconds that a SIP message is expected to arrive via TCP.

*Default value is 4.*
## `tcp_no_new_conn_bflag` (string)

Branch flag to instruct OpenSIPS not to open a new TCP connection.

*Default value is null.*
## `tcp_no_new_conn_rplflag` (string)

Message flag for preventing OpenSIPS to open a new TCP connection for replies.

*Default value is null.*
## `tcp_parallel_read_on_workers` (boolean)

Allow a TCP conn to perform read operations from different processes.

*Default value is null.*
## `tcp_socket_backlog` (integer)

Maximum length of the queue of pending connections for TCP listening sockets.

*Default value is 10.*
## `tcp_threshold` (integer)

Maximum number of microseconds sending of a TCP request is expected to last.

*Default value is 0.*
## `tcp_workers` (integer)

Number of worker processes to be created for reading from TCP connections.

*Default value is 8.*
## `timer_workers` (integer)

Number of worker processes to be created exclusively for timer related tasks.

*Default value is 1.*
## `tos` (string)

The TOS (Type Of Service) to be used for the sent IP packages.

*Default value is IPTOS_LOWDELAY.*
## `udp_workers` (integer)

Number of worker processes to be created for each UDP or SCTP interface.

*Default value is 8.*
## `user_agent_header` (string)

Body of User-Agent header field generated by OpenSIPS as UAC.

*Default value is "OpenSIPS (<version> (<arch>/<os>))".*
## `wdir` (string)

The working directory used by OpenSIPS at runtime.

*Default value is null.*
## `xlog_buf_size` (integer)

Size of the buffer used to print a single line on the logging facility.

*Default value is 4096.*
## `xlog_force_color` (boolean)

Enables the use of the color escape sequences in xlog.

*Default value is false.*
## `xlog_level` (integer)

Independently controls the verbosity of the xlog() functions.

*Default value is 2.*
## `xlog_print_level` (integer)

Default level for printing logs generated by xlog core function when log_level is omitted.

*Default value is 2.*
