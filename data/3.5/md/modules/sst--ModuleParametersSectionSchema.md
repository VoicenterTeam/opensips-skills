## 1.4.�Exported Parameters

### 1.4.1.�`enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the dialog processing. Set it to zero to disable or to non-zero to enable it.

_Default value is “1” (enabled)._

**Example�1.2.�Set `enable_stats` parameter**

...
modparam("sst", "enable\_stats", 0)
...

  

### 1.4.2.�`min_se` (integer)

The value is used to set the proxies MIN-SE value and is used in the 422 reply as the proxies MIN-SE: header value if the sstCheckMin() flag is set to true and the check fails.

If not set and sstCheckMin() is called with the send-reply flag set to true, the default 1800 seconds will be used as the compare and the MIN-SE: header value if the 422 reply is sent.

_Default value is “1800” seconds._

**Example�1.3.�Set `min_se` parameter**

...
modparam("sst", "min\_se", 2400)
...

  

### 1.4.3.�`sst_interval` (integer)

The sst minimum interval in Session-Expires header if OpenSIPS request the use of session times. The used value will be the maximum value between OpenSIPS minSE, UAS minSE and this value.

Per default the interval used will be the min\_se value

_Default value is “0” seconds._

**Example�1.4.�Set `sst_interval` parameter**

...
modparam("sst", "sst\_interval", 2400)
...

  

### 1.4.4.�`reject_to_small` (integer)

In the initial INVITE if the UAC has requested a Session-Expire: and it's value is smaller then our local policies Min-SE (see min\_se above), then the PROXY has the right to reject the call by replying to the message with a 422 Session Timer Too Small and state our local Min-SE: value. The INVITE is NOT forwarded on through the PROXY.

This flag if true will tell the SST module to reject the INVITE with a 422 response. If false, the INVITE is forwarded through the PROXY with out any modifications.

_Default value is “1” (true/on)._

**Example�1.5.�Set `reject_to_small` parameter**

...
modparam("sst", "reject\_to\_small", 0)
...

  

### 1.4.5.�`sst_flag` (string)

Keeping with OpenSIPS, the module will not do anything to any message unless instructed to do so via the opensips.cfg script. You must set the sst\_flag value in the setflag() call of the INVITE you want the sst module to process. But before you can do that, you need to tell the sst module which flag value you are assigning to sst.

In most cases when ever you create a new dialog via create\_dialog() function,you will want to set the sst flag. If create\_dialog() is not called and the sst flag is set, it will not have any effect.

This parameter must be set of the module will not load.

_Default value is “Not set!”._

**Example�1.6.�Set `sst_flag` parameter**

...
modparam("sst", "sst\_flag", "SST\_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(SST\_FLAG); # Set the sst flag
    create\_dialog(); # and then create the dialog
  }
  ...
}