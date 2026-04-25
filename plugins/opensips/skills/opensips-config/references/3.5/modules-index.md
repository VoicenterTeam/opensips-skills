# OpenSIPs module index
Generated reference for OpenSIPs 3.5. This file is the module catalog for the `opensips-config` skill. It maps every module in the active reference set to its per-module reference file and provides the lookup-discipline guidance that governs how Claude uses the reference set.
## Module index
| Module | Purpose | Reference file |
|---|---|---|
| `ALIAS_DB` | ALIAS_DB module can be used as an alternative for user aliases via usrloc | `references/{version}/modules/ALIAS_DB.md` |
| `XML Module` | This module exposes a script variable that provides basic parsing and manipulat… | `references/{version}/modules/XML Module.md` |
| `acc` | The ACC module is used to account transaction information to different backends… | `references/{version}/modules/acc.md` |
| `aka_av_diameter` | This module is an extension to the _AKA_AUTH_ module providing a Diameter AKA A… | `references/{version}/modules/aka_av_diameter.md` |
| `auth` | This is a module that provides common functions that are needed by other authen… | `references/{version}/modules/auth.md` |
| `auth_aaa` | This module contains functions that are used to perform digest authentication a… | `references/{version}/modules/auth_aaa.md` |
| `auth_aka` | This module contains functions that are used to perform digest authentication u… | `references/{version}/modules/auth_aka.md` |
| `auth_db` | This module contains all authentication related functions that need the access… | `references/{version}/modules/auth_db.md` |
| `auth_jwt` | The module implements authentication over JSON Web Tokens | `references/{version}/modules/auth_jwt.md` |
| `b2b_entities` | The B2BUA implementation in OpenSIPS is separated in two layers: * a lower one(… | `references/{version}/modules/b2b_entities.md` |
| `b2b_logic` | The B2BUA implementation in OpenSIPS is separated in two layers: * a lower one… | `references/{version}/modules/b2b_logic.md` |
| `b2b_sca` | This module provides core SCA (Shared Call Appearance) functionality for OpenSI… | `references/{version}/modules/b2b_sca.md` |
| `b2b_sdp_demux` | This module provides the logic to convert a multi-stream SDP call, to multiple… | `references/{version}/modules/b2b_sdp_demux.md` |
| `benchmark` | This module helps developers to benchmark their module functions | `references/{version}/modules/benchmark.md` |
| `cachedb_cassandra` | This module is an implementation of a cache system designed to work with Cassan… | `references/{version}/modules/cachedb_cassandra.md` |
| `cachedb_couchbase` | This module is an implementation of a cache system designed to work with a Couc… | `references/{version}/modules/cachedb_couchbase.md` |
| `cachedb_local` | This module is an implementation of a local cache system designed as a hash tab… | `references/{version}/modules/cachedb_local.md` |
| `cachedb_memcached` | This module is an implementation of a cache system designed to work with a memc… | `references/{version}/modules/cachedb_memcached.md` |
| `cachedb_mongodb` | This module is an implementation of a cache system designed to work with MongoD… | `references/{version}/modules/cachedb_mongodb.md` |
| `cachedb_redis` | This module is an implementation of a cache system designed to work with a Redi… | `references/{version}/modules/cachedb_redis.md` |
| `cachedb_sql` | This module is an implementation of a cache system designed to work with a regu… | `references/{version}/modules/cachedb_sql.md` |
| `call_center` | The Call Center module implements an inbound call center system with call flows… | `references/{version}/modules/call_center.md` |
| `call_control` | This module allows one to limit the duration of calls and automatically end the… | `references/{version}/modules/call_control.md` |
| `callops` | This module provides a set of functions that allow the user to control ongoing… | `references/{version}/modules/callops.md` |
| `carrierroute` | A module which provides routing, balancing and blacklisting capabilities | `references/{version}/modules/carrierroute.md` |
| `cfgutils` | Useful extensions for the server configuration | `references/{version}/modules/cfgutils.md` |
| `cgrates` | CGRateS is an open-source rating engine used for carrier-grade, multi-tenant, r… | `references/{version}/modules/cgrates.md` |
| `compression` | This module implements message compression/decompression and base64 encoding fo… | `references/{version}/modules/compression.md` |
| `cpl_c` | cpl_c modules implements a CPL (Call Processing Language) interpreter | `references/{version}/modules/cpl_c.md` |
| `db_berkeley` | This is a module which integrates the Berkeley DB into OpenSIPS | `references/{version}/modules/db_berkeley.md` |
| `db_cachedb` | The db_cachedb module will expose the same front db api, however it will run on… | `references/{version}/modules/db_cachedb.md` |
| `db_flatstore` | Flatstore is one of so-called OpenSIPS database modules | `references/{version}/modules/db_flatstore.md` |
| `db_http` | This module provides access to a database that is implemented as a HTTP server | `references/{version}/modules/db_http.md` |
| `db_mysql` | This is a module which provides MySQL connectivity for OpenSIPS | `references/{version}/modules/db_mysql.md` |
| `db_oracle` | This is a module which provides Oracle connectivity for OpenSIPS | `references/{version}/modules/db_oracle.md` |
| `db_perlvdb` | The Perl Virtual Database (VDB) provides a virtualization framework for OpenSIP… | `references/{version}/modules/db_perlvdb.md` |
| `db_postgres` | Module description | `references/{version}/modules/db_postgres.md` |
| `db_sqlite` | This is a module which provides SQLite support for OpenSIPS | `references/{version}/modules/db_sqlite.md` |
| `db_text` | The module implements a simplified database engine based on text files | `references/{version}/modules/db_text.md` |
| `db_unixodbc` | This module allows to use the unixodbc package with OpenSIPS | `references/{version}/modules/db_unixodbc.md` |
| `db_virtual` | A virtual DB will expose the same front DB api however, it will backed by many… | `references/{version}/modules/db_virtual.md` |
| `dialplan` | This module implements generic string translations based on matching and replac… | `references/{version}/modules/dialplan.md` |
| `dispatcher` | This modules implements a dispatcher for destination addresses | `references/{version}/modules/dispatcher.md` |
| `diversion` | The module implements the Diversion extensions as per draft-levy-sip-diversion-… | `references/{version}/modules/diversion.md` |
| `dns_cache` | This module is an implementation of a cache system designed for DNS records | `references/{version}/modules/dns_cache.md` |
| `domain` | Domain module implements checks that based on domain table determine if a host… | `references/{version}/modules/domain.md` |
| `domainpolicy` | The Domain Policy module implements draft-lendl-domain-policy-ddds-02 in combin… | `references/{version}/modules/domainpolicy.md` |
| `drouting` | Dynamic Routing is a module for selecting (based on multiple criteria) the best… | `references/{version}/modules/drouting.md` |
| `emergency` | The emergency module provides emergency call treatment for OpenSIPS, following… | `references/{version}/modules/emergency.md` |
| `enum` | Enum module implements \[i_\]enum_query functions that make an enum query based… | `references/{version}/modules/enum.md` |
| `event_datagram` | This is a module which provides a UNIX/UDP SOCKET transport layer implementatio… | `references/{version}/modules/event_datagram.md` |
| `event_flatstore` | The event_flatstore module provides a logging facility for different events, tr… | `references/{version}/modules/event_flatstore.md` |
| `event_kafka` | This module is an implementation of an [Apache Kafka](https://kafka.apache.org/… | `references/{version}/modules/event_kafka.md` |
| `event_rabbitmq` | _RabbitMQ_ (http://www.rabbitmq.com/) is an open source messaging server | `references/{version}/modules/event_rabbitmq.md` |
| `event_route` | This module provides a simple way for capturing and handling directly in the Op… | `references/{version}/modules/event_route.md` |
| `event_routing` | The Event (based) Routing module, or shortly the EBR module, provides a mechani… | `references/{version}/modules/event_routing.md` |
| `event_stream` | This module provides a TCP transport layer implementation for the Event Interfa… | `references/{version}/modules/event_stream.md` |
| `event_virtual` | The _event_virtual_ module provides the possibility to have multiple external a… | `references/{version}/modules/event_virtual.md` |
| `event_xmlrpc` | This module is an implementation of an XMLRPC client used to notify XMLRPC serv… | `references/{version}/modules/event_xmlrpc.md` |
| `exec` | The Exec module enables the execution of external commands from the OpenSIPS sc… | `references/{version}/modules/exec.md` |
| `fraud_detection` | This module provides a way to prevent some basic fraud attacks | `references/{version}/modules/fraud_detection.md` |
| `gflags` | gflags module (global flags) keeps a bitmap of flags in shared memory and may b… | `references/{version}/modules/gflags.md` |
| `group` | This module provides functionalities for different methods of group membership… | `references/{version}/modules/group.md` |
| `identity` | This module adds support for SIP Identity (see RFC 4474) | `references/{version}/modules/identity.md` |
| `imc` | This module offers support for instant message conference | `references/{version}/modules/imc.md` |
| `jabber` | This is new version of Jabber module that integrates XODE XML parser for parsin… | `references/{version}/modules/jabber.md` |
| `json` | This module introduces a new type of variable that provides both serialization… | `references/{version}/modules/json.md` |
| `load_balancer` | The Load-Balancer module comes to provide traffic routing based on load | `references/{version}/modules/load_balancer.md` |
| `lua` | The time needed when writing a new OpenSIPS module unfortunately is quite high,… | `references/{version}/modules/lua.md` |
| `mangler` | This is a module to help with SDP mangling | `references/{version}/modules/mangler.md` |
| `mathops` | The mathops module provides a series of functions which enable various floating… | `references/{version}/modules/mathops.md` |
| `maxfwd` | The module implements all the operations regarding MaX-Forward header field, li… | `references/{version}/modules/maxfwd.md` |
| `media_exchange` | This module provides the means to exchange media SDP between different SIP prox… | `references/{version}/modules/media_exchange.md` |
| `mi_datagram` | This is a module which provides a UNIX/UDP SOCKET transport layer implementatio… | `references/{version}/modules/mi_datagram.md` |
| `mi_fifo` | This is a module which provides a FIFO transport layer implementation for Manag… | `references/{version}/modules/mi_fifo.md` |
| `mi_html` | This module provides a minimal web user interface for the OpenSIPS's Management… | `references/{version}/modules/mi_html.md` |
| `mid_registrar` | The mid_registrar is a mid-component of a SIP platform, designed to work betwee… | `references/{version}/modules/mid_registrar.md` |
| `mmgeoip` | This module is a lightweight wrapper for the MaxMind GeoIP API | `references/{version}/modules/mmgeoip.md` |
| `mqueue` | The mqueue module offers a generic message queue system in shared memory for in… | `references/{version}/modules/mqueue.md` |
| `msilo` | This modules provides offline message storage for the Open SIP Server | `references/{version}/modules/msilo.md` |
| `msrp_gateway` | This module implements a Gateway for translating between Page Mode (SIP MESSAGE… | `references/{version}/modules/msrp_gateway.md` |
| `msrp_ua` | This module implements an User Agent capable of establishing messaging sessions… | `references/{version}/modules/msrp_ua.md` |
| `nat_traversal` | The nat_traversal module provides support for handling far-end NAT traversal fo… | `references/{version}/modules/nat_traversal.md` |
| `nathelper` | This is a module to help with NAT traversal | `references/{version}/modules/nathelper.md` |
| `options` | This module provides a function to answer OPTIONS requests which are directed t… | `references/{version}/modules/options.md` |
| `osp` | The OSP module enables OpenSIPS to support secure, multi-lateral peering using… | `references/{version}/modules/osp.md` |
| `path` | This module is designed to be used at intermediate sip proxies like loadbalance… | `references/{version}/modules/path.md` |
| `peering` | Peering module allows SIP providers (operators or organizations) to verify from… | `references/{version}/modules/peering.md` |
| `perl` | The time needed when writing a new OpenSIPS module unfortunately is quite high,… | `references/{version}/modules/perl.md` |
| `permissions` | ### 1.1.1 | `references/{version}/modules/permissions.md` |
| `pike` | The module provides a simple mechanism for DOS protection - DOS based on floods… | `references/{version}/modules/pike.md` |
| `presence` | The modules handles PUBLISH and SUBSCRIBE messages and generates NOTIFY message… | `references/{version}/modules/presence.md` |
| `presence_callinfo` | This module provides OpenSIPS support for shared call appearances (SCA) as defi… | `references/{version}/modules/presence_callinfo.md` |
| `presence_dfks` | The module enables the handling of the "as-feature-event" event package (as def… | `references/{version}/modules/presence_dfks.md` |
| `presence_dialoginfo` | The module enables the handling of "Event: dialog" (as defined in RFC 4235) ins… | `references/{version}/modules/presence_dialoginfo.md` |
| `presence_mwi` | The module does specific handling for notify-subscribe message-summary (message… | `references/{version}/modules/presence_mwi.md` |
| `presence_reginfo` | The module enables the handling of "Event: reg" (as defined in RFC 3680) inside… | `references/{version}/modules/presence_reginfo.md` |
| `presence_xcapdiff` | The presence_xcapdiff is an OpenSIPS module that adds support for the "xcap-dif… | `references/{version}/modules/presence_xcapdiff.md` |
| `presence_xml` | The module does specific handling for notify-subscribe events using xml bodies | `references/{version}/modules/presence_xml.md` |
| `pua` | This module offer the internal support for OpenSIPS to act as a Presence User A… | `references/{version}/modules/pua.md` |
| `pua_bla` | The pua_bla module enables Bridged Line Appearances support according to the sp… | `references/{version}/modules/pua_bla.md` |
| `pua_dialoginfo` | The pua_dialoginfo retrieves dialog state information from the dialog module an… | `references/{version}/modules/pua_dialoginfo.md` |
| `pua_mi` | The pua_mi offers the possibility to publish presence information and subscribe… | `references/{version}/modules/pua_mi.md` |
| `pua_reginfo` | This module publishes information about "reg"-events according to to RFC 3680 | `references/{version}/modules/pua_reginfo.md` |
| `pua_usrloc` | The pua_usrloc is the connector between usrloc and pua modules | `references/{version}/modules/pua_usrloc.md` |
| `pua_xmpp` | This module is a gateway for presence between SIP and XMPP | `references/{version}/modules/pua_xmpp.md` |
| `python` | This module can be used to efficiently run Python code directly from the OpenSI… | `references/{version}/modules/python.md` |
| `qos` | The qos module provides a way to keep track of per dialog SDP session(s) | `references/{version}/modules/qos.md` |
| `qrouting` | _qrouting_ is a module which sits on top of [drouting](../drouting/doc/drouting… | `references/{version}/modules/qrouting.md` |
| `rate_cacher` | The _rate_cacher_ module provides a means of caching and real-time querying of… | `references/{version}/modules/rate_cacher.md` |
| `ratelimit` | This module implements rate limiting for SIP requests | `references/{version}/modules/ratelimit.md` |
| `regex` | This module offers matching operations against regular expressions using the po… | `references/{version}/modules/regex.md` |
| `registrar` | The module contains SIP REGISTER request processing logic, per RFC 3261 | `references/{version}/modules/registrar.md` |
| `rls` | The modules is a Resource List Server implementation following the specificatio… | `references/{version}/modules/rls.md` |
| `rr` | The module contains record routing logic | `references/{version}/modules/rr.md` |
| `script_helper` | The purpose of the Script Helper module is to simplify the scripting process in… | `references/{version}/modules/script_helper.md` |
| `signaling` | The SIGNALING module comes as a wrapper over tm and sl modules and offers one f… | `references/{version}/modules/signaling.md` |
| `sip_i` | This module offers the possibility of processing ISDN User Part(ISUP) messages… | `references/{version}/modules/sip_i.md` |
| `sipmsgops` | The module implements SIP based operations over the messages processed by OpenS… | `references/{version}/modules/sipmsgops.md` |
| `sl` | The SL module allows OpenSIPS to act as a stateless UA server and generate repl… | `references/{version}/modules/sl.md` |
| `speeddial` | This module provides on-server speed dial facilities | `references/{version}/modules/speeddial.md` |
| `sql_cacher` | The sql_cacher module introduces the possibility to cache data from a SQL-based… | `references/{version}/modules/sql_cacher.md` |
| `sqlops` | SQLops (SQL-operations) modules implements a set of script functions for generi… | `references/{version}/modules/sqlops.md` |
| `sst` | The sst module provides a way to update the dialog expire timer based on the SI… | `references/{version}/modules/sst.md` |
| `stir_shaken` | This module adds support for implementing STIR/SHAKEN (RFC 8224, RFC 8588) Auth… | `references/{version}/modules/stir_shaken.md` |
| `textops` | The module implements text based operations over the SIP message processed by O… | `references/{version}/modules/textops.md` |
| `tm` | TM module enables stateful processing of SIP transactions | `references/{version}/modules/tm.md` |
| `topology_hiding` | This is a module which provides topology hiding capabilities | `references/{version}/modules/topology_hiding.md` |
| `uac` | UAC (User Agent Client) module provides some basic UAC functionalities like FRO… | `references/{version}/modules/uac.md` |
| `uac_auth` | UAC AUTH (User Agent Client Authentication) module provides a common API for bu… | `references/{version}/modules/uac_auth.md` |
| `uac_redirect` | UAC REDIRECT - User Agent Client redirection - module enhance OpenSIPS with the… | `references/{version}/modules/uac_redirect.md` |
| `uac_registrant` | The module enable OpenSIPS to register itself on a remote SIP registrar | `references/{version}/modules/uac_registrant.md` |
| `userblacklist` | The userblacklist module allows OpenSIPS to handle blacklists on a per user bas… | `references/{version}/modules/userblacklist.md` |
| `usrloc` | A SIP user location implementation | `references/{version}/modules/usrloc.md` |
| `uuid` | This module provides a way to generate universally unique identifiers (UUID) as… | `references/{version}/modules/uuid.md` |
| `xcap` | The module contains several parameters and functions common to all modules usin… | `references/{version}/modules/xcap.md` |
| `xcap_client` | The modules is an XCAP client for OpenSIPS that can be used by other modules | `references/{version}/modules/xcap_client.md` |
## How to use this file

The per-module reference file under `references/{version}/modules/{slug}.md` is the authoritative source of truth for everything that module exports. Read it before answering. Do not infer module behavior from training-data priors; the priors are unreliable across the SER lineage and across OpenSIPs versions.

The path pattern is fixed:

- Per-module reference file: `references/{version}/modules/{slug}.md`. Substitute `{version}` at read time with the active OpenSIPs version (e.g., `3.6`). Substitute `{slug}` with the module name as it appears in the index below.
- Consolidated index: `references/{version}/consolidated.json`. A structured JSON index of every module, function, pseudo-variable, parameter, MI command, and statistic in the version, plus a `relationships.moduleDependencies` graph.

The consolidated index is the fastest path when the user references an identifier without naming a module:

- To find which module exports a function whose home module is unclear, Read `consolidated.json` and look up `indexes.functionsByName[{function}]` to find the source module, then Read that module's per-module reference file for the full signature.
- To find which module defines a pseudo-variable, look up `indexes.variablesByName[{variable}]`.
- To find which module exposes an MI command, look up `indexes.miCommandsByName[{command}]`.
- To list all parameters of a known module, look up `indexes.parametersByModule[{module}]`.
- To check what other modules a given module depends on, look up `relationships.moduleDependencies[{module}]`.

Two-step lookup is the canonical pattern: Read `consolidated.json` to locate the source, then Read the per-module file for full content. Do not skip the second Read — the consolidated index does not contain function descriptions, parameter narratives, or usage examples.

When a user prompt names multiple modules, Read each per-module reference file in turn rather than answering from a single read. Cross-module behavior (e.g., how `tm` interacts with `dialog`) is described in each module's reference file separately; the consolidated index links them through the dependencies graph but does not narrate the interaction.
## Lookup discipline

The router-index pattern depends on Claude making the second hop. The most consequential failure mode for this reference is triggering on a module mention, reading the index entry to confirm the module exists, and then answering the user's substantive question from training-data priors instead of the per-module reference. The index entry is a routing signal, not an answer.

- **Wrong shape.** User asks for `dialog` module's exported functions. Claude reads the index, sees `dialog` listed, then writes a function list from priors without opening `dialog.md`. The answer may look plausible and may even be partially correct, but version-specific signatures and parameter orderings are not reliably reproducible from priors.
- **Right shape.** User asks for `dialog` module's exported functions. Claude reads the index to confirm the module slug, Reads `references/{version}/modules/dialog.md`, and answers from the file's exported-functions section, quoting signatures verbatim from the reference.

The same discipline applies when the user asks a follow-up. A second question about the same module is a second Read of the same file (or a re-quote from the previous Read in the same session); it is not an opportunity to fall back on priors because "we just looked at this module."
## What the per-module reference file contains

Each `references/{version}/modules/{slug}.md` is a generated reference covering one module's full surface area. The sections present in every per-module file are:

- **Overview** — what the module does and its role in a configuration.
- **Dependencies** — other modules that must be loaded for this module to function, plus optional modules that enable additional features when also loaded.
- **External dependencies** — system-level requirements (libraries, daemons, database schemas).
- **Parameters** — every `modparam(...)` exposed by the module, with type, default, valid values, and description.
- **Exported functions** — every script-callable function with full signatures, parameter types, return values, and the route types in which the function is valid.
- **Exported pseudo-variables** — variables added by the module, read/write semantics, and the contexts in which they are populated.
- **Exported MI commands** — management interface commands the module registers, with arguments and return shapes.
- **Exported statistics** — counters and gauges the module publishes.
- **Exported events** — event names the module raises through `event_route` blocks.

Not every module exposes every category. A module with no MI commands has no MI section. The presence or absence of a section is itself information — if the user asks about an MI command for a module whose reference file has no MI section, the command does not exist in this version and the user is likely confusing modules or versions.
## Version-specific behavior

Module exports change between OpenSIPs versions. A function that exists in the active version may have had a different signature in a prior version, or may not have existed at all. Always Read the per-module reference file under the version directory the user is working in. Do not assume cross-version equivalence. If the user has not specified a version, ask before answering — the answer is genuinely different across versions, and a version-correct answer to the wrong version is still wrong.
## When a module is not in the index

If a user names a module that does not appear in the index above:

1. **Check for typos.** Compare the user's spelling against the index. Common slips: hyphen vs. underscore (`mid-registrar` vs `mid_registrar`), missing or extra `_db` / `_mysql` / `_postgres` suffixes, plural vs. singular (`registrars` vs `registrar`), pluralized verb forms.
2. **Check the consolidated index.** Read `references/{version}/consolidated.json` and search for the name across `indexes.functionsByName`, `indexes.variablesByName`, `indexes.miCommandsByName`, and `indexes.parametersByModule`. A module that has been renamed in a recent version, or that the user is referring to by a function it exports rather than by its module name, may surface here even when the module-name table does not list it.
3. **Check the other version's index.** If the user is working with a version different from the one in `{version}`, the module may exist there. Confirm the version explicitly and switch the lookup.
4. **Ask the user.** If none of the above resolves the name, ask. Do not invent module names, function signatures, parameters, pseudo-variables, MI commands, or statistics. Do not guess at a "probably correct" answer based on training-data priors — those priors mix identifiers across the SER lineage and across OpenSIPs versions and are unreliable.

If a module is not in the index and not in the `consolidated.json`, treat it as unknown and ask for clarification before answering. The cost of one clarifying turn is small; the cost of a fabricated identifier landing in a user's production configuration is large because the failure mode is silent — the config loads, the proxy starts, and a call path silently misbehaves.

The same procedure applies to functions, pseudo-variables, MI commands, statistics, and events that the user names without naming a module. If the consolidated index has no record of the identifier across `indexes.functionsByName`, `indexes.variablesByName`, `indexes.miCommandsByName`, and the per-module statistics or events sections, the identifier is unknown to this version's reference set. Ask the user to confirm the identifier and the version; do not improvise.

A particular failure mode worth naming: an identifier that "feels right" because it follows a familiar naming convention (`pv_{thing}`, `{module}_send`, `{module}_check`) is not evidence that the identifier exists. Naming conventions are widely shared across the SER lineage, and the priors are confidently wrong about which conventions belong to which project's current releases. When the consolidated index disagrees with priors, the index wins.
