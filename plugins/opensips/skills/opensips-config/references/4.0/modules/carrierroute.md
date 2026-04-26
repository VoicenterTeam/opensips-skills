# carrierroute Module Reference
<!-- generated-from: data/4.0/modules/carrierroute.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 carrierroute module. Read this file when configuring or debugging the carrierroute module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

A module which provides routing, balancing and blacklisting capabilities.

## How It Works

The module provides routing, balancing and blacklisting capabilities. It reads routing entries from a database source or from a config file at OpenSIPS startup. It can uses one routing tree (for one carrier), or if needed for every user a different routing tree (unique for each carrier) for number prefix based routing. It supports several route tree domains, e.g. for failback routes or different routing rules for VoIP and PSTN targets.

Based on the tree, the module decides which number prefixes are forwarded to which gateway. It can also distribute the traffic by ratio parameters. Furthermore, the requests can be distributed by a hash funcion to predictable destinations. The hash source is configurable, two different hash functions are available.

This modules scales up to more than a few million users, and is able to handle more than several hundred thousand routing table entries. It should be able to handle more, but this is not that much tested at the moment. In load balancing scenarios the usage of the config file mode is recommended, to avoid the additional complexity that the database driven routing creates.

Routing tables can be reloaded and edited (in config file mode) with the MI interface, the config file is updated according the changes. This is not implemented for the db interface, because its easier to do the changes directly on the db. But the reload and dump functions works of course here too.

Some module functionality is not fully available in the config file mode, as it is not possible to specify all information that can be stored in the database tables in the config file. Further information about these limitations is given in later sections. For user based routing or LCR you should use the database mode.

Basically this module could be used as an replacement for the lcr and the dispatcher module, if you have certain performance, flexibility and/or integration requirements that these modules don't handle properly. But for small installations it probably make more sense to use the lcr and dispatcher module.

If you want to use this module in failure routes, then you need to call “append_branch()” after rewriting the request URI in order to relay the message to the new target. Its also supportes the usage of database derived failure routing descisions with the carrierfailureroute table.

## Dependencies

### OpenSIPs Modules

- `database module` — Required when a database is used as configuration data source. Only SQL based databases are supported, as this module needs the capability to issue raw queries. Its not possible to use the dbtext or db_berkeley module at the moment.
- `tm module` — Required when you want to use the $T_reply_code pseudo-variable in the “cr_next_domain” function.

### External Libraries

- `libconfuse` — Configuration file parser library.

## Exported Parameters

### `carrier_column` (string)

Name of the column containing the carrier id.

*Default value is carrier.*

**Example.** carrier.

```opensips
modparam("carrierroute", "carrier_column", "carrier")
```
### `carrier_id_col` (string)

The name of the column in the carrier table containing the carrier id.

*Default value is id.*

**Example.** id.

```opensips
...
modparam("carrierroute", "carrier_id_col", "id")
...
```
### `carrier_name_col` (string)

The name of the column in the carrier table containing the carrier name.

*Default value is carrier.*

**Example.** carrier.

```opensips
...
modparam("carrierroute", "carrier_name_col", "carrier")
...
```
### `carrier_table` (string)

The name of the table containing the existing carriers, consisting of the ids and corresponding names.

*Default value is route_tree.*

**Example.** route_tree.

```opensips
modparam("carrierroute", "carrier_table", "route_tree")
```
### `comment_column` (string)

Name of the column containing an optional comment (useful in large routing tables) The comment is also displayed by the MI command “carrierroute:dump_routes”.

*Default value is description.*

**Example.** description.

```opensips
modparam("carrierroute", "comment_column", "description")
```
### `config_file` (string)

Specifies the path to the config file.

*Default value is /etc/opensips/carrierroute.conf.*

**Example.** /etc/opensips/carrierroute.conf.

```opensips
modparam("carrierroute", "config_file", "/etc/opensips/carrierroute.conf")
```
### `config_source` (string)

Specifies whether the module loads its config data from a file or from a database. Possible values are file or db.

*Default value is file.*

**Possible values:**

- file
- db

**Example.** file.

```opensips
modparam("carrierroute", "config_source", "file")
```
### `db_failure_table` (string)

Name of the table where the failure routing data is stored.

*Default value is carrierfailureroute.*

**Example.** carrierfailureroute.

```opensips
modparam("carrierroute", "db_failure_table", "carrierfailureroute")
```
### `db_table` (string)

