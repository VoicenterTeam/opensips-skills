# Transformations Reference
<!-- generated-from: data/4.0/core/transformations.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: transformation -->

Reference for OpenSIPs 4.0 transformations. Read this file when manipulating pseudo-variable values inline and need the canonical class, input/output, and chaining behavior of a transformation.

## Contents

- [`csv.count`](#csvcount)
- [`csv.value`](#csvvalue)
- [`ip.family`](#ipfamily)
- [`ip.isip`](#ipisip)
- [`ip.isip4`](#ipisip4)
- [`ip.isip6`](#ipisip6)
- [`ip.isprivate`](#ipisprivate)
- [`ip.matches`](#ipmatches)
- [`ip.ntop`](#ipntop)
- [`ip.pton`](#ippton)
- [`ip.resolve`](#ipresolve)
- [`nameaddr.len`](#nameaddrlen)
- [`nameaddr.name`](#nameaddrname)
- [`nameaddr.param`](#nameaddrparam)
- [`nameaddr.params`](#nameaddrparams)
- [`nameaddr.uri`](#nameaddruri)
- [`param.count`](#paramcount)
- [`param.exist`](#paramexist)
- [`param.name`](#paramname)
- [`param.value`](#paramvalue)
- [`param.valueat`](#paramvalueat)
- [`re.subst`](#resubst)
- [`s.b64decode`](#sb64decode)
- [`s.b64encode`](#sb64encode)
- [`s.date2unix`](#sdate2unix)
- [`s.dec2hex`](#sdec2hex)
- [`s.decode.hexa`](#sdecodehexa)
- [`s.encode.hexa`](#sencodehexa)
- [`s.escape.common`](#sescapecommon)
- [`s.escape.param`](#sescapeparam)
- [`s.escape.user`](#sescapeuser)
- [`s.eval`](#seval)
- [`s.fill.left`](#sfillleft)
- [`s.fill.right`](#sfillright)
- [`s.hex2dec`](#shex2dec)
- [`s.index`](#sindex)
- [`s.int`](#sint)
- [`s.len`](#slen)
- [`s.md5`](#smd5)
- [`s.reverse`](#sreverse)
- [`s.rindex`](#srindex)
- [`s.select`](#sselect)
- [`s.sha1`](#ssha1)
- [`s.sha1_hmac`](#ssha1_hmac)
- [`s.sha224`](#ssha224)
- [`s.sha224_hmac`](#ssha224_hmac)
- [`s.sha256`](#ssha256)
- [`s.sha256_hmac`](#ssha256_hmac)
- [`s.sha384`](#ssha384)
- [`s.sha384_hmac`](#ssha384_hmac)
- [`s.sha512`](#ssha512)
- [`s.sha512_hmac`](#ssha512_hmac)
- [`s.substr`](#ssubstr)
- [`s.tolower`](#stolower)
- [`s.toupper`](#stoupper)
- [`s.trim`](#strim)
- [`s.triml`](#striml)
- [`s.trimr`](#strimr)
- [`s.unescape.common`](#sunescapecommon)
- [`s.unescape.param`](#sunescapeparam)
- [`s.unescape.user`](#sunescapeuser)
- [`s.width`](#swidth)
- [`s.xor`](#sxor)
- [`sdp.line`](#sdpline)
- [`sdp.stream`](#sdpstream)
- [`sdp.stream-delete`](#sdpstream-delete)
- [`uri.headers`](#uriheaders)
- [`uri.host`](#urihost)
- [`uri.lr`](#urilr)
- [`uri.maddr`](#urimaddr)
- [`uri.method`](#urimethod)
- [`uri.param`](#uriparam)
- [`uri.params`](#uriparams)
- [`uri.passwd`](#uripasswd)
- [`uri.port`](#uriport)
- [`uri.r2`](#urir2)
- [`uri.schema`](#urischema)
- [`uri.transport`](#uritransport)
- [`uri.ttl`](#urittl)
- [`uri.uparam`](#uriuparam)
- [`uri.user`](#uriuser)
- [`via.branch`](#viabranch)
- [`via.comment`](#viacomment)
- [`via.host`](#viahost)
- [`via.name`](#vianame)
- [`via.param`](#viaparam)
- [`via.params`](#viaparams)
- [`via.port`](#viaport)
- [`via.received`](#viareceived)
- [`via.rport`](#viarport)
- [`via.transport`](#viatransport)
- [`via.version`](#viaversion)

## `csv.count`

Returns the number of entries in the provided CSV.

- **Class:** CSV
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{csv.count}
```

**Example.** .

```opensips
"a,b,c" {csv.count} = 3
```

## `csv.value`

Returns the entry at the specified positions.

- **Class:** CSV
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{csv.value,index}
```

**Parameters:**

- `index` *(integer, required)* — The index of the entry (0-based).

**Example.** .

```opensips
"a,b,c" {csv.value,2} = c
```

## `ip.family`

Returns INET or INET6 if the binary IP representation provided is IPv4 or IPv6.

- **Class:** IP
- **Input:** binary
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.family}
```

**Example.** .

```opensips
"194.068.4.034" {ip.pton}{ip.family} = "INET"
```

## `ip.isip`

Returns 1 if the string provided is a valid IPv4 or IPv6 address, otherwise 0.

- **Class:** IP
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip}
```

**Example.** .

```opensips
"194.068.4.034" {ip.isip} = 1
"194.068.4.034.1" {ip.isip} = 0
```

## `ip.isip4`

Returns 1 if the string provided is a valid IPv4, otherwise 0.

- **Class:** IP
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip4}
```

**Example.** .

```opensips
"194.068.4.034" {ip.isip4} = 1
```

## `ip.isip6`

Returns 1 if the string provided is a valid IPv6, otherwise 0.

- **Class:** IP
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip6}
```

**Example.** .

```opensips
"194.068.4.034" {ip.isip6} = 0
"2001:0db8:85a3:0000:0000:8a2e:0370:7334" {ip.isip6} = 1
```

## `ip.isprivate`

Checks if the input IP address is an IPv4 private IP, according to RFC 1918 and RFC 6598.

- **Class:** IP
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isprivate}
```

**Example.** .

```opensips
if ( $(si{ip.isprivate})==1 )
	xlog("source ip is private\n");
else
	xlog("source ip is not private\n");
```

## `ip.matches`

Checks if the input IP address matches a net mask given as IP/masklen (short format).

- **Class:** IP
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.matches,netmask}
```

**Parameters:**

- `netmask` *(string, required)* — The netmask in IP/masklen format.

**Example.** .

```opensips
if ( $(si{ip.matches,10.10.0.1/24})==1 )
	xlog("It DOES match \n");
else
	xlog("It DOES NOT match \n");
```

## `ip.ntop`

Returns a string representation of the binary IP provided

- **Class:** IP
- **Input:** binary
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.ntop}
```

**Example.** .

```opensips
"194.068.4.034"{ip.pton}{ip.ntop} = "194.068.4.034"
```

## `ip.pton`

Returns a binary representation of a string represented IP.

- **Class:** IP
- **Input:** string
- **Output:** binary
- **Chainable:** yes

**Syntax:**

```
{ip.pton}
```

**Example.** .

```opensips
"194.068.4.034" {ip.pton} returns a 4 byte binary representation of the IP provided
```

## `ip.resolve`

Returns the resolved IP address corresponding to the string domain provided.

- **Class:** IP
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.resolve}
```

**Example.** .

```opensips
"opensips.org" {ip.resolve} = "78.46.64.50"
```

## `nameaddr.len`

Returns the length of the entire name-addr part from the value.

- **Class:** Name-address
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{nameaddr.len}
```

## `nameaddr.name`

Returns the value of display name

- **Class:** Name-address
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.name}
```

**Example.** .

```opensips
"test" <sip:test@opensips.org>' {nameaddr.name} = "test"
```

## `nameaddr.param`

Returns the value of the parameter with name param_name.

- **Class:** Name-address
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.param,param_name}
```

**Parameters:**

- `param_name` *(string, required)* — The name of the parameter.

**Example.** .

```opensips
"test" <sip:test@opensips.org>;tag=dat43h' {nameaddr.param,tag} = dat43h
```

## `nameaddr.params`

Returns all the parameters and their corresponding values.

- **Class:** Name-address
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.params}
```

**Example.** .

```opensips
"test" <sip:test@opensips.org>;tag=dat43h;private=yes' {nameaddr.params} = "tag=dat43h;private=yes"
```

## `nameaddr.uri`

Returns the value of URI

- **Class:** Name-address
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.uri}
```

**Example.** .

```opensips
"test" <sip:test@opensips.org>' {nameaddr.uri} = sip:test@opensips.org
```

## `param.count`

Returns the number of parameters in the list.

- **Class:** Parameters List
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{param.count}
```

**Example.** .

```opensips
"a=1;b=2;c=3"{param.count} = 3
```

## `param.exist`

Returns 1 if the parameter name exists (with or without value), else 0.

- **Class:** Parameters List
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{param.exist,name}
```

**Parameters:**

- `name` *(string, required)* — The name of the parameter.

**Example.** .

```opensips
"a=0;b=2;ob;c=3"{param.exist,ob};         # returns 1
"a=0;b=2;ob;c=3"{param.exist,a};          # returns 1
"a=0;b=2;ob;c=3"{param.exist,foo};        # returns 0
```

## `param.name`

Returns the name of parameter at position 'index'.

- **Class:** Parameters List
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.name,index}
```

**Parameters:**

- `index` *(integer, required)* — The position of the parameter.

**Example.** .

```opensips
"a=1;b=2;c=3"{param.name,1} = "b"
```

## `param.value`

Returns the value of parameter 'name'

- **Class:** Parameters List
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.value,name}
```

**Parameters:**

- `name` *(string, required)* — The name of the parameter.

**Example.** .

```opensips
"a=1;b=2;c=3"{param.value,c} = "3"
```

## `param.valueat`

Returns the value of parameter at position give by 'index' (0-based index)

- **Class:** Parameters List
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.valueat,index}
```

**Parameters:**

- `index` *(integer, required)* — The position of the parameter (0-based).

**Example.** .

```opensips
"a=1;b=2;c=3"{param.valueat,1} = "2"
```

## `re.subst`

Performs a regular expression substitution.

- **Class:** Regular Expression
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{re.subst,reg_exp}
```

**Parameters:**

- `reg_exp` *(string, required)* — The regular expression in /match/replacement/flags format.

**Example.** .

```opensips
$var(reg_input)="abc";
$var(reg) = "/a/A/g";
xlog("Applying reg exp $var(reg) to $var(reg_input) : $(var(reg_input){re.subst,$var(reg)})\n");
```

**Example.** .

```opensips
xlog("Applying reg /b/B/g to $var(reg_input) : $(var(reg_input){re.subst,/b/B/g})\n");
```

## `s.b64decode`

Assumes input is a Base64 string and decodes as many characters as possible.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.b64decode}
```

**Example.** .

```opensips
$var(in) = "AgMEBSFAIyVeJio=";
$(var(in){s.b64decode})   => "\x2\x3\x4\x5!@#%^&*"
```

## `s.b64encode`

Represents binary input data in an ASCII string format.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.b64encode}
```

**Example.** .

```opensips
$var(in) = "\x2\x3\x4\x5!@#%^&*";
$(var(in){s.b64encode})   => "AgMEBSFAIyVeJio="
```

## `s.date2unix`

Assumes the input is an RFC-3261 SIP "Date" header value, parses it accordingly and returns the equivalent UNIX timestamp.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.date2unix}
```

**Example.** .

```opensips
$var(date) = "Thu, 13 Jun 2024 12:48:00 GMT";
$(var(date){s.date2unix})   => "1718282880";
```

## `s.dec2hex`

Converts a decimal(base 10) number to hexadecimal (in base 16), represented as string.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.dec2hex}
```

## `s.decode.hexa`

Return decoding from hexa of variable's value

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.decode.hexa}
```

## `s.encode.hexa`

Return encoding in hexa of variable's value

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.encode.hexa}
```

## `s.escape.common`

Return escaped string of variable's value. Characters escaped are ', ", and 0.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.common}
```

## `s.escape.param`

Return escaped string of variable's value, changing to '%hexa' the characters that are not allowed in the param part of SIP URI following RFC requirements.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.param}
```

## `s.escape.user`

Return escaped string of variable's value, changing to '%hexa' the characters that are not allowed in user part of SIP URI following RFC requirements.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.user}
```

## `s.eval`

Interprets the string as a variable formatted string, evaluating all the variables declared in it.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.eval}
```

**Example.** .

```opensips
$var(in) = "client";
$var(format) = "Hello, $var(in)!";
$(var(format){s.eval})   => "Hello, client!"
```

## `s.fill.left`

Fills a string to the left with a char/string until the given final length is reached.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.fill.left,token,length}
```

**Parameters:**

- `length` *(integer, required)* — Final length.
- `token` *(string, required)* — Char/string to fill with.

**Example.** .

```opensips
$var(in) = "485"; (also works for integer PVs)

$(var(in){s.fill.left, 0, 3})    => 485    
$(var(in){s.fill.left, 0, 6})    => 000485
$(var(in){s.fill.left, abc, 8})  => bcabc485
```

## `s.fill.right`

Fills a string to the right with a char/string until the given final length is reached.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.fill.right,token,length}
```

**Parameters:**

- `length` *(integer, required)* — Final length.
- `token` *(string, required)* — Char/string to fill with.

**Example.** .

```opensips
$var(in) = 485; (also works for string PVs)

$(var(in){s.fill.right, 0, 3})   => 485
$(var(in){s.fill.right, 0, 6})   => 485000
$(var(in){s.fill.right, abc, 8}) => 485abcab
```

## `s.hex2dec`

Converts a hexadecimal number (base 16) represented as string to decimal (base 10).

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.hex2dec}
```

## `s.index`

Searches for one string within another starting at the beginning of the first string. Returns starting index of the string found or NULL if not found.

- **Class:** String
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.index,substring,offset}
```

**Parameters:**

- `offset` *(integer, optional)* — Offset to begin the search at. Default 0.
- `substring` *(string, required)* — String to search for.

**Example.** .

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

## `s.int`

Converts the initial part of the given string to an integer value. Returns 0 if there were no digits at all.

- **Class:** String
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.int}
```

**Example.** .

```opensips
$var(dur) = "2868.12 sec";
if ($(var(dur){s.int}) < 3600) {
  ...
}
```

## `s.len`

Return strlen of variable value

- **Class:** String
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.len}
```

**Example.** .

```opensips
$var(x) = "abc";
if($(var(x){s.len}) == 3)
{
   ...
}
```

## `s.md5`

Returns the MD5 hash of the given input.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.md5}
```

**Example.** .

```opensips
xlog("MD5 over From username: $(fU{s.md5})\n");
```

## `s.reverse`

Returns the input string in revers order.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.reverse}
```

**Example.** .

```opensips
$var(forward) = "onetwothree";
$var(reverse) = $(var(forward){s.reverse}); //Contains "eerhtowteno";
```

## `s.rindex`

Searches for one string within another starting at the end of the first string. Returns starting index of the string found or NULL if not found.

- **Class:** String
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.rindex,substring,offset}
```

**Parameters:**

- `offset` *(integer, optional)* — Offset to start the search before.
- `substring` *(string, required)* — String to search for.

**Example.** .

```opensips
$(var(strtosearch){s.rindex, $var(str)}) # will return 11
$(var(strtosearch){s.rindex, $var(str), -3}) # will return 11
$(var(strtosearch){s.rindex, $var(str), 11}) # will return 11
$(var(strtosearch){s.rindex, $var(str), -4}) # will return 0
```

## `s.select`

Return a field from the value of a variable based on separator and index.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.select,index,separator}
```

**Parameters:**

- `index` *(integer, required)* — Field index. Negative values count from the end.
- `separator` *(string, required)* — Character used to identify fields.

**Example.** .

```opensips
$var(x) = "12,34,56";
$(var(x){s.select,1,,}) => "34" ;
```

**Example.** .

```opensips
$var(x) = "12,34,56";
$(var(x){s.select,-2,,}) => "34"
```

## `s.sha1`

Returns the SHA1 hash of the given input.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha1}
```

**Example.** .

```opensips
xlog("SHA1 over From username: $(fU{s.sha1})\n");
```

## `s.sha1_hmac`

Returns the SHA1 HMAC hash of the given input using key.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha1_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for the HMAC operation.

**Example.** .

```opensips
xlog("SHA1 HMAC over From username using key 'secret': $(fU{s.sha1_hmac,secret})\n");
```

## `s.sha224`

Returns the SHA224 hash of the given input.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha224}
```

**Example.** .

```opensips
xlog("SHA224 over From username: $(fU{s.sha224})\n");
```

## `s.sha224_hmac`

Returns the SHA224 HMAC hash of the given input using key.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha224_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for the HMAC operation.

**Example.** .

```opensips
xlog("SHA224 HMAC over From username using key 'secret': $(fU{s.sha224_hmac,secret})\n");
```

## `s.sha256`

Returns the SHA256 hash of the given input.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha256}
```

**Example.** .

```opensips
xlog("SHA256 over From username: $(fU{s.sha256})\n");
```

## `s.sha256_hmac`

Returns the SHA256 HMAC hash of the given input using key.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha256_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for the HMAC operation.

**Example.** .

```opensips
xlog("SHA256 HMAC over From username using key 'secret': $(fU{s.sha256_hmac,secret})\n");
```

## `s.sha384`

Returns the SHA384 hash of the given input.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha384}
```

**Example.** .

```opensips
xlog("SHA384 over From username: $(fU{s.sha384})\n");
```

## `s.sha384_hmac`

Returns the SHA384 HMAC hash of the given input using key.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha384_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for the HMAC operation.

**Example.** .

```opensips
xlog("SHA384 HMAC over From username using key 'secret': $(fU{s.sha384_hmac,secret})\n");
```

## `s.sha512`

Returns the SHA512 hash of the given input.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha512}
```

**Example.** .

```opensips
xlog("SHA512 over From username: $(fU{s.sha512})\n");
```

## `s.sha512_hmac`

Returns the SHA512 HMAC hash of the given input using key.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha512_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for the HMAC operation.

**Example.** .

```opensips
xlog("SHA512 HMAC over From username using key 'secret': $(fU{s.sha512_hmac,secret})\n");
```

## `s.substr`

Return the substring starting at offset having size of length.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.substr,offset,length}
```

**Parameters:**

- `length` *(integer, required)* — Size of substring. 0 or greater than string length returns substring to end.
- `offset` *(integer, required)* — Starting index. Negative values count from the end.

**Example.** .

```opensips
$var(x) = "abcd";
$(var(x){s.substr,1,0}) = "bcd"
```

## `s.tolower`

Return string with lower case ASCII letters.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.tolower}
```

## `s.toupper`

Return string with upper case ASCII letters.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.toupper}
```

## `s.trim`

Strips any leading or trailing whitespace from the input string.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.trim}
```

**Example.** .

```opensips
$var(in) = "\t \n input string  \r  ";

$(var(in){s.trim})   => "input string"
```

## `s.triml`

Strips any leading whitespace from the input string.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.triml}
```

**Example.** .

```opensips
$var(in) = "\t \n input string  \r  ";

$(var(in){s.triml})   => "input string  \r  "
```

## `s.trimr`

Strips any trailing whitespace from the input string.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.trimr}
```

**Example.** .

```opensips
$var(in) = "\t \n input string  \r  ";

$(var(in){s.trimr})   => "\t \n input string"
```

## `s.unescape.common`

Return unescaped string of variable's value. Reverse of above transformation.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.common}
```

## `s.unescape.param`

Return unescaped string of variable's value, changing '%hexa' to character code. Reverse of above transformation.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.param}
```

## `s.unescape.user`

Return unescaped string of variable's value, changing '%hexa' to character code. Reverse of above transformation.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.user}
```

## `s.width`

Truncates or expands the input to the given len. Expanding is done to the right with the space character ' '. Truncating is done in a similar manner, from the right.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.width,length}
```

**Parameters:**

- `length` *(integer, required)* — Target length.

**Example.** .

```opensips
$var(in) = "transformation";

$(var(in){s.width, 14})   => "transformation"
$(var(in){s.width, 16})  => "transformation  "
$(var(in){s.width, 9})   => "transform"
```

## `s.xor`

Performs one or more logical XOR operations with (a part of) the "secret" string parameter and the input string.

- **Class:** String
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.xor,secret}
```

**Parameters:**

- `secret` *(string, required)* — The secret string to XOR with.

**Example.** .

```opensips
$var(in) = "aaaaaabbbbbb";
$(var(in){s.xor,x})   => "!/>^P!/>^P!^U2^Q!^U2^Q"
```

## `sdp.line`

Returns the specified line in the SDP body.

- **Class:** SDP
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.line,line_type,index}
```

**Parameters:**

- `index` *(integer, optional)* — The line number of the specified type. Default 0.
- `line_type` *(string, required)* — The type of line (e.g., 'a', 'm').

**Example.** .

```opensips
if (is_method("INVITE"))
   {
      $var(aline) = $(rb{sdp.line,a,1});
      xlog("The second a line in the SDP body is $var(aline)\n");
   }
```

**Example.** .

```opensips
if (is_method("INVITE"))
   {
      $var(mline) = $(rb{sdp.line,m});
      xlog("The first m line in the SDP body is $var(mline)\n");
   }
```

## `sdp.stream`

Returns a specific stream (starting with the m= line) from an SDP body.

- **Class:** SDP
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.stream,index_or_type}
```

**Parameters:**

- `index_or_type` *(string, required)* — The index of the stream or the media type (e.g., 'audio').

**Example.** .

```opensips
if (is_method("INVITE"))
   {
      $var(first_stream) = $(rb{sdp.stream,0});
      xlog("First stream is $var(first_stream)\n");
   }
```

**Example.** .

```opensips
if (is_method("INVITE"))
   {
      $var(audio_stream) = $(rb{sdp.stream,audio});
      xlog("Audio stream is $var(audio_stream)\n");
   }
```

## `sdp.stream-delete`

Returns the specified SDP body with some of its streams deleted.

- **Class:** SDP
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.stream-delete,index_or_type}
```

**Parameters:**

- `index_or_type` *(string, required)* — The index of the stream or the media type.

**Example.** .

```opensips
if (is_method("INVITE"))
   {
      $var(new_body) = $(rb{sdp.stream-delete,0});
      xlog("SDP body without first stream is $var(new_body)\n");
   }
```

**Example.** .

```opensips
if (is_method("INVITE"))
   {
      $var(new_body) = $(rb{sdp.stream-delete,video});
      xlog("SDP body without video stream is $var(new_body)\n");
   }
```

## `uri.headers`

Returns URI headers.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.headers}
```

## `uri.host`

Returns the domain part of the URI schema.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.host}
```

## `uri.lr`

Returns the value of lr URI parameter.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.lr}
```

## `uri.maddr`

Returns the value of maddr URI parameter.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.maddr}
```

## `uri.method`

Returns the value of method URI parameter.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.method}
```

## `uri.param`

Returns the value of URI parameter with name "name"

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.param,name}
```

**Parameters:**

- `name` *(string, required)* — The name of the URI parameter.

## `uri.params`

Returns all the URI parameters into a single string.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.params}
```

## `uri.passwd`

Returns the password part of the URI schema.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.passwd}
```

## `uri.port`

Returns the port of the URI schema.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.port}
```

## `uri.r2`

Returns the value of r2 URI parameter.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.r2}
```

## `uri.schema`

Returns the schema part of the given URI.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.schema}
```

## `uri.transport`

Returns the value of transport URI parameter.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.transport}
```

## `uri.ttl`

Returns the value of ttl URI parameter.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.ttl}
```

## `uri.uparam`

Returns the value of user URI parameter

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.uparam}
```

## `uri.user`

Returns the user part of the URI schema.

- **Class:** URI
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.user}
```

## `via.branch`

Returns the value of the branch parameter in the VIA header.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.branch}
```

## `via.comment`

The comment associated with the via header.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.comment}
```

## `via.host`

Returns the host portion of the sent-by (of RFC3261 BNF).

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.host}
```

## `via.name`

Returns the protocol-name (of RFC3261 BNF), generally SIP.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.name}
```

## `via.param`

Returns the value of Via header parameter with name name.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.param,name}
```

**Parameters:**

- `name` *(string, required)* — The name of the Via parameter.

**Example.** .

```opensips
$var(upstreamip) = $(hdr(Via)[1]{via.param,received});
```

## `via.params`

Returns all the Via headers parameters (via-param of RFC3261 BNF) as single string.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.params}
```

## `via.port`

Returns the port portion of the sent-by (of RFC3261 BNF).

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.port}
```

**Example.** .

```opensips
$var(clientport) = $(hdr(Via)[-1]{via.param,rport});
```

## `via.received`

Returns the value of the received parameter in the VIA header, if any.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.received}
```

## `via.rport`

Returns the value of the rport parameter in the VIA header, if any.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.rport}
```

## `via.transport`

Returns the transport (of RFC3261 BNF), e.g., UDP, TCP, TLS.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.transport}
```

**Example.** .

```opensips
$var(upstreamtransport) = $(hdr(Via)[1]{via.transport}{s.tolower});
```

## `via.version`

Returns the protocol-version (of RFC3261 BNF), generally 2.0.

- **Class:** VIA
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.version}
```
