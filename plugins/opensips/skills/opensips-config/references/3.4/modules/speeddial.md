# speeddial Module Reference
<!-- generated-from: data/3.4/modules/speeddial.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 speeddial module. Read this file when configuring or debugging the speeddial module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

- `database module` — must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

The URL of database where the table containing speed dial records.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** mysql://user:xxx@localhost/db_name.

```opensips
modparam("speeddial", "db_url", "mysql://user:xxx@localhost/db_name")
```
### `domain_column` (string)

The name of column storing the domain of the owner of the speed dial record.

*Default value is domain.*

**Example.** userdomain.

```opensips
modparam("speeddial", "domain_column", "userdomain")
```
### `domain_prefix` (string)

If the domain of the owner (From URI) starts with the value of this parameter, then it is stripped before performing the lookup of the short number.

*Default value is NULL.*

**Example.** tel..

```opensips
modparam("speeddial", "domain_prefix", "tel.")
```
### `new_uri_column` (string)

The name of the column containing the URI that will be use to replace the short dial URI.

*Default value is new_uri.*

**Example.** real_uri.

```opensips
modparam("speeddial", "new_uri_column", "real_uri")
```
### `sd_domain_column` (string)

The name of the column storing the domain of the short dial address.

*Default value is sd_domain.*

**Example.** short_domain.

```opensips
modparam("speeddial", "sd_domain_column", "short_domain")
```
### `sd_user_column` (string)

The name of the column storing the user part of the short dial address.

*Default value is sd_username.*

**Example.** short_user.

```opensips
modparam("speeddial", "sd_user_column", "short_user")
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
modparam("speeddial", "use_domain", 1)
```
### `user_column` (string)

The name of column storing the user name of the owner of the speed dial record.

*Default value is username.*

**Example.** userid.

```opensips
modparam("speeddial", "user_column", "userid")
```

## Exported Functions

### `sd_lookup(table [, owner])`

The function lookups the short dial number from R-URI in 'table' and replaces the R-URI with associated address.

**Parameters:**

- `owner` *(string, optional)* — The SIP URI of the owner of short dialing codes. If not pressent, URI of From header is used.
- `table` *(string, required)* — The name of the table storing the speed dial records.

**Usable from:** REQUEST_ROUTE

**Example.** `sd_lookup` usage.

```opensips
...
# 'speed_dial' is the default table name created by opensips db script
if($ru=~"sip:\[0-9\]{2}@.\*")
	sd_lookup("speed_dial");
# use auth username
if($ru=~"sip:\[0-9\]{2}@.\*")
	sd_lookup("speed_dial", "sip:$au@$fd");
...
```

## Configuration Examples

### OpenSIPS config script - sample speeddial usage

Next picture displays a sample usage of speeddial.

```opensips
...
# sample config script to use speeddial module
#

# ----------- global configuration parameters ------------------------

check_via=no	# (cmd. line: -v)
dns=no          # (cmd. line: -r)
rev_dns=no      # (cmd. line: -R)

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
loadmodule "mi_fifo.so"

# ----------------- setting module-specific parameters ---------------

# -- mi_fifo params --

modparam("mi_fifo", "fifo_name", "/tmp/opensips_fifo")

# -- usrloc params --

modparam("usrloc", "db_mode",   0)

# -------------------------  request routing logic -------------------

# main routing logic
route{

	# initial sanity checks 
	if (!mf_process_maxfwd_header("10"))
	{
		sl_send_reply(483,"Too Many Hops");
		exit;
	};
	if ($ml >=  65535 )
	{
		sl_send_reply(513, "Message too big");
		exit;
	};

	if (!$rm=="REGISTER") record_route();

	if (loose_route())
	{
		if (!t_relay())
		{
			sl_reply_error();
		};
		exit;
	};

	if (!is_myself("$rd"))
	{
		if (!t_relay())
		{
			sl_reply_error();
		};
		exit;
	};

	if (is_myself("$rd"))
	{
		if ($rm=="REGISTER")
		{
			save("location");
			exit;
		};

		if($ru=~"sip:\[0-9\]{2}@.*")
			sd_lookup("speeddial");

		lookup("aliases");
		if (!is_myself("$rd"))
		{
			if (!t_relay())
			{
				sl_reply_error();
			};
			exit;
		};

		if (!lookup("location"))
		{
			sl_send_reply(404, "Not Found");
			exit;
		};
	};

	if (!t_relay())
	{
		sl_reply_error();
	};
}

...
```
