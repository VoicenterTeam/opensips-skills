# Transformations Reference
<!-- generated-from: data/3.5/core/transformations.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: transformation -->

Reference for OpenSIPs 3.5 transformations. Read this file when manipulating pseudo-variable values inline and need the canonical class, input/output, and chaining behavior of a transformation.

## Contents

- [`{csv.count}`](#csvcount)
- [`{csv.value}`](#csvvalue)
- [`{ip.family}`](#ipfamily)
- [`{ip.isip4}`](#ipisip4)
- [`{ip.isip6}`](#ipisip6)
- [`{ip.isip}`](#ipisip)
- [`{ip.isprivate}`](#ipisprivate)
- [`{ip.matches}`](#ipmatches)
- [`{ip.ntop}`](#ipntop)
- [`{ip.pton}`](#ippton)
- [`{ip.resolve}`](#ipresolve)
- [`{nameaddr.len}`](#nameaddrlen)
- [`{nameaddr.name}`](#nameaddrname)
- [`{nameaddr.params}`](#nameaddrparams)
- [`{nameaddr.param}`](#nameaddrparam)
- [`{nameaddr.uri}`](#nameaddruri)
- [`{param.count}`](#paramcount)
- [`{param.exist}`](#paramexist)
- [`{param.name}`](#paramname)
- [`{param.valueat}`](#paramvalueat)
- [`{param.value}`](#paramvalue)
- [`{re.subst}`](#resubst)
- [`{s.b64decode}`](#sb64decode)
- [`{s.b64encode}`](#sb64encode)
- [`{s.dec2hex}`](#sdec2hex)
- [`{s.decode.hexa}`](#sdecodehexa)
- [`{s.encode.hexa}`](#sencodehexa)
- [`{s.escape.common}`](#sescapecommon)
- [`{s.escape.param}`](#sescapeparam)
- [`{s.escape.user}`](#sescapeuser)
- [`{s.eval}`](#seval)
- [`{s.fill.left}`](#sfillleft)
- [`{s.fill.right}`](#sfillright)
- [`{s.hex2dec}`](#shex2dec)
- [`{s.index}`](#sindex)
- [`{s.int}`](#sint)
- [`{s.len}`](#slen)
- [`{s.md5}`](#smd5)
- [`{s.reverse}`](#sreverse)
- [`{s.rindex}`](#srindex)
- [`{s.select}`](#sselect)
- [`{s.sha1_hmac}`](#ssha1_hmac)
- [`{s.sha1}`](#ssha1)
- [`{s.sha224_hmac}`](#ssha224_hmac)
- [`{s.sha224}`](#ssha224)
- [`{s.sha256_hmac}`](#ssha256_hmac)
- [`{s.sha256}`](#ssha256)
- [`{s.sha384_hmac}`](#ssha384_hmac)
- [`{s.sha384}`](#ssha384)
- [`{s.sha512_hmac}`](#ssha512_hmac)
- [`{s.sha512}`](#ssha512)
- [`{s.substr}`](#ssubstr)
- [`{s.tolower}`](#stolower)
- [`{s.toupper}`](#stoupper)
- [`{s.triml}`](#striml)
- [`{s.trimr}`](#strimr)
- [`{s.trim}`](#strim)
- [`{s.unescape.common}`](#sunescapecommon)
- [`{s.unescape.param}`](#sunescapeparam)
- [`{s.unescape.user}`](#sunescapeuser)
- [`{s.width}`](#swidth)
- [`{s.xor}`](#sxor)
- [`{sdp.line}`](#sdpline)
- [`{sdp.stream-delete}`](#sdpstream-delete)
- [`{sdp.stream}`](#sdpstream)
- [`{uri.headers}`](#uriheaders)
- [`{uri.host}`](#urihost)
- [`{uri.lr}`](#urilr)
- [`{uri.maddr}`](#urimaddr)
- [`{uri.method}`](#urimethod)
- [`{uri.params}`](#uriparams)
- [`{uri.param}`](#uriparam)
- [`{uri.passwd}`](#uripasswd)
- [`{uri.port}`](#uriport)
- [`{uri.r2}`](#urir2)
- [`{uri.schema}`](#urischema)
- [`{uri.transport}`](#uritransport)
- [`{uri.ttl}`](#urittl)
- [`{uri.uparam}`](#uriuparam)
- [`{uri.user}`](#uriuser)
- [`{via.branch}`](#viabranch)
- [`{via.comment}`](#viacomment)
- [`{via.host}`](#viahost)
- [`{via.name}`](#vianame)
- [`{via.params}`](#viaparams)
- [`{via.param}`](#viaparam)
- [`{via.port}`](#viaport)
- [`{via.received}`](#viareceived)
- [`{via.rport}`](#viarport)
- [`{via.transport}`](#viatransport)
- [`{via.version}`](#viaversion)

## `{csv.count}`

Returns the number of entries in the provided CSV.

- **Class:** CSV Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{csv.count}
```

**Example.** Count CSV entries.

```opensips
"a,b,c" {csv.count} = 3
```

## `{csv.value}`

Returns the entry at the specified positions. Indexing starts from 0.

- **Class:** CSV Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{csv.value,index}
```

**Parameters:**

- `index` *(integer, required)* — 0-based index of the CSV entry

**Example.** Get CSV entry at index.

```opensips
"a,b,c" {csv.value,2} = c
```

## `{ip.family}`

Returns INET or INET6 if the binary IP representation provided is IPv4 or IPv6.

- **Class:** IP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.family}
```

**Example.** Get IP family.

```opensips
"193.568.3.534" {ip.pton}{ip.family} = "INET"
```

## `{ip.isip4}`

Returns 1 if the string provided is a valid IPv4, otherwise 0.

- **Class:** IP Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip4}
```

**Example.** Check if valid IPv4.

```opensips
"193.568.3.534" {ip.isip4} = 1
```

## `{ip.isip6}`

Returns 1 if the string provided is a valid IPv6, otherwise 0.

- **Class:** IP Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip6}
```

**Example.** Check if valid IPv6.

```opensips
"193.568.3.534" {ip.isip6} = 0
"2001:0db8:85a3:0000:0000:8a2e:0370:7334" {ip.isip6} = 1
```

## `{ip.isip}`

Returns 1 if the string provided is a valid IPv4 or IPv6 address, otherwise 0.

- **Class:** IP Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip}
```

**Example.** Check if valid IP.

```opensips
"193.568.3.534" {ip.isip} = 1
"193.568.3.534.1" {ip.isip} = 0
```

## `{ip.isprivate}`

Checks if the input IP address is an IPv4 private IP, according to RFC 1918 and RFC 6598. It returns 1 if the IP is private, 0 if not.

- **Class:** IP Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isprivate}
```

**Example.** Check if IP is private.

```opensips
if ( $(si{ip.isprivate})==1 )
	xlog("source ip is private\n");
else
	xlog("source ip is not private\n");
```

## `{ip.matches}`

Checks if the input IP address matches a net mask given as IP/masklen (short format). It returns 1 if matches, 0 if not. NULL is returned on error (invalid input, invalid parameter, AF mismatch). Variables are supported for the parameter.

- **Class:** IP Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.matches,ip/masklen}
```

**Parameters:**

- `ip/masklen` *(string, required)* — Net mask given as IP/masklen

**Example.** Check IP against netmask.

```opensips
if ( $(si{ip.matches,10.10.0.1/24})==1 )
	xlog("It DOES match \n");
else
	xlog("It DOES NOT match \n");
```

## `{ip.ntop}`

Returns a string representation of the binary IP provided

- **Class:** IP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.ntop}
```

**Example.** Convert binary IP to string.

```opensips
"193.568.3.534"{ip.pton}{ip.ntop} = "193.568.3.534"
```

## `{ip.pton}`

Returns a binary representation of a string represented IP.

- **Class:** IP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.pton}
```

**Example.** Convert string IP to binary.

```opensips
"193.568.3.534" {ip.pton} returns a 4 byte binary representation of the IP provided
```

## `{ip.resolve}`

Returns the resolved IP address corresponding to the string domain provided. Transformation has no effect if a string IP is provided.

- **Class:** IP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.resolve}
```

**Example.** Resolve domain to IP.

```opensips
"opensips.org" {ip.resolve} = "78.46.64.50"
```

## `{nameaddr.len}`

Returns the length of the entire name-addr part from the value.

- **Class:** Name-address Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{nameaddr.[index.]len}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index of the nameaddr spec

## `{nameaddr.name}`

Returns the value of display name

- **Class:** Name-address Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.[index.]name}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index of the nameaddr spec

**Example.** Get display name.

```opensips
'"test" <sip:test@opensips.org>' {nameaddr.name} = "test"
```

## `{nameaddr.params}`

Returns all the parameters and their corresponding values.

- **Class:** Name-address Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.[index.]params}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index of the nameaddr spec

**Example.** Get all nameaddr parameters.

```opensips
'"test" <sip:test@opensips.org>;tag=dat43h;private=yes' {nameaddr.params} = "tag=dat43h;private=yes"
```

## `{nameaddr.param}`

Returns the value of the parameter with name param_name.

- **Class:** Name-address Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.[index.]param,param_name}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index of the nameaddr spec
- `param_name` *(string, required)* — Name of the parameter

**Example.** Get nameaddr parameter.

```opensips
'"test" <sip:test@opensips.org>;tag=dat43h' {nameaddr.param,tag} = dat43h
```

## `{nameaddr.uri}`

Returns the value of URI

- **Class:** Name-address Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.[index.]uri}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index of the nameaddr spec

**Example.** Get URI.

```opensips
'"test" <sip:test@opensips.org>' {nameaddr.uri} = sip:test@opensips.org
```

## `{param.count}`

Returns the number of parameters in the list.

- **Class:** Parameters List Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{param.count}
```

**Example.** Count parameters.

```opensips
"a=1;b=2;c=3"{param.count} = 3
```

## `{param.exist}`

Returns 1 if the parameter name exists (with or without value), else 0. Returned value is both string and integer. name can be variable. This can be used to test existence of parameters that do not have values.

- **Class:** Parameters List Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{param.exist,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the parameter

**Example.** Check parameter existence.

```opensips
"a=0;b=2;ob;c=3"{param.exist,ob};         # returns 1
"a=0;b=2;ob;c=3"{param.exist,a};          # returns 1
"a=0;b=2;ob;c=3"{param.exist,foo};        # returns 0
```

## `{param.name}`

Returns the name of parameter at position 'index'.

- **Class:** Parameters List Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.name,index}
```

**Parameters:**

- `index` *(integer, required)* — 0-based index of the parameter

**Example.** Get parameter name at index.

```opensips
"a=1;b=2;c=3"{param.name,1} = "b"
```

## `{param.valueat}`

Returns the value of parameter at position give by 'index' (0-based index)

- **Class:** Parameters List Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.valueat,index}
```

**Parameters:**

- `index` *(integer, required)* — 0-based index of the parameter

**Example.** Get parameter value at index.

```opensips
"a=1;b=2;c=3"{param.valueat,1} = "2"
```

## `{param.value}`

Returns the value of parameter 'name'

- **Class:** Parameters List Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.value,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the parameter

**Example.** Get parameter value.

```opensips
"a=1;b=2;c=3"{param.value,c} = "3"
```

## `{re.subst}`

The reg_exp parameter can either be a plain string or a variable. The format of the reg_exp is : /posix_match_expression/replacement_expression/flags

- **Class:** Regular Expression Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{re.subst,reg_exp}
```

**Parameters:**

- `reg_exp` *(string, required)* — Regular expression substitution string

**Example.** Regular expression substitution.

```opensips
$var(reg_input)="abc";
$var(reg) = "/a/A/g";
xlog("Applying reg exp $var(reg) to $var(reg_input) : $(var(reg_input){re.subst,$var(reg)})\n");

...
...
xlog("Applying reg /b/B/g to $var(reg_input) : $(var(reg_input){re.subst,/b/B/g})\n");
```

## `{s.b64decode}`

Assumes input is a Base64 string and decodes as many characters as possible.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.b64decode}
```

**Example.** Base64 decode.

```opensips
$var(in) = "AgMEBSFAIyVeJio=";
$(var(in){s.b64decode})   => "\x2\x3\x4\x5!@#%^&*"
```

## `{s.b64encode}`

Represents binary input data in an ASCII string format.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.b64encode}
```

**Example.** Base64 encode.

```opensips
$var(in) = "\x2\x3\x4\x5!@#%^&*";
$(var(in){s.b64encode})   => "AgMEBSFAIyVeJio="
```

## `{s.dec2hex}`

Converts a decimal(base 10) number to hexadecimal (in base 16), represented as string.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.dec2hex}
```

## `{s.decode.hexa}`

Return decoding from hexa of variable's value

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.decode.hexa}
```

## `{s.encode.hexa}`

Return encoding in hexa of variable's value

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.encode.hexa}
```

## `{s.escape.common}`

Return escaped string of variable's value. Characters escaped are ', ", and 0. Useful when doing DB queries (care should be taken for non Latin character set).

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.common}
```

## `{s.escape.param}`

Return escaped string of variable's value, changing to '%hexa' the characters that are not allowed in the param part of SIP URI following RFC requirements.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.param}
```

## `{s.escape.user}`

Return escaped string of variable's value, changing to '%hexa' the characters that are not allowed in user part of SIP URI following RFC requirements.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.user}
```

## `{s.eval}`

Interprets the string as a variable formatted string, evaluating all the variables declared in it.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.eval}
```

**Example.** Evaluate variables in string.

```opensips
$var(in) = "client";
$var(format) = "Hello, $var(in)!";
$(var(format){s.eval})   => "Hello, client!"
```

## `{s.fill.left}`

Fills a string to the left with a char/string until the given final length is reached. The initial string is returned if its length is greater or equal to the given final length.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.fill.left, tok, len}
```

**Parameters:**

- `len` *(integer, required)* — Final length to reach
- `tok` *(string, required)* — Character or string to fill with

**Example.** Fill string to the left.

```opensips
$var(in) = "485"; (also works for integer PVs)

$(var(in){s.fill.left, 0, 3})    => 485    
$(var(in){s.fill.left, 0, 6})    => 000485
$(var(in){s.fill.left, abc, 8})  => bcabc485
```

## `{s.fill.right}`

Fills a string to the right with a char/string until the given final length is reached. The initial string is returned if its length is greater or equal to the given final length.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.fill.right, tok, len}
```

**Parameters:**

- `len` *(integer, required)* — Final length to reach
- `tok` *(string, required)* — Character or string to fill with

**Example.** Fill string to the right.

```opensips
$var(in) = 485; (also works for string PVs)

$(var(in){s.fill.right, 0, 3})   => 485
$(var(in){s.fill.right, 0, 6})   => 485000
$(var(in){s.fill.right, abc, 8}) => 485abcab
```

## `{s.hex2dec}`

Converts a hexadecimal number (base 16) represented as string to decimal (base 10).

- **Class:** String Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.hex2dec}
```

## `{s.index}`

Searches for one string within another starting at the beginning of the first string. Returns starting index of the string found or NULL if not found. The optional index specifies the offset to begin the search at in the string. Negative offsets are supported and will wrap.

- **Class:** String Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.index, string[, offset]}
```

**Parameters:**

- `offset` *(integer, optional)* — Offset to begin the search at
- `string` *(string, required)* — String to search for

**Example.** Search for string index.

```opensips
$var(strtosearch) = 'onetwothreeone';
$var(str) = 'one';

# Search the string starting at 0 index
$(var(strtosearch){s.index, $var(str)}) # will return 0
$(var(strtosearch){s.index, $var(str), 0}) # Same as above
$(var(strtosearch){s.index, $var(str), 3}) # returns 11

# Negative offset
$(var(strtosearch){s.index, $var(str), -11}) # Same as above

# Negative wrapping offset
$(var(strtosearch){s.index, $var(str), -25}) # Same as above

#Test for existence of string in another
if ($(var(strtosearch){s.index, $var(str)}) != NULL)
    xlog("found $var(sstr) in $var(strtosearch)\n");
```

## `{s.int}`

Converts the initial part of the given string to an integer value. Returns 0 if there were no digits at all.

- **Class:** String Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.int}
```

**Example.** Convert string to integer.

```opensips
$var(dur) = "2868.12 sec";
if ($(var(dur){s.int}) < 3600) {
  ...
}
```

## `{s.len}`

Return strlen of variable value

- **Class:** String Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.len}
```

**Example.** Get string length.

```opensips
$var(x) = "abc";
if($(var(x){s.len}) == 3)
{
   ...
}
```

## `{s.md5}`

Returns the MD5 hash of the given input.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.md5}
```

**Example.** Calculate MD5 hash.

```opensips
xlog("MD5 over From username: $(fU{s.md5})\n");
```

## `{s.reverse}`

Returns the input string in revers order.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.reverse}
```

**Example.** Reverse a string.

```opensips
$var(forward) = "onetwothree";
$var(reverse) = $(var(forward){s.reverse}); //Contains "eerhtowteno";
```

## `{s.rindex}`

Searches for one string within another starting at the end of the first string. Returns starting index of the string found or NULL if not found. The optional index specifies an offset to start the search before, e.g the start of the found string will be before the supplied offset. Negative offsets are supported and will wrap.

- **Class:** String Transformations
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.rindex, string[, offset]}
```

**Parameters:**

- `offset` *(integer, optional)* — Offset to start the search before
- `string` *(string, required)* — String to search for

**Example.** Search for string index from the end.

```opensips
$(var(strtosearch){s.rindex, $var(str)}) # will return 11
$(var(strtosearch){s.rindex, $var(str), -3}) # will return 11
$(var(strtosearch){s.rindex, $var(str), 11}) # will return 11
$(var(strtosearch){s.rindex, $var(str), -4}) # will return 0
```

## `{s.select}`

Return a field from the value of a variable. The field is selected based on separator and index. The separator must be a character used to identify the fields. Index must be a integer value or a variable. If index is negative, the count of fields starts from end of value, -1 being last field. If index is positive, 0 is the first field. Note that if a field is empty, an empty string will be returned and not NULL.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.select,index,separator}
```

**Parameters:**

- `index` *(integer, required)* — Field index. Negative counts from the end.
- `separator` *(string, required)* — Character used to identify the fields.

**Example.** Select field from string.

```opensips
$var(x) = "12,34,56";
$(var(x){s.select,1,,}) => "34" ;

$var(x) = "12,34,56";
$(var(x){s.select,-2,,}) => "34"
```

## `{s.sha1_hmac}`

Returns the SHA1 HMAC hash of the given input using key.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha1_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — Key for HMAC

**Example.** Calculate SHA1 HMAC hash.

```opensips
xlog("SHA1 HMAC over From username using key 'secret': $(fU{s.sha1_hmac,secret})\n");
```

## `{s.sha1}`

Returns the SHA1 hash of the given input.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha1}
```

**Example.** Calculate SHA1 hash.

```opensips
xlog("SHA1 over From username: $(fU{s.sha1})\n");
```

## `{s.sha224_hmac}`

Returns the SHA224 HMAC hash of the given input using key.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha224_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — Key for HMAC

**Example.** Calculate SHA224 HMAC hash.

```opensips
xlog("SHA224 HMAC over From username using key 'secret': $(fU{s.sha224_hmac,secret})\n");
```

## `{s.sha224}`

Returns the SHA224 hash of the given input.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha224}
```

**Example.** Calculate SHA224 hash.

```opensips
xlog("SHA224 over From username: $(fU{s.sha224})\n");
```

## `{s.sha256_hmac}`

Returns the SHA256 HMAC hash of the given input using key.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha256_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — Key for HMAC

**Example.** Calculate SHA256 HMAC hash.

```opensips
xlog("SHA256 HMAC over From username using key 'secret': $(fU{s.sha256_hmac,secret})\n");
```

## `{s.sha256}`

Returns the SHA256 hash of the given input.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha256}
```

**Example.** Calculate SHA256 hash.

```opensips
xlog("SHA256 over From username: $(fU{s.sha256})\n");
```

## `{s.sha384_hmac}`

Returns the SHA384 HMAC hash of the given input using key.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha384_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — Key for HMAC

**Example.** Calculate SHA384 HMAC hash.

```opensips
xlog("SHA384 HMAC over From username using key 'secret': $(fU{s.sha384_hmac,secret})\n");
```

## `{s.sha384}`

Returns the SHA384 hash of the given input.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha384}
```

**Example.** Calculate SHA384 hash.

```opensips
xlog("SHA384 over From username: $(fU{s.sha384})\n");
```

## `{s.sha512_hmac}`

Returns the SHA512 HMAC hash of the given input using key.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha512_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — Key for HMAC

**Example.** Calculate SHA512 HMAC hash.

```opensips
xlog("SHA512 HMAC over From username using key 'secret': $(fU{s.sha512_hmac,secret})\n");
```

## `{s.sha512}`

Returns the SHA512 hash of the given input.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha512}
```

**Example.** Calculate SHA512 hash.

```opensips
xlog("SHA512 over From username: $(fU{s.sha512})\n");
```

## `{s.substr}`

Return the substring starting at offset having size of length. If offset is negative, then it is counted from the end of the value, -1 being the last char. In case of a positive value, 0 is the first char. The length must be positive and in case of both 0 and greater-than-string-length values, the substring to the end of the input string is returned. Both offset and length may be specified using variables.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.substr,offset,length}
```

**Parameters:**

- `length` *(integer, required)* — Size of the substring. 0 means to the end of the string.
- `offset` *(integer, required)* — Starting offset. Negative counts from the end.

**Example.** Extract substring.

```opensips
$var(x) = "abcd";
$(var(x){s.substr,1,0}) = "bcd"
```

## `{s.tolower}`

Return string with lower case ASCII letters.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.tolower}
```

## `{s.toupper}`

Return string with upper case ASCII letters.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.toupper}
```

## `{s.triml}`

Strips any leading whitespace from the input string. Trimmed characters are " " (space), \t (tab), \n (newline) and \r (carriage return).

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.triml}
```

**Example.** Trim leading whitespace.

```opensips
$var(in) = "\t \n input string  \r  ";

$(var(in){s.triml})   => "input string  \r  "
```

## `{s.trimr}`

Strips any trailing whitespace from the input string. Trimmed characters are " " (space), \t (tab), \n (newline) and \r (carriage return).

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.trimr}
```

**Example.** Trim trailing whitespace.

```opensips
$var(in) = "\t \n input string  \r  ";

$(var(in){s.trimr})   => "\t \n input string"
```

## `{s.trim}`

Strips any leading or trailing whitespace from the input string. Trimmed characters are " " (space), \t (tab), \n (newline) and \r (carriage return).

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.trim}
```

**Example.** Trim whitespace.

```opensips
$var(in) = "\t \n input string  \r  ";

$(var(in){s.trim})   => "input string"
```

## `{s.unescape.common}`

Return unescaped string of variable's value. Reverse of above transformation.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.common}
```

## `{s.unescape.param}`

Return unescaped string of variable's value, changing '%hexa' to character code. Reverse of above transformation.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.param}
```

## `{s.unescape.user}`

Return unescaped string of variable's value, changing '%hexa' to character code. Reverse of above transformation.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.user}
```

## `{s.width}`

Truncates or expands the input to the given len. Expanding is done to the right with the space character ' '. Truncating is done in a similar manner, from the right.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.width, len}
```

**Parameters:**

- `len` *(integer, required)* — Final length to reach

**Example.** Truncate or expand string.

```opensips
$var(in) = "transformation";

$(var(in){s.width, 14})   => "transformation"
$(var(in){s.width, 16})  => "transformation  "
$(var(in){s.width, 9})   => "transform"
```

## `{s.xor}`

Performs one or more logical XOR operations with (a part of) the "secret" string parameter and the input string, depending on the lengths of the two strings.

- **Class:** String Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.xor,secret}
```

**Parameters:**

- `secret` *(string, required)* — Secret string to XOR with

**Example.** XOR string.

```opensips
$var(in) = "aaaaaabbbbbb";
$(var(in){s.xor,x})   => "!/>^P!/>^P!^U2^Q!^U2^Q"
```

## `{sdp.line}`

Returns the specified line in the SDP body. The transformations also accepts a second parameter, that specifies the line number of the first parameter's type to get from the SDP body. Indexing starts from 0. If the second parameter is missing, it is assumed to be 0.

- **Class:** SDP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.line,type[,index]}
```

**Parameters:**

- `index` *(integer, optional)* — 0-based index of the line type
- `type` *(string, required)* — Type of the SDP line (e.g., 'a', 'm')

**Example.** Get SDP line.

```opensips
if (is_method("INVITE"))
   {
      $var(aline) = $(rb{sdp.line,a,1});
      xlog("The second a line in the SDP body is $var(aline)\n");
   }

if (is_method("INVITE"))
   {
      $var(mline) = $(rb{sdp.line,m});
      xlog("The first m line in the SDP body is $var(mline)\n");
   }
```

## `{sdp.stream-delete}`

Returns the specified SDP body with some of its streams deleted. The stream to be deleted can be specified using its index, or using on its media type. If specified as index, it starts at 0, but it can also be negative, with -1 being the last stream. If specified as media type, all streams matching will be deleted! If the media type or index does not exist, NULL is returned.

- **Class:** SDP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.stream-delete,index_or_type}
```

**Parameters:**

- `index_or_type` *(string, required)* — Index or media type of the stream to delete

**Example.** Delete SDP stream.

```opensips
if (is_method("INVITE"))
   {
      $var(new_body) = $(rb{sdp.stream-delete,0});
      xlog("SDP body without first stream is $var(new_body)\n");
   }

if (is_method("INVITE"))
   {
      $var(new_body) = $(rb{sdp.stream-delete,video});
      xlog("SDP body without video stream is $var(new_body)\n");
   }
```

## `{sdp.stream}`

Returns a specific stream (starting with the m= line) from an SDP body. The stream to be returned can be specified using its index within the body, or using on its media type. If specified as index, it starts at 0, but it can also be negative, with -1 being the last stream. If specified as media type, only the first stream of its type will be returned. If the media type or index does not exist, NULL is returned.

- **Class:** SDP Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.stream,index_or_type}
```

**Parameters:**

- `index_or_type` *(string, required)* — Index or media type of the stream

**Example.** Get SDP stream.

```opensips
if (is_method("INVITE"))
   {
      $var(first_stream) = $(rb{sdp.stream,0});
      xlog("First stream is $var(first_stream)\n");
   }

if (is_method("INVITE"))
   {
      $var(audio_stream) = $(rb{sdp.stream,audio});
      xlog("Audio stream is $var(audio_stream)\n");
   }
```

## `{uri.headers}`

Returns URI headers.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.headers}
```

## `{uri.host}`

Returns the domain part of the URI schema.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.host}
```

## `{uri.lr}`

Returns the value of lr URI parameter.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.lr}
```

## `{uri.maddr}`

Returns the value of maddr URI parameter.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.maddr}
```

## `{uri.method}`

Returns the value of method URI parameter.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.method}
```

## `{uri.params}`

Returns all the URI parameters into a single string.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.params}
```

## `{uri.param}`

Returns the value of URI parameter with name "name"

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.param,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the URI parameter

## `{uri.passwd}`

Returns the password part of the URI schema.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.passwd}
```

## `{uri.port}`

Returns the port of the URI schema.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.port}
```

## `{uri.r2}`

Returns the value of r2 URI parameter.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.r2}
```

## `{uri.schema}`

Returns the schema part of the given URI.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.schema}
```

## `{uri.transport}`

Returns the value of transport URI parameter.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.transport}
```

## `{uri.ttl}`

Returns the value of ttl URI parameter.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.ttl}
```

## `{uri.uparam}`

Returns the value of user URI parameter

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.uparam}
```

## `{uri.user}`

Returns the user part of the URI schema.

- **Class:** URI Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.user}
```

## `{via.branch}`

Returns the value of the branch parameter in the VIA header.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.branch}
```

## `{via.comment}`

The comment associated with the via header. The struct via_body contains this field, but it isn't clear that RFC3261 allows Via headers to have comments (see text at top of page 221, and the BNF doesn't explicit allow comment within Via). The comment is the text enclosed within parens.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.comment}
```

## `{via.host}`

Returns the host portion of the sent-by (of RFC3261 BNF). Typically this is the IP address of the sender of the request message, and is the address to which the response will be sent.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.host}
```

## `{via.name}`

Returns the protocol-name (of RFC3261 BNF), generally SIP.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.name}
```

## `{via.params}`

Returns all the Via headers parameters (via-param of RFC3261 BNF) as single string. Result can be processed using the {param.*} transforms. This is essentially everything after the host and port.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.params}
```

## `{via.param}`

Returns the value of Via header parameter with name name. Typical parameters include branch, rport and received.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.param,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the Via parameter

**Example.** Get via parameter.

```opensips
$var(upstreamip) = $(hdr(Via)[1]{via.param,received});
$var(clientport) = $(hdr(Via)[-1]{via.param,rport});
```

## `{via.port}`

Returns the port portion of the sent-by (of RFC3261 BNF). Typically this is the IP port of the sender of the request message, and is the address to which the response will be sent. Result of transform is valid as both integer and string.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.port}
```

## `{via.received}`

Returns the value of the received parameter in the VIA header, if any.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.received}
```

## `{via.rport}`

Returns the value of the rport parameter in the VIA header, if any.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.rport}
```

## `{via.transport}`

Returns the transport (of RFC3261 BNF), e.g., UDP, TCP, TLS. This is the transport protocol used to send the request message.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.transport}
```

**Example.** Get via transport.

```opensips
$var(upstreamtransport) = $(hdr(Via)[1]{via.transport}{s.tolower});
```

## `{via.version}`

Returns the protocol-version (of RFC3261 BNF), generally 2.0.

- **Class:** VIA Transformations
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.version}
```
