## 1.4.�Exported Parameters

### 1.4.1.�`hash_size` (int)

The size of the hash table that stores the MSRP session information. It is the 2 logarithmic value of the real size.

_Default value is “10”_ (1024 records).

**Example�1.1.�Set `hash_size` parameter**

...
modparam("msrp\_ua", "hash\_size", 16)
...
		

  

### 1.4.2.�`cleanup_interval` (int)

The interval between full iterations of the sessions table in order to clean up expired MSRP sessions.

_Default value is “60”._

**Example�1.2.�Set `cleanup_interval` parameter**

...
modparam("msrp\_ua", "cleanup\_interval", 30)
...
		

  

### 1.4.3.�`max_duration` (integer)

The maximum duration of a call. If set to 0, there will be no limitation.

The default value is 12 \* 3600 seconds (12 hours).

**Example�1.3.�max\_duration parameter example**

...
modparam("msrp\_ua", "max\_duration", 7200)
...

  

### 1.4.4.�`my_uri` (string)

The MSRP URI of the OpenSIPS endpoint. This URI will be advertised in the SDP offer provided to peers when setting up a session and should match one of the MSRP listeners defined in the script.

The _session-id_ part of the URI should be ommited.

If the port is not set explicitly, the default value of 2855 wil be assumed

**Example�1.4.�`my_uri` parameter usage**

...
modparam("msrp\_ua", "my\_uri", "msrp://opensips.org:2855;tcp")
...

  

### 1.4.5.�`advertised_contact` (string)

Contact to be used in the generated SIP requests. For sessions answered by OpenSIPS, if it is not set, it is constructed dynamically from the socket where the initiating request was received.

This parameter is mandatory when using the [msrp\_ua\_start\_session](#mi_msrp_ua_start_session "1.6.2.� msrp_ua_start_session") MI function.

**Example�1.5.�`advertised_contact` parameter usage**

...
modparam("msrp\_ua", "advertised\_contact", "sip:oss@opensips.org")
...

  

### 1.4.6.�`relay_uri` (string)

URI of an MSRP relay to use for both accepted and initiated sessions.

Credentials for the MSRP client are provided via the _uac\_auth_ module by setting the _credential_ module parameter.

If not set, no relay will be used.

**Example�1.6.�`relay_uri` parameter usage**

...
modparam("msrp\_ua", "relay\_uri", "msrp://opensips.org:2856;tcp")
...