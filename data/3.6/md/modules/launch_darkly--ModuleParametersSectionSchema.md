## 1.3.�Exported Parameters

### 1.3.1.�`sdk_key` (string)

The LaunchDarkly SDK key used to connect to the service. This is a mandatory parameter.

**Example�1.1.�Set `sdk_key` parameter**

...
modparam("launch\_darkly", "sdk\_key", "sdk-12345678-abcd-12ab-1234-0123456789abc")
...

  

### 1.3.2.�`ld_log_level` (string)

The LaunchDarkly specific log level to be used by the LD SDK/libray to log its internal messages. Note that these log produced by the LD library (according to this ld\_log\_level) will be further subject to filtering according to the overall OpenSIPS log\_level.

Accepted values are _LD\_LOG\_FATAL_, _LD\_LOG\_CRITICAL_, _LD\_LOG\_ERROR_, _LD\_LOG\_WARNING_, _LD\_LOG\_INFO_, _LD\_LOG\_DEBUG_, _LD\_LOG\_TRACE_.

If not set or set to an unsupported value, the _LD\_LOG\_WARNING_ level will be used by default.

**Example�1.2.�Set `log_level` parameter**

...
modparam("launch\_darkly", "ld\_log\_level", "LD\_LOG\_CRITICAL")
...

  

### 1.3.3.�`connect_wait` (integer)

The time to wait (in miliseconds) when connecting to the LD service. An initial failure in connecting to the LD service may be addressed by increasing this wait value.

The default value is 500 miliseconds.

**Example�1.3.�Set `connect_wait` parameter**

...
modparam("launch\_darkly", "connect\_wait", 100)
...

  

### 1.3.4.�`re_init_interval` (integer)

The minimum time interval (in seconds) to try again to init the LD client in the situation when the module was not able to init the LC connection at startup. In case of such failure, the module will automatically re-try to init its LD client on-demand, whnever the feature flag is checked from script, but not sooner than \`re\_init\_interval\`. Note: if there are no flag checkings to be performed, the re-init may be attempted longer than \`re\_init\_interval\`.

The default value is 10 seconds.

**Example�1.4.�Set `re_init_interval` parameter**

...
modparam("launch\_darkly", "re\_init\_interval", 30)
...