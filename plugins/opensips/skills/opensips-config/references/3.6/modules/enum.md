# enum Module Reference
<!-- generated-from: data/3.6/modules/enum.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 enum module. Read this file when configuring or debugging the enum module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Enum module implements [i_]enum_query functions that make an enum query based on the user part of the current Request-URI. These functions assume that the user part consists of an international phone number of the form +decimal-digits, where the number of digits is at least 2 and at most 15. Out of this number `enum_query` forms a domain name, where the digits are in reverse order and separated by dots followed by domain suffix that by default is “e164.arpa.”. For example, if the user part is +35831234567, the domain name will be “7.6.5.4.3.2.1.3.8.5.3.e164.arpa.”. `i_enum_query` operates in a similar fashion. The only difference is that it adds a label (default "i") to branch off from the default, user-ENUM tree to an infrastructure ENUM tree.

## How It Works

After forming the domain name, `enum_query` queries DNS for its NAPTR records. From the possible response `enum_query` chooses those records, whose flags field has string value "u", and whose services field has string value "e2u+[service:]sip" or "e2u+type[:subtype][+type[:subtype]...]" (case is ignored in both cases), and whose regexp field is of the form !pattern!replacement!.

Then `enum_query` sorts the chosen NAPTR records based on their <order, preference>. After sorting, `enum_query` replaces the current Request URI by applying regexp of the most preferred NAPTR record its user part and appends to the request new branches by applying regexp of each remaining NAPTR record to the user part of the current Request URI. If a new URI is a tel URI, `enum_query` appends to it as tel URI parameters the value of tel_uri_params module parameter. Finally, `enum_query` associates a q value with each new URI based on the <order, preference> of the corresponding NAPTR record.

When using `enum_query` without any parameters, it searches for NAPTRs with service type "e2u+sip" in the default enum tree. When using `enum_query` with a single parameter, this parameter will be used as enum tree. When using `enum_query` with two parameters, the functionality depends on the first letter in the second parameter. When the first letter is not a '+' sign, the second parameter will be used to search for NAPTRs with service type "e2u+parameter:sip". When the second parameter starts with a '+' sign, the ENUM lookup also supports compound NAPTRs (e.g. "e2u+voice:sip+video:sip") and searching for multiple service types within one lookup. Multiple service types must be separated by a '+' sign.

Most of the time you want to route based on the RURI. On rare occasions you may wish to route based on something else. The function `enum_pv_query` mimics the behavior of the `enum_query` function except the E.164 number in its pseudo variable argument is used for the enum lookup instead of the user part of the RURI. Obviously the user part of the RURI is still used in the NAPTR regexp.

Enum query returns 1 if the current Request URI was replaced and -1 if not.

In addition to standard ENUM, support for ISN (ITAD Subscriber Numbers) is provided as well. To allow ISN lookups to resolve, a different formatting algorithm is expected by the DNS server. Whereas a ENUM NAPTR record expects a DNS query of the form 9.8.7.6.5.4.3.2.1.suffix, ISN method expects a DNS query of the form 6.5.1212.suffix. That is, a valid ISN number includes a prefix of '56' in the example. The rest of the number is a ITAD (Internet Telephony Administrative Domain) as defined in RFCs 3872 and 2871, and as allocated by the IANA in http://www.iana.org/assignments/trip-parameters. The ITAD is left intact and not refersed as ENUM requires. To learn more about ISN please refer to documents at www.freenum.org.

To complete a ISN lookup on the user part of the Request-URI, isn_query() is used instead of enum_query().

Enum module also implements is_from_user_enum function. This function does an enum lookup on the from user and returns true if found, false otherwise.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `bl_algorithm` (string)

This parameter determines which algorithm i_enum_query() will use to select the position in the DNS tree where the infrastructure tree branches off the user ENUM tree.

If set to "cc", i_enum_query() will always inserts the label at the country-code level. Examples: i.1.e164.arpa, i.3.4.e164.arpa, i.2.5.3.e164.arpa

If set to "txt", i_enum_query() will look for a TXT record at [branchlabel].[reverse-country-code].[i_enum_suffix] to indicate after how many digits the label should in inserted.

