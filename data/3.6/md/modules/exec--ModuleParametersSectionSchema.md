## 1.3.�Exported Parameters

### 1.3.1.�`setvars` (integer)

Set to 1 to enable setting all above-mentioned environment variables for all executed commands.

**WARNING: Before enabling this parameter, make sure your "/bin/sh" is safe from the Shellshock bash vulnerability!!!**

_Default value is 0 (disabled)._

**Example�1.1.�Set “setvars” parameter**

...
modparam("exec", "setvars", 1)
...

  

### 1.3.2.�`time_to_kill` (integer)

If set, this parameter specifies the longest time (in seconds) that a program is allowed to execute. Once this duration is exceeded, the program is terminated (SIGTERM).

NOTE: due to internal limitations, a SIGTERM will actually be sent to **all** job pids once the "time\_to\_kill" expiration timeout hits. On a standard system, this should have no side-effects, as pids are monotonically increasing in a slow manner, and OpenSIPS should run under the "opensips" user, thus rendering it unable to terminate non-child processes. If this is not the case on your system, do not use the OpenSIPS "time\_to\_kill" feature -- rather implement it within your external app!

_Default value is 0 (disabled)._

**Example�1.2.�Set “time\_to\_kill” parameter**

...
modparam("exec", "time\_to\_kill", 20)
...