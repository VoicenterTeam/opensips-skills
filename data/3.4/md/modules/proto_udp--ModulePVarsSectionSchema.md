# proto\_udp Module

### OpenSIPS Project

#### Edited by

### Liviu Chircu

Copyright � 2015 OpenSIPS Project

---

**List of Examples**

1.1. [Set `udp_port` parameter](#idp151024)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The **proto\_udp** module is a built-in transport module which exports the required logic in order to handle UDP-based communication. (socket initialization and send/recv primitives to be used by higher-level network layers)

Once loaded, you will be able to define _"udp:"_ listeners in your script.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`udp_port` (integer)

The default port to be used for all UDP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the UDP listeners) and the SIP sending part (if the destination URI has no explicit port).

If you want to change only the listening port for UDP, use the port option in the SIP listener defintion.

_Default value is 5060._

**Example�1.1.�Set `udp_port` parameter**

...
modparam("proto\_udp", "udp\_port", 5070)
...

  

## Chapter�2.�Frequently Asked Questions

**2.1.**

After switching to OpenSIPS 2.1, I'm getting this error: "listeners found for protocol udp, but no module can handle it"

You need to load the "proto\_udp" module. In your script, make sure you do a **loadmodule "proto\_udp.so"** after setting the **[mpath](https://opensips.org/Documentation/Script-CoreParameters-2-1#toc74)**.

**2.2.**

I cannot locate "proto\_udp.so". Where is it?

The "proto\_udp" and "proto\_tcp" modules are simply built into the opensips binary by default. They are not available as shared libraries, but look like modules for code consistency reasons.