If set to "ebl", i_enum_query() will look for an EBL (ENUM Branch Label) record at [branchlabel].[reverse-country-code].[i_enum_suffix]. See http://www.ietf.org/internet-drafts/draft-lendl-enum-branch-location-record-00.txt for a description of that record and the meaning of the fields. The RR type for the EBL has not been allocated yet. This version of the code uses 65300. See resolve.h.

*Default value is cc.*

**Possible values:**

- cc
- txt
- ebl

**Notes:** Example 1.6. Zone file example
i.1.e164.arpa.                     IN TXT   "4"
9.9.9.8.7.6.5.i.4.3.2.1.e164.arpa. IN NAPTR "NAPTR content for  +1 234 5678 999"

Example 1.7. Zone file example
i.1.e164.arpa.     TYPE65300  \# 14 (
                              04    ; position
                              01 69 ; separator
                              04 65 31 36 34 04 61 72 70 61 00 ; e164.arpa
;                               )
9.9.9.8.7.6.5.i.4.3.2.1.e164.arpa. IN NAPTR "NAPTR content for  +1 234 5678 999"

**Example.** txt.

```opensips
modparam("enum", "bl_algorithm", "txt")
```
### `branchlabel` (string)

This parameter determines which label i_enum_query() will use to branch off to the infrastructure ENUM tree.

*Default value is i.*

**Example.** i.

```opensips
modparam("enum", "branchlabel", "i")
```
### `domain_suffix` (string)

The domain suffix to be added to the domain name obtained from the digits of an E164 number. Can be overridden by a parameter to enum_query.

*Default value is e164.arpa..*

**Example.** e1234.arpa..

```opensips
modparam("enum", "domain_suffix", "e1234.arpa.")
```
### `i_enum_suffix` (string)

The domain suffix to be used for i_enum_query() lookups. Can be overridden by a parameter to i_enum_query.

*Default value is e164.arpa..*

**Example.** e1234.arpa..

```opensips
modparam("enum", "i_enum_suffix", "e1234.arpa.")
```
### `isn_suffix` (string)

The domain suffix to be used for isn_query() lookups. Can be overridden by a parameter to isn_query.

*Default value is freenum.org..*

**Example.** freenum.org..

```opensips
modparam("enum", "isn_suffix", "freenum.org.")
```
### `tel_uri_params` (string)

A string whose contents is appended to each new tel URI in the request as tel URI parameters.

**Notes:** Currently OpenSIPS does not support tel URIs. This means that at present tel_uri_params is appended as URI parameters to every URI.

**Example.** ;npdi.

```opensips
modparam("enum", "tel_uri_params", ";npdi")
```

## Exported Functions

### `enum_query([suffix], [service], [number])`

The function performs an ENUM query on a given E.164 "number" (or R-URI username if "number" is missing) and rewrites the Request-URI with the result of the query. See Overview for more information.

**Parameters:**

- `number` *(string, optional)* — a specific E.164 number packed as a string on which the ENUM query is performed (if missing the R-URI username ($rU) will be used).
- `service` *(string, optional)* — service string to be used in the service field
- `suffix` *(string, optional)* — suffix to be appended to the domain name, domain_suffix if missing

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.9. enum_query usage.

```opensips
...
# search for "e2u+sip" in freenum.org 
enum_query("freenum.org.", , $avp(number));
...
# search for "e2u+sip" in default tree (configured as parameter)
enum_query();
...
# search for "e2u+voice:sip" in e164.arpa
enum_query("e164.arpa.", "voice");
...
# search for service type "sip" or "voice:sip" or "video:sip"
# note the '+' sign in front of the second parameter
enum_query("e164.arpa.", "+sip+voice:sip+video:sip", $avp(number));
...
# querying for service sip and voice:sip
enum_query("e164.arpa.");
enum_query("e164.arpa.", "voice");
# or use instead
enum_query("e164.arpa.", "+sip+voice:sip");
...
```

### `i_enum_query([suffix], [service])`

The function performs an enum query and rewrites the Request-URI with the result of the query. This the Infrastructure-ENUM version of enum_query(). The only difference to enum_query() is in the calculation of the FQDN where NAPTR records are looked for.

**Parameters:**

