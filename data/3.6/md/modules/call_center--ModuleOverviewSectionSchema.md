# Call-Center Module

---

**List of Tables**

4.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6223488)

4.2. [Most recently active contributors(1) to this module](#idp6346864)

**List of Examples**

1.1. [Set `db_url` parameter](#idp5590160)

1.2. [Set `acc_db_url` parameter](#idp5594864)

1.3. [Set `rt_db_url` parameter](#idp5599360)

1.4. [Set `wrapup_time` parameter](#idp5605056)

1.5. [Set `queue_pos_param` parameter](#idp5610128)

1.6. [Set `reject_on_no_agents` parameter](#idp5615136)

1.7. [Set `chat_dispatch_policy` parameter](#idp5624464)

1.8. [Set `internal_call_dispatching` parameter](#idp5630800)

1.9. [Set `cc_agents_table` parameter](#idp5635616)

1.10. [Set `cca_agentid_column` parameter](#idp5640432)

1.11. [Set `cca_location_column` parameter](#idp5645360)

1.12. [Set `cca_msrp_location_column` parameter](#idp5650288)

1.13. [Set `cca_msrp_max_sessions_column` parameter](#idp5655360)

1.14. [Set `cca_skills_column` parameter](#idp5660368)

1.15. [Set `cca_logstate_column` parameter](#idp5665296)

1.16. [Set `cca_wrapuptime_column` parameter](#idp5670224)

1.17. [Set `cca_wrapupend_column` parameter](#idp5675168)

1.18. [Set `cc_flows_table` parameter](#idp5680176)

1.19. [Set `ccf_flowid_column` parameter](#idp5685168)

1.20. [Set `ccf_priority_column` parameter](#idp5690144)

1.21. [Set `ccf_skill_column` parameter](#idp5695120)

1.22. [Set `ccf_cid_column` parameter](#idp5700112)

1.23. [Set `ccf_max_wrapup_column` parameter](#idp5705104)

1.24. [Set `ccf_dissuading_hangup_column` parameter](#idp5710112)

1.25. [Set `ccf_dissuading_onhold_th_column` parameter](#idp5715152)

1.26. [Set `ccf_dissuading_ewt_th_column` parameter](#idp5720160)

1.27. [Set `ccf_dissuading_qsize_th_column` parameter](#idp5725184)

1.28. [Set `ccf_m_welcome_column` parameter](#idp5730192)

1.29. [Set `ccf_m_queue_column` parameter](#idp5735200)

1.30. [Set `ccf_m_dissuading_column` parameter](#idp5740208)

1.31. [Set `ccf_m_flow_id_column` parameter](#idp5745232)

1.32. [Set `b2b_logic_ctx_param` parameter](#idp5751776)

1.33. [`cc_handle_call` usage](#idp5768992)

1.34. [`cc_agent_login` usage](#idp5776432)

1.35. [$rtpquery Usage](#idp5894688)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The Call Center module implements an inbound call center system with call flows (for queuing the received calls) and agents (for answering the calls).

The module implements the queuing system, the call distribution to agents, agents managements, CDRs for the calls, statistics on call distribution and agent's activity - basically everything except the media playback (for the queue). This part must be provided via a third party media server (FreeSwitch, Asterisk or others).

This is actually a Contact Center and it is able to handle both RTP/audio calls and (multiple) MSRP/chat calls, in the same time.

The module provides an internal buit-in dispatching logic (for sending the calls/chats to the agents), but also offers the possibility to use an external logic to do the dispatching (see [cc\_dispatch\_call\_to\_agent](#mi_cc_dispatch_call_to_agent "1.7.7.� cc_dispatch_call_to_agent") MI command).

## 1.2.�How it works

The main entities in the modules are the flows (queues) and agents.

### 1.2.1.�DB tables

Each entity has a corresponding table in the database, for provisioning purposes - the _cc\_flows_ and _cc\_agents_ tables, see [DB schema](https://opensips.org/Documentation/Install-DBSchema--3-3#AEN2656). Data is loaded at startup and cached into memory ; runtime reload is possible via the MI commands (see the _cc\_reload_ command in [Exported MI Functions](#exported_mi_functions "1.7.�Exported MI Functions")).

Additionally there is a table _cc\_cdrs_ for writing the CDRs - this operation is done in realtime, after the call in completed, covering all possible cases: call was dropped while in queue, call was rejected by agent, call was accepted by agent, call terminated with error - NOTE that a call may generate more than one CDR (like call rejected by agent A, and redistributed and accepted by agent B).

The _cc\_calls_ table is used to store ongoing calls, regardless it's state (in queue, to the agent, ended). It is populated at runtime by the module and queried at startup. This table should not be manually provisioned.

### 1.2.2.�Call Flows

A flow is defined by a unique alphanumerical ID - the main attribute of a flow is the _skill_ - the skill is a capability required by the flow for an agent to be able to answer the call ; the concept of _skills_ is the link between the flows and the agents - telling what agents are serving what flows - the flows require a skill, while the agents provide a set of skills. Agents matching the required skill of a flow will automatically receive calls from that flow.

Additional, the flow has a _priority_ - as agents may server multiple flows in the same time (based on skills), you can define priorities between the flows - if the flows has a higher priority, its calls will be pushed (in deliver to agents and queuing) in front of the calls from flows with a lower priority.

Configurable per flow, the module may do per-flow call dissuading; this means to redirect a call to another destination, if the queue/flow is overloaded:

*   if the number of calls already in the queue exceeds the diss\_qsize\_th threshold
    
*   if the estimated time to wait of the queue exceeds the diss\_ewt\_th threshold
    
*   if the call was waiting in the queue for longer than diss\_onhold\_th threshold
    

Optionally, the flow may define a _prependcid_ - a prefix to be added to the CLI (Caller ID) when the call is delivered to the agents - as an agent may receive call from multiple flows, it is important for the user to see which was the queue a call was received.

In terms of media announcements, the flow defines the _message\_welcome_ (optional, to be played in the call, before doing anything with the call) and _message\_queue_ (mandatory, the looping message providing infinite on hold media IMPORTANT - this message must cycle and media server must never hung up on it. Both announcements are provided as SIP URIs (where the call has to be sent in order to get the playback).

The flow also has an optional _max\_wrapup time_, which acts as an upper limit for the per-agent/global value (the flow forces a ceiling of the wrapup value for all its calls).

### 1.2.3.�Agents

An agent is defined by a unique alphanumerical ID - the main attribute of an agent is its the set of _skills_. This set of skills will tell what calls to be received (from which flows, based on the skill matching).

The agent may provide support for different optional media types, like RTP/audio or MSRP/chat. Each supported media type comes with the maximum supported number of sessions. Of course, for audio the \`1\` value is hardocded. On the SIP side, each media type comes with a _locations_. The location is a SIP URI where to calls must be sent in order to be answered by the agent. At least one media type should be defined. To specify which media the agent support, just define the corresponding SIP location in his profile.

So, at a certain time, an agent may handle either a single call, either several chat sessions.

Additionally, the agent has a initial _logstate_ - if he is logged in or not (being logged in is a must in order to receive calls). The log state may be changed at runtime via a dedicated MI command _cc\_agent\_login_, see [Exported MI Functions](#exported_mi_functions "1.7.�Exported MI Functions").

There is an optional per-agent _wrapup\_time_ defined, saying the time interval for an agent before getting a new call from the system (after he finished a call). If no value is defined for the agent, the global _wrapup\_time_ will be used. Note that the resulting value may be upper limited by the per-flow _max\_wrapup\_time_ if defined.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _b2b\_logic_ - B2bUA module
    
*   _database_ - one of the SQL DB modules
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`db_url` (string)

SQL address to the DB server -- database specific. This must be the Database holding the provisioning tables (cc\_flows, cc\_agents and cc\_calls tables).

If not explicitly set, the global OpenSIPS DB URL will be used.

**Example�1.1.�Set `db_url` parameter**

...
modparam("call\_center", "db\_url", 
	"mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.4.2.�`acc_db_url` (string)

SQL address to the DB server -- database specific. This must be the Database where the CDRs table (cc\_cdrs) is located.

If not explicitly set, the global OpenSIPS DB URL will be used.

**Example�1.2.�Set `acc_db_url` parameter**

...
modparam("call\_center", "acc\_db\_url", 
	"mysql://opensips:opensipsrw@localhost/opensips\_cdrs")
...

  

### 1.4.3.�`rt_db_url` (string)

SQL address/URL of the DB server (database specific) where the runtime tables (non provisioning tables) are located. The runtime tables are the tables populated by OpenSIPS with data learned during runtime. To be more specific, the only runtime table we have so far is the "cc\_calls" table.

If not explicitly set, the global OpenSIPS DB URL will be used.

**Example�1.3.�Set `rt_db_url` parameter**

...
modparam("call\_center", "rt\_db\_url", 
	"mysql://opensips:opensipsrw@localhost/opensips\_runtime")
...

  

### 1.4.4.�`wrapup_time` (integer)

Time for an agent between finishing a call and receiving the next call from the system. Even if there are queued calls, the module will not deliver call to agent during this wrapup interval.

This value may be overwritten by the per-agent value (if defined) and furher more, by the per-flow value (if defined).

_Default value is “30 seconds”._

**Example�1.4.�Set `wrapup_time` parameter**

...
modparam("call\_center", "wrapup\_time", 45)
...

  

### 1.4.5.�`queue_pos_param` (string)

The name of an SIP URI parameter to be used to report the position in the waiting queue when sending the call to media server for onwait/queue playback. The position 0 means it is the next call to be delivered to an agent.

_Default value is “empty(none)”._

**Example�1.5.�Set `queue_pos_param` parameter**

...
modparam("call\_center", "queue\_pos\_param", "cc\_pos")
...

  

### 1.4.6.�`reject_on_no_agents` (int)

A parameter to tell if an incoming call should be rejected or quueued if there are no logged in agents. Basically this allows call queueing on flows with no agents yet.

_Default value is “1 (true)”._

**Example�1.6.�Set `reject_on_no_agents` parameter**

...
modparam("call\_center", "reject\_on\_no\_agents", 0)
...

  

### 1.4.7.�`chat_dispatch_policy` (int)

A parameter to tell what should be the policy on dispatching the chat/MSRP sessions to the agents, considering that an agent may handle multiple such sessions/chats in the same time.

Options are:

*   **balancing** \- the distribution will try to be even across the agents, but by doing this you may end up waisting chat sessions on agents and call starvation - agents are partially used by chat sessions, so they cannot take calls (of course, if you have mixed agetns with audio/chat)
    
*   **full-load** - the distribution will try to make usage of an agent in the best possible way when comes to chat sessions - once the agent take a chat, all the following chats will be assigned ot him - the idea is to try to be efficient in using the resource/sessions of an agents, to leave as much room as possible for calls. Of course, this may lead to an un-even loading of chat agents - some will be full, others empty.
    

_Default value is “balancing”._

**Example�1.7.�Set `chat_dispatch_policy` parameter**

...
modparam("call\_center", "chat\_dispatch\_policy", "balancing")
...

  

### 1.4.8.�`internal_call_dispatching` (int)

A parameter to tell if the internal/buit-in call dispatching to agent should be used or not. If enabled, the module will automatically dispatch (by itself) the queued/incoming calls to the available agents. If disabled, the module will not do such dispaching by itself and it is expected to use the [cc\_dispatch\_call\_to\_agent](#mi_cc_dispatch_call_to_agent "1.7.7.� cc_dispatch_call_to_agent") MI command to dispatch the queued calls to agents. This allows the implementation of an external, custom dispatching logic. The value of this setting may be changed during runtime via the [cc\_internal\_call\_dispatching](#mi_cc_internal_call_dispatching "1.7.8.� cc_internal_call_dispatching") MI command.

_Default value is “1” (enabled)._

**Example�1.8.�Set `internal_call_dispatching` parameter**

...
modparam("call\_center", "internal\_call\_dispatching", 0)
...

  

### 1.4.9.�`cc_agents_table` (string)

Name to be used for the table holding the agents.

_Default value is “cc\_agents”._

**Example�1.9.�Set `cc_agents_table` parameter**

...
modparam("call\_center", "cc\_agents\_table", "my\_agents")
...

  

### 1.4.10.�`cca_agentid_column` (string)

Name to be used for the "agent id" (unique DB id) column in the agents table.

_Default value is “agentid”._

**Example�1.10.�Set `cca_agentid_column` parameter**

...
modparam("call\_center", "cca\_agentid\_column", "cid")
...

  

### 1.4.11.�`cca_location_column` (string)

Name to be used for the calling/audio "location" (SIP URI) column in the agents table.

_Default value is “location”._

**Example�1.11.�Set `cca_location_column` parameter**

...
modparam("call\_center", "cca\_location\_column", "sip\_uri")
...

  

### 1.4.12.�`cca_msrp_location_column` (string)

Name to be used for the msrp/chat "location" (SIP URI) column in the agents table.

_Default value is “msrp\_location”._

**Example�1.12.�Set `cca_msrp_location_column` parameter**

...
modparam("call\_center", "cca\_msrp\_location\_column", "sip\_uri")
...

  

### 1.4.13.�`cca_msrp_max_sessions_column` (string)

Name to be used for the column (in the agents table) holding the maximum number of chat sessions that can be handled by the agent.

_Default value is “msrp\_max\_sessions”._

**Example�1.13.�Set `cca_msrp_max_sessions_column` parameter**

...
modparam("call\_center", "cca\_msrp\_max\_sessions\_column", "max\_chats")
...

  

### 1.4.14.�`cca_skills_column` (string)

Name to be used for the "skills" (list of skills) column in the agents table.

_Default value is “skills”._

**Example�1.14.�Set `cca_skills_column` parameter**

...
modparam("call\_center", "cca\_skills\_column", "skills")
...

  

### 1.4.15.�`cca_logstate_column` (string)

Name to be used for the "logstate" (original login state) column in the agents table.

_Default value is “logstate”._

**Example�1.15.�Set `cca_logstate_column` parameter**

...
modparam("call\_center", "cca\_logstate\_column", "log\_state")
...

  

### 1.4.16.�`cca_wrapuptime_column` (string)

Name to be used for the "wrapuptime" (per-agent wrapup time) column in the agents table.

_Default value is “wrapup\_time”._

**Example�1.16.�Set `cca_wrapuptime_column` parameter**

...
modparam("call\_center", "cca\_wrapuptime\_column", "wtime")
...

  

### 1.4.17.�`cca_wrapupend_column` (string)

Name to be used for the "wrapupend" (timestamp when the wrapup ends) column in the agents table.

_Default value is “wrapup\_end\_time”._

**Example�1.17.�Set `cca_wrapupend_column` parameter**

...
modparam("call\_center", "cca\_wrapupend\_column", "wrapup\_ends")
...

  

### 1.4.18.�`cc_flows_table` (string)

Name to be used for the table holding the definition of the flows/queues.

_Default value is “cc\_flows”._

**Example�1.18.�Set `cc_flows_table` parameter**

...
modparam("call\_center", "cc\_flows\_table", "queues")
...

  

### 1.4.19.�`ccf_flowid_column` (string)

Name to be used for the "flow id" (unique DB id) column in the flows table.

_Default value is “flowid”._

**Example�1.19.�Set `ccf_flowid_column` parameter**

...
modparam("call\_center", "ccf\_flowid\_column", "queue\_id")
...

  

### 1.4.20.�`ccf_priority_column` (string)

Name to be used for the "priority" column in the flows table.

_Default value is “priority”._

**Example�1.20.�Set `ccf_priority_column` parameter**

...
modparam("call\_center", "ccf\_priority\_column", "queue\_prio")
...

  

### 1.4.21.�`ccf_skill_column` (string)

Name to be used for the "skill" column in the flows table.

_Default value is “skill”._

**Example�1.21.�Set `ccf_skill_column` parameter**

...
modparam("call\_center", "ccf\_skill\_column", "queue\_skill")
...

  

### 1.4.22.�`ccf_cid_column` (string)

Name to be used for the "caller ID prefix" column in the flows table.

_Default value is “prependcid”._

**Example�1.22.�Set `ccf_cid_column` parameter**

...
modparam("call\_center", "ccf\_cid\_column", "queue\_cli\_prefix")
...

  

### 1.4.23.�`ccf_max_wrapup_column` (string)

Name to be used for the "max limit for wrapup time" column in the flows table.

_Default value is “max\_wrapup\_time”._

**Example�1.23.�Set `ccf_max_wrapup_column` parameter**

...
modparam("call\_center", "ccf\_max\_wrapup\_column", "queue\_wrapup")
...

  

### 1.4.24.�`ccf_dissuading_hangup_column` (string)

Name to be used for the "hangup after dissuading" column in the flows table.

_Default value is “dissuading\_hangup”._

**Example�1.24.�Set `ccf_dissuading_hangup_column` parameter**

...
modparam("call\_center", "ccf\_dissuading\_hangup\_column", "hangup\_on\_dissuading")
...

  

### 1.4.25.�`ccf_dissuading_onhold_th_column` (string)

Name to be used for the "on-hold dissuading threshold" column in the flows table.

_Default value is “dissuading\_onhold\_th”._

**Example�1.25.�Set `ccf_dissuading_onhold_th_column` parameter**

...
modparam("call\_center", "ccf\_dissuading\_onhold\_th\_column", "th\_diss\_onhold")
...

  

### 1.4.26.�`ccf_dissuading_ewt_th_column` (string)

Name to be used for the "EWT dissuading threshold" column in the flows table.

_Default value is “dissuading\_ewt\_th”._

**Example�1.26.�Set `ccf_dissuading_ewt_th_column` parameter**

...
modparam("call\_center", "ccf\_dissuading\_ewt\_th\_column", "th\_diss\_ewt")
...

  

### 1.4.27.�`ccf_dissuading_qsize_th_column` (string)

Name to be used for the "queue size dissuading threshold" column in the flows table.

_Default value is “dissuading\_qsize\_th”._

**Example�1.27.�Set `ccf_dissuading_qsize_th_column` parameter**

...
modparam("call\_center", "ccf\_dissuading\_qsize\_th\_column", "th\_diss\_qsize")
...

  

### 1.4.28.�`ccf_m_welcome_column` (string)

Name to be used for the "audio message on welcome" column in the flows table.

_Default value is “message\_welcome”._

**Example�1.28.�Set `ccf_m_welcome_column` parameter**

...
modparam("call\_center", "ccf\_m\_welcome\_column", "audio\_welcome")
...

  

### 1.4.29.�`ccf_m_queue_column` (string)

Name to be used for the "audio message on queueing" column in the flows table.

_Default value is “message\_queue”._

**Example�1.29.�Set `ccf_m_queue_column` parameter**

...
modparam("call\_center", "ccf\_m\_queue\_column", "audio\_queue")
...

  

### 1.4.30.�`ccf_m_dissuading_column` (string)

Name to be used for the "audio message on dissuading" column in the flows table.

_Default value is “message\_dissuading”._

**Example�1.30.�Set `ccf_m_dissuading_column` parameter**

...
modparam("call\_center", "ccf\_m\_dissuading\_column", "audio\_dissuading")
...

  

### 1.4.31.�`ccf_m_flow_id_column` (string)

Name to be used for the "audio message on identifying the flow" column in the flows table.

_Default value is “message\_flow\_id”._

**Example�1.31.�Set `ccf_m_flow_id_column` parameter**

...
modparam("call\_center", "ccf\_m\_flow\_id\_column", "audio\_flow\_id")
...

  

### 1.4.32.�`b2b_logic_ctx_param` (string)

The name of the _$b2b\_logic.ctx_ variable that can be used to retrieve the value of the parameter passed to the [cc\_handle\_call](#func_cc_handle_call "1.5.1.� cc_handle_call( flowID [,param])") function.

This parameter will be copied throughout all the B2B scenarios started by the call\_center module. NOTE that you can change the value of the current scenario by writing into it, but the change will not be reflected in a different scenario.

_Default value is “call\_center”._

**Example�1.32.�Set `b2b_logic_ctx_param` parameter**

...
modparam("call\_center", "b2b\_logic\_ctx\_param", "b2b\_callid")
...
route\[handle\_call\_center\] {
    ...
    cc\_handle\_call("flow", $ci);
    ...
}
...
route\[b2b\_handle\_request\] {
    ...
    xlog("Initial Callid is $b2b\_logic.ctx(b2b\_callid)\\n");
    ...
}

  

## 1.5.�Exported Functions

### 1.5.1.� `cc_handle_call( flowID [,param])`

This must be used only for initial INVITE requests - the function pushes the call to be handled by the call center module (via a certain flow/queue).

This function can be used from REQUEST\_ROUTE.

Parameters:

*   _flowID (string)_ - the ID of the flow to handle this call (push the call to that flow).
    
*   _param (string, optional)_ - an opaque string to be passed as parameter to the "callcenter" and "agent" B2B scenarios. It is intended for custom integration of the call center module and it is 100% up to the script writer about the value and purpose of this parameter, OpenSIPS will not touch or interpret it. You can retrieve the value of this parameter using the _$b2b\_logic.ctx_ variable with the name defined in the [b2b\_logic\_ctx\_param](#param_b2b_logic_ctx_param "1.4.32.�b2b_logic_ctx_param (string)") parameter.
    

The function returns TRUE back to the script if the call was successfully pushed and handled by the Call Center engine. IMPORTANT: you must not do any signaling on the call (reply, relay) after this point.

In case of error, FALSE is returned to the script with the following return codes:

*   **\-1** - unable to get the flow ID from the parameter;
    
*   **\-2** - unable to parse the FROM URI;
    
*   **\-3** - flow with FlowID not found;
    
*   **\-4** - no agents logged in the flow;
    
*   **\-5** - internal error;
    

**Example�1.33.�`cc_handle_call` usage**

...
if (is\_method("INVITE") and !has\_totag()) {
	if (!cc\_handle\_call("tech\_support")) {
		send\_reply(403,"Cannot handle call");
		exit;
	}
}
...

  

### 1.5.2.� `cc_agent_login(agentID, state)`

This function sets the login (on or off) state for an agent.

This function can be used from REQUEST\_ROUTE.

Parameters:

*   _agentID (string)_ - the ID of the agent
    
*   _state (int)_ - an integer value giving the new state - 0 means logged off, anything else means logged in.
    

**Example�1.34.�`cc_agent_login` usage**

...
# log off the 'agentX' agent
cc\_agent\_login("agentX",0);
...

  

## 1.6.�Exported Statistics

### 1.6.1.�Global statistics

#### 1.6.1.1.�ccg\_incalls

Total number of received calls. (counter type)

#### 1.6.1.2.�ccg\_awt

Global avg. waiting time for calls. (realtime type)

#### 1.6.1.3.�ccg\_load

Global load (across all flows). (realtime type)

#### 1.6.1.4.�ccg\_distributed\_incalls

Total number of distributed calls. (counter type)

#### 1.6.1.5.�ccg\_answered\_incalls

Total number of calls (audio/RTP and chat/MSRP) answered by agents. (counter type)

#### 1.6.1.6.�ccg\_answered\_inchats

Total number of chat/MSRP only calls answered by agents. (counter type)

#### 1.6.1.7.�ccg\_abandonned\_incalls

Total number of calls terminated by caller before being answered by agents. (counter type)

#### 1.6.1.8.�ccg\_onhold\_calls

Total number of calls (audio/RTP and chat/MSRP) in the queues (onhold). (realtime type)

#### 1.6.1.9.�ccg\_onhold\_chats

Total number of chat/MSRP only calls in the queues (onhold). (realtime type)

#### 1.6.1.10.�ccg\_free\_agents

Total number of free agents (across all flows). (realtime type)

### 1.6.2.�Per-flow statistics (one set for each flow)

#### 1.6.2.1.�ccf\_incalls\_flowID

Number of received calls for the flow. (counter type)

#### 1.6.2.2.�ccf\_dist\_incalls\_flowID

Number of distributed calls in this flow. (counter type)

#### 1.6.2.3.�ccf\_answ\_incalls\_flowID

Nnumber of calls (audio/RTP and chat/MSRP) from the flow answered by agents. (counter type)

#### 1.6.2.4.�ccf\_answ\_incalls\_flowID

Nnumber of chat/MSRP only calls from the flow answered by agents. (counter type)

#### 1.6.2.5.�ccf\_aban\_incalls\_flowID

Number of calls (from the flow) terminated by caller before being answered by agents. (counter type)

#### 1.6.2.6.�ccf\_onhold\_incalls\_flowID

Number of calls (audio/RTP and chat/MSRP) -from the flow- which are onhold. (realtime type)

#### 1.6.2.7.�ccf\_onhold\_inchats\_flowID

Number of chat/MSRP only calls -from the flow- which are onhold. (realtime type)

#### 1.6.2.8.�ccf\_queued\_calls\_flowID

Number of calls which are queued for this flow. (realtime type)

#### 1.6.2.9.�ccf\_free\_agents\_flowID

Number of free agents serving this flow. (realtime type)

#### 1.6.2.10.�ccf\_etw\_flowID

Estimated Time to Wait for this flow. (realtime type)

#### 1.6.2.11.�ccf\_awt\_flowID

Avg. Wating Time for this flow. (realtime type)

#### 1.6.2.12.�ccg\_load\_flowID

The load on the flow (number of queued calls versus number of logged agents). (realtime type)

### 1.6.3.�Per-agent statistics (one set for each agent)

#### 1.6.3.1.�cca\_dist\_incalls\_agnetID

Number of distributed calls to this agent. (counter type)

#### 1.6.3.2.�cca\_answ\_incalls\_agentID

Number of calls (audio/RTP and chat/MSRP) answered by the agent. (counter type)

#### 1.6.3.3.�cca\_answ\_inchats\_agentID

Number of chat/MSRP only calls answered by the agent. (counter type)

#### 1.6.3.4.�cca\_aban\_incalls\_agentID

Number of calls (sent to this agent) terminated by caller before being answered by agents. (counter type)

#### 1.6.3.5.�cca\_att\_agentID

Avg. Talk Time for this agent (realtime type)

## 1.7.�Exported MI Functions

### 1.7.1.� `cc_reload`

Command to reload flows and agents definition from database.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_reload

### 1.7.2.� `cc_agent_login`

Command to login an agent into the Call Center engine.

Parameters:

*   _agent\_id_ - ID of the agent
    
*   _state_ - the new login state (0 - log off, 1 - log in)
    

MI FIFO Command usage:

opensips-cli -x mi cc\_agent\_login agentX 0

### 1.7.3.� `cc_list_queue`

Command to list all the calls in queuing - for each call, the following attributes will be printed: the call id, the calling user info, the flow of the call, for how long the call is in the queue, the ETW for the call, call priority and the call skill (inherited from the flow).

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_queue

### 1.7.4.� `cc_list_flows`

Command to list all the flows - for each flow, the following attributes will be printed: the flow ID, the avg. call duration, how many calls were processed, how many agents are logged, and how many onging calls are.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_flows

### 1.7.5.� `cc_list_agents`

Command to list all the agents - for each agent, the following attributes will be printed: agent ID, agent login state, agent state (free, wrapup, incall) and info on ongoing sessions.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_agents

### 1.7.6.� `cc_list_calls`

Command to list all the ongoing calls - for each call, the following attributes will be printed: call ID, call state (welcome, queued, toagent, ended), call duration, flow it belongs to, agent serving the call (if any).

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_list\_agents

### 1.7.7.� `cc_dispatch_call_to_agent`

This function sends a given call (from the queue) to a given agent. For the operation to succeed, several conditions must be met:

*   the call must be in the queue
    
*   the agent must be logged in
    
*   the agent must support the skill required by the call
    
*   the agent must support the media (RTP/MSRP) requiref by the call
    
*   the agent must have available sessions for the requested media
    

It takes two parameters.

*   _call\_id_ - the ID of the call, as provided by the queue listing MI command [cc\_list\_queue](#mi_cc_list_queue "1.7.3.� cc_list_queue")
    
*   _agent\_id_ - the ID of the call, as provided by the agents listing MI command [cc\_list\_agents](#mi_cc_list_agents "1.7.5.� cc_list_agents")
    

IMPORTANT: in order to be used, you need to be sure that the internal call dispatching is DISABLED via the [chat\_internal\_call\_dispatching](#param_internal_call_dispatching "1.4.8.�internal_call_dispatching (int)") module parameter or the [cc\_internal\_call\_dispatching](#mi_cc_internal_call_dispatching "1.7.8.� cc_internal_call_dispatching") MI command.

MI FIFO Command usage:

opensips-cli -x mi cc\_dispatch\_call\_to\_agent B2B452.dee2.33 agentX

### 1.7.8.� `cc_internal_call_dispatching`

Command to inspect and/or change the [chat\_internal\_call\_dispatching](#param_internal_call_dispatching "1.4.8.�internal_call_dispatching (int)") setting

It takes one optional parameter `dispatching` if the value of the setting should be changed. A 0 value means disabling the internal dispatching, a non zero means to enable it.

MI FIFO Command usage:

opensips-cli -x mi cc\_internal\_call\_dispatching 0

### 1.7.9.� `cc_reset_stats`

Command to reset all counter-like statistics.

It takes no parameter.

MI FIFO Command usage:

opensips-cli -x mi cc\_reset\_stats

## 1.8.�Exported Events

### 1.8.1.� `E_CALLCENTER_AGENT_REPORT`

This event is raised when the status of an agent changes.

Parameters:

*   _agent\_id_ - the id of the agent.
    
*   _state_ - the status of the agent:
    
    *   offline
    *   free
    *   incall
    *   wrapup
    
*   _wrapup\_ends_ - the timestamp when the wrapup state will end; published only if the state is "wrapup"
    
*   _flow\_id_ - the flow ID that delivered the call for this agent; published only if the state is "incall"
    

## 1.9.�Exported Pseudo-Variables

#### 1.�`$cc_state`

Returns the state of a call.

Possible values returned are:

*   _welcome_ - the welcome message is played.
    
*   _dissuading1_ - the first dissuading message is played.
    
*   _dissuading2_ - the second dissuading message is played.
    
*   _queue_ - the call is in queue.
    
*   _preagent_ - the agent is being called.
    
*   _toagent_ - the agent is in call.
    

**Example�1.35.�$rtpquery Usage**

...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...
		

  

NONE

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

NONE

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

110

44

6780

511

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

45

34

849

159

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

18

9

287

314

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

15

12

73

90

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

8

13

6.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

4

2

1

2

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

1

1

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

3

1

13

4

9.

Alexandra Titoc

3

1

4

4

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

3

1

1

1

  

**All remaining contributors**: Zero King ([@l2dy](https://github.com/l2dy)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 4.2.�By Commit Activity

**Table�4.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jun 2014 - Aug 2025

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2014 - Oct 2023

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2014 - May 2023

6.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2021 - Apr 2021

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jan 2021

8.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Sep 2018

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�5.�Documentation

## 5.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Zero King ([@l2dy](https://github.com/l2dy)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2014 [www.opensips-solutions.com](http://www.opensips-solutions.com/)