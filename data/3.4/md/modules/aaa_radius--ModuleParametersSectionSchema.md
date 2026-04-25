## 1.3.�Exported Parameters

### 1.3.1.�`sets (string)`

Sets of Radius AVPs to be used when building custom RADIUS requests (set of input RADIUS AVPs) or when fetching data from the RADIUS reply (set of output RADIUS AVPs).

The format for a set definition is the following:

*   " set\_name = ( attribute\_name1 = var1 \[, attribute\_name2 = var2 \]\* ) "
    

The left-hand side of the assignment must be an attribute name known by the RADIUS dictionary.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

**Example�1.1.�Set `sets` parameter**

...
modparam("aaa\_radius","sets","set4  =  (  Sip-User-ID  =   $avp(10)
			,   Sip-From-Tag=$si,Sip-To-Tag=$tt      )      ")
...

...
modparam("aaa\_radius","sets","set1 = (User-Name=$var(usr), Sip-Group = $var(grp),
			Service-Type = $var(type)) ")
...

...
modparam("aaa\_radius","sets","set2 = (Sip-Group = $var(sipgrup)) ")
...

  

### 1.3.2.�`radius_config (string)`

Radiusclient configuration file.

This parameter is optional. It must be set only if the radius\_send\_acct and radius\_send\_auth functions are used.

**Example�1.2.�Set `radius_config` parameter**

...
modparam("aaa\_radius", "radius\_config", "/etc/radiusclient-ng/radiusclient.conf")
...

  

### 1.3.3.�`syslog_name (string)`

Enable logging of the client library to syslog, using the given log name.

This parameter is optional. Radius client libraries will try to use syslog to report errors (such as problems with dictionaries) with the given ident string .If this parameter is set, then these errors are visible in syslog. Otherwise errors are hidden.

By default this parameter is not set (no logging).

**Example�1.3.�Set `syslog_name` parameter**

...
modparam("aaa\_radius", "syslog\_name", "aaa-radius")
...

  

### 1.3.4.�`fetch_all_values (integer)`

For the output sets, this parameter controls if all the values (for the same RADIUS AVP) should be returned (otherwise only the first value will be returned). When enabling this options, be sure that the variable you use to get the RADIUS output can store multiple values (like the AVP variables).

By default this parameter is disabled (set to 0) for backward compatibility reasons.

**Example�1.4.�Set `fetch_all_values` parameter**

...
modparam("aaa\_radius", "fetch\_all\_values", 1)
...