- `service` *(string, optional)* — service string to be used in the service field
- `suffix` *(string, optional)* — suffix to be appended to the domain name, i_enum_suffix if missing

**Related:**

- `enum_query`

### `is_from_user_enum([suffix], [service])`

Checks if the user part of from URI is found in an enum lookup. Returns 1 if yes and -1 if not.

**Parameters:**

- `service` *(string, optional)* — service string to be used in the service field
- `suffix` *(string, optional)* — suffix to be appended to the domain name, domain_suffix if missing

**Return codes:**

- `1` — if yes
- `-1` — if not

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.11. is_from_user_enum usage.

```opensips
...
if (is_from_user_enum()) {
	....
};
...
```

### `isn_query([suffix], [service])`

The function performs a ISN query and rewrites the Request-URI with the result of the query. See Overview for more information.

**Parameters:**

- `service` *(string, optional)* — service string to be used in the service field
- `suffix` *(string, optional)* — suffix to be appended to the domain name, isn_suffix if missing

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.10. isn_query usage.

```opensips
...
# search for "e2u+sip" in freenum.org 
isn_query("freenum.org.");
...
# search for "e2u+sip" in default tree (configured as parameter)
isn_query();
...
# search for "e2u+voice:sip" in freenum.org
isn_query("freenum.org.", "voice");
...
```

## Configuration Examples

### Setting domain_suffix module parameter

Setting domain_suffix module parameter

```opensips
modparam("enum", "domain_suffix", "e1234.arpa.")
```
### Setting tel_uri_params module parameter

Setting tel_uri_params module parameter

```opensips
modparam("enum", "tel_uri_params", ";npdi")
```
### Setting i_enum_suffix module parameter

Setting i_enum_suffix module parameter

```opensips
modparam("enum", "i_enum_suffix", "e1234.arpa.")
```
### Setting isn_suffix module parameter

Setting isn_suffix module parameter

```opensips
modparam("enum", "isn_suffix", "freenum.org.")
```
### Setting branchlabel module parameter

Setting branchlabel module parameter

```opensips
modparam("enum", "branchlabel", "i")
```
### Zone file example

Zone file example

```opensips
i.1.e164.arpa.                     IN TXT   "4"
9.9.9.8.7.6.5.i.4.3.2.1.e164.arpa. IN NAPTR "NAPTR content for  +1 234 5678 999"
```
### Zone file example

Zone file example

```opensips
i.1.e164.arpa.     TYPE65300  \# 14 (
                              04    ; position
                              01 69 ; separator
                              04 65 31 36 34 04 61 72 70 61 00 ; e164.arpa
;                               )
9.9.9.8.7.6.5.i.4.3.2.1.e164.arpa. IN NAPTR "NAPTR content for  +1 234 5678 999"
```
### Setting the bl_algorithm module parameter

Setting the bl_algorithm module parameter

```opensips
modparam("enum", "bl_algorithm", "txt")
```
### `enum_query` usage

`enum_query` usage

```opensips
...
# search for "e2u+sip" in freenum.org 
enum_query("freenum.org.", , $avp(number));
...
# search for "e2u+sip" in default tree (configured as parameter)
enum_query();
...
# search for "e2u+voice:sip" in e164.arpa
enum_query("e164.arpa.", "voice");
...
# search for service type "sip" or "voice:sip" or "video:sip"
# note the '+' sign in front of the second parameter
enum_query("e164.arpa.", "+sip+voice:sip+video:sip", $avp(number));
...
# querying for service sip and voice:sip
enum_query("e164.arpa.");
enum_query("e164.arpa.", "voice");
# or use instead
enum_query("e164.arpa.", "+sip+voice:sip");
...
```
### `isn_query` usage

`isn_query` usage

```opensips
...
# search for "e2u+sip" in freenum.org 
isn_query("freenum.org.");
...
# search for "e2u+sip" in default tree (configured as parameter)
isn_query();
...
# search for "e2u+voice:sip" in freenum.org
isn_query("freenum.org.", "voice");
...
```
### `is_from_user_enum` usage

`is_from_user_enum` usage

```opensips
...
if (is_from_user_enum()) {
	....
};
...
```
