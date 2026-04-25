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