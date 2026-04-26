# call_center Module Reference
<!-- generated-from: data/3.4/modules/call_center.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 call_center module. Read this file when configuring or debugging the call_center module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The Call Center module implements an inbound call center system with call flows (for queuing the received calls) and agents (for answering the calls).

The module implements the queuing system, the call distribution to agents, agents managements, CDRs for the calls, statistics on call distribution and agent's activity - basically everything except the media playback (for the queue). This part must be provided via a third party media server (FreeSwitch, Asterisk or others).

This is actually a Contact Center and it is able to handle both RTP/audio calls and (multiple) MSRP/chat calls, in the same time.

The module provides an internal buit-in dispatching logic (for sending the calls/chats to the agents), but also offers the possibility to use an external logic to do the dispatching (see [cc_dispatch_call_to_agent](#mi_cc_dispatch_call_to_agent "1.7.7. cc_dispatch_call_to_agent") MI command).

## How It Works

The main entities in the modules are the flows (queues) and agents.

### 1.2.1.DB tables

Each entity has a corresponding table in the database, for provisioning purposes - the _cc_flows_ and _cc_agents_ tables, see [DB schema](https://opensips.org/Documentation/Install-DBSchema--3-3#AEN2656). Data is loaded at startup and cached into memory ; runtime reload is possible via the MI commands (see the _cc_reload_ command in [Exported MI Functions](#exported_mi_functions "1.7.Exported MI Functions")).

Additionally there is a table _cc_cdrs_ for writing the CDRs - this operation is done in realtime, after the call in completed, covering all possible cases: call was dropped while in queue, call was rejected by agent, call was accepted by agent, call terminated with error - NOTE that a call may generate more than one CDR (like call rejected by agent A, and redistributed and accepted by agent B).

The _cc_calls_ table is used to store ongoing calls, regardless it's state (in queue, to the agent, ended). It is populated at runtime by the module and queried at startup. This table should not be manually provisioned.

### 1.2.2.Call Flows

A flow is defined by a unique alphanumerical ID - the main attribute of a flow is the _skill_ - the skill is a capability required by the flow for an agent to be able to answer the call ; the concept of _skills_ is the link between the flows and the agents - telling what agents are serving what flows - the flows require a skill, while the agents provide a set of skills. Agents matching the required skill of a flow will automatically receive calls from that flow.

Additional, the flow has a _priority_ - as agents may server multiple flows in the same time (based on skills), you can define priorities between the flows - if the flows has a higher priority, its calls will be pushed (in deliver to agents and queuing) in front of the calls from flows with a lower priority.

Configurable per flow, the module may do per-flow call dissuading; this means to redirect a call to another destination, if the queue/flow is overloaded:

*   if the number of calls already in the queue exceeds the diss_qsize_th threshold
    
*   if the estimated time to wait of the queue exceeds the diss_ewt_th threshold
    
*   if the call was waiting in the queue for longer than diss_onhold_th threshold

Optionally, the flow may define a _prependcid_ - a prefix to be added to the CLI (Caller ID) when the call is delivered to the agents - as an agent may receive call from multiple flows, it is important for the user to see which was the queue a call was received.

In terms of media announcements, the flow defines the _message_welcome_ (optional, to be played in the call, before doing anything with the call) and _message_queue_ (mandatory, the looping message providing infinite on hold media IMPORTANT - this message must cycle and media server must never hung up on it. Both announcements are provided as SIP URIs (where the call has to be sent in order to get the playback).

The flow also has an optional _max_wrapup time_, which acts as an upper limit for the per-agent/global value (the flow forces a ceiling of the wrapup value for all its calls).

### 1.2.3.Agents

An agent is defined by a unique alphanumerical ID - the main attribute of an agent is its the set of _skills_. This set of skills will tell what calls to be received (from which flows, based on the skill matching).

The agent may provide support for different optional media types, like RTP/audio or MSRP/chat. Each supported media type comes with the maximum supported number of sessions. Of course, for audio the `1` value is hardocded. On the SIP side, each media type comes with a _locations_. The location is a SIP URI where to calls must be sent in order to be answered by the agent. At least one media type should be defined. To specify which media the agent support, just define the corresponding SIP location in his profile.

So, at a certain time, an agent may handle either a single call, either several chat sessions.

Additionally, the agent has a initial _logstate_ - if he is logged in or not (being logged in is a must in order to receive calls). The log state may be changed at runtime via a dedicated MI command _cc_agent_login_, see [Exported MI Functions](#exported_mi_functions "1.7.Exported MI Functions").

There is an optional per-agent _wrapup_time_ defined, saying the time interval for an agent before getting a new call from the system (after he finished a call). If no value is defined for the agent, the global _wrapup_time_ will be used. Note that the resulting value may be upper limited by the per-flow _max_wrapup_time_ if defined.

## Dependencies

### OpenSIPs Modules

- `b2b_logic` — B2bUA module
- `database` — one of the SQL DB modules

### External Libraries

None.

## Exported Parameters

### `acc_db_url` (string)

SQL address to the DB server -- database specific. This must be the Database where the CDRs table (cc_cdrs) is located.

*Default value is If not explicitly set, the global OpenSIPS DB URL will be used..*

**Example.** mysql://opensips:opensipsrw@localhost/opensips_cdrs.

```opensips
modparam("call_center", "acc_db_url", 
	"mysql://opensips:opensipsrw@localhost/opensips_cdrs")
```
### `b2b_logic_ctx_param` (string)

The name of the _$b2b_logic.ctx_ variable that can be used to retrieve the value of the parameter passed to the cc_handle_call function.

This parameter will be copied throughout all the B2B scenarios started by the call_center module. NOTE that you can change the value of the current scenario by writing into it, but the change will not be reflected in a different scenario.

*Default value is call_center.*

**Example.** b2b_callid.

```opensips
...
modparam("call_center", "b2b_logic_ctx_param", "b2b_callid")
...
route\[handle_call_center\] {
    ...
    cc_handle_call("flow", $ci);
    ...
}
...
route\[b2b_handle_request\] {
    ...
    xlog("Initial Callid is $b2b_logic.ctx(b2b_callid)\\n");
    ...
}
```
### `cc_agents_table` (string)

Name to be used for the table holding the agents.

*Default value is cc_agents.*

**Example.** my_agents.

```opensips
...
modparam("call_center", "cc_agents_table", "my_agents")
...
```
### `cc_flows_table` (string)

Name to be used for the table holding the definition of the flows/queues.

*Default value is cc_flows.*

**Example.** queues.

```opensips
...
modparam("call_center", "cc_flows_table", "queues")
...
```
### `cca_agentid_column` (string)

Name to be used for the "agent id" (unique DB id) column in the agents table.

*Default value is agentid.*

**Example.** cid.

```opensips
...
modparam("call_center", "cca_agentid_column", "cid")
...
```
### `cca_location_column` (string)

Name to be used for the calling/audio "location" (SIP URI) column in the agents table.

*Default value is location.*

**Example.** Set the `cca_location_column` parameter.

```opensips
...
modparam("call_center", "cca_location_column", "sip_uri")
...
```
### `cca_logstate_column` (string)

Name to be used for the "logstate" (original login state) column in the agents table.

*Default value is logstate.*

**Example.** Set the `cca_logstate_column` parameter.

```opensips
...
modparam("call_center", "cca_logstate_column", "log_state")
...
```
### `cca_msrp_location_column` (string)

Name to be used for the msrp/chat "location" (SIP URI) column in the agents table.

*Default value is msrp_location.*

**Example.** Set the `cca_msrp_location_column` parameter.

```opensips
...
modparam("call_center", "cca_msrp_location_column", "sip_uri")
...
```
### `cca_msrp_max_sessions_column` (string)

Name to be used for the column (in the agents table) holding the maximum number of chat sessions that can be handled by the agent.

*Default value is msrp_max_sessions.*

**Example.** Set the `cca_msrp_max_sessions_column` parameter.

```opensips
...
modparam("call_center", "cca_msrp_max_sessions_column", "max_chats")
...
```
### `cca_skills_column` (string)

Name to be used for the "skills" (list of skills) column in the agents table.

*Default value is skills.*

**Example.** Set the `cca_skills_column` parameter.

```opensips
...
modparam("call_center", "cca_skills_column", "skills")
...
```
### `cca_wrapupend_column` (string)

Name to be used for the "wrapupend" (timestamp when the wrapup ends) column in the agents table.

*Default value is wrapup_end_time.*

**Example.** wrapup_ends.

```opensips
...
modparam("call_center", "cca_wrapupend_column", "wrapup_ends")
...
```
### `cca_wrapuptime_column` (string)

Name to be used for the "wrapuptime" (per-agent wrapup time) column in the agents table.

*Default value is wrapup_time.*

**Example.** wtime.

```opensips
...
modparam("call_center", "cca_wrapuptime_column", "wtime")
...
```
### `ccf_cid_column` (string)

Name to be used for the "caller ID prefix" column in the flows table.

*Default value is prependcid.*

**Example.** queue_cli_prefix.

```opensips
modparam("call_center", "ccf_cid_column", "queue_cli_prefix")
```
### `ccf_dissuading_ewt_th_column` (string)

Name to be used for the "EWT dissuading threshold" column in the flows table.

*Default value is dissuading_ewt_th.*

**Example.** th_diss_ewt.

```opensips
modparam("call_center", "ccf_dissuading_ewt_th_column", "th_diss_ewt")
```
### `ccf_dissuading_hangup_column` (string)

Name to be used for the "hangup after dissuading" column in the flows table.

*Default value is dissuading_hangup.*

**Example.** hangup_on_dissuading.

```opensips
modparam("call_center", "ccf_dissuading_hangup_column", "hangup_on_dissuading")
```
### `ccf_dissuading_onhold_th_column` (string)

Name to be used for the "on-hold dissuading threshold" column in the flows table.

*Default value is dissuading_onhold_th.*

**Example.** th_diss_onhold.

```opensips
modparam("call_center", "ccf_dissuading_onhold_th_column", "th_diss_onhold")
```
### `ccf_dissuading_qsize_th_column` (string)

Name to be used for the "queue size dissuading threshold" column in the flows table.

*Default value is dissuading_qsize_th.*

**Example.** th_diss_qsize.

```opensips
modparam("call_center", "ccf_dissuading_qsize_th_column", "th_diss_qsize")
```
### `ccf_flowid_column` (string)

Name to be used for the "flow id" (unique DB id) column in the flows table.

*Default value is flowid.*

**Example.** queue_id.

```opensips
...
modparam("call_center", "ccf_flowid_column", "queue_id")
...
```
### `ccf_m_dissuading_column` (string)

Name to be used for the "audio message on dissuading" column in the flows table.

*Default value is message_dissuading.*

**Example.** audio_dissuading.

```opensips
modparam("call_center", "ccf_m_dissuading_column", "audio_dissuading")
```
### `ccf_m_flow_id_column` (string)

Name to be used for the "audio message on identifying the flow" column in the flows table.

*Default value is message_flow_id.*

**Example.** audio_flow_id.

```opensips
...
modparam("call_center", "ccf_m_flow_id_column", "audio_flow_id")
...
```
### `ccf_m_queue_column` (string)

Name to be used for the "audio message on queueing" column in the flows table.

*Default value is message_queue.*

**Example.** audio_queue.

```opensips
modparam("call_center", "ccf_m_queue_column", "audio_queue")
```
### `ccf_m_welcome_column` (string)

Name to be used for the "audio message on welcome" column in the flows table.

*Default value is message_welcome.*

**Example.** audio_welcome.

```opensips
modparam("call_center", "ccf_m_welcome_column", "audio_welcome")
```
### `ccf_max_wrapup_column` (string)

Name to be used for the "max limit for wrapup time" column in the flows table.

*Default value is max_wrapup_time.*

**Example.** queue_wrapup.

```opensips
modparam("call_center", "ccf_max_wrapup_column", "queue_wrapup")
```
### `ccf_priority_column` (string)

Name to be used for the "priority" column in the flows table.

*Default value is priority.*

**Example.** queue_prio.

```opensips
...
modparam("call_center", "ccf_priority_column", "queue_prio")
...
```
### `ccf_skill_column` (string)

Name to be used for the "skill" column in the flows table.

*Default value is skill.*

**Example.** queue_skill.

```opensips
modparam("call_center", "ccf_skill_column", "queue_skill")
```
### `chat_dispatch_policy` (string)

A parameter to tell what should be the policy on dispatching the chat/MSRP sessions to the agents, considering that an agent may handle multiple such sessions/chats in the same time. Options are: balancing - the distribution will try to be even across the agents, but by doing this you may end up waisting chat sessions on agents and call starvation - agents are partially used by chat sessions, so they cannot take calls (of course, if you have mixed agetns with audio/chat); full-load - the distribution will try to make usage of an agent in the best possible way when comes to chat sessions - once the agent take a chat, all the following chats will be assigned ot him - the idea is to try to be efficient in using the resource/sessions of an agents, to leave as much room as possible for calls. Of course, this may lead to an un-even loading of chat agents - some will be full, others empty.

*Default value is balancing.*

**Possible values:**

- balancing
- full-load

**Example.** balancing.

```opensips
...
modparam("call_center", "chat_dispatch_policy", "balancing")
...
```
### `db_url` (string)

SQL address to the DB server -- database specific. This must be the Database holding the provisioning tables (cc_flows, cc_agents and cc_calls tables).

*Default value is If not explicitly set, the global OpenSIPS DB URL will be used..*

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("call_center", "db_url", 
	"mysql://opensips:opensipsrw@localhost/opensips")
```
### `internal_call_dispatching` (integer)

A parameter to tell if the internal/buit-in call dispatching to agent should be used or not. If enabled, the module will automatically dispatch (by itself) the queued/incoming calls to the available agents. If disabled, the module will not do such dispaching by itself and it is expected to use the cc_dispatch_call_to_agent MI command to dispatch the queued calls to agents. This allows the implementation of an external, custom dispatching logic. The value of this setting may be changed during runtime via the cc_internal_call_dispatching MI command.

*Default value is 1.*

**Example.** 0.

```opensips
...
modparam("call_center", "internal_call_dispatching", 0)
...
```
### `queue_pos_param` (string)

The name of an SIP URI parameter to be used to report the position in the waiting queue when sending the call to media server for onwait/queue playback. The position 0 means it is the next call to be delivered to an agent.

*Default value is empty(none).*

**Example.** cc_pos.

```opensips
modparam("call_center", "queue_pos_param", "cc_pos")
```
### `reject_on_no_agents` (integer)

A parameter to tell if an incoming call should be rejected or quueued if there are no logged in agents. Basically this allows call queueing on flows with no agents yet.

*Default value is 1 (true).*

**Example.** 0.

```opensips
...
modparam("call_center", "reject_on_no_agents", 0)
...
```
### `rt_db_url` (string)

SQL address/URL of the DB server (database specific) where the runtime tables (non provisioning tables) are located. The runtime tables are the tables populated by OpenSIPS with data learned during runtime. To be more specific, the only runtime table we have so far is the "cc_calls" table.

*Default value is If not explicitly set, the global OpenSIPS DB URL will be used..*

**Example.** mysql://opensips:opensipsrw@localhost/opensips_runtime.

```opensips
modparam("call_center", "rt_db_url", 
	"mysql://opensips:opensipsrw@localhost/opensips_runtime")
```
### `wrapup_time` (integer)

Time for an agent between finishing a call and receiving the next call from the system. Even if there are queued calls, the module will not deliver call to agent during this wrapup interval.

*Default value is 30 seconds.*

**Notes:** This value may be overwritten by the per-agent value (if defined) and furher more, by the per-flow value (if defined).

**Example.** 45.

```opensips
modparam("call_center", "wrapup_time", 45)
```

## Exported Functions

### `cc_agent_login(agentID, state)`

This function sets the login (on or off) state for an agent.

**Parameters:**

- `agentID` *(string, required)* — the ID of the agent
- `state` *(int, required)* — an integer value giving the new state - 0 means logged off, anything else means logged in.

**Usable from:** REQUEST_ROUTE

**Example.** cc_agent_login usage.

```opensips
...
# log off the 'agentX' agent
cc_agent_login("agentX",0);
...
```

### `cc_handle_call( flowID [,param])`

This must be used only for initial INVITE requests - the function pushes the call to be handled by the call center module (via a certain flow/queue).

**Parameters:**

- `flowID` *(string, required)* — the ID of the flow to handle this call (push the call to that flow).
- `param` *(string, optional)* — an opaque string to be passed as parameter to the "callcenter" and "agent" B2B scenarios. It is intended for custom integration of the call center module and it is 100% up to the script writer about the value and purpose of this parameter, OpenSIPS will not touch or interpret it. You can retrieve the value of this parameter using the $b2b_logic.ctx variable with the name defined in the b2b_logic_ctx_param parameter.

**Return codes:**

- `TRUE` — the call was successfully pushed and handled by the Call Center engine. IMPORTANT: you must not do any signaling on the call (reply, relay) after this point.
- `FALSE (-1)` — unable to get the flow ID from the parameter
- `FALSE (-2)` — unable to parse the FROM URI
- `FALSE (-3)` — flow with FlowID not found
- `FALSE (-4)` — no agents logged in the flow
- `FALSE (-5)` — internal error

**Usable from:** REQUEST_ROUTE

**Example.** cc_handle_call usage.

```opensips
...
if (is_method("INVITE") and !has_totag()) {
	if (!cc_handle_call("tech_support")) {
		send_reply(403,"Cannot handle call");
		exit;
	}
}
...
```

## Exported Pseudo-Variables

### `$cc_state`

Returns the state of a call.

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- welcome
- dissuading1
- dissuading2
- queue
- preagent
- toagent

## Exported MI Functions

### `cc_agent_login`

Command to login an agent into the Call Center engine.

**Parameters:**

- `agent_id` *(string, required)* — ID of the agent
- `state` *(integer, required)* — the new login state (0 - log off, 1 - log in)

**Example.**

```opensips
opensips-cli -x mi cc_agent_login agentX 0
```

### `cc_dispatch_call_to_agent`

This function sends a given call (from the queue) to a given agent. For the operation to succeed, several conditions must be met:

*   the call must be in the queue
    
*   the agent must be logged in
    
*   the agent must support the skill required by the call
    
*   the agent must support the media (RTP/MSRP) requiref by the call
    
*   the agent must have available sessions for the requested media

IMPORTANT: in order to be used, you need to be sure that the internal call dispatching is DISABLED via the chat_internal_call_dispatching module parameter or the cc_internal_call_dispatching MI command.

**Parameters:**

- `agent_id` *(string, required)* — the ID of the call, as provided by the agents listing MI command cc_list_agents
- `call_id` *(string, required)* — the ID of the call, as provided by the queue listing MI command cc_list_queue

**Example.**

```opensips
opensips-cli -x mi cc_dispatch_call_to_agent B2B452.dee2.33 agentX
```

### `cc_internal_call_dispatching`

Command to inspect and/or change the chat_internal_call_dispatching setting

**Parameters:**

- `dispatching` *(integer, optional)* — It takes one optional parameter dispatching if the value of the setting should be changed. A 0 value means disabling the internal dispatching, a non zero means to enable it.

**Example.**

```opensips
opensips-cli -x mi cc_internal_call_dispatching 0
```

### `cc_list_agents`

Command to list all the agents - for each agent, the following attributes will be printed: agent ID, agent login state, agent state (free, wrapup, incall) and info on ongoing sessions.

It takes no parameter.

**Example.**

```opensips
opensips-cli -x mi cc_list_agents
```

### `cc_list_calls`

Command to list all the ongoing calls - for each call, the following attributes will be printed: call ID, call state (welcome, queued, toagent, ended), call duration, flow it belongs to, agent serving the call (if any).

It takes no parameter.

**Example.**

```opensips
opensips-cli -x mi cc_list_agents
```

### `cc_list_flows`

Command to list all the flows - for each flow, the following attributes will be printed: the flow ID, the avg. call duration, how many calls were processed, how many agents are logged, and how many onging calls are.

It takes no parameter.

**Example.**

```opensips
opensips-cli -x mi cc_list_flows
```

### `cc_list_queue`

Command to list all the calls in queuing - for each call, the following attributes will be printed: the call id, the calling user info, the flow of the call, for how long the call is in the queue, the ETW for the call, call priority and the call skill (inherited from the flow).

It takes no parameter.

**Example.**

```opensips
opensips-cli -x mi cc_list_queue
```

### `cc_reload`

Command to reload flows and agents definition from database.

It takes no parameter.

**Example.**

```opensips
opensips-cli -x mi cc_reload
```

### `cc_reset_stats`

Command to reset all counter-like statistics.

It takes no parameter.

**Example.**

```opensips
opensips-cli -x mi cc_reset_stats
```

## Exported Statistics

### `cca_aban_incalls_agentID`

Number of calls (sent to this agent) terminated by caller before being answered by agents.

- **Type:** counter
### `cca_answ_incalls_agentID`

Number of calls (audio/RTP and chat/MSRP) answered by the agent.

- **Type:** counter
### `cca_answ_inchats_agentID`

Number of chat/MSRP only calls answered by the agent.

- **Type:** counter
### `cca_att_agentID`

Avg. Talk Time for this agent

- **Type:** gauge
### `cca_dist_incalls_agnetID`

Number of distributed calls to this agent.

- **Type:** counter
### `ccf_aban_incalls_flowID`

Number of calls (from the flow) terminated by caller before being answered by agents.

- **Type:** counter
### `ccf_answ_incalls_flowID`

Nnumber of calls (audio/RTP and chat/MSRP) from the flow answered by agents.

- **Type:** counter
### `ccf_answ_incalls_flowID`

Nnumber of chat/MSRP only calls from the flow answered by agents.

- **Type:** counter
### `ccf_awt_flowID`

Avg. Wating Time for this flow.

- **Type:** gauge
### `ccf_dist_incalls_flowID`

Number of distributed calls in this flow.

- **Type:** counter
### `ccf_etw_flowID`

Estimated Time to Wait for this flow.

- **Type:** gauge
### `ccf_free_agents_flowID`

Number of free agents serving this flow.

- **Type:** gauge
### `ccf_incalls_flowID`

Number of received calls for the flow.

- **Type:** counter
### `ccf_onhold_incalls_flowID`

Number of calls (audio/RTP and chat/MSRP) -from the flow- which are onhold.

- **Type:** gauge
### `ccf_onhold_inchats_flowID`

Number of chat/MSRP only calls -from the flow- which are onhold.

- **Type:** gauge
### `ccf_queued_calls_flowID`

Number of calls which are queued for this flow.

- **Type:** gauge
### `ccg_abandonned_incalls`

Total number of calls terminated by caller before being answered by agents.

- **Type:** counter
### `ccg_answered_incalls`

Total number of calls (audio/RTP and chat/MSRP) answered by agents.

- **Type:** counter
### `ccg_answered_inchats`

Total number of chat/MSRP only calls answered by agents.

- **Type:** counter
### `ccg_awt`

Global avg. waiting time for calls.

- **Type:** gauge
### `ccg_distributed_incalls`

Total number of distributed calls.

- **Type:** counter
### `ccg_free_agents`

Total number of free agents (across all flows).

- **Type:** gauge
### `ccg_incalls`

Total number of received calls.

- **Type:** counter
### `ccg_load`

Global load (across all flows).

- **Type:** gauge
### `ccg_load_flowID`

The load on the flow (number of queued calls versus number of logged agents).

- **Type:** gauge
### `ccg_onhold_calls`

Total number of calls (audio/RTP and chat/MSRP) in the queues (onhold).

- **Type:** gauge
### `ccg_onhold_chats`

Total number of chat/MSRP only calls in the queues (onhold).

- **Type:** gauge

## Exported Events

### `E_CALLCENTER_AGENT_REPORT`

This event is raised when the status of an agent changes.

**Parameters:**

- `agent_id` *(string)* — the id of the agent.
- `state` *(string)* — the status of the agent: offline, free, incall, wrapup
- `wrapup_ends` *(integer)* — the timestamp when the wrapup state will end; published only if the state is "wrapup"
- `flow_id` *(string)* — the flow ID that delivered the call for this agent; published only if the state is "incall"

## Configuration Examples

### Set `db_url` parameter

SQL address to the DB server -- database specific. This must be the Database holding the provisioning tables (cc_flows, cc_agents and cc_calls tables). If not explicitly set, the global OpenSIPS DB URL will be used.

```opensips
...
modparam("call_center", "db_url", 
	"mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Set `acc_db_url` parameter

SQL address to the DB server -- database specific. This must be the Database where the CDRs table (cc_cdrs) is located. If not explicitly set, the global OpenSIPS DB URL will be used.

```opensips
...
modparam("call_center", "acc_db_url", 
	"mysql://opensips:opensipsrw@localhost/opensips_cdrs")
...
```
### Set `rt_db_url` parameter

SQL address/URL of the DB server (database specific) where the runtime tables (non provisioning tables) are located. The runtime tables are the tables populated by OpenSIPS with data learned during runtime. To be more specific, the only runtime table we have so far is the "cc_calls" table. If not explicitly set, the global OpenSIPS DB URL will be used.

```opensips
...
modparam("call_center", "rt_db_url", 
	"mysql://opensips:opensipsrw@localhost/opensips_runtime")
...
```
### Set `wrapup_time` parameter

Time for an agent between finishing a call and receiving the next call from the system. Even if there are queued calls, the module will not deliver call to agent during this wrapup interval. This value may be overwritten by the per-agent value (if defined) and furher more, by the per-flow value (if defined). Default value is “30 seconds”.

```opensips
...
modparam("call_center", "wrapup_time", 45)
...
```
### Set `queue_pos_param` parameter

The name of an SIP URI parameter to be used to report the position in the waiting queue when sending the call to media server for onwait/queue playback. The position 0 means it is the next call to be delivered to an agent. Default value is “empty(none)”.

```opensips
...
modparam("call_center", "queue_pos_param", "cc_pos")
...
```
### Set `reject_on_no_agents` parameter

A parameter to tell if an incoming call should be rejected or quueued if there are no logged in agents. Basically this allows call queueing on flows with no agents yet. Default value is “1 (true)”.

```opensips
...
modparam("call_center", "reject_on_no_agents", 0)
...
```
### Set `chat_dispatch_policy` parameter

A parameter to tell what should be the policy on dispatching the chat/MSRP sessions to the agents, considering that an agent may handle multiple such sessions/chats in the same time. Options are: balancing - the distribution will try to be even across the agents, but by doing this you may end up waisting chat sessions on agents and call starvation - agents are partially used by chat sessions, so they cannot take calls (of course, if you have mixed agetns with audio/chat); full-load - the distribution will try to make usage of an agent in the best possible way when comes to chat sessions - once the agent take a chat, all the following chats will be assigned ot him - the idea is to try to be efficient in using the resource/sessions of an agents, to leave as much room as possible for calls. Of course, this may lead to an un-even loading of chat agents - some will be full, others empty. Default value is “balancing”.

```opensips
...
modparam("call_center", "chat_dispatch_policy", "balancing")
...
```
### Set `internal_call_dispatching` parameter

A parameter to tell if the internal/buit-in call dispatching to agent should be used or not. If enabled, the module will automatically dispatch (by itself) the queued/incoming calls to the available agents. If disabled, the module will not do such dispaching by itself and it is expected to use the cc_dispatch_call_to_agent MI command to dispatch the queued calls to agents. This allows the implementation of an external, custom dispatching logic. The value of this setting may be changed during runtime via the cc_internal_call_dispatching MI command. Default value is “1” (enabled).

```opensips
...
modparam("call_center", "internal_call_dispatching", 0)
...
```
### Set `cc_agents_table` parameter

Name to be used for the table holding the agents. Default value is “cc_agents”.

```opensips
...
modparam("call_center", "cc_agents_table", "my_agents")
...
```
### Set `cca_agentid_column` parameter

Name to be used for the "agent id" (unique DB id) column in the agents table. Default value is “agentid”.

```opensips
...
modparam("call_center", "cca_agentid_column", "cid")
...
```
### Set `cca_location_column` parameter

Name to be used for the calling/audio "location" (SIP URI) column in the agents table. Default value is “location”.

```opensips
...
modparam("call_center", "cca_location_column", "sip_uri")
...
```
### Set `cca_msrp_location_column` parameter

Name to be used for the msrp/chat "location" (SIP URI) column in the agents table. Default value is “msrp_location”.

```opensips
...
modparam("call_center", "cca_msrp_location_column", "sip_uri")
...
```
### Set `cca_msrp_max_sessions_column` parameter

Name to be used for the column (in the agents table) holding the maximum number of chat sessions that can be handled by the agent. Default value is “msrp_max_sessions”.

```opensips
...
modparam("call_center", "cca_msrp_max_sessions_column", "max_chats")
...
```
### Set `cca_skills_column` parameter

Name to be used for the "skills" (list of skills) column in the agents table. Default value is “skills”.

```opensips
...
modparam("call_center", "cca_skills_column", "skills")
...
```
### Set `cca_logstate_column` parameter

Name to be used for the "logstate" (original login state) column in the agents table. Default value is “logstate”.

```opensips
...
modparam("call_center", "cca_logstate_column", "log_state")
...
```
### Set `cca_wrapuptime_column` parameter

Name to be used for the "wrapuptime" (per-agent wrapup time) column in the agents table. Default value is “wrapup_time”.

```opensips
...
modparam("call_center", "cca_wrapuptime_column", "wtime")
...
```
### Set `cca_wrapupend_column` parameter

Name to be used for the "wrapupend" (timestamp when the wrapup ends) column in the agents table. Default value is “wrapup_end_time”.

```opensips
...
modparam("call_center", "cca_wrapupend_column", "wrapup_ends")
...
```
### Set `cc_flows_table` parameter

Name to be used for the table holding the definition of the flows/queues. Default value is “cc_flows”.

```opensips
...
modparam("call_center", "cc_flows_table", "queues")
...
```
### Set `ccf_flowid_column` parameter

Name to be used for the "flow id" (unique DB id) column in the flows table. Default value is “flowid”.

```opensips
...
modparam("call_center", "ccf_flowid_column", "queue_id")
...
```
### Set `ccf_priority_column` parameter

Name to be used for the "priority" column in the flows table. Default value is “priority”.

```opensips
...
modparam("call_center", "ccf_priority_column", "queue_prio")
...
```
### Set `ccf_skill_column` parameter

Name to be used for the "skill" column in the flows table. Default value is “skill”.

```opensips
...
modparam("call_center", "ccf_skill_column", "queue_skill")
...
```
### Set `ccf_cid_column` parameter

Name to be used for the "caller ID prefix" column in the flows table. Default value is “prependcid”.

```opensips
...
modparam("call_center", "ccf_cid_column", "queue_cli_prefix")
...
```
### Set `ccf_max_wrapup_column` parameter

Name to be used for the "max limit for wrapup time" column in the flows table. Default value is “max_wrapup_time”.

```opensips
...
modparam("call_center", "ccf_max_wrapup_column", "queue_wrapup")
...
```
### Set `ccf_dissuading_hangup_column` parameter

Name to be used for the "hangup after dissuading" column in the flows table. Default value is “dissuading_hangup”.

```opensips
...
modparam("call_center", "ccf_dissuading_hangup_column", "hangup_on_dissuading")
...
```
### Set `ccf_dissuading_onhold_th_column` parameter

Name to be used for the "on-hold dissuading threshold" column in the flows table. Default value is “dissuading_onhold_th”.

```opensips
...
modparam("call_center", "ccf_dissuading_onhold_th_column", "th_diss_onhold")
...
```
### Set `ccf_dissuading_ewt_th_column` parameter

Name to be used for the "EWT dissuading threshold" column in the flows table. Default value is “dissuading_ewt_th”.

```opensips
...
modparam("call_center", "ccf_dissuading_ewt_th_column", "th_diss_ewt")
...
```
### Set `ccf_dissuading_qsize_th_column` parameter

Name to be used for the "queue size dissuading threshold" column in the flows table. Default value is “dissuading_qsize_th”.

```opensips
...
modparam("call_center", "ccf_dissuading_qsize_th_column", "th_diss_qsize")
...
```
### Set `ccf_m_welcome_column` parameter

Name to be used for the "audio message on welcome" column in the flows table. Default value is “message_welcome”.

```opensips
...
modparam("call_center", "ccf_m_welcome_column", "audio_welcome")
...
```
### Set `ccf_m_queue_column` parameter

Name to be used for the "audio message on queueing" column in the flows table. Default value is “message_queue”.

```opensips
...
modparam("call_center", "ccf_m_queue_column", "audio_queue")
...
```
### Set `ccf_m_dissuading_column` parameter

Name to be used for the "audio message on dissuading" column in the flows table. Default value is “message_dissuading”.

```opensips
...
modparam("call_center", "ccf_m_dissuading_column", "audio_dissuading")
...
```
### Set `ccf_m_flow_id_column` parameter

Name to be used for the "audio message on identifying the flow" column in the flows table. Default value is “message_flow_id”.

```opensips
...
modparam("call_center", "ccf_m_flow_id_column", "audio_flow_id")
...
```
### Set `b2b_logic_ctx_param` parameter

The name of the _$b2b_logic.ctx_ variable that can be used to retrieve the value of the parameter passed to the cc_handle_call function. This parameter will be copied throughout all the B2B scenarios started by the call_center module. NOTE that you can change the value of the current scenario by writing into it, but the change will not be reflected in a different scenario. Default value is “call_center”.

```opensips
...
modparam("call_center", "b2b_logic_ctx_param", "b2b_callid")
...
route\[handle_call_center\] {
    ...
    cc_handle_call("flow", $ci);
    ...
}
...
route\[b2b_handle_request\] {
    ...
    xlog("Initial Callid is $b2b_logic.ctx(b2b_callid)\\n");
    ...
}
...
```
### `cc_handle_call` usage

This must be used only for initial INVITE requests - the function pushes the call to be handled by the call center module (via a certain flow/queue). This function can be used from REQUEST_ROUTE. Parameters: flowID (string) - the ID of the flow to handle this call (push the call to that flow). param (string, optional) - an opaque string to be passed as parameter to the "callcenter" and "agent" B2B scenarios. It is intended for custom integration of the call center module and it is 100% up to the script writer about the value and purpose of this parameter, OpenSIPS will not touch or interpret it. You can retrieve the value of this parameter using the _$b2b_logic.ctx_ variable with the name defined in the b2b_logic_ctx_param parameter. The function returns TRUE back to the script if the call was successfully pushed and handled by the Call Center engine. IMPORTANT: you must not do any signaling on the call (reply, relay) after this point. In case of error, FALSE is returned to the script with the following return codes: -1 - unable to get the flow ID from the parameter; -2 - unable to parse the FROM URI; -3 - flow with FlowID not found; -4 - no agents logged in the flow; -5 - internal error.

```opensips
...
if (is_method("INVITE") and !has_totag()) {
	if (!cc_handle_call("tech_support")) {
		send_reply(403,"Cannot handle call");
		exit;
	}
}
...
```
### `cc_agent_login` usage

This function sets the login (on or off) state for an agent. This function can be used from REQUEST_ROUTE. Parameters: agentID (string) - the ID of the agent; state (int) - an integer value giving the new state - 0 means logged off, anything else means logged in.

```opensips
...
# log off the 'agentX' agent
cc_agent_login("agentX",0);
...
```
### $rtpquery Usage

Returns the state of a call. Possible values returned are: _welcome_ - the welcome message is played. _dissuading1_ - the first dissuading message is played. _dissuading2_ - the second dissuading message is played. _queue_ - the call is in queue. _preagent_ - the agent is being called. _toagent_ - the agent is in call.

```opensips
...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...		
```
