## 1.5.�Exported Functions

### 1.5.1.� `sca_set_calling_line([line])`

The function (to be used only in internal publishing mode) is setting for the current new call (initinal INVITE) the outbound line - the line used for calling out.

If no parameter is provided, the name of the line is taken from the SIP FROM header of the INVITE. You can override that by providing the name of the line as a string parameter - be careful as the value must be a SIP URI !

This function can be used from REQUEST\_ROUTE.

**Example�1.5.�`sca_set_calling_line()` usage**

...
	if (is\_method("INVITE") and !has\_totag()) {
		sca\_set\_calling\_line();
	}
...

  

### 1.5.2.� `sca_set_called_line([line])`

The function (to be used only in internal publishing mode) is setting for the current new call (initinal INVITE) the inbound line - the line the call was received on.

If no parameter is provided, the name of the line is taken from the SIP RURI of the INVITE. You can override that by providing the name of the line as a string parameter - be careful as the value must be a SIP URI ! Variables are accepted.

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�`sca_set_called_line()` usage**

...
	if (is\_method("INVITE") and !has\_totag()) {
		sca\_set\_called\_line();
	}
...