---
name: opensips-modules
description: |-
  Provides authoritative per-module reference data for OpenSIPs modules (function signatures, exported parameters, dependencies, pseudo-variables, MI commands, statistics, events). Use whenever the user references a specific OpenSIPs module by name (e.g. dialog, tm, rr, registrar, dispatcher, drouting, presence, sl, uac, db_mysql, mid_registrar) or asks what functions/parameters a module exports. Do NOT use for sibling SIP Express Router (SER)-lineage projects' modules even when the names look identical.
allowed-tools: Read, Glob, Grep
---

## Overview

This skill is a router-index for per-module reference data on OpenSIPs modules. It does not author configuration. Its job is to point at the correct per-module reference file so Claude can answer accurately about a module's exported functions, parameters, pseudo-variables, MI commands, statistics, events, and dependencies. The substantive content lives in the per-module reference files under `references/{version}/modules/`, not in this SKILL.md — this file routes Claude to the right reference, and the reference file carries the answer.

For authoring tasks (writing route blocks, configuring `opensips.cfg`, designing call flows, choosing between modules) defer to `opensips-routing`. For security review of an existing configuration defer to `opensips-security-advisor`. This skill answers "what does module X expose?" — not "should I use module X?" or "is the way I'm using module X safe?".

## Cross-project guardrail

OpenSIPs is one of several projects descending from the SIP Express Router (SER). The projects share an architectural ancestry but have diverged substantially in configuration syntax, function names, parameter names, pseudo-variable conventions, and module exports. Module-name confusion is the single highest-risk failure mode for this skill: an identifier that looks correct from training-data priors may belong to a sibling SER-lineage project rather than to OpenSIPs, or may exist in OpenSIPs with a different signature, different parameters, or different semantics than the priors suggest.

The operational rule is positive, not comparative: a module, function, parameter, or pseudo-variable is valid only if it is present in this version's reference set under `references/{version}/modules/`. Identifiers that look familiar but are not in the reference set are either typos, version mismatches, or imports from sibling projects, and must be flagged rather than answered from priors.

Always Read the per-module reference file before answering a question about a module. Do not infer signatures, parameter lists, or pseudo-variables from training data. If an identifier looks familiar but cannot be located in the reference set, ask the user for clarification rather than constructing an answer.

The reference detour is the deterministic act that grounds answers in version-correct content. Skipping it because "the answer seems obvious" is the most common path to fabrication. The reference files are the source of truth; training-data priors are not.

## When to use this skill

This skill should be the active one when:

- The user names a specific OpenSIPs module (`dialog`, `tm`, `rr`, `registrar`, `dispatcher`, `drouting`, `presence`, `sl`, `uac`, `auth_db`, `nathelper`, `acc`, `db_mysql`, `mid_registrar`, `permissions`, `rtpengine`, `usrloc`, etc.) and asks about its exports, parameters, dependencies, pseudo-variables, MI commands, statistics, or events.
- The user phrases the question as "what functions does X module export?", "show me the parameters for Y module", "what does function Z return?", "which module exports `t_relay`?", or "what pseudo-variables does the dialog module add?".
- The user pastes a config snippet that names a module and asks what a particular `modparam(...)` line does, or asks whether a function is available in the module they have loaded.
- The user wants the dependency graph for a module — which other modules must also be loaded for it to work.

This skill should defer to `opensips-routing` when:

- The user asks how to write a route block, structure an `opensips.cfg`, design a call flow, handle NAT traversal, or apply a transformation. Authoring is the routing skill's domain; this skill provides the reference data the routing skill consumes.
- The user asks about core script syntax — pseudo-variables defined by the core (not by a module), operators, statements, route types, async statements, transformations. Those live under `../opensips-routing/references/{version}/core/`, not in this skill's reference tree.

This skill should defer to `opensips-security-advisor` when:

- The user asks for a security review, audit, or hardening check on a configuration. The advisor reads this skill's reference files as needed; this skill does not run reviews itself.
- The user asks whether a module's default settings are safe, whether a particular `modparam(...)` value introduces a vulnerability, or whether a configuration is exposed to a named risk (toll fraud, registration hijacking, INVITE flooding, RTP relay exposure). The advisor owns those judgments; this skill only states what the parameter does and what its default is.

