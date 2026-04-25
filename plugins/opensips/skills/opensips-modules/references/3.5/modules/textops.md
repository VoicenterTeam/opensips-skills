# textops Module Reference
<!-- generated-from: data/3.5/modules/textops.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 textops module. Read this file when configuring or debugging the textops module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module implements text based operations over the SIP message processed by OpenSIPS. SIP is a text based protocol and the module provides a large set of very useful functions to manipulate the message at text level, e.g., regular expression search and replace, Perl-like substitutions, etc.

Note: all SIP-aware functions like _insert_hf_, _append_hf_ or _codec_ operations have been moved to the _sipmsgops_ module.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Functions

### `replace(re, txt)`

Replaces the first occurrence of re with txt.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** replace usage.

```opensips
replace("opensips", "Open SIP Server");
```

### `replace_all(re, txt)`

Replaces all occurrence of re with txt.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** .

```opensips
replace_all("opensips", "Open SIP Server");
```

### `replace_body(re, txt)`

Replaces the first occurrence of re in the body of the message with txt.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** .

```opensips
replace_body("opensips", "Open SIP Server");
```

### `replace_body_all(re, txt)`

Replaces all occurrence of re in the body of the message with txt. Matching is done on a per-line basis.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** .

```opensips
replace_body_all("opensips", "Open SIP Server");
```

### `replace_body_atonce(re, txt)`

Replaces all occurrence of re in the body of the message with txt. Matching is done over the whole body.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** .

```opensips
# strip the whole body from the message:
if(has_body() && replace_body_atonce("^.+$", ""))
        remove_hf("Content-Type");
```

### `search(re)`

Searches for the re in the message.

**Parameters:**

- `re` *(string, required)* — Regular expression.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** search usage.

```opensips
if ( search("\[Ss\]\[Ii\]\[Pp\]") ) { /\*....\*/ };
```

### `search_append(re, txt)`

Searches for the first match of re and appends txt after it.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — String to be appended.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** search_append usage.

```opensips
search_append("\[Oo\]pen\[Ss\]er", " SIP Proxy");
```

### `search_append_body(re, txt)`

Searches for the first match of re in the body of the message and appends txt after it.

**Parameters:**

- `re` *(string, required)* — Regular expression.
- `txt` *(string, required)* — String to be appended.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** search_append_body usage.

```opensips
search_append_body("\[Oo\]pen\[Ss\]er", " SIP Proxy");
```

### `search_body(re)`

Searches for the re in the body of the message.

**Parameters:**

- `re` *(string, required)* — Regular expression.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** search_body usage.

```opensips
if ( search_body("\[Ss\]\[Ii\]\[Pp\]") ) { /\*....\*/ };
```

### `subst('/re/repl/flags')`

Replaces re with repl (sed or perl like).

**Parameters:**

- `'/re/repl/flags'` *(string, required)* — sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line). 're' - is regular expression 'repl' - is replacement string - may contain pseudo-variables 'flags' - substitution flags (i - ignore case, g - global)

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** .

```opensips
# replace the uri in to: with the message uri (just an example)
if ( subst('/^To:(.*)sip:[^@]*@[a-zA-Z0-9.]+(.*)$/t:\1\u\2/ig') ) {};

# replace the uri in to: with the value of avp sip_address (just an example)
if ( subst('/^To:(.*)sip:[^@]*@[a-zA-Z0-9.]+(.*)$/t:\1$avp(sip_address)\2/ig') ) {};
```

### `subst_body('/re/repl/flags')`

Replaces re with repl (sed or perl like) in the body of the message.

**Parameters:**

- `'/re/repl/flags'` *(string, required)* — sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line). 're' - is regular expression 'repl' - is replacement string - may contain pseudo-variables 'flags' - substitution flags (i - ignore case, g - global)

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** subst_body usage.

```opensips
...
if (subst_body("/^o=([^ ]*) /o=$fU /"))
	xlog("successfully prepared an "o" line update!\n");

...
```

### `subst_uri('/re/repl/flags')`

Runs the re substitution on the message uri (like subst but works only on the uri)

**Parameters:**

- `'/re/repl/flags'` *(string, required)* — sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line). 're' - is regular expression 'repl' - is replacement string - may contain pseudo-variables 'flags' - substitution flags (i - ignore case, g - global)

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Related:**

- `subst`

**Example.** subst_uri usage.

