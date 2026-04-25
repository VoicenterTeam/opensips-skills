## 1.5.�Exported Functions

### 1.5.1.� `sstCheckMin(send_reply_flag)`

Check the current Session-Expires / MIN-SE values against the sst\_min\_se parameter value. If the Session-Expires or MIN\_SE header value is less then modules minimum value, this function will return true.

If the fuction is called with the send\_reply\_flag set to true (1) and the requested Session-Expires / MIN-SE values are too small, a 422 reply will be sent for you. The 422 will carry a MIN-SE: header with the sst min\_se parameter value set.

Meaning of the parameters is as follows:

*   _min\_allowed_ (int, optional) - The value to compare the MIN\_SE header value to.
    

**Example�1.7.�`sstCheckMin` usage**

...
modparam("sst", "sst\_flag", "SST\_FLAG")
modparam("sst", "min\_se", 2400) # Must be >= 90
...

route {
  if ($rm=="INVITE") {
	if (sstCheckMin(1)) {
		xlog("L\_ERR", "422 Session Timer Too Small reply sent.\\n");
		exit;
	}
	# track the session timers via the dialog module
	setflag(SST\_FLAG);
	create\_dialog();
  }
}

...