## 1.4.�Exported Parameters

### 1.4.1.�`aaa_url` (string)

This is the url representing the connection to the AAA server.

_Note:_ Currently the module only supports connections to a Diameter server. The path to the AVPs configuration file is also required, otherwise the module will not start, or not work properly.

**Example�1.1.�`aaa_url` parameter usage**

modparam("auth\_aaa", "aaa\_url", "diameter:freeDiameter.conf;extra-avps-file:/etc/freeDiameter/aka\_av\_diameter.dictionary")
		

  

### 1.4.2.�`realm` (string)

The Realm used in the Origin Diameter commands.

Default value is “diameter.test”.

**Example�1.2.�`realm` parameter usage**

		
modparam("aka\_av\_diameter", "realm", "scscf.ims.mnc001.mcc001.3gppnetwork.org")
		

  

### 1.4.3.�`server_uri` (string)

The Server-URI used in the Diameter commands.

If it is left empty, the Server-Name will be created by adding "sip:" in front of the realm parameter value (e.g. “sip:scscf.ims.mnc001.mcc001.3gppnetwork.org”).

**Example�1.3.�`server_uri` parameter usage**

		
modparam("aka\_av\_diameter", "server\_uri", "sip:scscf.ims.mnc001.mcc001.3gppnetwork.org")