When in doubt about which sibling owns a question, default to providing reference data and naming the sibling skill. A prompt that mixes "what does function X do?" (this skill) with "should I use function X here?" (routing or advisor) is best answered by reading the per-module reference, surfacing the factual answer, and pointing at the sibling for the judgment call.

## How to use this skill

The per-module reference file under `references/{version}/modules/<slug>.md` is the authoritative source of truth for everything that module exports. Read it before answering. Do not infer module behavior from training-data priors; the priors are unreliable across the SER lineage and across OpenSIPs versions.

The path pattern is fixed:

- Per-module reference file: `references/{version}/modules/<slug>.md`. Substitute `{version}` at read time with the active OpenSIPs version (e.g., `3.6`). Substitute `<slug>` with the module name as it appears in the index below.
- Consolidated index: `references/{version}/consolidated.json`. A structured JSON index of every module, function, pseudo-variable, parameter, MI command, and statistic in the version, plus a `relationships.moduleDependencies` graph.

The consolidated index is the fastest path when the user references an identifier without naming a module:

- To find which module exports a function whose home module is unclear, Read `consolidated.json` and look up `indexes.functionsByName[<function>]` to find the source module, then Read that module's per-module reference file for the full signature.
- To find which module defines a pseudo-variable, look up `indexes.variablesByName[<variable>]`.
- To find which module exposes an MI command, look up `indexes.miCommandsByName[<command>]`.
- To list all parameters of a known module, look up `indexes.parametersByModule[<module>]`.
- To check what other modules a given module depends on, look up `relationships.moduleDependencies[<module>]`.

Two-step lookup is the canonical pattern: Read `consolidated.json` to locate the source, then Read the per-module file for full content. Do not skip the second Read — the consolidated index does not contain function descriptions, parameter narratives, or usage examples.

When a user prompt names multiple modules, Read each per-module reference file in turn rather than answering from a single read. Cross-module behavior (e.g., how `tm` interacts with `dialog`) is described in each module's reference file separately; the consolidated index links them through the dependencies graph but does not narrate the interaction.

### Worked lookup examples

Three concrete shapes the lookup takes in practice. Each ends with a per-module Read; the consolidated index alone is never the final answer.

- **User names a module directly.** Prompt: "What parameters does the dispatcher module expose?" Read `references/{version}/modules/dispatcher.md` and answer from the parameters section. No consolidated lookup needed.
- **User names a function but not a module.** Prompt: "What does `t_relay()` return?" Read `references/{version}/consolidated.json`, look up `indexes.functionsByName["t_relay"]` to find the source module (`tm`), then Read `references/{version}/modules/tm.md` for the full signature, return value, and side effects.
- **User names a pseudo-variable that may belong to a module.** Prompt: "Where does `$dlg_val(name)` come from?" Read `consolidated.json`, look up `indexes.variablesByName["$dlg_val"]` to find the owning module (`dialog`), then Read `references/{version}/modules/dialog.md` for the full pseudo-variable description and the functions that read or write it.
- **User names an MI command without naming a module.** Prompt: "What does the `dlg_list` MI command return?" Read `consolidated.json`, look up `indexes.miCommandsByName["dlg_list"]` to find the owning module, then Read that module's per-module file for the full argument list and return shape. Statistics and events follow the same shape but live under their module's per-file sections rather than in dedicated top-level indexes.
- **User asks about dependencies.** Prompt: "What does the `mid_registrar` module depend on?" Read `consolidated.json` and look up `relationships.moduleDependencies["mid_registrar"]` for the dependency edges, then Read `references/{version}/modules/mid_registrar.md` for the narrative explanation of why each dependency exists and which features they unlock.

If the consolidated lookup returns no match for an identifier the user clearly believes is real, the identifier is most likely from training-data priors that conflate the SER lineage. Do not construct an answer. Apply the procedure in "When a module is not in the index" below.

### Lookup discipline

The router-index pattern depends on Claude making the second hop. The most consequential failure mode for this skill is triggering on a module mention, reading the index entry to confirm the module exists, and then answering the user's substantive question from training-data priors instead of the per-module reference. The index entry is a routing signal, not an answer.

- **Wrong shape.** User asks for `dialog` module's exported functions. Claude reads the index, sees `dialog` listed, then writes a function list from priors without opening `dialog.md`. The answer may look plausible and may even be partially correct, but version-specific signatures and parameter orderings are not reliably reproducible from priors.
- **Right shape.** User asks for `dialog` module's exported functions. Claude reads the index to confirm the module slug, Reads `references/{version}/modules/dialog.md`, and answers from the file's exported-functions section, quoting signatures verbatim from the reference.

