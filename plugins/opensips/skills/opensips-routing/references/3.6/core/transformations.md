# Transformations Reference
<!-- generated-from: data/3.6/core/transformations.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: transformation -->

Reference for OpenSIPs 3.6 transformations. Read this file when manipulating pseudo-variable values inline and need the canonical class, input/output, and chaining behavior of a transformation.

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

- **Class:** csv
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

## `csv.value`

Returns the entry at the specified positions. Indexing starts from 0.

- **Class:** csv
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{csv.value,index}
```

**Parameters:**

- `index` *(integer, required)* — Index of the entry.

**Example.** Get CSV value at index.

```opensips
"a,b,c" {csv.value,2} = c
```

## `ip.family`

Returns INET or INET6 if the binary IP representation provided is IPv4 or IPv6.

- **Class:** ip
- **Input:** binary
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.family}
```

**Example.** Get IP family.

```opensips
"193.668.3.634" {ip.pton}{ip.family} = "INET"
```

## `ip.isip`

Returns 1 if the string provided is a valid IPv4 or IPv6 address, otherwise 0.

- **Class:** ip
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip}
```

**Example.** Check if valid IP.

```opensips
"193.668.3.634" {ip.isip} = 1
```

## `ip.isip4`

Returns 1 if the string provided is a valid IPv4, otherwise 0.

- **Class:** ip
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip4}
```

**Example.** Check if valid IPv4.

```opensips
"193.668.3.634" {ip.isip4} = 1
```

## `ip.isip6`

Returns 1 if the string provided is a valid IPv6, otherwise 0.

- **Class:** ip
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.isip6}
```

**Example.** Check if valid IPv6.

```opensips
"2001:0db8:85a3:0000:0000:8a2e:0370:7334" {ip.isip6} = 1
```

## `ip.isprivate`

Checks if the input IP address is an IPv4 private IP, according to RFC 1918 and RFC 6598.

- **Class:** ip
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
```

## `ip.matches`

Checks if the input IP address matches a net mask given as IP/masklen.

- **Class:** ip
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{ip.matches,netmask}
```

**Parameters:**

- `netmask` *(string, required)* — Netmask in IP/masklen format.

**Example.** Check if IP matches netmask.

```opensips
if ( $(si{ip.matches,10.10.0.1/24})==1 )
	xlog("It DOES match \n");
```

## `ip.ntop`

Returns a string representation of the binary IP provided.

- **Class:** ip
- **Input:** binary
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{ip.ntop}
```

**Example.** Convert binary IP to string.

```opensips
"193.668.3.634"{ip.pton}{ip.ntop} = "193.668.3.634"
```

## `ip.pton`

Returns a binary representation of a string represented IP.

- **Class:** ip
- **Input:** string
- **Output:** binary
- **Chainable:** yes

**Syntax:**

```
{ip.pton}
```

**Example.** Convert IP to binary.

```opensips
"193.668.3.634" {ip.pton} returns a 4 byte binary representation
```

## `ip.resolve`

Returns the resolved IP address corresponding to the string domain provided.

- **Class:** ip
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

## `nameaddr.len`

Returns the length of the entire name-addr part from the value.

- **Class:** nameaddr
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{nameaddr.len,index}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index for list of nameaddr specs.

## `nameaddr.name`

Returns the value of display name.

- **Class:** nameaddr
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.name,index}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index for list of nameaddr specs.

**Example.** Get display name.

```opensips
'"test" <sip:test@opensips.org>' {nameaddr.name} = "test"
```

## `nameaddr.param`

Returns the value of the parameter with name param_name.

- **Class:** nameaddr
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.param,param_name,index}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index for list of nameaddr specs.
- `param_name` *(string, required)* — Name of the parameter.

**Example.** Get parameter value.

```opensips
'"test" <sip:test@opensips.org>;tag=dat43h' {nameaddr.param,tag} = dat43h
```

## `nameaddr.params`

Returns all the parameters and their corresponding values.

- **Class:** nameaddr
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.params,index}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index for list of nameaddr specs.

**Example.** Get all parameters.

```opensips
'"test" <sip:test@opensips.org>;tag=dat43h;private=yes' {nameaddr.params} = "tag=dat43h;private=yes"
```

## `nameaddr.uri`

Returns the value of URI.

- **Class:** nameaddr
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{nameaddr.uri,index}
```

**Parameters:**

- `index` *(integer, optional)* — Optional index for list of nameaddr specs.

**Example.** Get URI.

```opensips
'"test" <sip:test@opensips.org>' {nameaddr.uri} = sip:test@opensips.org
```

## `param.count`

Returns the number of parameters in the list.

- **Class:** param
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

## `param.exist`

Returns 1 if the parameter 'name' exists, else 0.

- **Class:** param
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{param.exist,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the parameter.

**Example.** Check if parameter 'ob' exists.

```opensips
"a=0;b=2;ob;c=3"{param.exist,ob};         # returns 1
```

## `param.name`

Returns the name of parameter at position 'index'.

- **Class:** param
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.name,index}
```

