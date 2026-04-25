## 1.3.�Exported Parameters

### 1.3.1.�`event_heartbeat_interval` (integer)

The expected interval between FreeSWITCH HEARTBEAT event arrivals.

_Default value is “1” (second)._

**Example�1.1.�Setting the `event_heartbeat_interval` parameter**

...
modparam("freeswitch", "event\_heartbeat\_interval", 20)
...

  

### 1.3.2.�`esl_connect_timeout` (integer)

The maximally allowed duration for the establishment of an ESL connection.

_Default value is “5000” (milliseconds)._

**Example�1.2.�Setting the `esl_connect_timeout` parameter**

...
modparam("freeswitch", "esl\_connect\_timeout", 3000)
...

  

### 1.3.3.�`esl_cmd_timeout` (integer)

The maximally allowed duration for the execution of an ESL command. This interval does not include the connect duration.

_Default value is “5000” (milliseconds)._

**Example�1.3.�Setting the `esl_cmd_timeout` parameter**

...
modparam("freeswitch", "esl\_cmd\_timeout", 3000)
...

  

### 1.3.4.�`esl_cmd_polling_itv` (integer)

The sleep interval used when polling for an ESL command response. Since the value of this parameter imposes a minimal duration for any ESL command, you should run OpenSIPS in debug mode in order to first determine an expected response time for an arbitrary ESL command, then tune this parameter accordingly.

_Default value is “1000” (microseconds)._

**Example�1.4.�Setting the `esl_cmd_polling_itv` parameter**

...
modparam("freeswitch", "esl\_cmd\_polling\_itv", 3000)
...