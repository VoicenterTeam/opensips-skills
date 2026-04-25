## 1.4.�Exported Parameters

### 1.4.1.�`sampling_time_unit` (integer)

Time period used for sampling (or the sampling accuracy ;-) ). The smaller the better, but slower. If you want to detect peaks, use a small one. To limit the access (like total number of requests on a long period of time) to a proxy resource (a gateway for ex), use a bigger value of this parameter.

IMPORTANT: a too small value may lead to performance penalties due timer process overloading.

_Default value is 2._

**Example�1.1.�Set `sampling_time_unit` parameter**

...
modparam("pike", "sampling\_time\_unit", 10)
...

  

### 1.4.2.�`reqs_density_per_unit` (integer)

How many requests should be allowed per sampling\_time\_unit before blocking all the incoming request from that IP. Practically, the blocking limit is between ( let's have x=reqs\_density\_per\_unit) x and 3\*x for IPv4 addresses and between x and 8\*x for ipv6 addresses.

_Default value is 30._

**Example�1.2.�Set `reqs_density_per_unit` parameter**

...
modparam("pike", "reqs\_density\_per\_unit", 30)
...

  

### 1.4.3.�`remove_latency` (integer)

For how long the IP address will be kept in memory after the last request from that IP address. It's a sort of timeout value.

_Note:_ If the _remove\_latency_ value is lower than _sampling\_time\_unit_ value, nodes might expire before being unblocked, therefore losing some UNBLOCK events. In order to prevent this, if the _remove\_latency_ is lower, OpenSIPS internally forces its value to _sampling\_time\_unit + 1_.

_Default value is 120._

**Example�1.3.�Set `remove_latency` parameter**

...
modparam("pike", "remove\_latency", 130)
...

  

### 1.4.4.�`check_route` (integer)

The name of the script route to be triggers (in automatic way) when a package is received from the network. If you do a "drop" in this route, it will indicate to the module that the source IP of the package does not need to be monitored. Otherwise, the source IP will be automatically monitered.

By defining this parameter, the automatic checking mode is enabled.

_Default value is NONE (no auto mode)._

**Example�1.4.�Set `check_route` parameter**

...
modparam("pike", "check\_route", "pike")
...
route\[pike\]{
    if ($si==111.222.111.222)  /\*trusted, do not check it\*/
        drop;
    /\* all other IPs are checked\*/
}
....

  

### 1.4.5.�`pike_log_level` (integer)

Log level to be used by module to auto report the blocking (only first time) and unblocking of IPs detected as source of floods.

_Default value is 1 (L\_WARN)._

**Example�1.5.�Set `pike_log_level` parameter**

...
modparam("pike", "pike\_log\_level", -1)
...