**Parameters:**

- `index` *(integer, required)* — 0-based index of the parameter.

**Example.** Get name of parameter at index 1.

```opensips
"a=1;b=2;c=3"{param.name,1} = "b"
```

## `param.value`

Returns the value of parameter 'name'.

- **Class:** param
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.value,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the parameter.

**Example.** Get value of parameter 'c'.

```opensips
"a=1;b=2;c=3"{param.value,c} = "3"
```

## `param.valueat`

Returns the value of parameter at position give by 'index' (0-based index).

- **Class:** param
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{param.valueat,index}
```

**Parameters:**

- `index` *(integer, required)* — 0-based index of the parameter.

**Example.** Get value of parameter at index 1.

```opensips
"a=1;b=2;c=3"{param.valueat,1} = "2"
```

## `re.subst`

Performs substitution using a regular expression.

- **Class:** re
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{re.subst,reg_exp}
```

**Parameters:**

- `reg_exp` *(string, required)* — Format: /posix_match_expression/replacement_expression/flags

**Example.** Apply regex substitution.

```opensips
xlog("Applying reg exp $var(reg) to $var(reg_input) : $(var(reg_input){re.subst,$var(reg)})\n");
```

## `s.b64decode`

Assumes input is a Base64 string and decodes as many characters as possible.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.b64decode}
```

**Example.** Base64 decode input.

```opensips
$(var(in){s.b64decode})   => "\x2\x3\x4\x5!@#%^&*"
```

## `s.b64encode`

Represents binary input data in an ASCII string format.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.b64encode}
```

**Example.** Base64 encode input.

```opensips
$(var(in){s.b64encode})   => "AgMEBSFAIyVeJio="
```

## `s.date2unix`

Assumes the input is an RFC-3261 SIP Date header value and returns the equivalent UNIX timestamp.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.date2unix}
```

**Example.** Convert SIP Date to UNIX timestamp.

```opensips
$(var(date){s.date2unix})   => "1718282880";
```

## `s.dec2hex`

Converts a decimal(base 10) number to hexadecimal (in base 16), represented as string.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.dec2hex}
```

## `s.decode.hexa`

Return decoding from hexa of variable's value

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.decode.hexa}
```

## `s.encode.hexa`

Return encoding in hexa of variable's value

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.encode.hexa}
```

## `s.escape.common`

Return escaped string of variable's value. Characters escaped are ', ", and 0.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.common}
```

## `s.escape.param`

Return escaped string of variable's value, changing to '%hexa' the characters that are not allowed in the param part of SIP URI.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.param}
```

## `s.escape.user`

Return escaped string of variable's value, changing to '%hexa' the characters that are not allowed in user part of SIP URI.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.escape.user}
```

## `s.eval`

Interprets the string as a variable formatted string, evaluating all the variables declared in it.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.eval}
```

**Example.** Evaluate variables in string.

```opensips
$(var(format){s.eval})   => "Hello, client!"
```

## `s.fill.left`

Fills a string to the left with a char/string until the given final length is reached.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.fill.left,token,length}
```

**Parameters:**

- `length` *(integer, required)* — Final length of the string.
- `token` *(string, required)* — Character or string to fill with.

**Example.** Left pad string with zeros.

```opensips
$(var(in){s.fill.left, 0, 6})    => 000485
```

## `s.fill.right`

Fills a string to the right with a char/string until the given final length is reached.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.fill.right,token,length}
```

**Parameters:**

- `length` *(integer, required)* — Final length of the string.
- `token` *(string, required)* — Character or string to fill with.

**Example.** Right pad string with zeros.

```opensips
$(var(in){s.fill.right, 0, 6})   => 485000
```

## `s.hex2dec`

Converts a hexadecimal number (base 16) represented as string to decimal (base 10).

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.hex2dec}
```

## `s.index`

Searches for one string within another starting at the beginning. Returns starting index or NULL.

- **Class:** s
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.index,substring,offset}
```

**Parameters:**

- `offset` *(integer, optional)* — Offset to begin search. Optional.
- `substring` *(string, required)* — String to search for.

**Example.** Find index of substring.

```opensips
$(var(strtosearch){s.index, $var(str)}) # will return 0
```

## `s.int`

Converts the initial part of the given string to an integer value. Returns 0 if there were no digits at all.

- **Class:** s
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.int}
```

**Example.** Convert string to integer and compare.

```opensips
$var(dur) = "2868.12 sec";
if ($(var(dur){s.int}) < 3600) {
  ...
}
```

## `s.len`

Return strlen of variable value

- **Class:** s
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.len}
```

