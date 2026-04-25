# perl Module

---

**List of Tables**

5.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6105888)

5.2. [Most recently active contributors(1) to this module](#idp6225024)

**List of Examples**

1.1. [Set `filename` parameter](#idp5528432)

1.2. [Set `modpath` parameter](#idp5533280)

1.3. [`perl_exec_simple()` usage](#idp5541552)

1.4. [`perl_exec()` usage](#idp5548768)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The time needed when writing a new OpenSIPS module unfortunately is quite high, while the options provided by the configuration file are limited to the features implemented in the modules.

With this Perl module, you can easily implement your own OpenSIPS extensions in Perl. This allows for simple access to the full world of CPAN modules. SIP URI rewriting could be implemented based on regular expressions; accessing arbitrary data backends, e.g. LDAP or Berkeley DB files, is now extremely simple.

## 1.2.�Installing the module

This Perl module is loaded in opensips.cfg (just like all the other modules) with loadmodule("/path/to/perl.so");.

For the Perl module to compile, you need a reasonably recent version of perl (tested with 5.8.8) linked dynamically. It is strongly advised to use a threaded version. The default binary packages from your favorite Linux distribution should work fine.

Cross compilation is supported by the Makefile. You need to set the environment variables PERLLDOPTS, PERLCCOPTS and TYPEMAP to values similar to the output of

PERLLDOPTS: perl -MExtUtils::Embed -e ldopts
PERLCCOPTS: perl -MExtUtils::Embed -e ccopts
TYPEMAP:    echo "\`perl -MConfig -e 'print $Config{installprivlib}'\`/ExtUtils/typemap"

The exact position of your (precompiled!) perl libraries depends on the setup of your environment.

## 1.3.�Using the module

The Perl module has two interfaces: The perl side, and the OpenSIPS side. Once a Perl function is defined and loaded via the module parameters (see below), it may be called in OpenSIPS's configuration at an arbitary point. E.g., you could write a function "ldap\_alias" in Perl, and then execute

...
if (perl\_exec("ldap\_alias")) {
	...
}	
...

just as you would have done with the current alias\_db module.

The functions you can use are listed in the [exported\_functions](#exported_functions "1.6.�Exported Functions") section below.

On the Perl side, there are a number of functions that let you read and modify the current SIP message, such as the RURI or the message flags. An introduction to the Perl interface and the full reference documentation can be found below.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   The "sl" module is needed for sending replies uppon fatal errors. All other modules can be accessed from the Perl module, though.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _Perl 5.8.x or later_
    

Additionally, a number of perl modules should be installed. The OpenSIPS::LDAPUtils package relies on Net::LDAP to be installed. One of the sample scripts needs IPC::Shareable

This module has been developed and tested with Perl 5.8.8, but should work with any 5.8.x release. Compilation is possible with 5.6.x, but its behavior is unsupported. Earlier versions do not work.

On current Debian systems, at least the following packages should be installed:

*   perl
    
*   perl-base
    
*   perl-modules
    
*   libperl5.8
    
*   libperl-dev
    
*   libnet-ldap-perl
    
*   libipc-shareable-perl
    

It was reported that other Debian-style distributions (such as Ubuntu) need the same packages.

On SuSE systems, at least the following packages should be installed:

*   perl
    
*   perl-ldap
    
*   IPC::Shareable perl module from CPAN
    

Although SuSE delivers a lot of perl modules, others may have to be fetched from CPAN. Consider using the program “cpan2rpm” - which, in turn, is available on CPAN. It creates RPM files from CPAN.

## 1.5.�Exported Parameters

### 1.5.1.�`filename` (string)

This is the file name of your script. This may be set once only, but it may include an arbitary number of functions and “use” as many Perl module as necessary.

_May not be empty!_

**Example�1.1.�Set `filename` parameter**

...
modparam("perl", "filename", "/home/john/opensips/myperl.pl")
...

  

### 1.5.2.�`modpath` (string)

The path to the Perl modules included (OpenSIPS.pm et.al). It is not absolutely crucial to set this path, as you _may_ install the Modules in Perl's standard path, or update the “%INC” variable from within your script. Using this module parameter is the standard behavior, though.

**Example�1.2.�Set `modpath` parameter**

...
modparam("perl", "modpath", "/usr/local/lib/opensips/perl/")
...

  

## 1.6.�Exported Functions

### 1.6.1.� `perl_exec_simple(func, [param])`

Calls a perl function _without_ passing it the current SIP message. May be used for very simple simple requests that do not have to fiddle with the message themselves, but rather return information values about the environment.

The first parameter is the function to be called. An arbitrary string may optionally be passed as a parameter.

The function returns _1_ if the perl function was successfully called or _\-1_ if an internal error occured. Note that it does not propagate the return value of the perl function.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE and BRANCH\_ROUTE.

**Example�1.3.�`perl_exec_simple()` usage**

...
if ($rm=="INVITE") {
	perl\_exec\_simple("dosomething", "on invite messages");
};
...

  

### 1.6.2.� `perl_exec(func, [param])`

Calls a perl function _with_ passing it the current SIP message. The SIP message is reflected by a Perl module that gives you access to the information in the current SIP message (OpenSIPS::Message).

The first parameter is the function to be called. An arbitrary string may be passed as a parameter.

The function returns back to the OpenSIPS script the value returned by the perl function. Note that if this value is _0_ the script execution will be stoped, similarly to calling _exit_.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE and BRANCH\_ROUTE.

**Example�1.4.�`perl_exec()` usage**

...
if (perl\_exec("ldapalias")) {
	...
};
...

  

## Chapter�2.�OpenSIPS Perl API

## 2.1.�OpenSIPS

This module provides access to a limited number of OpenSIPS core functions. As the most interesting functions deal with SIP messages, they are located in the OpenSIPS::Message class below.

### 2.1.1.�log(level,message)

Logs the message with OpenSIPS's logging facility. The logging level is one of the following:

\* L\_ALERT
\* L\_CRIT
\* L\_ERR
\* L\_WARN
\* L\_NOTICE
\* L\_INFO
\* L\_DBG

Please note that this method is NOT automatically exported, as it collides with the perl function log (which calculates the logarithm). Either explicitly import the function (via `use OpenSIPS qw ( log );`), or call it with its full name:

OpenSIPS::log(L\_INFO, "foobar");

## 2.2.�OpenSIPS::Message

This package provides access functions for an OpenSIPS `sip_msg` structure and its sub-components. Through its means it is possible to fully configure alternative routing decisions.

### 2.2.1.�getType()

Returns one of the constants SIP\_REQUEST, SIP\_REPLY, SIP\_INVALID stating the type of the current message.

### 2.2.2.�getStatus()

Returns the status code of the current Reply message. This function is invalid in Request context!

### 2.2.3.�getReason()

Returns the reason of the current Reply message. This function is invalid in Request context!

### 2.2.4.�getVersion()

Returns the version string of the current SIP message.

### 2.2.5.�getRURI()

This function returns the recipient URI of the present SIP message:

`my $ruri = $m->getRURI();`

getRURI returns a string. See [“getParsedRURI()”](#ID-f20c57aaa92a757d7152aa0479ee1fc0 "2.2.22.�getParsedRURI()") below how to receive a parsed structure.

This function is valid in request messages only.

### 2.2.6.�getMethod()

Returns the current method, such as `INVITE`, `REGISTER`, `ACK` and so on.

`my $method = $m->getMethod();`

This function is valid in request messages only.

### 2.2.7.�getFullHeader()

Returns the full message header as present in the current message. You might use this header to further work with it with your favorite MIME package.

`my $hdr = $m->getFullHeader();`

### 2.2.8.�getBody()

Returns the message body.

### 2.2.9.�getMessage()

Returns the whole message including headers and body.

### 2.2.10.�getHeader(name)

Returns the body of the first message header with this name.

`print $m->getHeader("To");`

**`"John" <sip:john@doe.example>`**

### 2.2.11.�getHeaderNames()

Returns an array of all header names. Duplicates possible!

### 2.2.12.�moduleFunction(func,string1,string2)

Search for an arbitrary function in module exports and call it with the parameters self, string1, string2.

`string1` and/or `string2` may be omitted.

As this function provides access to the functions that are exported to the OpenSIPS configuration file, it is autoloaded for unknown functions. Instead of writing

$m->moduleFunction("sl\_send\_reply", "500", "Internal Error");
$m->moduleFunction("xlog", "L\_INFO", "foo");

you may as well write

$m->sl\_send\_reply("500", "Internal Error");
$m->xlog("L\_INFO", "foo");

WARNING

In OpenSIPS 1.2, only a limited subset of module functions is available. This restriction will be removed in a later version.

Here is a list of functions that are expected to be working (not claiming completeness):

\* alias\_db\_lookup
\* consume\_credentials
\* is\_rpid\_user\_e164
\* append\_rpid\_hf
\* bind\_auth
\* avp\_print
\* cpl\_process\_register
\* cpl\_process\_register\_norpl
\* load\_dlg
\* ds\_next\_dst
\* ds\_next\_domain
\* ds\_mark\_dst
\* ds\_mark\_dst
\* is\_from\_local
\* is\_uri\_host\_local
\* dp\_can\_connect
\* dp\_apply\_policy
\* enum\_query (without parameters)
\* enum\_fquery (without parameters)
\* is\_from\_user\_enum (without parameters)
\* i\_enum\_query (without parameters)
\* imc\_manager
\* jab\_\* (all functions from the jabber module)
\* sdp\_mangle\_ip
\* sdp\_mangle\_port
\* encode\_contact
\* decode\_contact
\* decode\_contact\_header
\* fix\_contact
\* use\_media\_proxy
\* end\_media\_session
\* m\_store
\* m\_dump
\* fix\_nated\_contact
\* unforce\_rtp\_proxy
\* force\_rtp\_proxy
\* fix\_nated\_register
\* add\_rcv\_param
\* options\_reply
\* checkospheader
\* validateospheader
\* requestosprouting
\* checkosproute
\* prepareosproute
\* prepareallosproutes
\* checkcallingtranslation
\* reportospusage
\* mangle\_pidf
\* mangle\_message\_cpim
\* add\_path (without parameters)
\* add\_path\_received (without parameters)
\* prefix2domain
\* allow\_routing (without parameters)
\* allow\_trusted
\* pike\_check\_req
\* handle\_publish
\* handle\_subscribe
\* stored\_pres\_info
\* bind\_pua
\* send\_publish
\* send\_subscribe
\* pua\_set\_publish
\* loose\_route
\* record\_route
\* load\_rr
\* sip\_trace
\* sl\_reply\_error
\* sd\_lookup
\* sstCheckMin
\* append\_time
\* has\_body (without parameters)
\* is\_peer\_verified
\* t\_newtran
\* t\_release
\* t\_relay (without parameters)
\* t\_flush\_flags
\* t\_check\_trans
\* t\_was\_cancelled
\* uac\_restore\_from
\* uac\_auth
\* has\_totag
\* tel2sip
\* check\_to
\* check\_from
\* radius\_does\_uri\_exist
\* ul\_\* (All functions exported by the usrloc module for user access)
\* xmpp\_send\_message

### 2.2.13.�log(level,message) (deprecated type)

Logs the message with OpenSIPS's logging facility. The logging level is one of the following:

\* L\_ALERT
\* L\_CRIT
\* L\_ERR
\* L\_WARN
\* L\_NOTICE
\* L\_INFO
\* L\_DBG

The logging function should be accessed via the OpenSIPS module variant. This one, located in OpenSIPS::Message, is deprecated.

### 2.2.14.�rewrite\_ruri(newruri)

Sets a new destination (recipient) URI. Useful for rerouting the current message/call.

if ($m->getRURI() =~ m/\\@somedomain.net/) {
  $m->rewrite\_ruri("sip:dispatcher\\@organization.net");
}

### 2.2.15.�setFlag(flag)

Sets a message flag. The constants as known from the C API may be used, when Constants.pm is included.

### 2.2.16.�resetFlag(flag)

Resets a message flag.

### 2.2.17.�isFlagSet(flag)

Returns whether a message flag is set or not.

### 2.2.18.�pseudoVar(string)

Returns a new string where all pseudo variables are substituted by their values. Can be used to receive the values of single variables, too.

**Please remember that you need to escape the '$' sign in perl strings!**

### 2.2.19.�append\_branch(branch,qval)

Append a branch to current message.

### 2.2.20.�serialize\_branches(clean\_before, keep\_order)

Serialize branches.

### 2.2.21.�next\_branches()

Next branches.

### 2.2.22.�getParsedRURI()

Returns the current destination URI as an OpenSIPS::URI object.

## 2.3.�OpenSIPS::URI

This package provides functions for access to sip\_uri structures.

### 2.3.1.�user()

Returns the user part of this URI.

### 2.3.2.�host()

Returns the host part of this URI.

### 2.3.3.�passwd()

Returns the passwd part of this URI.

### 2.3.4.�port()

Returns the port part of this URI.

### 2.3.5.�params()

Returns the params part of this URI.

### 2.3.6.�headers()

Returns the headers part of this URI.

### 2.3.7.�transport()

Returns the transport part of this URI.

### 2.3.8.�ttl()

Returns the ttl part of this URI.

### 2.3.9.�user\_param()

Returns the user\_param part of this URI.

### 2.3.10.�maddr()

Returns the maddr part of this URI.

### 2.3.11.�method()

Returns the method part of this URI.

### 2.3.12.�lr()

Returns the lr part of this URI.

### 2.3.13.�r2()

Returns the r2 part of this URI.

### 2.3.14.�transport\_val()

Returns the transport\_val part of this URI.

### 2.3.15.�ttl\_val()

Returns the ttl\_val part of this URI.

### 2.3.16.�user\_param\_val()

Returns the user\_param\_val part of this URI.

### 2.3.17.�maddr\_val()

Returns the maddr\_val part of this URI.

### 2.3.18.�method\_val()

Returns the method\_val part of this URI.

### 2.3.19.�lr\_val()

Returns the lr\_val part of this URI.

### 2.3.20.�r2\_val()

Returns the r2\_val part of this URI.

## 2.4.�OpenSIPS::AVP

This package provides access functions for OpenSIPS's AVPs. These variables can be created, evaluated, modified and removed through this package.

Please note that these functions do NOT support the notation used in the configuration file, but directly work on strings or numbers. See documentation of add method below.

### 2.4.1.�add(name,val)

Add an AVP.

Add an OpenSIPS AVP to its environment. name and val may both be integers or strings; this function will try to guess what is correct. Please note that

OpenSIPS::AVP::add("10", "10")

is something different than

OpenSIPS::AVP::add(10, 10)

due to this evaluation: The first will create \_string\_ AVPs with the name 10, while the latter will create a numerical AVP.

You can modify/overwrite AVPs with this function.

### 2.4.2.�get(name)

get an OpenSIPS AVP:

my $numavp = OpenSIPS::AVP::get(5);
my $stravp = OpenSIPS::AVP::get("foo");

### 2.4.3.�destroy(name)

Destroy an AVP.

OpenSIPS::AVP::destroy(5);
OpenSIPS::AVP::destroy("foo");

## 2.5.�OpenSIPS::Utils::PhoneNumbers

OpenSIPS::Utils::PhoneNumbers - Functions for canonical forms of phone numbers.

use OpenSIPS::Utils::PhoneNumbers;

my $phonenumbers = new OpenSIPS::Utils::PhoneNumbers(
     publicAccessPrefix => "0",
     internationalPrefix => "+",
     longDistancePrefix => "0",
     areaCode => "761",
     pbxCode => "456842",
     countryCode => "49"
   );

$canonical = $phonenumbers->canonicalForm("07612034567");
$number    = $phonenumbers->dialNumber("+497612034567");

A telphone number starting with a plus sign and containing all dial prefixes is in canonical form. This is usally not the number to dial at any location, so the dialing number depends on the context of the user/system.

The idea to canonicalize numbers were taken from hylafax.

Example: +497614514829 is the canonical form of my phone number, 829 is the number to dial at Pyramid, 4514829 is the dialing number from Freiburg are and so on.

To canonicalize any number, we strip off any dial prefix we find and then add the prefixes for the location. So, when the user enters the number 04514829 in context pyramid, we remove the publicAccessPrefix (at Pyramid this is 0) and the pbxPrefix (4514 here). The result is 829. Then we add all the general dial prefixes - 49 (country) 761 (area) 4514 (pbx) and 829, the number itself => +497614514829

To get the dialing number from a canonical phone number, we substract all general prefixes until we have something

As said before, the interpretation of a phone number depends on the context of the location. For the functions in this package, the context is created through the `new` operator.

The following fields should be set:

'longDistancePrefix' 
'areaCode'
'pbxCode' 
'internationalPrefix'
'publicAccessPrefix'
'countryCode'

This module exports the following functions when `use`ed:

### 2.5.1.�new(publicAccessPrefix,internationalPrefix,longDistancePrefix,countryCode,areaCode,pbxCode)

The new operator returns an object of this type and sets its locational context according to the passed parameters. See OpenSIPS::Utils::PhoneNumbers above.

### 2.5.2.�canonicalForm( number \[, context\] )

Convert a phone number (given as first argument) into its canonical form. When no context is passed in as the second argument, the default context from the systems configuration file is used.

### 2.5.3.�dialNumber( number \[, context\] )

Convert a canonical phone number (given in the first argument) into a number to to dial. WHen no context is given in the second argument, a default context from the systems configuration is used.

## 2.6.�OpenSIPS::LDAPUtils::LDAPConf

OpenSIPS::LDAPUtils::LDAPConf - Read openldap config from standard config files.

use OpenSIPS::LDAPUtils::LDAPConf;
my $conf = new OpenSIPS::LDAPUtils::LDAPConf();

This module may be used to retrieve the global LDAP configuration as used by other LDAP software, such as `nsswitch.ldap` and `pam-ldap`. The configuration is usualy stored in `/etc/openldap/ldap.conf`

When used from an account with sufficient privilegs (e.g. root), the ldap manager passwort is also retrieved.

### 2.6.1.�Constructor new()

Returns a new, initialized `OpenSIPS::LDAPUtils::LDAPConf` object.

### 2.6.2.�Method base()

Returns the servers base-dn to use when doing queries.

### 2.6.3.�Method host()

Returns the ldap host to contact.

### 2.6.4.�Method port()

Returns the ldap servers port.

### 2.6.5.�Method uri()

Returns an uri to contact the ldap server. When there is no ldap\_uri in the configuration file, an `ldap:` uri is constucted from host and port.

### 2.6.6.�Method rootbindpw()

Returns the ldap "root" password.

Note that the `rootbindpw` is only available when the current account has sufficient privilegs to access `/etc/openldap/ldap.secret`.

### 2.6.7.�Method rootbinddn()

Returns the DN to use for "root"-access to the ldap server.

### 2.6.8.�Method binddn()

Returns the DN to use for authentication to the ldap server. When no bind dn has been specified in the configuration file, returns the `rootbinddn`.

### 2.6.9.�Method bindpw()

Returns the password to use for authentication to the ldap server. When no bind password has been specified, returns the `rootbindpw` if any.

## 2.7.�OpenSIPS::LDAPUtils::LDAPConnection

OpenSIPS::LDAPUtils::LDAPConnection - Perl module to perform simple LDAP queries.

OO-Style interface:

use OpenSIPS::LDAPUtils::LDAPConnection;
my $ldap = new OpenSIPS::LDAPUtils::LDAPConnection;
my @rows = $ldap-search("uid=andi","ou=people,ou=coreworks,ou=de");

Procedural interface:

use OpenSIPS::LDAPUtils::LDAPConnection;
my @rows = $ldap->search(
      new OpenSIPS::LDAPUtils::LDAPConfig(), "uid=andi","ou=people,ou=coreworks,ou=de");

This perl module offers a somewhat simplified interface to the `Net::LDAP` functionality. It is intended for cases where just a few attributes should be retrieved without the overhead of the full featured `Net::LDAP`.

### 2.7.1.�Constructor new( \[config, \[authenticated\]\] )

Set up a new LDAP connection.

The first argument, when given, should be a hash reference pointing to to the connection parameters, possibly an `OpenSIPS::LDAPUtils::LDAPConfig` object. This argument may be `undef` in which case a new (default) `OpenSIPS::LDAPUtils::LDAPConfig` object is used.

When the optional second argument is a true value, the connection will be authenticated. Otherwise an anonymous bind is done.

On success, a new `LDAPConnection` object is returned, otherwise the result is `undef`.

### 2.7.2.�Function/Method search( conf, filter, base, \[requested\_attributes ...\])

perform an ldap search, return the dn of the first matching directory entry, unless a specific attribute has been requested, in wich case the values(s) fot this attribute are returned.

When the first argument (conf) is a `OpenSIPS::LDAPUtils::LDAPConnection`, it will be used to perform the queries. You can pass the first argument implicitly by using the "method" syntax.

Otherwise the `conf` argument should be a reference to a hash containing the connection setup parameters as contained in a `OpenSIPS::LDAPUtils::LDAPConf` object. In this mode, the `OpenSIPS::LDAPUtils::LDAPConnection` from previous queries will be reused.

#### 2.7.2.1.�Arguments:

conf

configuration object, used to find host,port,suffix and use\_ldap\_checks

filter

ldap search filter, eg '(mail=some@domain)'

base

search base for this query. If undef use default suffix, concat base with default suffix if the last char is a ','

requested\_attributes

retrieve the given attributes instead of the dn from the ldap directory.

#### 2.7.2.2.�Result:

Without any specific `requested_attributes`, return the dn of all matching entries in the LDAP directory.

When some `requested_attributes` are given, return an array with those attibutes. When multiple entries match the query, the attribute lists are concatenated.

## 2.8.�OpenSIPS::VDB

This package is an (abstract) base class for all virtual databases. Derived packages can be configured to be used by OpenSIPS as a database.

The base class itself should NOT be used in this context, as it does not provide any functionality.

## 2.9.�OpenSIPS::Constants

This package provides a number of constants taken from enums and defines of OpenSIPS header files. Unfortunately, there is no mechanism for updating the constants automatically, so check the values if you are in doubt.

## 2.10.�OpenSIPS::VDB::Adapter::Speeddial

This adapter can be used with the speeddial module.

## 2.11.�OpenSIPS::VDB::Adapter::Alias

This package is intended for usage with the alias\_db module. The query VTab has to take two arguments and return an array of two arguments (user name/domain).

### 2.11.1.�query(conds,retkeys,order)

Queries the vtab with the given arguments for request conditions, keys to return and sort order column name.

## 2.12.�OpenSIPS::VDB::Adapter::AccountingSIPtrace

This package is an Adapter for the acc and tracer modules, featuring only an insert operation.

## 2.13.�OpenSIPS::VDB::Adapter::Describe

This package is intended for debug usage. It will print information about requested functions and operations of a client module.

Use this module to request schema information when creating new adapters.

## 2.14.�OpenSIPS::VDB::Adapter::Auth

This adapter is intended for usage with the auth\_db module. The VTab should take a username as an argument and return a (plain text!) password.

## 2.15.�OpenSIPS::VDB::ReqCond

This package represents a request condition for database access, consisting of a column name, an operator (=, <, >, ...), a data type and a value.

This package inherits from OpenSIPS::VDB::Pair and thus includes its methods.

### 2.15.1.�new(key,op,type,name)

Constructs a new Column object.

### 2.15.2.�op()

Returns or sets the current operator.

## 2.16.�OpenSIPS::VDB::Pair

This package represents database key/value pairs, consisting of a key, a value type, and the value.

This package inherits from OpenSIPS::VDB::Value and thus has the same methods.

### 2.16.1.�new(key,type,name)

Constructs a new Column object.

### 2.16.2.�key()

Returns or sets the current key.

## 2.17.�OpenSIPS::VDB::VTab

This package handles virtual tables and is used by the OpenSIPS::VDB class to store information about valid tables. The package is not inteded for end user access.

### 2.17.1.�new()

Constructs a new VTab object

### 2.17.2.�call(op,\[args\])

Invokes an operation on the table (insert, update, ...) with the given arguments.

## 2.18.�OpenSIPS::VDB::Value

This package represents a database value. Additional to the data itself, information about its type is stored.

### 2.18.1.�stringification

When accessing a OpenSIPS::VDB::Value object as a string, it simply returns its data regardless of its type. =cut

use strict;

package OpenSIPS::VDB::Value;

use overload '""' => \\&stringify;

sub stringify { shift->{data} }

use OpenSIPS; use OpenSIPS::Constants;

our @ISA = qw ( OpenSIPS::Utils::Debug );

### 2.18.2.�new(type,data)

Constructs a new Value object. Its data type and the data are passed as parameters.

### 2.18.3.�type()

Returns or sets the current data type. Please consider using the constants from OpenSIPS::Constants

### 2.18.4.�data()

Returns or sets the current data.

## 2.19.�OpenSIPS::VDB::Column

This package represents database column definition, consisting of a column name and its data type.

### 2.19.1.�Stringification

When accessing a OpenSIPS::VDB::Column object as a string, it simply returns its column name regardless of its type. =cut

package OpenSIPS::VDB::Column;

use overload '""' => \\&stringify;

sub stringify { shift->{name} }

use OpenSIPS; use OpenSIPS::Constants;

our @ISA = qw ( OpenSIPS::Utils::Debug );

### 2.19.2.�new(type,name)

Constructs a new Column object. Its type and the name are passed as parameters.

### 2.19.3.�type( )

Returns or sets the current type. Please consider using the constants from OpenSIPS::Constants

### 2.19.4.�name()

Returns or sets the current column name.

### 2.19.5.�OpenSIPS::VDB::Result

This class represents a VDB result set. It contains a column definition, plus an array of rows. Rows themselves are simply references to arrays of scalars.

### 2.19.6.�new(coldefs,\[row, row, ...\])

The constructor creates a new Result object. Its first parameter is a reference to an array of OpenSIPS::VDB::Column objects. Additional parameters may be passed to provide initial rows, which are references to arrays of scalars.

### 2.19.7.�coldefs()

Returns or sets the column definition of the object.

### 2.19.8.�rows()

Returns or sets the rows of the object.

## Chapter�3.�Perl samples

**Revision History**

Revision $Revision: 5901 $

$Date$

## 3.1.�sample directory

There are a number of example scripts in the “samples/”. They are documented well. Read them, it will explain a lot to you :)

If you want to use any of these scripts directly in your implementation, you can use Perl's “require” mechanism to import them (just remember that you need to use quotes when require'ing .pl files).

### 3.1.1.�Script descriptions

The included sample scripts are described below:

#### 3.1.1.1.�branches.pl

The minimal function in branches.pl demonstrates that you can access the "append\_branch" function from within perl, just as you would have done from your normal configuration file. You'll find documentation on the concepts of branching in the OpenSIPS documentation.

#### 3.1.1.2.�firstline.pl

Message's first\_line structure may be evaluated. Message can be either of SIP\_REQUEST or SIP\_REPLY. Depending on that, different information can be received. This script demonstrates these functions.

#### 3.1.1.3.�flags.pl

The perl module provides access to OpenSIPS's flagging mechanism. The flag names available for OpenSIPS modules are made available through the OpenSIPS::Constants package, so you can flag messages as "green", "magenta" etc.

The first function, setflag, demonstrates how the "green" flag is set. In the second function, readflag, the "green" and "magenta" flags are evaluated.

#### 3.1.1.4.�functions.pl

This sample script demonstrates different things related to calling functions from within perl, and the different types of functions you can offer for OpenSIPS access.

“exportedfuncs” simply demonstrates that you can use the moduleFunction method to call functions offered by other modules. The results are equivalent to calling these functions from your config file. In the demonstrated case, telephone calls with a destination number beginning with 555... are rejected with an internal server error. Other destination addresses are passed to the alias\_db module.

Please note that the moduleFunction method is not fully available in OpenSIPS 1.2. See the method's documentation for details.

“paramfunc” shows that you can pass arbitrary strings to perl functions. Do with them whatever you want :)

“autotest” demonstrates that unknown functions in OpenSIPS::Message objects are automatically transformed into calls to module functions.

The “diefunc”s show that dying perl scripts - by "manual" dying, or because of script errors - are handled by the OpenSIPS package. The error message is logged through OpenSIPS's logging mechanism. Please note that this only works correctly if you do NOT overwrite the default die handler. Oh, yes, that works for warnings, too.

#### 3.1.1.5.�headers.pl

Header extraction is among the most crucial functionalities while processing SIP messages. This sample script demonstrates access to header names and values within two sample functions.

“headernames” extracts all header names and logs their names.

“someheaders” logs the contents of the two headers, “To” and “WWW-Contact”. As you can see, headers that occur more than once are retrieved as an array, which may be accessed by Perl's array accessing methods.

#### 3.1.1.6.�logging.pl

For debugging purposes, you probably want to write messages to the syslog. The “logdemo” shows three ways to access the OpenSIPS log function: it is available through the OpenSIPS class as well as through the OpenSIPS::Message class.

Remember that you can use exported functions from other modules. You may thus as well use the “xlog” module and it's xlog function.

The L\_INFO, L\_DBG, L\_ERR, L\_CRIT... constants are available through the OpenSIPS::Constants package.

#### 3.1.1.7.�messagedump.pl

This script demonstrates how to access the whole message header of the current message. Please note that modifications on the message made by earlier function calls in your configuration script may NOT be reflected in this dump.

#### 3.1.1.8.�persistence.pl

When processing SIP messages, you may want to use persistent data across multiple calls to your Perl functions. Your first option is to use global variables in your script. Unfortunately, these globals are not visible from the mulitple instances of OpenSIPS. You may want to use a mechanism such as the IPC::Shareable shared memory access package to correct this.

#### 3.1.1.9.�phonenumbers.pl

The OpenSIPS::Utils::PhoneNumbers package provides two methods for the transformation of local to canonical telephone numbers, and vice versa. This script demonstrates it's use.

#### 3.1.1.10.�pseudovars.pl

This script demonstrates the Perl module's “pseudoVar” method. It may be used to retrieve the values of current pseudo variables.

You might notice that there is no particular function for setting pseudo variables; you may use the exported functions from the sqlops module, though.

## Chapter�4.�Frequently Asked Questions

**4.1.**

Are there known bugs in the Perl module?

The Perl module does have a few shortcomings that may be regarded as bugs.

*   Missing module functions. Not all functions of other modules are available for Perl access. The reason for this is a design property of OpenSIPS. Making available more functions is work in progress.
    
*   Perl and threads. Perl itself is, when compiled with the correct parameters, thread safe; unfortunately, not all Perl modules are. The DBI modules, especially (but not restricted to) DBI::ODBC are known NOT to be thread safe.
    
    Using DBI::ODBC -- and possibly other non-thread-safe Perl extensions -- may result in erroneous behavior of OpenSIPS, including (but not restricted to) server crashes and wrong routing.
    

**4.2.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**4.3.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**4.4.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

## Chapter�5.�Contributors

## 5.1.�By Commit Statistics

**Table�5.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bastian Friedrich

116

38

8597

284

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

51

32

715

688

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

23

21

99

60

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

22

18

62

133

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

20

10

264

408

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

19

14

164

125

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

10

42

8.

Julien Blache

4

1

80

64

9.

Edson Gellert Schubert

4

1

0

141

10.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

3

1

100

7

  

**All remaining contributors**: Ancuta Onofrei, Konstantin Bokarius, Boris Ratner, Juli�n Moreno Pati�o, Klaus Darilion, Fabian Gast ([@fgast](https://github.com/fgast)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Aaron Meriwether, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Dan Pascu ([@danpascu](https://github.com/danpascu)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 5.2.�By Commit Activity

**Table�5.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2006 - May 2025

2.

Aaron Meriwether

May 2024 - May 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2022 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jan 2020

6.

Fabian Gast ([@fgast](https://github.com/fgast))

Jan 2020 - Jan 2020

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Sep 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Oct 2015 - Oct 2015

  

**All remaining contributors**: Boris Ratner, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Bastian Friedrich, Ancuta Onofrei, Julien Blache.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�6.�Documentation

## 6.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Bastian Friedrich.

_Documentation Copyrights:_

Copyright � 2007 Collax GmbH