Name of the table where the routing data is stored.

*Default value is carrierroute.*

**Example.** carrierroute.

```opensips
modparam("carrierroute", "db_table", "carrierroute")
```
### `db_url` (string)

Url to the database containing the routing data.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("carrierroute", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `default_tree` (string)

The name of the carrier tree used per default (if the current subscriber has no preferred tree)

*Default value is default.*

**Example.** default.

```opensips
modparam("carrierroute", "default_tree", "default")
```
### `domain_column` (string)

Name of column containing the rule domain. You can define several routing domains to have different routing rules. Maybe you use domain 0 for normal routing and domain 1 if domain 0 failed.

*Default value is domain.*

**Example.** domain.

```opensips
...
modparam("carrierroute", "domain_column", "domain")
...
```
### `failure_carrier_column` (string)

Name of the column containing the carrier id.

*Default value is carrier.*

**Example.** carrier.

```opensips
modparam("carrierroute", "failure_carrier_column", "carrier")
```
### `failure_comment_column` (string)

Name of the column containing an optional comment.

*Default value is description.*

**Example.** description.

```opensips
modparam("carrierroute", "failure_comment_column", "description")
```
### `failure_domain_column` (string)

Name of column containing the rule domain. You can define several routing domains to have different routing rules. Maybe you use domain 0 for normal routing and domain 1 if domain 0 failed.

*Default value is domain.*

**Example.** Set the `failure_domain_column` parameter.

```opensips
modparam("carrierroute", "failure_domain_column", "domain")
```
### `failure_flags_column` (string)

Name of the column containing the flags.

*Default value is flags.*

**Example.** Set the `failure_flags_column` parameter.

```opensips
modparam("carrierroute", "failure_flags_column", "flags")
```
### `failure_host_name_column` (string)

Name of the column containing the host name of the last routing destination.

*Default value is host_name.*

**Example.** Set the `failure_host_name_column` parameter.

```opensips
modparam("carrierroute", "failure_host_name_column", "host_name")
```
### `failure_id_column` (string)

Name of the column containing the id identifier.

*Default value is id.*

**Example.** id.

```opensips
modparam("carrierroute", "failure_id_column", "id")
```
### `failure_mask_column` (string)

Name of the column containing the flags mask.

*Default value is mask.*

**Example.** Set the `failure_mask_column` parameter.

```opensips
modparam("carrierroute", "failure_mask_column", "mask")
```
### `failure_next_domain_column` (string)

Name of the column containing the next routing domain.

*Default value is next_domain.*

**Example.** next_domain.

```opensips
modparam("carrierroute", "failure_next_domain_column", "next_domain")
```
### `failure_reply_code_column` (string)

Name of the column containing the reply code.

*Default value is reply_code.*

**Example.** Set the `failure_reply_code_column` parameter.

```opensips
modparam("carrierroute", "failure_reply_code_column", "reply_code")
```
### `failure_scan_prefix_column` (string)

Name of column containing the scan prefixes. Scan prexies define the matching portion of a phone number, e.g. we have the scan prefixes 49721 and 49, the called number is 49721913740, it matches 49721, because the longest match is taken. If no prefix matches, the number is not failure routed. To prevent this, an empty prefix value of “” could be added.

*Default value is scan_prefix.*

**Example.** scan_prefix.

```opensips
modparam("carrierroute", "failure_scan_prefix_column", "scan_prefix")
```
### `fallback_default` (integer)

This parameter defines the behaviour when using user-based tree lookup. If the user has a non-existing tree set and fallback_default is set to 1, the default tree is used. Otherwise, cr_user_rewrite_uri returns an error.

*Default value is 1.*

**Example.** 1.

```opensips
modparam("carrierroute", "fallback_default", 1)
```
### `flags_column` (string)

Name of the column containing the flags.

*Default value is flags.*

**Example.** flags.

```opensips
...
modparam("carrierroute", "flags_column", "flags")
...
```
### `id_column` (string)

Name of the column containing the id identifier.

*Default value is id.*

**Example.** id.

```opensips
modparam("carrierroute", "id_column", "id")
```
### `mask_column` (string)

Name of the column containing the flags mask.

*Default value is mask.*

**Example.** mask.

```opensips
...
modparam("carrierroute", "mask_column", "mask")
...
```
### `prob_column` (string)

Name of column containing probability. The probability value is used to distribute the traffic between several gateways. Let's say 70 % of the traffic shall be routed to gateway A, the other 30 % shall be routed to gateway B, we define a rule for gateway A with a prob value of 0.7 and a rule for gateway B with a prob value of 0.3.

If all probabilities for a given prefix, tree and domain don't add to 100%, the prefix values will be adjusted according the given prob values. E.g. if three hosts with prob values of 0.5, 0.5 and 0.4 are defined, the resulting probabilities are 35.714, 35.714 and 28.571%. But its better to choose meaningful values in the first place because of clarity.

*Default value is prob.*

**Example.** prob.

```opensips
...
modparam("carrierroute", "prob_column", "prob")
...
```
### `rewrite_host_column` (string)

Name of column containing rewrite host value. An empty field represents a blacklist entry, anything else is put as domain part into the Request URI of the SIP message.

*Default value is rewrite_host.*

**Example.** rewrite_host.

```opensips
...
modparam("carrierroute", "rewrite_host_column", "rewrite_host")
...
```
### `rewrite_prefix_column` (string)

Name of column containing rewrite prefixes. Here you can define a rewrite prefix for the localpart of the SIP URI.

*Default value is rewrite_prefix.*

**Example.** rewrite_prefix.

```opensips
modparam("carrierroute", "rewrite_prefix_column", "rewrite_prefix")
```
### `rewrite_suffix_column` (string)

Name of column containing rewrite suffixes. Here you can define a rewrite suffix for the localpart of the SIP URI.

*Default value is rewrite_suffix.*

**Example.** rewrite_suffix.

```opensips
modparam("carrierroute", "rewrite_suffix_column", "rewrite_suffix")
```
### `scan_prefix_column` (string)

Name of column containing the scan prefixes. Scan prefixes define the matching portion of a phone number, e.g. when we have the scan prefixes 49721 and 49, the called number is 49721913740, it matches 49721, because the longest match is taken. If no prefix matches, the number is not routed. To prevent this, an empty prefix value of “” could be added.

*Default value is scan_prefix.*

**Example.** scan_prefix.

```opensips
modparam("carrierroute", "scan_prefix_column", "scan_prefix")
```
### `strip_column` (string)

Name of the column containing the number of digits to be stripped of the userpart of an URI before prepending rewrite_prefix.

*Default value is strip.*

**Example.** strip.

```opensips
modparam("carrierroute", "strip_column", "strip")
```
### `subscriber_carrier_col` (string)

The name of the column in the subscriber table containing the carrier id of the subscriber.

*Default value is cr_preferred_carrier.*

**Example.** cr_preferred_carrier.

```opensips
modparam("carrierroute", "subscriber_carrier_col", "cr_preferred_carrier")
```
### `subscriber_domain_col` (string)

The name of the column in the subscriber table containing the domain of the subscriber.

*Default value is domain.*

**Example.** domain.

```opensips
...
modparam("carrierroute", "subscriber_domain_col", "domain")
...
```
### `subscriber_table` (string)

The name of the table containing the subscribers

*Default value is subscriber.*

**Example.** subscriber.

```opensips
...
modparam("carrierroute", "subscriber_table", "subscriber")
...
```
### `subscriber_user_col` (string)

The name of the column in the subscriber table containing the usernames.

*Default value is username.*

**Example.** username.

```opensips
...
modparam("carrierroute", "subscriber_user_col", "username")
...
```
### `use_domain` (boolean)

When using tree lookup per user, this parameter specifies whether to use the domain part for user matching or not.

*Default value is true.*

**Example.** true.

```opensips
modparam("carrierroute", "use_domain", true)
```

## Exported Functions

### `cr_next_domain(carrier, domain, prefix_matching, host, reply_code, dst_avp)`

This function searches for the longest match for the user given in prefix_matching at the given domain in the given carrier failure tree. It tries to find a next domain matching the given host, reply_code and the message flags. The matching is done in this order: host, reply_code and then flags. The more wildcards in reply_code and the more bits used in flags, the lower the priority. Returns -1 if there is no data found or an empty next_domain on the longest match is found. Otherwise the next domain is stored in the given AVP. This function is only usable with prefix_matching containing a valid numerical only string.

**Parameters:**

- `carrier` *(string, required)* — The routing tree to be used any pseudo-variable could be used as input.
- `domain` *(string, required)* — Name of the routing domain to be used
- `dst_avp` *(var, required)* — AVP where to store the next routing domain.
- `host` *(string, required)* — The host name to be used for failure route rule matching. Usually, this is the last tried routing destination stored in an avp by cr_route
- `prefix_matching` *(string, required)* — User name to be used for prefix matching in the routing tree
- `reply_code` *(string, required)* — The reply code to be used for failure route rule matching

**Return codes:**

- `-1` — if there is no data found or an empty next_domain on the longest match is found

### `cr_prime_route(carrier, domain, prefix_matching, rewrite_user, hash_source, [dst_avp])`

This function searches for the longest match for the user given in prefix_matching at the given domain in the given carrier tree. The Request URI is rewritten using rewrite_user and the given hash source and algorithm. Returns -1 if there is no data found or an empty rewrite host on the longest match is found. Otherwise the rewritten host is stored in the given AVP (if obmitted, the host is not stored in an AVP). This function is only usable with rewrite_user and prefix_matching containing a valid numerical only string. It uses the prime hash algorithm to calculate the hash values.

**Parameters:**

- `carrier` *(string, required)* — The routing tree to be used
- `domain` *(string, required)* — Name of the routing domain to be used
- `dst_avp` *(var, optional)* — Optional AVP where to store the rewritten host
- `hash_source` *(string, required)* — The hash values of the destination set must be a contiguous range starting at 1, limited by the configuration parameter max_targets. Possible values for hash_source are: call_id, from_uri, from_user, to_uri and to_user.
  - `call_id`
  - `from_uri`
  - `from_user`
  - `to_uri`
  - `to_user`
- `prefix_matching` *(string, required)* — User name to be used for prefix matching in the routing tree
- `rewrite_user` *(string, required)* — The user name to be used for applying the rewriting rule. Usually, this is the user part of the request URI

**Return codes:**

- `-1` — if there is no data found or an empty rewrite host on the longest match is found

**Related:**

- `cr_prime_balance_by_from`
- `cr_prime_balance_by_to`
- `cr_prime_balance_uri`

### `cr_route(carrier, domain, prefix_matching, rewrite_user, hash_source, [dst_avp])`

This function searches for the longest match for the user given in prefix_matching at the given domain in the given carrier tree. The Request URI is rewritten using rewrite_user and the given hash source and algorithm. Returns -1 if there is no data found or an empty rewrite host on the longest match is found. Otherwise the rewritten host is stored in the given AVP (if obmitted, the host is not stored in an AVP). This function is only usable with rewrite_user and prefix_matching containing a valid numerical only string. It uses the standard crc32 algorithm to calculate the hash values.

**Parameters:**

- `carrier` *(string, required)* — The routing tree to be used
- `domain` *(string, required)* — Name of the routing domain to be used
- `dst_avp` *(var, optional)* — Optional AVP where to store the rewritten host
- `hash_source` *(string, required)* — The hash values of the destination set must be a contiguous range starting at 1, limited by the configuration parameter max_targets. Possible values for hash_source are: call_id, from_uri, from_user, to_uri and to_user.
  - `call_id`
  - `from_uri`
  - `from_user`
  - `to_uri`
  - `to_user`
- `prefix_matching` *(string, required)* — User name to be used for prefix matching in the routing tree
- `rewrite_user` *(string, required)* — The user name to be used for applying the rewriting rule. Usually, this is the user part of the request URI

**Return codes:**

- `-1` — if there is no data found or an empty rewrite host on the longest match is found

**Related:**

- `cr_rewrite_by_from`
- `cr_rewrite_by_to`
- `cr_rewrite_uri`
- `cr_tree_rewrite_uri`
- `cr_user_rewrite_uri`

### `cr_user_carrier(user, domain, dst_avp)`

This function loads the carrier and stores it in an AVP. It cannot be used in the config file mode, as it needs a mapping of the given user to a certain carrier. The is derived from a database entry belonging to the user parameter. This mapping must be available in the table that is specified in the “subscriber_table” variable. This data is not cached in memory, that means for every execution of this function a database query will be done.

**Parameters:**

- `domain` *(string, required)* — Name of the routing domain to be used
- `dst_avp` *(var, required)* — Name of an AVP where to store the carrier id
- `user` *(string, required)* — Name of the user for the carrier tree lookup

**Related:**

- `cr_user_rewrite_uri`

## Exported MI Functions

### `carrierroute:activate_host`

Replaces obsolete MI command: cr_activate_host. This command activates the specified host, i.e. it sets its status to 1. It is only usable in file mode. Following options are possible: -d - the domain containing the host -p - the prefix containing the host -h - the host to be activated Use the "null" prefix to specify an empty prefix.

**Parameters:**

- `-?` *(string, optional)* — print a short help message
- `-d` *(string, required)* — the domain containing the host
- `-h` *(string, required)* — the host to be activated
- `-p` *(string, required)* — the prefix containing the host

**Example.** carrierroute:activate_host usage

```opensips-cli
opensips-cli -x mi carrierroute:activate_host "-d proxy -p 49 -h proxy1"
```

### `carrierroute:add_host`

Replaces obsolete MI command: cr_add_host. This command adds a route rule, it is only usable in file mode. Following options are possible: -d - the domain containing the host -p - the prefix containing the host -h - the host to be added -w - the weight of the rule -P - an optional rewrite prefix -S - an optional rewrite suffix -i - an optional hash index -s - an optional strip value Use the "null" prefix to specify an empty prefix.

**Parameters:**

- `-?` *(string, optional)* — print a short help message
- `-d` *(string, required)* — the domain containing the host
- `-h` *(string, required)* — the host to be added
- `-i` *(integer, optional)* — an optional hash index
- `-p` *(string, required)* — the prefix containing the host
- `-P` *(string, optional)* — an optional rewrite prefix
- `-s` *(integer, optional)* — an optional strip value
- `-S` *(string, optional)* — an optional rewrite suffix
- `-w` *(number, required)* — the weight of the rule

**Example.** carrierroute:add_host usage

```opensips-cli
opensips-cli -x mi carrierroute:add_host "-d proxy -p 49 -h proxy1 -w 0.25"
```

### `carrierroute:deactivate_host`

Replaces obsolete MI command: cr_deactivate_host. This command deactivates the specified host, i.e. it sets its status to 0. It is only usable in file mode. Following options are possible: -d - the domain containing the host -p - the prefix containing the host -h - the host to be deactivated -t - the new host used as backup When -t (new_host) is specified, the portion of traffic for the deactivated host is routed to the host given by -t. This is indicated in the output of dump_routes. The backup route is deactivated if the host is activated again. Use the "null" prefix to specify an empty prefix.

**Parameters:**

- `-?` *(string, optional)* — print a short help message
- `-d` *(string, required)* — the domain containing the host
- `-h` *(string, required)* — the host to be deactivated
- `-p` *(string, required)* — the prefix containing the host
- `-t` *(string, optional)* — the new host used as backup

**Example.** carrierroute:deactivate_host usage

```opensips-cli
opensips-cli -x mi carrierroute:deactivate_host "-d proxy -p 49 -h proxy1"
```

### `carrierroute:delete_host`

Replaces obsolete MI command: cr_delete_host. This command delete the specified hosts or rules, i.e. remove them from the route tree. It is only usable in file mode. Following options are possible: -d - the domain containing the host -p - the prefix containing the host -h - the host to be added -w - the weight of the rule -P - an optional rewrite prefix -S - an optional rewrite suffix -i - an optional hash index -s - an optional strip value Use the "null" prefix to specify an empty prefix.

**Parameters:**

- `-?` *(string, optional)* — print a short help message
- `-d` *(string, required)* — the domain containing the host
- `-h` *(string, required)* — the host to be added
- `-i` *(integer, optional)* — an optional hash index
- `-p` *(string, required)* — the prefix containing the host
- `-P` *(string, optional)* — an optional rewrite prefix
- `-s` *(integer, optional)* — an optional strip value
- `-S` *(string, optional)* — an optional rewrite suffix
- `-w` *(number, required)* — the weight of the rule

**Example.** carrierroute:delete_host usage

```opensips-cli
opensips-cli -x mi carrierroute:delete_host "-d proxy -p 49 -h proxy1 -w 0.25"
```

### `carrierroute:dump_routes`

Replaces obsolete MI command: cr_dump_routes. This command prints the route rules on the command line.

**Parameters:**

- `-?` *(string, optional)* — print a short help message

### `carrierroute:reload_routes`

Replaces obsolete MI command: cr_reload_routes. This command reloads the routing data from the data source. Important: When new domains have been added, a restart of the server must be done, because the mapping of the ids used in the config script cannot be updated at runtime at the moment. So a reload could result in a wrong routing behaviour, because the ids used in the script could differ from the one used internally from the server. Modifying of already existing domains is no problem.

**Parameters:**

- `-?` *(string, optional)* — print a short help message

### `carrierroute:replace_host`

Replaces obsolete MI command: cr_replace_host. This command can replace the rewrite_host of a route rule, it is only usable in file mode. Following options are possible: -d - the domain containing the host -p - the prefix containing the host -h - the host to be replaced -t - the new host Use the "null" prefix to specify an empty prefix.

**Parameters:**

- `-?` *(string, optional)* — print a short help message
- `-d` *(string, required)* — the domain containing the host
- `-h` *(string, required)* — the host to be replaced
- `-p` *(string, required)* — the prefix containing the host
- `-t` *(string, required)* — the new host

**Example.** carrierroute:replace_host usage

```opensips-cli
opensips-cli -x mi carrierroute:replace_host "-d proxy -p 49 -h proxy1 -t proxy2"
```

## Configuration Examples

### Configuration example - Routing to default tree

Routing to default tree

```opensips
route {
	# route calls based on hash over callid
	# choose route domain 0 of the default carrier
	
	if(!cr_route("default", "0", "$rU", "$rU", "call_id", "crc32")){
		sl_send_reply(403, "Not allowed");
	} else {
		# In case of failure, re-route the request
		t_on_failure("1");
		# Relay the request to the gateway
		t_relay();
	}
}

failure_route[1] {
	# In case of failure, send it to an alternative route:
	if (t_check_status("408|5\[0-9\]\[0-9\]")) {
		#choose route domain 1 of the default carrier
	if(!cr_route("default", "1", "$rU", "$rU", "call_id", "crc32")){
			t_reply(403, "Not allowed");
		} else {
			t_on_failure("2");
			t_relay();
		}
	}
}

failure_route[2] {
	# further processing
}
```
### Configuration example - Routing to user tree

Routing to user tree

```opensips
route[1] {
	cr_user_carrier("$fU", "$fd", "$avp(carrier)");

	# just an example domain
	$avp(domain)="start";
	if (!cr_route("$avp(carrier)", "$avp(domain)", "$rU", "$rU",
			"call_id", "$avp(host)")) {
		xlog("L_ERR", "cr_route failed\n");
		exit;
	}
	t_on_failure("1");
		if (!t_relay()) {
			sl_reply_error();
	};
}

failure_route[1] {
	revert_uri();
	if (!cr_next_domain("$avp(carrier)", "$avp(domain)", "$rU",
			"$avp(host)", "$T_reply_code", "$avp(domain)")) {
		xlog("L_ERR", "cr_next_domain failed\n");
		exit;
	}
	if (!cr_route("$avp(carrier)", "$avp(domain)", "$rU", "$rU",
			"call_id", "$avp(host)")) {
		xlog("L_ERR", "cr_route failed\n");
		exit;
	}
	t_on_failure("1");
	append_branch();
	if (!t_relay()) {
		xlog("L_ERR", "t_relay failed\n");
		exit;
	};
}
```
### Configuration example - module configuration

The following config file specifies within the default carrier two domains, each with an prefix that contains two hosts. It is not possible to specify another carrier if you use the config file as data source.

All traffic will be equally distributed between the hosts, both are active. The hash algorithm will working over the [1,2] set, messages hashed to one will go to the first host, the other to the second one. Don't use a hash index value of zero. If you ommit the hash completly, the module gives them a autogenerated value, starting from one.

Use the “NULL” prefix to specify an empty prefix in the config file. Please note that the prefix is matched against the request URI (or to URI), if they did not contain a valid numerical URI, no match is possible. So for loadbalancing purposes e.g. for your registrars, you should use an empty prefix.

```opensips
domain proxy {
   prefix 49 {
     max_targets = 2
      target proxy1.localdomain {
         prob = 0.500000
         hash_index = 1
         status = 1
         comment = "test target 1"
      }
      target proxy2.localdomain {
         prob = 0.500000
         hash_index = 2
         status = 1
         comment = "test target 2"
      }
   }
}

domain register {
   prefix NULL {
     max_targets = 2
      target register1.localdomain {
         prob = 0.500000
         hash_index = 1
         status = 1
         comment = "test target 1"
      }
      target register2.localdomain {
         prob = 0.500000
         hash_index = 2
         status = 1
         comment = "test target 2"
      }
   }
}
```
