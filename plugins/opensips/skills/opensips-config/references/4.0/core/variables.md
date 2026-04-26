# Core Pseudo-Variables Reference
<!-- generated-from: data/4.0/core/variables.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: core_variable -->

Reference for OpenSIPs 4.0 core pseudo-variables. Read this file when constructing route scripts that need to inspect or manipulate SIP message fields, transaction state, or runtime context.

## Contents

- [`$Au`](#au)
- [`$C()`](#c)
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
- [`$challenge.algorithm`](#challengealgorithm)
- [`$challenge.ck`](#challengeck)
- [`$challenge.ik`](#challengeik)
- [`$challenge.nonce`](#challengenonce)
- [`$challenge.opaque`](#challengeopaque)
- [`$challenge.qop`](#challengeqop)
- [`$challenge.realm`](#challengerealm)
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
- [`$msg.branch`](#msgbranch)
- [`$msg.branch.attr()`](#msgbranchattr)
- [`$msg.branch.duri`](#msgbranchduri)
- [`$msg.branch.flag()`](#msgbranchflag)
- [`$msg.branch.flags`](#msgbranchflags)
- [`$msg.branch.last_idx`](#msgbranchlast_idx)
- [`$msg.branch.path`](#msgbranchpath)
- [`$msg.branch.q`](#msgbranchq)
- [`$msg.branch.socket`](#msgbranchsocket)
- [`$msg.branch.uri`](#msgbranchuri)
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
- [`$proxy_protocol()`](#proxy_protocol)
- [`$pu`](#pu)
- [`$rP`](#rp)
- [`$rU`](#ru)
- [`$rb`](#rb)
- [`$rc`](#rc)
- [`$rd`](#rd)
- [`$re`](#re)
- [`$return`](#return)
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
- [`$sdp`](#sdp)
- [`$sdp.line`](#sdpline)
- [`$sdp.session`](#sdpsession)
- [`$sdp.stream`](#sdpstream)
- [`$sdp.stream.idx`](#sdpstreamidx)
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
- **Scope:** message_context
## `$C()`

reference to an escape sequence. x represents the foreground color and y represents the background color.

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$TS`

reference to startup unix time stamp

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$T_branch_idx`

the index (starting with 1 for the first branch) of the branch for which is executed the branch_route[].

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$Tf`

reference string formatted time

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$Ts`

reference to current unix time stamp in seconds

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$Tsm`

reference to current microseconds of the current second

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$aU`

whole username from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ad`

domain part of username from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$adu`

URI from Authorization or Proxy-Authorization header. This URI is used when calculating the HTTP Digest Response.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ai`

reference to URI in request's P-Asserted-Identity header (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$an`

the nonce from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ar`

realm from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$argv`

provides access to command line arguments specified with '-o' option.

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$au`

user part of username from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$auth.alg`

the algorithm string from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$auth.nc`

the value of nonce count parameter from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$auth.nonce`

the nonce string from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$auth.opaque`

the opaque string from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$auth.qop`

the value of qop parameter from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$auth.resp`

the authentication response from Authorization or Proxy-Authorization header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$avp(name)`

Attribute Value Pair. Dynamic variables linked to a singular message or transaction. Visible in all routes where any message of the transaction will be processed.

- **Type:** any
- **Read/write:** read-write
- **Scope:** transaction
## `$bf`

displays a list with the branch flags set for the current SIP request. TO BECOME OBSOLETE, replaced by $msg.branch.flags

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$branch`

this variable is used for creating new branches by writing into it the value of a SIP URI. TO BECOME OBSOLETE, replaced by $msg.branch.uri

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$branch()`

this variable provides read/write access to all fields/attributes of an already existing branch. TO BECOME OBSOLETE, replaced by $msg.branch.uri

- **Type:** any
- **Read/write:** read-write
- **Scope:** message_context
## `$branch.flag()`

this variable provides read/write access to the value of a single certain branch flag (identified by name). TO BECOME OBSOLETE, replaced by $msg.branch.flag

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message_context
## `$cT`

reference to body of Content-Type header and also the content-type headers inside a multi-part body

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$cfg_file`

Holds the current name of the cfg file being executed, useful when using multiple scripts via the include statement

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$cfg_line`

Holds the current line from the script of the action being executed, useful for logging purposes

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$challenge.algorithm`

the algorithm value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$challenge.ck`

the ck value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$challenge.ik`

the ik value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$challenge.nonce`

the nonce value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$challenge.opaque`

the opaque value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$challenge.qop`

the qop value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$challenge.realm`

the realm value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ci`

reference to body of call-id header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$cl`

reference to body of content-length header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$cs`

reference to cseq number from cseq header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ct`

reference to contact instance/body from the contact header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ct.fields()`

reference to the fields of a contact instance/body.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$dP`

reference to transport protocol of destination uri

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$dd`

reference to domain of destination uri

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$di`

reference to Diversion header URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$dip`

reference to Diversion header "privacy" parameter value

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$dir`

reference to Diversion header "reason" parameter value

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$dp`

reference to port of destination uri

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message_context
## `$ds`

reference to destination set

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$du`

reference to destination uri (outbound proxy to be used for sending the request)

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$err.class`

the class of error (now is '1' for parsing errors)

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$err.info`

text describing the error

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$err.level`

severity level for the error

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$err.rcode`

recommended reply code

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$err.rreason`

recommended reply reason phrase

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$fU`

reference to username in URI of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$fd`

reference to domain in URI of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$fn`

reference to display name of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ft`

reference to tag parameter of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$fu`

reference to URI of 'From' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$hdr()`

represents the body of the N-th header identified by 'name'.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$log_level`

changes the log level for the current process

- **Type:** integer
- **Read/write:** read-write
- **Scope:** process
## `$mb`

reference to SIP message buffer

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$mf`

displays a list with the message/transaction flags set for the current SIP request

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$mi`

reference to SIP message id

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ml`

reference to SIP message length

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$msg.branch`

similar to $branch, this variable is used for creating new message branches by writing into it the value of a SIP URI.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.attr()`

similar to $msg.branch.uri, but operating over a single branch attribute (attached to the current branch).

- **Type:** any
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.duri`

100% similar to $msg.branch.uri, but operating with the Detination-URI value of the message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.flag()`

similar to $msg.branch.uri, but operating over a single branch flag (for the current branch).

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.flags`

100% similar to $msg.branch.uri, but operating with list (comma separated) of per-branch flags (which are set for the branch).

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.last_idx`

returns the index of the last message branch.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$msg.branch.path`

100% similar to $msg.branch.uri, but operating with the PATH value of the message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.q`

100% similar to $msg.branch.uri, but operating with the Q value of the message branch.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.socket`

100% similar to $msg.branch.uri, but operating with the (forced) socket value of the message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.branch.uri`

gives read / write access over the SIP URI (as string) of an existing message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.flag()`

this variable provides read/write access to the value of a single certain message flag (identified by name).

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message_context
## `$msg.is_request`

this variable tells if the current SIP message is a request or not.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$msg.type`

this variable returns the type of the current message. The returned values are "request" (request) or "reply" (reply).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$oP`

reference to transport protocol of original R-URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$oU`

reference to username in request's original URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$od`

reference to domain in request's original R-URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$op`

reference to port of original R-URI

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$ou`

reference to request's original URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$pU`

reference to user in request's P-Preferred-Identity header URI (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$param()`

retrieves the parameters of the route. The index can be an integer, or a pseudo-variable (index starts at 1).

- **Type:** string
- **Read/write:** read-only
- **Scope:** process
## `$pd`

reference to domain in request's P-Preferred-Identity header URI (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$pn`

reference to Display Name in request's P-Preferred-Identity header (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$pp`

reference to process id (pid)

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$proxy_protocol()`

retrieves Proxy Protocol information from the transport layer.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$pu`

reference to URI in request's P-Preferred-Identity header (see RFC 3325)

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$rP`

reference to transport protocol of R-URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$rU`

reference to username in request's URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$rb`

reference to the body or a body part of the SIP message

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$rc`

reference to returned code by last invoked function

- **Type:** integer
- **Read/write:** read-only
- **Scope:** process
## `$rd`

reference to domain in request's URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$re`

reference to Remote-Party-ID header URI

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$return`

Returns the value of the previously executed route.

- **Type:** any
- **Read/write:** read-only
- **Scope:** process
## `$rm`

reference to request's method

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$route`

Access route names of the current route call stack.

- **Type:** string
- **Read/write:** read-only
- **Scope:** process
## `$route.name`

Access the name of the current route. May be indexed, using positive or negative indexes.

- **Type:** string
- **Read/write:** read-only
- **Scope:** process
## `$route.type`

Access the type of the current route. May be indexed, using positive or negative indexes.

- **Type:** string
- **Read/write:** read-only
- **Scope:** process
## `$rp`

reference to port of R-URI

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message_context
## `$rr`

reference to reply's reason

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$rs`

reference to reply's status

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$rt`

reference to URI of refer-to header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ru`

reference to request's URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$ru_q`

reference to q value of the R-URI

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$sdp`

Read/Write reference to the SDP body of the current SIP message

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$sdp.line`

Read/Write reference to SDP body lines, with filtering support

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$sdp.session`

Read/Write reference to the SDP body session, with filtering support

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$sdp.stream`

Read/Write reference to SDP body streams, with filtering support

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$sdp.stream.idx`

Read-Only reference to the index of the matched SDP stream. Yields NULL on no-match.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$si`

reference to IP source address of the message

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$socket_in`

read-only variable to get the description (proto:ip:port format) of the inbound socket (used for receiving the message).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$socket_out`

read-write variable for reading or changing the outbound socket of the message.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message_context
## `$sp`

reference to the source port of the message

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message_context
## `$tU`

reference to username in URI of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$td`

reference to domain in URI of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$time()`

returns the string formatted time according to UNIX date

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$tn`

reference to display name of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$tt`

reference to tag parameter of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$tu`

reference to URI of 'To' header

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$ua`

reference to user agent header field

- **Type:** string
- **Read/write:** read-only
- **Scope:** message_context
## `$var(name)`

Script variables strictly bound to the script routes. Visible only in the routing blocks, process related. Inherited by script routes executed by the same OpenSIPS process.

- **Type:** integer/string
- **Read/write:** read-write
- **Scope:** process
## `$xlog_level`

allows to set /reset the xlog() logging level on per-process bases.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** process
