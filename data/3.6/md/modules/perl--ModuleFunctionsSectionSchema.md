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