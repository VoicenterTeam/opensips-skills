## 1.4.�Exported MI Functions

### 1.4.1.� `tcp_reload`

Reload all TCP paths from the _tcp\_mgm_ table without disrupting ongoing traffic. Note that the reloaded rules will NOT immediately apply to existing TCP connections, rather only to newly established ones.

Example:

\# reload all TCP paths
$ opensips-cli -x mi tcp\_reload
$ "OK"