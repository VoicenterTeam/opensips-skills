# Core Pseudo-Variables Reference
<!-- generated-from: data/3.5/core/variables.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: core_variable -->

Reference for OpenSIPs 3.5 core pseudo-variables. Read this file when constructing route scripts that need to inspect or manipulate SIP message fields, transaction state, or runtime context.

## Contents

- [`$Au`](#au)
- [`$TS`](#ts)
- [`$T_branch_idx`](#t_branch_idx)
- [`$Tf`](#tf)
- [`$Ts`](#ts)
- [`$Tsm`](#tsm)
- [`$aU`](#au)
- [`$ad`](#ad)
- [`$adu`](#adu)
- [`$ai`](#ai)
- [`$an`](#an)
- [`$ar`](#ar)
- [`$argv`](#argv)
- [`$au`](#au)
- [`$auth.alg`](#authalg)
- [`$auth.nc`](#authnc)
- [`$auth.nonce`](#authnonce)
- [`$auth.opaque`](#authopaque)
- [`$auth.qop`](#authqop)
- [`$auth.resp`](#authresp)
- [`$avp(name)`](#avpname)
- [`$bf`](#bf)
- [`$branch`](#branch)
- [`$branch()`](#branch)
- [`$branch.flag()`](#branchflag)
- [`$cT`](#ct)
- [`$cfg_file`](#cfg_file)
- [`$cfg_line`](#cfg_line)
- [`$ci`](#ci)
- [`$cl`](#cl)
- [`$cs`](#cs)
- [`$ct`](#ct)
- [`$ct.fields()`](#ctfields)
- [`$dP`](#dp)
- [`$dd`](#dd)
- [`$di`](#di)
- [`$dip`](#dip)
- [`$dir`](#dir)
- [`$dp`](#dp)
- [`$ds`](#ds)
- [`$du`](#du)
- [`$err.class`](#errclass)
- [`$err.info`](#errinfo)
- [`$err.level`](#errlevel)
- [`$err.rcode`](#errrcode)
- [`$err.rreason`](#errrreason)
- [`$fU`](#fu)
- [`$fd`](#fd)
- [`$fn`](#fn)
- [`$ft`](#ft)
- [`$fu`](#fu)
- [`$hdr()`](#hdr)
- [`$log_level`](#log_level)
- [`$mb`](#mb)
- [`$mf`](#mf)
- [`$mi`](#mi)
- [`$ml`](#ml)
- [`$msg.flag()`](#msgflag)
- [`$msg.is_request`](#msgis_request)
- [`$msg.type`](#msgtype)
- [`$oP`](#op)
- [`$oU`](#ou)
- [`$od`](#od)
- [`$op`](#op)
- [`$ou`](#ou)
- [`$pU`](#pu)
- [`$param()`](#param)
- [`$pd`](#pd)
- [`$pn`](#pn)
- [`$pp`](#pp)
- [`$pu`](#pu)
- [`$rP`](#rp)
- [`$rU`](#ru)
- [`$rb`](#rb)
- [`$rc`](#rc)
- [`$rd`](#rd)
- [`$re`](#re)
- [`$rm`](#rm)
- [`$route`](#route)
- [`$route.name`](#routename)
- [`$route.type`](#routetype)
- [`$rp`](#rp)
- [`$rr`](#rr)
- [`$rs`](#rs)
- [`$rt`](#rt)
- [`$ru`](#ru)
- [`$ru_q`](#ru_q)
- [`$si`](#si)
- [`$socket_in`](#socket_in)
- [`$socket_out`](#socket_out)
- [`$sp`](#sp)
- [`$tU`](#tu)
- [`$td`](#td)
- [`$time()`](#time)
- [`$tn`](#tn)
- [`$tt`](#tt)
- [`$tu`](#tu)
- [`$ua`](#ua)
- [`$var(name)`](#varname)
- [`$xlog_level`](#xlog_level)

## `$Au`

username for accounting purposes. It's a selective pseudo variable (inherited from acc module). It returns $au if exits or From username otherwise.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$TS`

reference to startup unix time stamp

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$T_branch_idx`

the index (starting with 1 for the first branch) of the branch for which is executed the branch_route[].

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$Tf`

reference string formatted time

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$Ts`

reference to current unix time stamp in seconds

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$Tsm`

reference to current microseconds of the current second

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$aU`

whole username from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ad`

domain part of username from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$adu`

URI from Authorization or Proxy-Authorization header. This URI is used when calculating the HTTP Digest Response.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ai`

reference to URI in request's P-Asserted-Identity header (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$an`

the nonce from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ar`

realm from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$argv`

provides access to command line arguments specified with '-o' option.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$au`

user part of username from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$auth.alg`

the algorithm string from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$auth.nc`

the value of nonce count parameter from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$auth.nonce`

the nonce string from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$auth.opaque`

the opaque string from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$auth.qop`

the value of qop parameter from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$auth.resp`

the authentication response from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$avp(name)`

Attribute Value Pair - dynamic variables linked to a singular message or transaction.

- **Type:** string/integer
- **Read/write:** read-write
- **Scope:** core
## `$bf`

displays a list with the branch flags set for the current SIP request

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$branch`

this variable is used for creating new branches by writing into it the value of a SIP URI.

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$branch()`

this variable provides read/write access to all fields/attributes of an already existing branch (prior created with append_branch() ).

- **Type:** string/integer
- **Read/write:** read-write
- **Scope:** core
## `$branch.flag()`

this variable provides read/write access to the value of a single certain branch flag (identified by name).

- **Type:** integer/string
- **Read/write:** read-write
- **Scope:** core
## `$cT`

reference to body of Content-Type header and also the content-type headers inside a multi-part body

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$cfg_file`

Holds the current name of the cfg file being executed, useful when using multiple scripts via the include statement

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$cfg_line`

Holds the current line from the script of the action being executed, useful for logging purposes

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$ci`

reference to body of call-id header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$cl`

reference to body of content-length header

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$cs`

reference to cseq number from cseq header

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$ct`

reference to contact instance/body from the contact header. A contact instance is display_name + URI + contact_params.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ct.fields()`

reference to the fields of a contact instance/body

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$dP`

reference to transport protocol of destination uri

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$dd`

reference to domain of destination uri

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$di`

reference to Diversion header URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$dip`

reference to Diversion header "privacy" parameter value

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$dir`

reference to Diversion header "reason" parameter value

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$dp`

reference to port of destination uri

- **Type:** integer
- **Read/write:** read-write
- **Scope:** core
## `$ds`

reference to destination set

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$du`

reference to destination uri (outbound proxy to be used for sending the request)

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$err.class`

the class of error (now is '1' for parsing errors)

- **Type:** string/integer
- **Read/write:** read-only
- **Scope:** core
## `$err.info`

text describing the error

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$err.level`

severity level for the error

- **Type:** string/integer
- **Read/write:** read-only
- **Scope:** core
## `$err.rcode`

recommended reply code

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$err.rreason`

recommended reply reason phrase

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$fU`

reference to username in URI of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$fd`

reference to domain in URI of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$fn`

reference to display name of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ft`

reference to tag parameter of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$fu`

reference to URI of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$hdr()`

represents the body of the N-th header identified by 'name'.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$log_level`

changes the log level for the current process

- **Type:** integer
- **Read/write:** read-write
- **Scope:** core
## `$mb`

reference to SIP message buffer

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$mf`

displays a list with the message/transaction flags set for the current SIP request

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$mi`

reference to SIP message id

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ml`

reference to SIP message length

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$msg.flag()`

this variable provides read/write access to the value of a single certain message flag (identified by name).

- **Type:** integer/string
- **Read/write:** read-write
- **Scope:** core
## `$msg.is_request`

this variable tells if the current SIP message is a request or not.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$msg.type`

this variable returns the type of the current message. The returned values are "request" (request) or "reply" (reply).

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$oP`

reference to transport protocol of original R-URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$oU`

reference to username in request's original URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$od`

reference to domain in request's original R-URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$op`

reference to port of original R-URI

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$ou`

reference to request's original URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$pU`

reference to user in request's P-Preferred-Identity header URI (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$param()`

retrieves the parameters of the route. The index can be an integer, or a pseudo-variable (index starts at 1).

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$pd`

reference to domain in request's P-Preferred-Identity header URI (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$pn`

reference to Display Name in request's P-Preferred-Identity header (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$pp`

reference to process id (pid)

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$pu`

reference to URI in request's P-Preferred-Identity header (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$rP`

reference to transport protocol of R-URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$rU`

reference to username in request's URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$rb`

reference to the body or a body part of the SIP message

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$rc`

reference to returned code by last invoked function

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$rd`

reference to domain in request's URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$re`

reference to Remote-Party-ID header URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$rm`

reference to request's method

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$route`

Access route names of the current route call stack.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$route.name`

Access the name of the current route. May be indexed, using positive or negative indexes.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$route.type`

Access the type of the current route. May be indexed, using positive or negative indexes.

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$rp`

reference to port of R-URI

- **Type:** integer
- **Read/write:** read-write
- **Scope:** core
## `$rr`

reference to reply's reason

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$rs`

reference to reply's status

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$rt`

reference to URI of refer-to header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ru`

reference to request's URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$ru_q`

reference to q value of the R-URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$si`

reference to IP source address of the message

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$socket_in`

read-only variable to get the description (proto:ip:port format) of the inbound socket (used for receiving the message).

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$socket_out`

read-write variable for reading or changing the outbound socket of the message.

- **Type:** string
- **Read/write:** read-write
- **Scope:** core
## `$sp`

reference to the source port of the message

- **Type:** integer
- **Read/write:** read-only
- **Scope:** core
## `$tU`

reference to username in URI of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$td`

reference to domain in URI of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$time()`

returns the string formatted time according to UNIX date

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$tn`

reference to display name of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$tt`

reference to tag parameter of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$tu`

reference to URI of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$ua`

reference to user agent header field

- **Type:** string
- **Read/write:** read-only
- **Scope:** core
## `$var(name)`

Script variables strictly bound to the script routes. Visible only in the routing blocks - they are not message or transaction related, but they are process related.

- **Type:** integer/string
- **Read/write:** read-write
- **Scope:** core
## `$xlog_level`

allows to set /reset the xlog() logging level on per-process bases.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** core