The same discipline applies when the user asks a follow-up. A second question about the same module is a second Read of the same file (or a re-quote from the previous Read in the same session); it is not an opportunity to fall back on priors because "we just looked at this module."

### What the per-module reference file contains

Each `references/{version}/modules/<slug>.md` is a generated reference covering one module's full surface area. The sections present in every per-module file are:

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

### Version-specific behavior

Module exports change between OpenSIPs versions. A function that exists in the active version may have had a different signature in a prior version, or may not have existed at all. Always Read the per-module reference file under the version directory the user is working in. Do not assume cross-version equivalence. If the user has not specified a version, ask before answering — the answer is genuinely different across versions, and a version-correct answer to the wrong version is still wrong.

## Module index

The table below maps every OpenSIPs module in the active reference set to its per-module reference file and a one-line statement of purpose. The table is generated from `consolidated.json` at build time and replaces the placeholder marker. Do not hand-edit it — edits will be overwritten on the next build, and the underlying source of truth is the upstream extraction. If a module appears wrong in the table, the fix belongs upstream in the extraction project, not here.

The table covers the modules available in the build's primary version. Module sets differ between versions: a module listed here may not exist in older versions, and a module that existed in older versions may have been removed or renamed. Always confirm the active version with the user when the answer depends on it, and Read `references/{version}/consolidated.json` for the active version's authoritative module list.

