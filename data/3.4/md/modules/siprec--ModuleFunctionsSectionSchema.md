## 1.8.�Exported Functions

### 1.8.1.� `siprec_start_recording(srs)`

Calling this function on an initial _INVITE_ engages call recording to SRS(s) for that call. Note that it does not necessary mean that the call will be recorded - it just means that OpenSIPS will query instruct the SRS that a new call has started, but the SRS might decide that the recording is disabled for those participants.

_Note_ that the call recording is not started right away, but only when the callee provides an SDP as well (usually in a 200 OK, or possibly a 183 Ringing).

_Note_ if you only want to start recording when the call is established (200 OK is received), then you should call this function in the onreply route processing that 200 OK.

Parameters:

*   _srs_ (string) - a comma-separated list of SRS URIs. These URIs are used in the order specified. See [siprec\_srs\_failover](#siprec_srs_failover "1.4.�SRS Failover") for more information.
    

The function returns false when an internal error is triggered and the call recording setup fails. Otherwise, if all the internal mechanisms are activated, it returns true.

This function can be used from REQUEST\_ROUTE.

**Example�1.2.�Use `siprec_start_recording()` function with a single SRS**

	...
	if (!has\_totag() && is\_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1";
		xlog("Engage SIPREC call recording to $var(srs) for $ci\\n");
		siprec\_start\_recording($var(srs));
	}
	...
	

  

**Example�1.3.�Use `siprec_start_recording()` function with multiple SRS servers**

	...
	if (!has\_totag() && is\_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1, sip:127.0.0.1;transport=TCP";
		xlog("Engage SIPREC call recording to servers $var(srs) for $ci in inbound group\\n");
		siprec\_start\_recording($var(srs), "inbound");
	}
	...
	

  

**Example�1.4.�Use `siprec_start_recording()` function with custom XML values for participants**

	...
	$xml(caller\_xml) = "<nameID></nameID>";
	$xml(caller\_xml/nameID.attr/aor) = "sip:6024151234@10.0.0.11:5090";
	$xml(caller\_xml/nameID) = "<name>test</name>";
	$siprec(caller) = $xml(caller\_xml/nameID);
	siprec\_start\_recording($var(srs));
	...
	

  

**Example�1.5.�Use `siprec_start_recording()` function with custom headers**

	...
	$siprec(headers) = "X-MY-CUSTOM\_HDR: 1\\r\\n";
	siprec\_start\_recording($var(srs));
	...
	

  

### 1.8.2.� `siprec_pause_recording()`

Pauses the recording for the ongoing call. Should be called after the dialog has matched.

This function can be used from any route.

**Example�1.6.�Use `siprec_pause_recording()`**

	...
	if (has\_totag() && is\_method("INVITE")) {
		if (is\_audio\_on\_hold())
			siprec\_pause\_recording();
	}
	...
	

  

### 1.8.3.� `siprec_resume_recording()`

Resumes the recording for the ongoing call. Should be called after the dialog has matched.

This function can be used from any route.

**Example�1.7.�Use `siprec_resume_recording()`**

	...
	if (has\_totag() && is\_method("INVITE")) {
		if (!is\_audio\_on\_hold())
			siprec\_resume\_recording();
	}
	...