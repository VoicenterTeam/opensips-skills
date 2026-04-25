## 1.5.�Exported Functions

### 1.5.1.� `sca_init_request(shared_line)`

This is the function that must be called by the script writer on an initial INVITE for which an SCA call must be instantiated (see the call from alice1 in the above diagram).

Meaning of the parameters:

*   _shared\_line_ (int) - an integer identifying the call leg as being an "appearnace" call or a "shared" call:
    
    *   0: "shared" call
        
    *   1: "appearance" call
        
    

**Example�1.16.�`sca_init_request()` usage**

...
modparam("b2b\_sca",
	"shared\_line\_spec\_param","$var(shared\_line)")
modparam("b2b\_sca",
	"appearance\_name\_addr\_spec\_param","$var(appearance\_name\_addr)")
modparam("b2b\_sca",
	"watchers\_avp\_spec","$avp(watchers\_avp\_spec)")

...

	# Setting the shared call identifier
	$var(shared\_line) = "alice";

	# Setting the watchers
	$avp(watchers\_avp\_spec) = "sip:alice1@example.com";
	$avp(watchers\_avp\_spec) = "sip:alice2@example.com";

	if (INCOMING\_SHARED\_CALL) {
		# The incoming call is a 'shared' call
		$var(shared\_line\_entity) = 0;
		# Setting the appearance name address
		$var(appearance\_name\_addr) = $fu;
	}
	else {
		# The incoming call is an 'appearance' call
		# - see Alice's initial call leg in the given example
		$var(shared\_line\_entity) = 1;
		# Setting the appearance name address
		$var(appearance\_name\_addr) = $tu;
	}

	# Initiate the call
	if (!sca\_init\_request($var(shared\_line\_entity))) {
		send\_reply(403, "Internal Server Error (SLA)");
		exit;
	}
...

  

### 1.5.2.�`sca_bridge_request(shared_line_to bridge)`

This is the function that must be called by the script writer on an initial "appearance" INVITE for an existing shared call. It will bridge the current "appearance" call with the existing "shared" call and the old "appearance" call will be disconnected (see the call from alice2 in the above diagram).

Meaning of the parameters:

*   _shared\_line\_to\_bridge_ (string) - a string identifying the shared line/call that was previously set by sca\_init\_request().
    

...
	if ($rU==NULL && is\_method("INVITE") &&
		$fU==$tU && is\_present\_hf("Call-Info")) {
		# The incoming call is an 'appearance' call
		# - see Alice's call from alice2 in the given example
		$var(shared\_line\_to\_bridge) = "alice";
		if (!sca\_bridge\_request($var(shared\_line\_to\_bridge)))
			send\_reply(403, "Internal SLA Error");
			exit;
		}
	}
...