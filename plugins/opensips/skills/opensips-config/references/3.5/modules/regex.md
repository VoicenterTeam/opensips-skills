# regex Module Reference
<!-- generated-from: data/3.5/modules/regex.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 regex module. Read this file when configuring or debugging the regex module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module offers matching operations against regular expressions using the powerful [PCRE](http://www.pcre.org/) library.

## How It Works

A text file containing regular expressions categorized in groups is compiled when the module is loaded, storing the compiled PCRE objects in an array. A function to match a string or pseudo-variable against any of these groups is provided. The text file can be modified and reloaded at any time via a MI command. The module also offers a function to perform a PCRE matching operation against a regular expression provided as function parameter.

For a detailed list of PCRE features read the [man page](http://www.pcre.org/pcre.txt) of the library.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libpcre-dev` — the development libraries of PCRE

## Exported Parameters

### `file` (string)

Text file containing the regular expression groups. It must be set in order to enable the group matching function.

*Default value is NULL.*

**Example.** /etc/opensips/regex_groups.

```opensips
modparam("regex", "file", "/etc/opensips/regex_groups")
```
### `group_max_size` (integer)

Max content size of a group in the text file.

*Default value is 8192.*

**Example.** 16384.

```opensips
modparam("regex", "group_max_size", 16384)
```
### `max_groups` (integer)

Max number of regular expression groups in the text file.

*Default value is 20.*

**Example.** 40.

```opensips
modparam("regex", "max_groups", 40)
```
### `pcre_caseless` (integer)

If this options is set, matching is done caseless. It is equivalent to Perl's /i option, and it can be changed within a pattern by a (?i) or (?-i) option setting.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("regex", "pcre_caseless", 1)
```
### `pcre_dotall` (integer)

If this option is set, a dot metacharater in the pattern matches all characters, including those that indicate newline. Without it, a dot does not match when the current position is at a newline. This option is equivalent to Perl's /s option, and it can be changed within a pattern by a (?s) or (?-s) option setting.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("regex", "pcre_dotall", 1)
```
### `pcre_extended` (integer)

If this option is set, whitespace data characters in the pattern are totally ignored except when escaped or inside a character class. Whitespace does not include the VT character (code 11). In addition, characters between an unescaped # outside a character class and the next newline, inclusive, are also ignored. This is equivalent to Perl's /x option, and it can be changed within a pattern by a (?x) or (?-x) option setting.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("regex", "pcre_extended", 1)
```
### `pcre_multiline` (integer)

By default, PCRE treats the subject string as consisting of a single line of characters (even if it actually contains newlines). The "start of line" metacharacter (^) matches only at the start of the string, while the "end of line" metacharacter ($) matches only at the end of the string, or before a terminating newline. When this option is set, the "start of line" and "end of line" constructs match immediately following or immediately before internal newlines in the subject string, respectively, as well as at the very start and end. This is equivalent to Perl's /m option, and it can be changed within a pattern by a (?m) or (?-m) option setting. If there are no newlines in a subject string, or no occurrences of ^ or $ in a pattern, setting this option has no effect.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("regex", "pcre_multiline", 1)
```

## Exported Functions

### `pcre_match (string, pcre_regex)`

Matches the given string parameter against the regular expression pcre_regex, which is compiled into a PCRE object. Returns TRUE if it matches, FALSE otherwise.

**Parameters:**

- `pcre_regex` *(string, required)* — Regular expression to be compiled in a PCRE object.
- `string` *(string, required)* — String to compare.

**Return codes:**

- `TRUE` — if it matches
- `FALSE` — otherwise

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** pcre_match usage (forcing case insensitive).

```opensips
...
if (pcre_match("$ua", "(?i)^twinkle")) {
    xlog("L_INFO", "User-Agent matches\\n");
}
...
```

**Example.** pcre_match usage (using "end of line" symbol).

```opensips
...
if (pcre_match($rU, "^user[1234]$$")) {  # Will be converted to "^user[1234]$"
    xlog("L_INFO", "RURI username matches\\n");
}
...
```

### `pcre_match_group (string [, group])`

It uses the groups readed from the text file (see Section 1.6.1, “File format”) to match the given string parameter against the compiled regular expression in group number group. Returns TRUE if it matches, FALSE otherwise.

**Parameters:**

- `group` *(int, optional)* — group to use in the operation. If not specified then 0 (the first group) is used.
- `string` *(string, required)* — String to compare.

**Return codes:**

- `TRUE` — if it matches
- `FALSE` — otherwise

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** pcre_match_group usage.

```opensips
...
if (pcre_match_group($rU, 2)) {
    xlog("L_INFO", "RURI username matches group 2\\n");
}
...
```

## Exported MI Functions

### `regex_match`

Matches the given string parameter against the regular expression pcre_regex. Returns "Match" if it matches, "Not Match" otherwise.

**Parameters:**

- `pcre_regex` *(string, required)* — The regular expression to match against
- `string` *(string, required)* — The given string parameter

**Returns:** Returns "Match" if it matches, "Not Match" otherwise.

**Example.**

```opensips
opensips-cli -x mi regex_match string="1234" pcre_regex="^1234$"
"Match"
```

**Example.**

```opensips
opensips-cli -x mi regex_match string="1234" pcre_regex="^1235$"
"Not Match"
```

### `regex_match_group`

It uses the groups readed from the text file to match the given string parameter against the compiled regular expression in group number group. Returns "Match" if it matches, "Not Match" otherwise.

**Parameters:**

- `group` *(integer, required)* — The group number
- `string` *(string, required)* — The given string parameter

**Returns:** Returns "Match" if it matches, "Not Match" otherwise.

**Example.**

```opensips
opensips-cli -x mi regex_match_group string="1234" group="0"
"Match"
```

**Example.**

```opensips
opensips-cli -x mi regex_match_group string="1234" group="1"
"Not Match"
```

### `regex_reload`

Causes regex module to re-read the content of the text file and re-compile the regular expressions. The number of groups in the file can be modified safely.

**Returns:** 

**Example.**

```opensips
opensips-cli -x mi regex_reload
```

## Configuration Examples

### Set `file` parameter

Set `file` parameter

```opensips
...
modparam("regex", "file", "/etc/opensips/regex_groups")
...
```
### Set `max_groups` parameter

Set `max_groups` parameter

```opensips
...
modparam("regex", "max_groups", 40)
...
```
### Set `group_max_size` parameter

Set `group_max_size` parameter

```opensips
...
modparam("regex", "group_max_size", 16384)
...
```
### Set `pcre_caseless` parameter

Set `pcre_caseless` parameter

```opensips
...
modparam("regex", "pcre_caseless", 1)
...
```
### Set `pcre_multiline` parameter

Set `pcre_multiline` parameter

```opensips
...
modparam("regex", "pcre_multiline", 1)
...
```
### Set `pcre_dotall` parameter

Set `pcre_dotall` parameter

```opensips
...
modparam("regex", "pcre_dotall", 1)
...
```
### Set `pcre_extended` parameter

Set `pcre_extended` parameter

```opensips
...
modparam("regex", "pcre_extended", 1)
...
```
### `pcre_match` usage (forcing case insensitive)

`pcre_match` usage (forcing case insensitive)

```opensips
...
if (pcre_match("$ua", "(?i)^twinkle")) {
    xlog("L_INFO", "User-Agent matches\\n");
}
...
```
### `pcre_match` usage (using "end of line" symbol)

`pcre_match` usage (using "end of line" symbol)

```opensips
...
if (pcre_match($rU, "^user\[1234\]$$")) {  # Will be converted to "^user\[1234\]$"
    xlog("L_INFO", "RURI username matches\\n");
}
...
```
### `pcre_match_group` usage

`pcre_match_group` usage

```opensips
...
if (pcre_match_group($rU, 2)) {
    xlog("L_INFO", "RURI username matches group 2\\n");
}
...
```
### regex file

regex file

```opensips
\### List of User-Agents publishing presence status
[0]

# Softphones
^Twinkle/1
^X-Lite
^eyeBeam
^Bria
^SIP Communicator
^Linphone

# Deskphones
^Snom

# Others
^SIPp
^PJSUA

### Blacklisted source IP's
[1]

^190\\.232\\.250\.226$
^122\.5\.27\.125$
^86\.92\.112\.

### Free PSTN destinations in Spain
[2]

^1\\d{3}$
^((\\+|00)34)?900\\d{6}$
```

The module compiles the text above to the following regular expressions:

group 0: ((^Twinkle/1)|(^X-Lite)|(^eyeBeam)|(^Bria)|(^SIP Communicator)|
          (^Linphone)|(^Snom)|(^SIPp)|(^PJSUA))
group 1: ((^190\.232\.250\.226$)|(^122.5\.27\.125$)|(^86\.92\.112\.))
group 2: ((^1\d{3}$)|(^((\+|00)34)?900\d{6}$))
### Using with pua_usrloc

Using with pua_usrloc

```opensips
route[REGISTER] {
    if (! pcre_match_group("$ua", 0)) {
        xlog("L_INFO", "Auto-generated PUBLISH for $fu ($ua)\\n");
        pua_set_publish();
    }
    save("location");
    exit;
}
```
### Incorrect groups file

Incorrect groups file

```opensips
[1]
^aaa
^bbb

[2]
^ccc
^ddd
```

will generate the following regular expressions:

group 0: ((^aaa)|(^bbb))
group 1: ((^ccc)|(^ddd))

Note that the real index doesn't match the group number in the file. This is, compiled group 0 always points to the first group in the file, regardless of its number in the file. In fact, the group number appearing in the file is used for nothing but for delimiting different groups.
