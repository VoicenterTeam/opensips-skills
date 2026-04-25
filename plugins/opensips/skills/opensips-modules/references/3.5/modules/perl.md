# perl Module Reference
<!-- generated-from: data/3.5/modules/perl.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 perl module. Read this file when configuring or debugging the perl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The time needed when writing a new OpenSIPS module unfortunately is quite high, while the options provided by the configuration file are limited to the features implemented in the modules.

With this Perl module, you can easily implement your own OpenSIPS extensions in Perl. This allows for simple access to the full world of CPAN modules. SIP URI rewriting could be implemented based on regular expressions; accessing arbitrary data backends, e.g. LDAP or Berkeley DB files, is now extremely simple.

## How It Works

The Perl module has two interfaces: The perl side, and the OpenSIPS side. Once a Perl function is defined and loaded via the module parameters (see below), it may be called in OpenSIPS's configuration at an arbitary point. E.g., you could write a function "ldap_alias" in Perl, and then execute

...
if (perl_exec("ldap_alias")) {
	...
}	
...

just as you would have done with the current alias_db module.

The functions you can use are listed in the [exported_functions](#exported_functions "1.6.Exported Functions") section below.

On the Perl side, there are a number of functions that let you read and modify the current SIP message, such as the RURI or the message flags. An introduction to the Perl interface and the full reference documentation can be found below.

## Dependencies

### OpenSIPs Modules

- `sl` — Needed for sending replies uppon fatal errors.

### External Libraries

- `IPC::Shareable` — One of the sample scripts needs IPC::Shareable.
- `Net::LDAP` — The OpenSIPS::LDAPUtils package relies on Net::LDAP to be installed.
- `Perl 5.8.x or later` — Required for the module to compile and run.

## Exported Parameters

### `filename` (string)

This is the file name of your script. This may be set once only, but it may include an arbitary number of functions and “use” as many Perl module as necessary.

**Notes:** May not be empty!

**Example.** /home/john/opensips/myperl.pl.

```opensips
modparam("perl", "filename", "/home/john/opensips/myperl.pl")
```
### `modpath` (string)

The path to the Perl modules included (OpenSIPS.pm et.al). It is not absolutely crucial to set this path, as you _may_ install the Modules in Perl's standard path, or update the “%INC” variable from within your script. Using this module parameter is the standard behavior, though.

**Example.** /usr/local/lib/opensips/perl/.

```opensips
modparam("perl", "modpath", "/usr/local/lib/opensips/perl/")
```

## Exported Functions

### `perl_exec(func, [param])`

Calls a perl function _with_ passing it the current SIP message. The SIP message is reflected by a Perl module that gives you access to the information in the current SIP message (OpenSIPS::Message).

**Parameters:**

- `func` *(string, required)* — The function to be called.
- `param` *(string, optional)* — An arbitrary string passed as a parameter.

**Return codes:**

- `value returned by the perl function` — general execution
- `0` — script execution will be stoped, similarly to calling _exit_

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Example.** `perl_exec()` usage.

```opensips
...
if (perl_exec("ldapalias")) {
	...
};
...
```

### `perl_exec_simple(func, [param])`

Calls a perl function _without_ passing it the current SIP message. May be used for very simple simple requests that do not have to fiddle with the message themselves, but rather return information values about the environment.

**Parameters:**

- `func` *(string, required)* — The function to be called.
- `param` *(string, optional)* — An arbitrary string passed as a parameter.

**Return codes:**

- `1` — the perl function was successfully called
- `-1` — an internal error occured

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Example.** `perl_exec_simple()` usage.

```opensips
...
if ($rm=="INVITE") {
	perl_exec_simple("dosomething", "on invite messages");
};
...
```

## Configuration Examples

### Set filename parameter

This is the file name of your script. This may be set once only, but it may include an arbitary number of functions and “use” as many Perl module as necessary.

May not be empty!

```opensips
...
modparam("perl", "filename", "/home/john/opensips/myperl.pl")
...
```

null
### Set modpath parameter

The path to the Perl modules included (OpenSIPS.pm et.al). It is not absolutely crucial to set this path, as you may install the Modules in Perl's standard path, or update the “%INC” variable from within your script. Using this module parameter is the standard behavior, though.

```opensips
...
modparam("perl", "modpath", "/usr/local/lib/opensips/perl/")
...
```

null
### perl_exec_simple() usage

Calls a perl function without passing it the current SIP message. May be used for very simple simple requests that do not have to fiddle with the message themselves, but rather return information values about the environment.

The first parameter is the function to be called. An arbitrary string may optionally be passed as a parameter.

The function returns 1 if the perl function was successfully called or -1 if an internal error occured. Note that it does not propagate the return value of the perl function.

This function can be used from REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE and BRANCH_ROUTE.

```opensips
...
if ($rm=="INVITE") {
	perl_exec_simple("dosomething", "on invite messages");
};
...
```

null
### perl_exec() usage

Calls a perl function with passing it the current SIP message. The SIP message is reflected by a Perl module that gives you access to the information in the current SIP message (OpenSIPS::Message).

The first parameter is the function to be called. An arbitrary string may be passed as a parameter.

The function returns back to the OpenSIPS script the value returned by the perl function. Note that if this value is 0 the script execution will be stoped, similarly to calling exit.

This function can be used from REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE and BRANCH_ROUTE.

```opensips
...
if (perl_exec("ldapalias")) {
	...
};
...
```

null
