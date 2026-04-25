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