<!-- MODULE_INDEX:BEGIN -->
| Module | Purpose | Reference file |
|---|---|---|
| `Script Helper Module` | The purpose of the **Script Helper module** is to simplify the scripting proces… | `references/{version}/modules/Script Helper Module.md` |
| `aaa_diameter` | This module provides an RFC 6733 Diameter peer implementation, being able to ac… | `references/{version}/modules/aaa_diameter.md` |
| `aaa_radius` | This module provides a Radius implementation for the AAA API from the core | `references/{version}/modules/aaa_radius.md` |
| `acc` | The ACC module is used to account transaction information to different backends… | `references/{version}/modules/acc.md` |
| `aka_av_diameter` | This module is an extension to the _AKA_AUTH_ module providing a Diameter AKA A… | `references/{version}/modules/aka_av_diameter.md` |
| `alias_db` | ALIAS_DB module can be used as an alternative for user aliases via usrloc | `references/{version}/modules/alias_db.md` |
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
| `cachedb_dynamodb` | This module is an implementation of a cachedb system designed to work with Amaz… | `references/{version}/modules/cachedb_dynamodb.md` |
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
| `clusterer` | The _clusterer_ module is used to organize multiple OpenSIPS instances into gro… | `references/{version}/modules/clusterer.md` |
| `compression` | This module implements message compression/decompression and base64 encoding fo… | `references/{version}/modules/compression.md` |
| `config` | The _config_ module enables dynamic, runtime configuration of OpenSIPS paramete… | `references/{version}/modules/config.md` |
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
| `dialog` | The dialog module provides dialog awareness to the OpenSIPS proxy | `references/{version}/modules/dialog.md` |
| `dialplan` | This module implements generic string translations based on matching and replac… | `references/{version}/modules/dialplan.md` |
| `dispatcher` | This modules implements a dispatcher for destination addresses | `references/{version}/modules/dispatcher.md` |
| `diversion` | The module implements the Diversion extensions as per draft-levy-sip-diversion-… | `references/{version}/modules/diversion.md` |
| `dns_cache` | This module is an implementation of a cache system designed for DNS records | `references/{version}/modules/dns_cache.md` |
| `domain` | Domain module implements checks that based on domain table determine if a host… | `references/{version}/modules/domain.md` |
| `domainpolicy` | The Domain Policy module implements draft-lendl-domain-policy-ddds-02 in combin… | `references/{version}/modules/domainpolicy.md` |
| `drouting` | Dynamic Routing is a module for selecting (based on multiple criteria) the best… | `references/{version}/modules/drouting.md` |
| `emergency` | The emergency module provides emergency call treatment for OpenSIPS, following… | `references/{version}/modules/emergency.md` |
| `enum` | Enum module implements [i_]enum_query functions that make an enum query based o… | `references/{version}/modules/enum.md` |
| `event_datagram` | This is a module which provides a UNIX/UDP SOCKET transport layer implementatio… | `references/{version}/modules/event_datagram.md` |
| `event_flatstore` | The _event_flatstore_ module provides a logging facility for different events,… | `references/{version}/modules/event_flatstore.md` |
| `event_kafka` | This module is an implementation of an [Apache Kafka](https://kafka.apache.org/… | `references/{version}/modules/event_kafka.md` |
| `event_rabbitmq` | _RabbitMQ_ (http://www.rabbitmq.com/) is an open source messaging server | `references/{version}/modules/event_rabbitmq.md` |
| `event_route` | This module provides a simple way for capturing and handling directly in the Op… | `references/{version}/modules/event_route.md` |
| `event_routing` | The Event (based) Routing module, or shortly the EBR module, provides a mechani… | `references/{version}/modules/event_routing.md` |
| `event_sqs` | The event_sqs module is an implementation of an Amazon SQS producer | `references/{version}/modules/event_sqs.md` |
| `event_stream` | This module provides a TCP transport layer implementation for the Event Interfa… | `references/{version}/modules/event_stream.md` |
| `event_virtual` | The _event_virtual_ module provides the possibility to have multiple external a… | `references/{version}/modules/event_virtual.md` |
| `event_xmlrpc` | This module is an implementation of an XMLRPC client used to notify XMLRPC serv… | `references/{version}/modules/event_xmlrpc.md` |
| `exec` | The Exec module enables the execution of external commands from the OpenSIPS sc… | `references/{version}/modules/exec.md` |
| `fraud_detection` | This module provides a way to prevent some basic fraud attacks | `references/{version}/modules/fraud_detection.md` |
| `freeswitch` | The _"freeswitch"_ module is a C driver for the FreeSWITCH Event Socket Layer i… | `references/{version}/modules/freeswitch.md` |
| `freeswitch_scripting` | _freeswitch_scripting_ is a helper module that exposes full control over the Fr… | `references/{version}/modules/freeswitch_scripting.md` |
| `gflags` | gflags module (global flags) keeps a bitmap of flags in shared memory and may b… | `references/{version}/modules/gflags.md` |
| `group` | This module provides functionalities for different methods of group membership… | `references/{version}/modules/group.md` |
| `h350` | The OpenSIPS H350 module enables an OpenSIPS SIP proxy server to access SIP acc… | `references/{version}/modules/h350.md` |
| `http2d` | This module provides an RFC 7540/9113 HTTP/2 server implementation with "h2" AL… | `references/{version}/modules/http2d.md` |
| `httpd` | This module provides an HTTP transport layer for OpenSIPS | `references/{version}/modules/httpd.md` |
| `identity` | This module adds support for SIP Identity (see RFC 4474) | `references/{version}/modules/identity.md` |
| `imc` | This module offers support for instant message conference | `references/{version}/modules/imc.md` |
| `jabber` | This is new version of Jabber module that integrates XODE XML parser for parsin… | `references/{version}/modules/jabber.md` |
| `janus` | The _"janus"_ module is a C driver for the Janus websocket protocol | `references/{version}/modules/janus.md` |
| `json` | This module introduces a new type of variable that provides both serialization… | `references/{version}/modules/json.md` |
| `jsonrpc` | This module is an implementation of an JSON-RPC v2.0 client http://www.jsonrpc.… | `references/{version}/modules/jsonrpc.md` |
| `launch_darkly` | This module implements support for the [Launch Darkly](https://launchdarkly.com… | `references/{version}/modules/launch_darkly.md` |
| `ldap` | The LDAP module implements an LDAP search interface for OpenSIPS | `references/{version}/modules/ldap.md` |
| `load_balancer` | The Load-Balancer module comes to provide traffic routing based on load | `references/{version}/modules/load_balancer.md` |
| `lua` | The time needed when writing a new OpenSIPS module unfortunately is quite high,… | `references/{version}/modules/lua.md` |
| `mangler` | This is a module to help with SDP mangling | `references/{version}/modules/mangler.md` |
| `mathops` | The mathops module provides a series of functions which enable various floating… | `references/{version}/modules/mathops.md` |
| `maxfwd` | The module implements all the operations regarding MaX-Forward header field, li… | `references/{version}/modules/maxfwd.md` |
| `media_exchange` | This module provides the means to exchange media SDP between different SIP prox… | `references/{version}/modules/media_exchange.md` |
| `mediaproxy` | Mediaproxy is an OpenSIPS module that is designed to allow automatic NAT traver… | `references/{version}/modules/mediaproxy.md` |
| `mi_datagram` | This is a module which provides a UNIX/UDP SOCKET transport layer implementatio… | `references/{version}/modules/mi_datagram.md` |
| `mi_fifo` | This is a module which provides a FIFO transport layer implementation for Manag… | `references/{version}/modules/mi_fifo.md` |
| `mi_html` | This module provides a minimal web user interface for the OpenSIPS's Management… | `references/{version}/modules/mi_html.md` |
| `mi_http` | This module provides a HTTP transport layer implementation for OpenSIPS's Manag… | `references/{version}/modules/mi_http.md` |
| `mi_script` | This module provides multiple hooks to run Management Interface commands direct… | `references/{version}/modules/mi_script.md` |
| `mi_xmlrpc_ng` | This module implements a xmlrpc server that handles xmlrpc requests and generat… | `references/{version}/modules/mi_xmlrpc_ng.md` |
| `mid_registrar` | The mid_registrar is a mid-component of a SIP platform, designed to work betwee… | `references/{version}/modules/mid_registrar.md` |
| `mmgeoip` | This module is a lightweight wrapper for the MaxMind GeoIP API | `references/{version}/modules/mmgeoip.md` |
| `mqueue` | The mqueue module offers a generic message queue system in shared memory for in… | `references/{version}/modules/mqueue.md` |
| `msilo` | This modules provides offline message storage for the Open SIP Server | `references/{version}/modules/msilo.md` |
| `msrp_gateway` | This module implements a Gateway for translating between Page Mode (SIP MESSAGE… | `references/{version}/modules/msrp_gateway.md` |
| `msrp_relay` | This modules implements a Relay for the MSRP protocol, according to the specifi… | `references/{version}/modules/msrp_relay.md` |
| `msrp_ua` | This module implements an User Agent capable of establishing messaging sessions… | `references/{version}/modules/msrp_ua.md` |
| `nat_traversal` | The nat_traversal module provides support for handling far-end NAT traversal fo… | `references/{version}/modules/nat_traversal.md` |
| `nathelper` | This is a module to help with NAT traversal | `references/{version}/modules/nathelper.md` |
| `options` | This module provides a function to answer OPTIONS requests which are directed t… | `references/{version}/modules/options.md` |
| `osp` | The OSP module enables OpenSIPS to support secure, multi-lateral peering using… | `references/{version}/modules/osp.md` |
| `path` | This module is designed to be used at intermediate sip proxies like loadbalance… | `references/{version}/modules/path.md` |
| `peering` | Peering module allows SIP providers (operators or organizations) to verify from… | `references/{version}/modules/peering.md` |
| `perl` | The time needed when writing a new OpenSIPS module unfortunately is quite high,… | `references/{version}/modules/perl.md` |
| `permissions` | The module can be used to determine if a call has appropriate permission to be… | `references/{version}/modules/permissions.md` |
| `pi_http` | This module provides an HTTP provisioning interface for OpenSIPS | `references/{version}/modules/pi_http.md` |
| `pike` | The module provides a simple mechanism for DOS protection - DOS based on floods… | `references/{version}/modules/pike.md` |
| `presence` | The modules handles PUBLISH and SUBSCRIBE messages and generates NOTIFY message… | `references/{version}/modules/presence.md` |
| `presence_callinfo` | This module provides OpenSIPS support for shared call appearances (SCA) as defi… | `references/{version}/modules/presence_callinfo.md` |
| `presence_dfks` | The module enables the handling of the "as-feature-event" event package (as def… | `references/{version}/modules/presence_dfks.md` |
| `presence_dialoginfo` | The module enables the handling of "Event: dialog" (as defined in RFC 4235) ins… | `references/{version}/modules/presence_dialoginfo.md` |
| `presence_mwi` | The module does specific handling for notify-subscribe message-summary (message… | `references/{version}/modules/presence_mwi.md` |
| `presence_reginfo` | The module enables the handling of "Event: reg" (as defined in RFC 3680) inside… | `references/{version}/modules/presence_reginfo.md` |
| `presence_xcapdiff` | The presence_xcapdiff is an OpenSIPS module that adds support for the "xcap-dif… | `references/{version}/modules/presence_xcapdiff.md` |
| `presence_xml` | The module does specific handling for notify-subscribe events using xml bodies | `references/{version}/modules/presence_xml.md` |
| `prometheus` | This module provides a HTTP interface for the [Prometheus](https://prometheus.i… | `references/{version}/modules/prometheus.md` |
| `proto_bin` | The **proto_bin** module is a transport module which implements Binary Interfac… | `references/{version}/modules/proto_bin.md` |
| `proto_bins` | This module implements a secure Binary communication protocol over TLS, to be u… | `references/{version}/modules/proto_bins.md` |
| `proto_hep` | The **proto_hep** module is a transport module which implements hepV1 and hepV2… | `references/{version}/modules/proto_hep.md` |
| `proto_ipsec` | The **proto_ipsec** module provides IPSec sockets for establishing secure commu… | `references/{version}/modules/proto_ipsec.md` |
| `proto_msrp` | The **proto_msrp** module provides the MSRP protocol stack, meaning the network… | `references/{version}/modules/proto_msrp.md` |
| `proto_sctp` | The proto_sctp module is an optional transport module (shared library) which ex… | `references/{version}/modules/proto_sctp.md` |
| `proto_smpp` | This module offers interoperability between SIP and SMPP (Short Message Peer-to… | `references/{version}/modules/proto_smpp.md` |
| `proto_tcp` | The **proto_tcp** module is a built-in transport module which implements SIP TC… | `references/{version}/modules/proto_tcp.md` |
| `proto_tls` | TLS, as defined in SIP RFC 3261, is a mandatory feature for proxies and can be… | `references/{version}/modules/proto_tls.md` |
| `proto_udp` | The **proto_udp** module is a built-in transport module which exports the requi… | `references/{version}/modules/proto_udp.md` |
| `proto_ws` | The WebSocket protocol ([RFC 6455](http://tools.ietf.org/html/rfc6455)) provide… | `references/{version}/modules/proto_ws.md` |
| `proto_wss` | The WSS (Secure WebSocket) module provides the ability to communicate with a We… | `references/{version}/modules/proto_wss.md` |
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
| `rabbitmq` | _RabbitMQ_ ([http://www.rabbitmq.com/](http://www.rabbitmq.com/)) is an open so… | `references/{version}/modules/rabbitmq.md` |
| `rabbitmq_consumer` | RabbitMQ Consumer (http://www.rabbitmq.com/) is an open source messaging server | `references/{version}/modules/rabbitmq_consumer.md` |
| `rate_cacher` | The _rate_cacher_ module provides a means of caching and real-time querying of… | `references/{version}/modules/rate_cacher.md` |
| `ratelimit` | This module implements rate limiting for SIP requests | `references/{version}/modules/ratelimit.md` |
| `regex` | This module offers matching operations against regular expressions using the po… | `references/{version}/modules/regex.md` |
| `registrar` | The module contains SIP REGISTER request processing logic, per RFC 3261 | `references/{version}/modules/registrar.md` |
| `rest_client` | The _rest_client_ module provides a means of interacting with an HTTP server by… | `references/{version}/modules/rest_client.md` |
| `rls` | The modules is a Resource List Server implementation following the specificatio… | `references/{version}/modules/rls.md` |
| `rr` | The module contains record routing logic | `references/{version}/modules/rr.md` |
| `rtp.io` | The RTP.io module provides an integrated solution for handling RTP traffic with… | `references/{version}/modules/rtp.io.md` |
| `rtp_relay` | The purpose of this module is to simplify the usage of different RTP Relays Ser… | `references/{version}/modules/rtp_relay.md` |
| `rtpengine` | This is a module that enables media streams to be proxied via an RTP proxy | `references/{version}/modules/rtpengine.md` |
| `rtpproxy` | This module is used by OpenSIPS to communicate with RTPProxy, a media relay pro… | `references/{version}/modules/rtpproxy.md` |
| `signaling` | The SIGNALING module comes as a wrapper over tm and sl modules and offers one f… | `references/{version}/modules/signaling.md` |
| `sip_i` | This module offers the possibility of processing ISDN User Part(ISUP) messages… | `references/{version}/modules/sip_i.md` |
| `sipcapture` | Offer a possibility to store incoming/outgoing SIP messages in database | `references/{version}/modules/sipcapture.md` |
| `sipmsgops` | The module implements SIP based operations over the messages processed by OpenS… | `references/{version}/modules/sipmsgops.md` |
| `siprec` | This module provides the means to do calls recording using an external recorder… | `references/{version}/modules/siprec.md` |
| `sl` | The SL module allows OpenSIPS to act as a stateless UA server and generate repl… | `references/{version}/modules/sl.md` |
| `sngtc` | The Sangoma transcoding module offers the possibility of performing voice trans… | `references/{version}/modules/sngtc.md` |
| `snmpstats` | The SNMPStats module provides an SNMP management interface to OpenSIPS | `references/{version}/modules/snmpstats.md` |
| `sockets_mgm` | This module provides the means to provision and manage dynamic sockets for Open… | `references/{version}/modules/sockets_mgm.md` |
| `speeddial` | This module provides on-server speed dial facilities | `references/{version}/modules/speeddial.md` |
| `sql_cacher` | The sql_cacher module introduces the possibility to cache data from a SQL-based… | `references/{version}/modules/sql_cacher.md` |
| `sqlops` | SQLops (SQL-operations) modules implements a set of script functions for generi… | `references/{version}/modules/sqlops.md` |
| `sst` | The sst module provides a way to update the dialog expire timer based on the SI… | `references/{version}/modules/sst.md` |
| `statistics` | The Statistics module is a wrapper over the internal statistics manager, allowi… | `references/{version}/modules/statistics.md` |
| `status_report` | The Status/Report module is a wrapper over the internal status/report framework… | `references/{version}/modules/status_report.md` |
| `stir_shaken` | This module adds support for implementing STIR/SHAKEN (RFC 8224, RFC 8588) Auth… | `references/{version}/modules/stir_shaken.md` |
| `stun` | A stun server working with the same port as SIP (5060) in order to gain accurat… | `references/{version}/modules/stun.md` |
| `tcp_mgm` | This module provides optional, SQL-based support for fine-grained management of… | `references/{version}/modules/tcp_mgm.md` |
| `textops` | The module implements text based operations over the SIP message processed by O… | `references/{version}/modules/textops.md` |
| `tls_mgm` | This module is a management module for TLS certificates and parameters | `references/{version}/modules/tls_mgm.md` |
| `tls_openssl` | This module implements TLS operations using the openSSL libarary | `references/{version}/modules/tls_openssl.md` |
| `tls_wolfssl` | This module implements TLS operations using the wolfSSL libarary | `references/{version}/modules/tls_wolfssl.md` |
| `tm` | TM module enables stateful processing of SIP transactions | `references/{version}/modules/tm.md` |
| `topology_hiding` | This is a module which provides topology hiding capabilities | `references/{version}/modules/topology_hiding.md` |
| `tracer` | Offer a possibility to store incoming/outgoing SIP messages in database | `references/{version}/modules/tracer.md` |
| `trie` | Trie is a module for efficiently caching and lookup of a set of prefixes ( stor… | `references/{version}/modules/trie.md` |
| `uac` | UAC (User Agent Client) module provides some basic UAC functionalities like FRO… | `references/{version}/modules/uac.md` |
| `uac_auth` | UAC AUTH (User Agent Client Authentication) module provides a common API for bu… | `references/{version}/modules/uac_auth.md` |
| `uac_redirect` | UAC REDIRECT - User Agent Client redirection - module enhance OpenSIPS with the… | `references/{version}/modules/uac_redirect.md` |
| `uac_registrant` | The module enable OpenSIPS to register itself on a remote SIP registrar | `references/{version}/modules/uac_registrant.md` |
| `userblacklist` | The userblacklist module allows OpenSIPS to handle blacklists on a per user bas… | `references/{version}/modules/userblacklist.md` |
| `usrloc` | A SIP user location implementation | `references/{version}/modules/usrloc.md` |
| `uuid` | This module provides a way to generate universally unique identifiers (UUID) as… | `references/{version}/modules/uuid.md` |
| `xcap` | The module contains several parameters and functions common to all modules usin… | `references/{version}/modules/xcap.md` |
| `xcap_client` | The modules is an XCAP client for OpenSIPS that can be used by other modules | `references/{version}/modules/xcap_client.md` |
| `xml` | This module exposes a script variable that provides basic parsing and manipulat… | `references/{version}/modules/xml.md` |
| `xmpp` | This modules is a gateway between OpenSIPS and a jabber server | `references/{version}/modules/xmpp.md` |
<!-- MODULE_INDEX:END -->

## When a module is not in the index

If a user names a module that does not appear in the index above:

1. **Check for typos.** Compare the user's spelling against the index. Common slips: hyphen vs. underscore (`mid-registrar` vs `mid_registrar`), missing or extra `_db` / `_mysql` / `_postgres` suffixes, plural vs. singular (`registrars` vs `registrar`), pluralized verb forms.
2. **Check the consolidated index.** Read `references/{version}/consolidated.json` and search for the name across `indexes.functionsByName`, `indexes.variablesByName`, `indexes.miCommandsByName`, and `indexes.parametersByModule`. A module that has been renamed in a recent version, or that the user is referring to by a function it exports rather than by its module name, may surface here even when the module-name table does not list it.
3. **Check the other version's index.** If the user is working with a version different from the one in `{version}`, the module may exist there. Confirm the version explicitly and switch the lookup.
4. **Ask the user.** If none of the above resolves the name, ask. Do not invent module names, function signatures, parameters, pseudo-variables, MI commands, or statistics. Do not guess at a "probably correct" answer based on training-data priors — those priors mix identifiers across the SER lineage and across OpenSIPs versions and are unreliable.

If a module is not in the index and not in the `consolidated.json`, treat it as unknown and ask for clarification before answering. The cost of one clarifying turn is small; the cost of a fabricated identifier landing in a user's production configuration is large because the failure mode is silent — the config loads, the proxy starts, and a call path silently misbehaves.

The same procedure applies to functions, pseudo-variables, MI commands, statistics, and events that the user names without naming a module. If the consolidated index has no record of the identifier across `indexes.functionsByName`, `indexes.variablesByName`, `indexes.miCommandsByName`, and the per-module statistics or events sections, the identifier is unknown to this version's reference set. Ask the user to confirm the identifier and the version; do not improvise.

A particular failure mode worth naming: an identifier that "feels right" because it follows a familiar naming convention (`pv_<thing>`, `<module>_send`, `<module>_check`) is not evidence that the identifier exists. Naming conventions are widely shared across the SER lineage, and the priors are confidently wrong about which conventions belong to which project's current releases. When the consolidated index disagrees with priors, the index wins.

## References

This skill consults the following files:

- Read `references/{version}/modules/<module>.md` for a module's full surface area: parameters, exported functions, pseudo-variables, MI commands, statistics, events, dependencies, usage notes, and version history.
- Read `references/{version}/consolidated.json` for fast cross-module lookup when the source module of an identifier is not yet known.
- Read `../opensips-routing/references/{version}/ser-lineage-notes.md` whenever an unfamiliar identifier appears that might be from a sibling SER-lineage project. The notes explain the operational rule and the common confusion patterns.
- Read `../opensips-routing/references/{version}/core/*.md` only as a cross-reference when a question spans both a module's exports and core script syntax. Core syntax is the routing skill's domain; this skill does not own those files but may direct attention to them.

All paths use `{version}` as a placeholder. Substitute it at read time with the active OpenSIPs version (e.g., `3.5`, `3.6`). Do not pre-resolve the placeholder; the SKILL.md body itself is version-agnostic and the same body content services every version the plugin supports.

Reference paths are one hop from this file. The body names a reference; Claude Reads it directly. Reference files do not chain — a per-module file does not point at another reference file expecting Claude to follow further. If a question requires content from multiple reference files, Read each one explicitly rather than relying on the per-module file to surface its dependencies.

## Working with sibling skills

This skill is one of three coordinated skills:

- `opensips-routing` — authors and edits OpenSIPs SIP server configuration scripts. The hub for procedural authoring guidance.
- `opensips-modules` — provides authoritative per-module reference data (this skill). The reference library.
- `opensips-security-advisor` — reviews OpenSIPs configurations for security issues. The audit workflow.

The three skills are designed to load together. A prompt that touches multiple concerns ("review the dispatcher config for security issues, and what failure_route hooks does the dispatcher module expose?") will trigger more than one skill, and each contributes its specialty: this skill supplies the module reference data, the routing skill handles authoring, the advisor handles the review. Each skill stays within its own domain and defers to siblings rather than duplicating their work. If a question pushes outside this skill's scope — into authoring, into security review, into core script syntax — Read the relevant sibling's references rather than answering from priors.
