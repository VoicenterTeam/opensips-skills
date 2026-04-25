# speeddial Module Reference
<!-- generated-from: data/3.5/modules/speeddial.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 speeddial module. Read this file when configuring or debugging the speeddial module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides on-server speed dial facilities. An user can store records consisting of pairs short numbers (2 digits) and SIP addresses into a table of OpenSIPS. Then it can dial the two digits whenever it wants to call the SIP address associated with them.

## Dependencies

### OpenSIPs Modules

- `database module (mysql, dbtext, ...)` — must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

The URL of database where the table containing speed dial records.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** mysql://user:xxx@localhost/db\_name.

```opensips
modparam("speeddial", "db\_url", "mysql://user:xxx@localhost/db\_name")
```
### `domain_column` (string)

The name of column storing the domain of the owner of the speed dial record.

*Default value is “domain”.*

**Example.** userdomain.

```opensips
modparam("speeddial", "domain\_column", "userdomain")
```
### `domain_prefix` (string)

If the domain of the owner (From URI) starts with the value of this parameter, then it is stripped before performing the lookup of the short number.

*Default value is NULL.*

**Example.** tel..

```opensips
modparam("speeddial", "domain\_prefix", "tel.")
```
### `new_uri_column` (string)

The name of the column containing the URI that will be use to replace the short dial URI.

*Default value is “new\_uri”.*

**Example.** real\_uri.

```opensips
modparam("speeddial", "new\_uri\_column", "real\_uri")
```
### `sd_domain_column` (string)

The name of the column storing the domain of the short dial address.

*Default value is “sd\_domain”.*

**Example.** short\_domain.

```opensips
modparam("speeddial", "sd\_domain\_column", "short\_domain")
```
### `sd_user_column` (string)

The name of the column storing the user part of the short dial address.

*Default value is “sd\_username”.*

**Example.** short\_user.

```opensips
modparam("speeddial", "sd\_user\_column", "short\_user")
```
### `use_domain` (integer)

The parameter specifies wheter or not to use the domain when searching a speed dial record (0 - no domain, 1 - use domain from From URI, 2 - use both domains, from From URI and from request URI).

*Default value is 0.*

**Possible values:**

- 0
- 1
- 2

**Example.** 1.

```opensips
modparam("speeddial", "use\_domain", 1)
```
### `user_column` (string)

The name of column storing the user name of the owner of the speed dial record.

*Default value is “username”.*

**Example.** userid.

```opensips
modparam("speeddial", "user\_column", "userid")
```

## Exported Functions

### `sd_lookup(table [, owner])`

The function lookups the short dial number from R-URI in 'table' and replaces the R-URI with associated address.

**Parameters:**

- `owner` *(string, optional)* — The SIP URI of the owner of short dialing codes. If not pressent, URI of From header is used.
- `table` *(string, required)* — The name of the table storing the speed dial records.

**Usable from:** REQUEST_ROUTE

**Example.** sd_lookup usage.

```opensips
...
# 'speed\_dial' is the default table name created by opensips db script
if($ru=~"sip:\[0-9\]{2}@.*")
	sd\_lookup("speed\_dial");
# use auth username
if($ru=~"sip:\[0-9\]{2}@.*")
	sd\_lookup("speed\_dial", "sip:$au@$fd");
...
```

## Configuration Examples

### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("speeddial", "db\_url", "mysql://user:xxx@localhost/db\_name")
...
```
### Set `user_column` parameter

Set `user_column` parameter

```opensips
...
modparam("speeddial", "user\_column", "userid")
...
```
### Set `domain_column` parameter

Set `domain_column` parameter

```opensips
...
modparam("speeddial", "domain\_column", "userdomain")
...
```
### Set `sd_user_column` parameter

Set `sd_user_column` parameter

```opensips
...
modparam("speeddial", "sd\_user\_column", "short\_user")
...
```
### Set `sd_domain_column` parameter

Set `sd_domain_column` parameter

```opensips
...
modparam("speeddial", "sd\_domain\_column", "short\_domain")
...
```
### Set `new_uri_column` parameter

Set `new_uri_column` parameter

```opensips
...
modparam("speeddial", "new\_uri\_column", "real\_uri")
...
```
### Set `domain_prefix` parameter

Set `domain_prefix` parameter

```opensips
...
modparam("speeddial", "domain\_prefix", "tel.")
...
```
### Set `use_domain` parameter

Set `use_domain` parameter

```opensips
...
modparam("speeddial", "use\_domain", 1)
...
```
### `sd_lookup` usage

`sd_lookup` usage

```opensips
...
# 'speed\_dial' is the default table name created by opensips db script
if($ru=~"sip:\[0-9\]{2}@.*")
	sd\_lookup("speed\_dial");
# use auth username
if($ru=~"sip:\[0-9\]{2}@.*")
	sd\_lookup("speed\_dial", "sip:$au@$fd");
...
```
### OpenSIPS config script - sample speeddial usage

Next picture displays a sample usage of speeddial.

```opensips
...
# sample config script to use speeddial module
#

# ----------- global configuration parameters ------------------------

check\_via=no	# (cmd. line: -v)
dns=no          # (cmd. line: -r)
rev\_dns=no      # (cmd. line: -R)

# ------------------ module loading ----------------------------------

mpath="/usr/local/lib/opensips/modules"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "maxfwd.so"
loadmodule "usrloc.so"
loadmodule "registrar.so"
loadmodule "textops.so"
loadmodule "mysql.so"
loadmodule "speeddial.so"
loadmodule "mi\_fifo.so"

# ----------------- setting module-specific parameters ---------------

# -- mi\_fifo params --

modparam("mi\_fifo", "fifo\_name", "/tmp/opensips\_fifo")

# -- usrloc params --

modparam("usrloc", "db\_mode",   0)

# -------------------------  request routing logic -------------------

# main routing logic
route{

	# initial sanity checks 
	if (!mf\_process\_maxfwd\_header("10"))
	{
		sl\_send\_reply(483,"Too Many Hops");
		exit;
	};
	if ($ml >=  65535 )
	{
		sl\_send\_reply(513, "Message too big");
		exit;
	};

	if (!$rm=="REGISTER") record\_route();

	if (loose\_route())
	{
		if (!t\_relay())
		{
			sl\_reply\_error();
		};
		exit;
	};

	if (!is\_myself("$rd"))
	{
		if (!t\_relay())
		{
			sl\_reply\_error();
		};
		exit;
	};

	if (is\_myself("$rd"))
	{
		if ($rm=="REGISTER")
		{
			save("location");
			exit;
		};

		if($ru=~"sip:\[0-9\]{2}@.*")
			sd\_lookup("speeddial");

		lookup("aliases");
		if (!is\_myself("$rd"))
		{
			if (!t\_relay())
			{
				sl\_reply\_error();
			};
			exit;
		};

		if (!lookup("location"))
		{
			sl\_send\_reply(404, "Not Found");
			exit;
		};
	};

	if (!t\_relay())
	{
		sl\_reply\_error();
	};
}

...
```
