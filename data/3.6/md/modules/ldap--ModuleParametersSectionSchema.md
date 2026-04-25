## 1.4.�Exported Parameters

### 1.4.1.�config\_file (string)

Full path to LDAP configuration file.

Default value: `/usr/local/etc/opensips/ldap.cfg`

**Example�1.12.�`config_file` parameter usage**

modparam("ldap", "config\_file", "/etc/opensips/ldap.ini")
		  

  

### 1.4.2.�max\_async\_connections (int)

Number of maximum asynchronous connections that will be started with the ldap server for executing asynchronous ldap\_search calls. The number of connections is per process, so if there are 8 worker processes with 20 max\_async\_connections, there will be a maximum of 160 connections to the ldap server.

Default value: `20`

**Example�1.13.�`max_async_connections` parameter usage**

modparam("ldap", "max\_async\_connections", 50)