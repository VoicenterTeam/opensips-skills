## 1.3.�Exported Parameters

### 1.3.1.� `primary_ip` (str)

The IP of an interface which is configured as an UDP SIP listener in OpenSIPS. This is a mandatory parameter, unless [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled.

Syntax: "ip \[/ advertised\_ip\]

By default, the _primary\_ip_ and the advertised _primary\_ip_ will be identical. This may be changed with an optional "/ xxx.xxx.xxx.xxx" string.

**Example�1.1.�Set `primary_ip` parameter**

...
modparam("stun", "primary\_ip", "192.168.0.100")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "primary\_ip", "192.168.0.100 / 64.50.46.78")
...
				

  

### 1.3.2.� `primary_port` (str)

The port configured (together with the _primary\_ip_) as an UDP SIP listener in OpenSIPS. The default value is 5060.

Syntax: "port \[/ advertised\_port\]

By default, the _primary\_port_ and the advertised _primary\_port_ will be identical. This may be changed with an optional "/ adv\_port" string.

**Example�1.2.�Set `primary_port` parameter**

...
modparam("stun", "primary\_port", "5060")

# Listening on a primary port, but advertising a different one
modparam("stun", "primary\_port", "5060 / 5062")
...
				

  

### 1.3.3.� `alternate_ip` (str)

Another IP from another interface. This is a mandatory parameter.

If [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled, the alternate IP must be either:

*   an IP from an existing UDP SIP listener configured in OpenSIPS, but one that is different from all the other UPD listeners;
    
*   an IP that is different from the UDP SIP listeners configured in OpenSIPS.
    

Syntax: "ip \[/ advertised\_ip\]

By default, the _alternate\_ip_ and the advertised _alternate\_ip_ will be identical. This may be changed with an optional "/ xxx.xxx.xxx.xxx" string.

**Example�1.3.�Set `alternate_ip` parameter**

...
modparam("stun","alternate\_ip","11.22.33.44")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "alternate\_ip", "192.168.0.100 / 64.78.46.50")
...
				

  

### 1.3.4.� `alternate_port` (str)

The port used by the STUN server for the second interface. The default value is 3478 (default STUN port).

If [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled, the alternate port must be either:

*   a port from an existing UDP SIP listener configured in OpenSIPS, but one that is different from all the other UPD listeners;
    
*   a port that is different from the UDP SIP listeners configured in OpenSIPS.
    

Syntax: "port \[/ advertised\_port\]

By default, the _alternate\_port_ and the advertised _alternate\_port_ will be identical. This may be changed with an optional "/ adv\_port" string.

**Example�1.4.�Set `alternate_port` parameter**

...
modparam("stun","alternate\_port","3479")

# Listening on an alternate port, but advertising a different one
modparam("stun", "alternate\_port", "5060 / 5062")
...
				

  

### 1.3.5.� `use_listeners_as_primary` (int)

Setting this parameter to _1_ will allow all configured UDP SIP listeners to be automatically used as "primary" STUN sockets.

The [primary\_ip](#param_primary_ip "1.3.1.� primary_ip (str)") and [primary\_port](#param_primary_port "1.3.2.� primary_port (str)") parameters will be ignored when this behavior is enabled.

The default value is _0_ (disabled).

**Example�1.5.�Set `use_listeners_as_primary` parameter**

...
modparam("stun","use\_listeners\_as\_primary",1)
...