**Example.** Check if string length is 3.

```opensips
$var(x) = "abc";
if($(var(x){s.len}) == 3)
{
   ...
}
```

## `s.md5`

Returns the MD5 hash of the given input.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.md5}
```

**Example.** Log MD5 hash of From username.

```opensips
xlog("MD5 over From username: $(fU{s.md5})\n");
```

## `s.reverse`

Returns the input string in revers order.

- **Class:** s
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

## `s.rindex`

Searches for one string within another starting at the end. Returns starting index or NULL.

- **Class:** s
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.rindex,substring,offset}
```

**Parameters:**

- `offset` *(integer, optional)* — Offset to start search before. Optional.
- `substring` *(string, required)* — String to search for.

**Example.** Find last index of substring.

```opensips
$(var(strtosearch){s.rindex, $var(str)}) # will return 11
```

## `s.select`

Return a field from the value of a variable based on separator and index.

- **Class:** s
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

**Example.** Select field at index 1.

```opensips
$var(x) = "12,34,56";
$(var(x){s.select,1,,}) => "34" ;
```

## `s.sha1`

Returns the SHA1 hash of the given input.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha1}
```

**Example.** Log SHA1 hash.

```opensips
xlog("SHA1 over From username: $(fU{s.sha1})\n");
```

## `s.sha1_hmac`

Returns the SHA1 HMAC hash of the given input using key.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha1_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for HMAC.

**Example.** Log SHA1 HMAC.

```opensips
xlog("SHA1 HMAC over From username using key 'secret': $(fU{s.sha1_hmac,secret})\n");
```

## `s.sha224`

Returns the SHA224 hash of the given input.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha224}
```

**Example.** Log SHA224 hash.

```opensips
xlog("SHA224 over From username: $(fU{s.sha224})\n");
```

## `s.sha224_hmac`

Returns the SHA224 HMAC hash of the given input using key.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha224_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for HMAC.

**Example.** Log SHA224 HMAC.

```opensips
xlog("SHA224 HMAC over From username using key 'secret': $(fU{s.sha224_hmac,secret})\n");
```

## `s.sha256`

Returns the SHA256 hash of the given input.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha256}
```

**Example.** Log SHA256 hash.

```opensips
xlog("SHA256 over From username: $(fU{s.sha256})\n");
```

## `s.sha256_hmac`

Returns the SHA256 HMAC hash of the given input using key.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha256_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for HMAC.

**Example.** Log SHA256 HMAC.

```opensips
xlog("SHA256 HMAC over From username using key 'secret': $(fU{s.sha256_hmac,secret})\n");
```

## `s.sha384`

Returns the SHA384 hash of the given input.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha384}
```

**Example.** Log SHA384 hash.

```opensips
xlog("SHA384 over From username: $(fU{s.sha384})\n");
```

## `s.sha384_hmac`

Returns the SHA384 HMAC hash of the given input using key.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha384_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for HMAC.

**Example.** Log SHA384 HMAC.

```opensips
xlog("SHA384 HMAC over From username using key 'secret': $(fU{s.sha384_hmac,secret})\n");
```

## `s.sha512`

Returns the SHA512 hash of the given input.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha512}
```

**Example.** Log SHA512 hash.

```opensips
xlog("SHA512 over From username: $(fU{s.sha512})\n");
```

## `s.sha512_hmac`

Returns the SHA512 HMAC hash of the given input using key.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.sha512_hmac,key}
```

**Parameters:**

- `key` *(string, required)* — The key for HMAC.

**Example.** Log SHA512 HMAC.

```opensips
xlog("SHA512 HMAC over From username using key 'secret': $(fU{s.sha512_hmac,secret})\n");
```

## `s.substr`

Return the substring starting at offset having size of length.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.substr,offset,length}
```

**Parameters:**

- `length` *(integer, required)* — Size of the substring. Must be positive.
- `offset` *(integer, required)* — Starting index. Negative values count from the end.

**Example.** Get substring from index 1 to end.

```opensips
$var(x) = "abcd";
$(var(x){s.substr,1,0}) = "bcd"
```

## `s.tolower`

Return string with lower case ASCII letters.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.tolower}
```

## `s.toupper`

Return string with upper case ASCII letters.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.toupper}
```

## `s.trim`

Strips any leading or trailing whitespace from the input string.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.trim}
```

**Example.** Trim whitespace.

```opensips
$(var(in){s.trim})   => "input string"
```

## `s.triml`

Strips any leading whitespace from the input string.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.triml}
```

**Example.** Trim left whitespace.

```opensips
$(var(in){s.triml})   => "input string  \r  "
```

## `s.trimr`

Strips any trailing whitespace from the input string.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.trimr}
```

