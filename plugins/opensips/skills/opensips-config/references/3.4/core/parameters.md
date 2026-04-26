# Core Parameters Reference
<!-- generated-from: data/3.4/core/parameters.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: core_parameter -->

Reference for OpenSIPs 3.4 core global parameters. Read this file when tuning startup-time configuration values that govern the SIP processor itself rather than any single module.

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
- [`listen` (string)](#listen-string)
- [`log_event_enabled` (boolean)](#log_event_enabled-boolean)
- [`log_event_level_filter` (integer)](#log_event_level_filter-integer)
- [`log_facility` (string)](#log_facility-string)
- [`log_json_buf_size` (integer)](#log_json_buf_size-integer)
- [`log_level` (integer)](#log_level-integer)
- [`log_msg_buf_size` (integer)](#log_msg_buf_size-integer)
- [`log_name` (string)](#log_name-string)
- [`log_prefix` (string)](#log_prefix-string)
- [`log_stderror` (boolean)](#log_stderror-boolean)
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
- [`mhomed` (boolean)](#mhomed-boolean)
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
- [`tcp_accept_aliases` (boolean)](#tcp_accept_aliases-boolean)
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
## `advertised_port` (integer)

The port advertised in Via header and other destination lumps (e.g. RR). If empty or not set (default value) the port from where the message will be sent is used.
## `alias` (string)

Parameter to set alias hostnames for the server. It can be set many times, each value being added in a list to match the hostname when 'myself' is checked.
## `auto_aliases` (boolean)

This parameter controls if aliases should be automatically discovered and added during fixing listening sockets.

*Default value is off/0.*
## `auto_scaling_cycle` (integer)

The number of seconds defining a auto-scaling cycle - the auto-scaling engine, at each cycle, is evaluating the internal load of the groups and decided if more processes needs to be created or if existing processes need to be terminated.

*Default value is 1.*
## `auto_scaling_profile` (string)

Defines the behavior of the auto-scaling support, in terms of how many processes should be allowed and when to terminate or create new processes.
## `check_via` (integer)

Check if the address in top most via of replies is local.

*Default value is 0.*
## `chroot` (string)

The value must be a valid path in the system. If set, OpenSIPS will chroot (change root directory) to its value.
## `db_default_url` (string)

The default DB URL to be used by modules if no per-module URL is given.

*Default value is NULL.*
## `db_max_async_connections` (integer)

Maximum number of TCP connections opened from a single OpenSIPS worker to each individual SQL backend.

*Default value is 10.*
## `db_version_table` (string)

The name of the table version to be used by the DB API to check the version of the used tables.

*Default value is version.*
## `debug_mode` (boolean)

Enabling the debug_mode option is a fast way to debug your OpenSIPS. This option will automatically force staying in foreground, set logging level to 4, set logging to standard error, enable core dumping, set UDP worker processes to 2, and set TCP worker processes to 2.

*Default value is false/0.*
## `disable_503_translation` (boolean)

If 'yes', OpenSIPS will not translate the received 503 replies into 500 replies.

*Default value is no.*
## `disable_core_dump` (boolean)

Can be 'yes' or 'no'. By default core dump limits are set to unlimited or a high enough value. Set this config variable to 'yes' to disable core dump-ing.

*Default value is no.*
## `disable_dns_blacklist` (boolean)

The DNS resolver, when configured with failover, can automatically store in a temporary blacklist the failed destinations. Can be 'yes' or 'no'. By default the blacklist is disabled.

*Default value is yes.*
## `disable_dns_failover` (boolean)

Can be 'yes' or 'no'. By default DNS-based failover is enabled. Set this config variable to 'yes' to disable the DNS-based failover.

*Default value is no.*
## `disable_stateless_fwd` (boolean)

Can be 'yes' or 'no'. This parameter controls the handling of stateless replies.

*Default value is yes.*
## `dns` (boolean)

This parameter controls if the SIP server should attempt to lookup its own domain name in DNS.

*Default value is no.*
## `dns_retr_no` (integer)

Number of dns retransmissions before giving up.

*Default value is system specific.*
## `dns_retr_time` (integer)

Time in seconds before retrying a dns request.

*Default value is system specific.*
## `dns_servers_no` (integer)

How many dns servers from the ones defined in '/etc/resolv.conf' will be used.

*Default value is all.*
## `dns_try_ipv6` (boolean)

Can be 'yes' or 'no'. If it is set to 'yes' and a DNS lookup fails, it will retry it for ipv6 (AAAA record).

*Default value is no.*
## `dns_try_naptr` (boolean)

Disables the NAPTR lookups when doing DNS based routing for SIP requests - if disabled, the DNS lookup will start with SRV lookups.

*Default value is yes.*
## `dns_use_search_list` (boolean)

Can be 'yes' or 'no'. If set to 'no', the search list in '/etc/resolv.conf' will be ignored.

*Default value is yes.*
## `dst_blacklist` (string)

Definition of a IP/destination blacklist. These lists can be selected from script (at runtime) to filter the outgoing requests, based on IP, protocol, port, etc.
## `enable_asserts` (boolean)

Set to true in order to enable the assert script statement.

*Default value is false.*
## `event_pkg_threshold` (integer)

A number representing the percentage threshold above which the E_CORE_PKG_THRESHOLD event is raised, warning about low amount of free private memory. It accepts integer values between 0 and 100.

*Default value is 0.*
## `event_shm_threshold` (integer)

A number representing the percentage threshold above which the E_CORE_SHM_THRESHOLD event is raised, warning about low amount of free shared memory. It accepts integer values between 0 and 100.

*Default value is 0.*
## `exec_dns_threshold` (integer)

A number representing the maximum number of microseconds a DNS query is expected to last.

*Default value is 0.*
## `exec_msg_threshold` (integer)

A number representing the maximum number of microseconds the processing of a SIP msg is expected to last.

*Default value is 0.*
## `import_file` (string)

Same as include_file.
## `include_file` (string)

Can be called from outside route blocks to load additional routes/blocks or from inside them to simply perform more functions.
## `listen` (string)

This parameter was replaced by the socket parameter, preserving exactly the same format and behavior.
## `log_event_enabled` (boolean)

Enables the triggering of the E_CORE_LOG event for every log message generated by opensips.

*Default value is disabled.*
## `log_event_level_filter` (integer)

Extra log level filtering for the E_CORE_LOG event.

*Default value is 0.*
## `log_facility` (string)

This parameter was replaced by the syslog_facility parameter, preserving exactly the same format and behavior.
## `log_json_buf_size` (integer)

Size of the buffer used for printing the JSON document corresponding to a log message.

*Default value is 6144.*
## `log_level` (integer)

Set the logging level (how verbose OpenSIPS should be).

*Default value is 2.*
## `log_msg_buf_size` (integer)

Size of the buffer used for printing the log message's payload.

*Default value is 4096.*
## `log_name` (string)

This parameter was replaced by the syslog_name parameter, preserving exactly the same format and behavior.
## `log_prefix` (string)

A string prefix which will be prepended to all logs produced by OpenSIPS.

*Default value is "".*
## `log_stderror` (boolean)

This parameter is deprecated and it's behavior starting with OpenSIPS 3.4 is equivalent to setting the stderror_enabled and syslog_enabled parameters.

*Default value is yes.*
## `log_stdout` (boolean)

Although all OpenSIPS logs are done via standard error, enabling this parameter may be still be useful when trying to extract logs from 3rd party libraries.

*Default value is no.*
## `max_while_loops` (integer)

The parameters set the value of maximum loops that can be done within a "while".

*Default value is 100.*
## `maxbuffer` (integer)

The size in bytes not to be exceeded during the auto-probing procedure of discovering the maximum buffer size for receiving UDP messages.

*Default value is 262144.*
## `mcast_loopback` (boolean)

It can be 'yes' or 'no'. If set to 'yes', multicast datagram are sent over loopback.

*Default value is no.*
## `mcast_ttl` (integer)

Set the value for multicast ttl.

*Default value is OS specific.*
## `mem-group` (string)

Defines a group of modules (by name) to get separate memory statistics.
## `mem_warming` (boolean)

Only relevant when the HP_MALLOC compile flag is enabled. If set to "on", on each startup, OpenSIPS will attempt to restore the memory fragmentation pattern it had before the stop/restart.

*Default value is off.*
## `mem_warming_pattern_file` (string)

Only relevant if mem_warming is enabled. It contains the memory fragmentation pattern of a previous OpenSIPS run.

*Default value is CFG_DIR/mem_warming_pattern.*
## `mem_warming_percentage` (integer)

How much of OpenSIPS's memory should be fragmented with the pattern of the previous run, upon a restart.

*Default value is 75.*
## `memdump` (integer)

Log level to print memory status information (runtime and shutdown).

*Default value is L_DBG (4).*
## `memlog` (integer)

Log level to print memory debug info.

*Default value is L_DBG (4).*
## `mhomed` (boolean)

Set the server to try to locate outbound interface on multihomed host.

*Default value is 0.*
## `mpath` (string)

Set the module search path.
## `open_files_limit` (integer)

If set and bigger than the current open file limit, OpenSIPS will try to increase its open file limit to this number.
## `poll_method` (string)

The poll method to be used by the I/O internal reactor.

*Default value is best one for OS.*
## `port` (integer)

The port the SIP server listens to.

*Default value is 5060.*
## `pv_print_buf_size` (integer)

The maximum size of an expanded formatted string containing variables and/or pseudo-variables.

*Default value is 20000.*
## `query_buffer_size` (integer)

If set to a value greater than 1, inserts to DB will not be flushed one by one.
## `query_flush_time` (integer)

If query_buffer_size is set to a value greater than 1, a timer will trigger once every query_flush_time seconds.
## `restart_persistency_cache_file` (string)

This parameter controls the name of the cache file that is used to store restart persistence memory.

*Default value is .restart_persistency.cache.*
## `restart_persistency_size` (integer)

This parameter controls the size of the cache file.

*Default value is shared memory size.*
## `rev_dns` (boolean)

This parameter controls if the SIP server should attempt to lookup its own IP address in DNS.

*Default value is no.*
## `server_header` (string)

The body of Server header field generated by OpenSIPS when it sends a request as UAS.

*Default value is OpenSIPS (<version> (<arch>/<os>)).*
## `server_signature` (boolean)

This parameter controls the "Server" header in any locally generated message.

*Default value is yes.*
## `shm_hash_split_percentage` (integer)

Only relevant when the HP_MALLOC compile flag is enabled. It controls how many memory buckets will be optimized.

*Default value is 1.*
## `shm_memlog_size` (integer)

Configures the maximum number of shm operations to keep in the in-memory history.

*Default value is 0.*
## `shm_secondary_hash_size` (integer)

Only relevant when the HP_MALLOC compile flag is enabled. It represents the optimization factor of a single bucket.

*Default value is 8.*
## `sip_warning` (integer)

Can be 0 or 1. If set to 1 a 'Warning' header is added to each reply generated by OpenSIPS.

*Default value is 0.*
## `socket` (string)

Set the network addresses/sockets the OpenSIPS server should listen on. Its syntax is protocol:address[:port].
## `stderror_enabled` (boolean)

Enables writing log messages to standard error.

*Default value is yes/1.*
## `stderror_level_filter` (integer)

Extra log level filtering for the messages written to the standard error.

*Default value is 0.*
## `stderror_log_format` (string)

Format of the log messages printed to standard error.

*Default value is plain_text.*
## `syslog_enabled` (boolean)

Enables writing log messages to syslog.

*Default value is no/disabled.*
## `syslog_facility` (string)

If OpenSIPS logs to syslog, you can control the facility for logging.

*Default value is LOG_DAEMON.*
## `syslog_level_filter` (integer)

Extra log level filtering for the messages sent to syslog.

*Default value is 0.*
## `syslog_log_format` (string)

Format of the log messages sent to syslog.

*Default value is plain_text.*
## `syslog_name` (string)

Set the id to be printed in syslog.

*Default value is argv[0].*
## `tcp_accept_aliases` (boolean)

If enabled, OpenSIPS will enforce RFC 5923 behaviour when detecting an ";alias" Via header field parameter.

*Default value is 0.*
## `tcp_connect_timeout` (integer)

Time in milliseconds before an ongoing blocking attempt to connect will be aborted.

*Default value is 100ms.*
## `tcp_connection_lifetime` (integer)

Lifetime in seconds for TCP sessions. TCP sessions which are inactive for >tcp_connection_lifetime will be closed by OpenSIPS.

*Default value is 120.*
## `tcp_keepalive` (boolean)

Enable or disable TCP keepalive (OS level).

*Default value is Enabled.*
## `tcp_keepcount` (integer)

Number of keepalives to send before closing the connection (Linux only).

*Default value is OS dependent.*
## `tcp_keepidle` (integer)

Amount of time before OpenSIPS will start to send keepalives if the connection is idle (Linux only).

*Default value is OS dependent.*
## `tcp_keepinterval` (integer)

Interval between keepalive probes, if the previous one failed (Linux only).

*Default value is OS dependent.*
## `tcp_max_connections` (integer)

Maximum number of active TCP accepted connections.

*Default value is 2048.*
## `tcp_max_msg_time` (integer)

The maximum number of seconds that a SIP message is expected to arrive via TCP.

*Default value is 4.*
## `tcp_no_new_conn_bflag` (string)

A branch flag to be used as marker to instruct OpenSIPS not to attempt to open a new TCP connection when delivering a request.
## `tcp_no_new_conn_rplflag` (string)

A message flag, similar to tcp_no_new_conn_bflag, for preventing OpenSIPS to try to open a new TCP connection when sending back a reply.
## `tcp_parallel_read_on_workers` (boolean)

This option will allow a TCP conn to perform read operations from different processes, not only from one.
## `tcp_socket_backlog` (integer)

The backlog argument defines the maximum length to which the queue of pending connections for the TCP listening sockets may grow.

*Default value is 10.*
## `tcp_threshold` (integer)

A number representing the maximum number of microseconds sending of a TCP request is expected to last.

*Default value is 0.*
## `tcp_workers` (integer)

Number of worker processes to be created for reading from TCP connections.

*Default value is 8.*
## `timer_workers` (integer)

The number of worker processes to be created exclusively for timer related tasks/processing.

*Default value is 1.*
## `tos` (string)

The TOS (Type Of Service) to be used for the sent IP packages (both TCP and UDP).
## `udp_workers` (integer)

Number of worker processes to be created for each UDP or SCTP interface you have defined.

*Default value is 8.*
## `user_agent_header` (string)

The body of User-Agent header field generated by OpenSIPS when it sends a request as UAC.

*Default value is OpenSIPS (<version> (<arch>/<os>)).*
## `wdir` (string)

The working directory used by OpenSIPS at runtime.
## `xlog_buf_size` (integer)

Size of the buffer used to print a single line on the chosen logging facility of OpenSIPS.

*Default value is 4096.*
## `xlog_force_color` (boolean)

Only relevant when xlog is set to true. Enables the use of the color escape sequences.

*Default value is false.*
## `xlog_level` (integer)

Similar to log_level this parameter independently controls the verbosity of the xlog() functions.

*Default value is 2 / L_NOTICE.*
## `xlog_print_level` (integer)

Default level for printing the logs generated by xlog core function, when the log_level parameter is omitted.

*Default value is 2 (L_NOTICE).*
