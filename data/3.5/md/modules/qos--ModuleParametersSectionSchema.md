## 1.4.�Exported Parameters

### 1.4.1.�`qos_flag` (string)

Keeping with OpenSIPS, the module will not do anything to any message unless instructed to do so via the config script. You must set the qos\_flag value in the setflag() call of the INVITE you want the qos module to process. But before you can do that, you need to tell the qos module which flag value you are assigning to qos.

In most cases when ever you create a new dialog via create\_dialog() function,you will want to set the qos flag. If create\_dialog() is not called and the qos flag is set, it will not have any effect.

This parameter must be set of the module will not load.

_Default value is “Not set!”._

**Example�1.1.�Set `qos_flag` parameter**

...
modparam("qos", "qos\_flag", "QOS\_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(QOS\_FLAG); # Set the qos flag
	create\_dialog(); # create the dialog
  }
  ...
}