**Example.** Trim right whitespace.

```opensips
$(var(in){s.trimr})   => "\t \n input string"
```

## `s.unescape.common`

Return unescaped string of variable's value. Reverse of s.escape.common.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.common}
```

## `s.unescape.param`

Return unescaped string of variable's value, changing '%hexa' to character code.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.param}
```

## `s.unescape.user`

Return unescaped string of variable's value, changing '%hexa' to character code.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.unescape.user}
```

## `s.width`

Truncates or expands the input to the given len. Expanding is done to the right with spaces.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.width,length}
```

**Parameters:**

- `length` *(integer, required)* — Target length.

**Example.** Expand string to width 16.

```opensips
$(var(in){s.width, 16})  => "transformation  "
```

## `s.xor`

Performs one or more logical XOR operations with the secret string parameter and the input string.

- **Class:** s
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{s.xor,secret}
```

**Parameters:**

- `secret` *(string, required)* — The secret string to XOR against.

**Example.** XOR input with 'x'.

```opensips
$(var(in){s.xor,x})   => "!/>^P!/>^P!^U2^Q!^U2^Q"
```

## `sdp.line`

Returns the specified line in the SDP body.

- **Class:** sdp
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.line,type,index}
```

**Parameters:**

- `index` *(integer, optional)* — The line number of the type. Defaults to 0.
- `type` *(string, required)* — The line type (e.g., 'a', 'm').

**Example.** Get second 'a' line.

```opensips
$var(aline) = $(rb{sdp.line,a,1});
```

## `sdp.stream`

Returns a specific stream (starting with the m= line) from an SDP body.

- **Class:** sdp
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.stream,index_or_type}
```

**Parameters:**

- `index_or_type` *(string, required)* — Index (int) or media type (string) of the stream.

**Example.** Get audio stream.

```opensips
$var(audio_stream) = $(rb{sdp.stream,audio});
```

## `sdp.stream-delete`

Returns the specified SDP body with some of its streams deleted.

- **Class:** sdp
- **Input:** string
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{sdp.stream-delete,index_or_type}
```

**Parameters:**

- `index_or_type` *(string, required)* — Index (int) or media type (string) of the stream to delete.

**Example.** Delete video stream.

```opensips
$var(new_body) = $(rb{sdp.stream-delete,video});
```

## `uri.headers`

Returns URI headers.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.headers}
```

## `uri.host`

Returns the domain part of the URI schema.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.host}
```

## `uri.lr`

Returns the value of lr URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.lr}
```

## `uri.maddr`

Returns the value of maddr URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.maddr}
```

## `uri.method`

Returns the value of method URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.method}
```

## `uri.param`

Returns the value of URI parameter with name 'name'.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.param,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the parameter.

## `uri.params`

Returns all the URI parameters into a single string.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.params}
```

## `uri.passwd`

Returns the password part of the URI schema.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.passwd}
```

## `uri.port`

Returns the port of the URI schema.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.port}
```

## `uri.r2`

Returns the value of r2 URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.r2}
```

## `uri.schema`

Returns the schema part of the given URI.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.schema}
```

## `uri.transport`

Returns the value of transport URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.transport}
```

## `uri.ttl`

Returns the value of ttl URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.ttl}
```

## `uri.uparam`

Returns the value of user URI parameter.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.uparam}
```

## `uri.user`

Returns the user part of the URI schema.

- **Class:** uri
- **Input:** SIP URI
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{uri.user}
```

## `via.branch`

Returns the value of the branch parameter in the VIA header.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.branch}
```

## `via.comment`

The comment associated with the via header.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.comment}
```

## `via.host`

Returns the host portion of the sent-by (of RFC3261 BNF).

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.host}
```

## `via.name`

Returns the protocol-name (of RFC3261 BNF), generally SIP.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.name}
```

## `via.param`

Returns the value of Via header parameter with name 'name'.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.param,name}
```

**Parameters:**

- `name` *(string, required)* — Name of the parameter.

## `via.params`

Returns all the Via headers parameters as single string.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.params}
```

## `via.port`

Returns the port portion of the sent-by (of RFC3261 BNF).

- **Class:** via
- **Input:** SIP Via Header
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{via.port}
```

## `via.received`

Returns the value of the received parameter in the VIA header, if any.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.received}
```

## `via.rport`

Returns the value of the rport parameter in the VIA header, if any.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.rport}
```

## `via.transport`

Returns the transport (of RFC3261 BNF), e.g., UDP, TCP, TLS.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.transport}
```

## `via.version`

Returns the protocol-version (of RFC3261 BNF), generally 2.0.

- **Class:** via
- **Input:** SIP Via Header
- **Output:** string
- **Chainable:** yes

**Syntax:**

```
{via.version}
```