```opensips
...
# adds 3463 prefix to numeric uris, and save the original uri (\0 match)
# as a parameter: orig_uri (just an example)
if (subst_uri('/^sip:([0-9]+)@(.*)$/sip:3463\1@\2;orig_uri=\0/i')){$

# adds the avp 'uri_prefix' as prefix to numeric uris, and save the original
# uri (\0 match) as a parameter: orig_uri (just an example)
if (subst_uri('/^sip:([0-9]+)@(.*)$/sip:$avp(uri_prefix)\1@\2;orig_uri=\0/i')){$

...
```

### `subst_user('/re/repl/flags')`

Runs the re substitution on the message uri (like subst_uri but works only on the user portion of the uri)

**Parameters:**

- `'/re/repl/flags'` *(string, required)* — sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line). 're' - is regular expression 'repl' - is replacement string - may contain pseudo-variables 'flags' - substitution flags (i - ignore case, g - global)

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Related:**

- `subst_uri`

**Example.** subst usage.

```opensips
...
# adds 3463 prefix to uris ending with 3642 (just an example)
if (subst_user('/3642$/36423463/')){$

...
# adds avp 'user_prefix' as prefix to username in r-uri ending with 3642
if (subst_user('/(.*)3642$/$avp(user_prefix)\13642/')){$

...
```

## Configuration Examples

### `search` usage

Searches for the re in the message.

```opensips
...
if ( search("[Ss][Ii][Pp]") ) { /*....*/ };
...
```
### `search_body` usage

Searches for the re in the body of the message.

```opensips
...
if ( search_body("[Ss][Ii][Pp]") ) { /*....*/ };
...
```
### `search_append` usage

Searches for the first match of re and appends txt after it.

```opensips
...
search_append("[Oo]pen[Ss]er", " SIP Proxy");
...
```
### `search_append_body` usage

Searches for the first match of re in the body of the message and appends txt after it.

```opensips
...
search_append_body("[Oo]pen[Ss]er", " SIP Proxy");
...
```
### `replace` usage

Replaces the first occurrence of re with txt.

```opensips
...
replace("opensips", "Open SIP Server");
...
```
### `replace_body` usage

Replaces the first occurrence of re in the body of the message with txt.

```opensips
...
replace_body("opensips", "Open SIP Server");
...
```
### `replace_all` usage

Replaces all occurrence of re with txt.

```opensips
...
replace_all("opensips", "Open SIP Server");
...
```
### `replace_body_all` usage

Replaces all occurrence of re in the body of the message with txt. Matching is done on a per-line basis.

```opensips
...
replace_body_all("opensips", "Open SIP Server");
...
```
### `replace_body_atonce` usage

Replaces all occurrence of re in the body of the message with txt. Matching is done over the whole body.

```opensips
...
# strip the whole body from the message:
if(has_body() && replace_body_atonce("^.+$", ""))
	remove_hf("Content-Type"); 
...
```
### `subst` usage

Replaces re with repl (sed or perl like).

```opensips
...
# replace the uri in to: with the message uri (just an example)
if ( subst('/^To:(.*)sip:[^@]*@[a-zA-Z0-9.]+(.*)$/t:\1\u\2/ig') ) {};

# replace the uri in to: with the value of avp sip_address (just an example)
if ( subst('/^To:(.*)sip:[^@]*@[a-zA-Z0-9.]+(.*)$/t:\1$avp(sip_address)\2/ig') ) {};

...
```
### `subst_uri` usage

Runs the re substitution on the message uri (like subst but works only on the uri)

```opensips
...
# adds 3463 prefix to numeric uris, and save the original uri (\0 match)
# as a parameter: orig_uri (just an example)
if (subst_uri('/^sip:([0-9]+)@(.*)$/sip:3463\1@\2;orig_uri=\0/i')){$

# adds the avp 'uri_prefix' as prefix to numeric uris, and save the original
# uri (\0 match) as a parameter: orig_uri (just an example)
if (subst_uri('/^sip:([0-9]+)@(.*)$/sip:$avp(uri_prefix)\1@\2;orig_uri=\0/i')){$

...
```
### `subst` usage

Runs the re substitution on the message uri (like subst_uri but works only on the user portion of the uri)

```opensips
...
# adds 3463 prefix to uris ending with 3642 (just an example)
if (subst_user('/3642$/36423463/')){$
...
# adds avp 'user_prefix' as prefix to username in r-uri ending with 3642
if (subst_user('/(.*)3642$/$avp(user_prefix)\13642/')){$

...
```
### `subst_body` usage

Replaces re with repl (sed or perl like) in the body of the message.

```opensips
...
if (subst_body("/^o=([^ ]*) /o=$fU /"))
	xlog("successfully prepared an "o" line update!\n");

...
```
