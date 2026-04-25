# Core Pseudo-Variables Reference
<!-- generated-from: data/3.6/core/variables.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: core_variable -->

Reference for OpenSIPs 3.6 core pseudo-variables. Read this file when constructing route scripts that need to inspect or manipulate SIP message fields, transaction state, or runtime context.

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
- [`$branch.fields`](#branchfields)
- [`$branch.flag`](#branchflag)
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
- [`$ct.fields`](#ctfields)
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
- [`$hdr`](#hdr)
- [`$hdrcnt`](#hdrcnt)
- [`$log_level`](#log_level)
- [`$mb`](#mb)
- [`$mf`](#mf)
- [`$mi`](#mi)
- [`$ml`](#ml)
- [`$msg.branch`](#msgbranch)
- [`$msg.branch.attr`](#msgbranchattr)
- [`$msg.branch.duri`](#msgbranchduri)
- [`$msg.branch.flag`](#msgbranchflag)
- [`$msg.branch.flags`](#msgbranchflags)
- [`$msg.branch.last_idx`](#msgbranchlast_idx)
- [`$msg.branch.path`](#msgbranchpath)
- [`$msg.branch.q`](#msgbranchq)
- [`$msg.branch.socket`](#msgbranchsocket)
- [`$msg.branch.uri`](#msgbranchuri)
- [`$msg.flag`](#msgflag)
- [`$msg.is_request`](#msgis_request)
- [`$msg.type`](#msgtype)
- [`$oP`](#op)
- [`$oU`](#ou)
- [`$od`](#od)
- [`$op`](#op)
- [`$ou`](#ou)
- [`$pU`](#pu)
- [`$param`](#param)
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
- [`$time`](#time)
- [`$tn`](#tn)
- [`$tt`](#tt)
- [`$tu`](#tu)
- [`$ua`](#ua)
- [`$var(name)`](#varname)
- [`$xlog_level`](#xlog_level)

## `$Au`

Username for accounting purposes. It's a selective pseudo variable (inherited from acc module). It returns $au if exits or From username otherwise.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$TS`

Reference to startup unix time stamp.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$T_branch_idx`

The index (starting with 1 for the first branch) of the branch for which is executed the branch_route[]. If used outside of branch_route[] block, the value is '0'.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** transaction
## `$Tf`

Reference string formatted time.

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$Ts`

Reference to current unix time stamp in seconds.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$Tsm`

Reference to current microseconds of the current second.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global
## `$aU`

Whole username from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ad`

Domain part of username from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$adu`

URI from Authorization or Proxy-Authorization header. This URI is used when calculating the HTTP Digest Response.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ai`

Reference to URI in request's P-Asserted-Identity header (see RFC 3325).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$an`

The nonce from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ar`

Realm from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$argv`

Provides access to command line arguments specified with '-o' option.

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$au`

User part of username from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$auth.alg`

The algorithm string from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$auth.nc`

The value of nonce count parameter from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$auth.nonce`

The nonce string from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$auth.opaque`

The opaque string from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$auth.qop`

The value of qop parameter from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$auth.resp`

The authentication response from Authorization or Proxy-Authorization header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$avp(name)`

Attribute Value Pairs are dynamic variables linked to a singular message or transaction. They can hold multiple values in a stack order.

- **Type:** string
- **Read/write:** read-write
- **Scope:** transaction
## `$bf`

Displays a list with the branch flags set for the current SIP request.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$branch`

This variable is used for creating new branches by writing into it the value of a SIP URI.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$branch.fields`

Provides read/write access to all fields/attributes of an already existing branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$branch.flag`

Provides read/write access to the value of a single certain branch flag (identified by name).

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$cT`

Reference to body of Content-Type header and also the content-type headers inside a multi-part body.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$cfg_file`

Holds the current name of the cfg file being executed, useful when using multiple scripts via the include statement.

- **Type:** string
- **Read/write:** read-only
- **Scope:** script
## `$cfg_line`

Holds the current line from the script of the action being executed, useful for logging purposes.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** script
## `$challenge.algorithm`

The algorithm value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$challenge.ck`

The ck value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$challenge.ik`

The ik value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$challenge.nonce`

The nonce value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$challenge.opaque`

The opaque value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$challenge.qop`

The qop value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$challenge.realm`

The realm value taken from the WWW-Authorize or Proxy-Authorize header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ci`

Reference to body of call-id header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$cl`

Reference to body of content-length header.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$cs`

Reference to cseq number from cseq header.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$ct`

Reference to contact instance/body from the contact header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ct.fields`

Reference to the fields of a contact instance/body.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$dP`

Reference to transport protocol of destination uri.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$dd`

Reference to domain of destination uri.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$di`

Reference to Diversion header URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$dip`

Reference to Diversion header 'privacy' parameter value.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$dir`

Reference to Diversion header 'reason' parameter value.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$dp`

Reference to port of destination uri.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$ds`

Reference to destination set.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$du`

Reference to destination uri (outbound proxy to be used for sending the request). If loose_route() returns TRUE a destination uri is set according to the first Route header.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$err.class`

The class of error (now is '1' for parsing errors).

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$err.info`

Text describing the error.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$err.level`

Severity level for the error.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$err.rcode`

Recommended reply code.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$err.rreason`

Recommended reply reason phrase.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$fU`

Reference to username in URI of 'From' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$fd`

Reference to domain in URI of 'From' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$fn`

Reference to display name of 'From' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ft`

Reference to tag parameter of 'From' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$fu`

Reference to URI of 'From' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$hdr`

Represents the body of the N-th header identified by 'name'.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$hdrcnt`

Returns number of headers of type given by 'name'.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$log_level`

Changes the log level for the current process; the log level can be set to a new value or it can be reset back to the global log level.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** process
## `$mb`

Reference to SIP message buffer.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$mf`

Displays a list with the message/transaction flags set for the current SIP request.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$mi`

Reference to SIP message id.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$ml`

Reference to SIP message length.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$msg.branch`

Used for creating new message branches by writing into it the value of a SIP URI. By reading this variable, you get the SIP URI of the current/last added branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.attr`

Similar to $msg.branch.uri, but operating over a single branch attribute (attached to the current branch).

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.duri`

100% similar to $msg.branch.uri, but operating with the Detination-URI value of the message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.flag`

Similar to $msg.branch.uri, but operating over a single branch flag (for the current branch).

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.flags`

100% similar to $msg.branch.uri, but operating with list (comma separated) of per-branch flags (which are set for the branch).

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.last_idx`

Returns the index of the last message branch. IF no additional branche were added, it will return 0, the index of the RURI branch.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$msg.branch.path`

100% similar to $msg.branch.uri, but operating with the PATH value of the message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.q`

100% similar to $msg.branch.uri, but operating with the Q value of the message branch.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.socket`

100% similar to $msg.branch.uri, but operating with the (forced) socket value of the message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.branch.uri`

Gives read / write access over the SIP URI (as string) of an existing message branch.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$msg.flag`

Provides read/write access to the value of a single certain message flag (identified by name).

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$msg.is_request`

Tells if the current SIP message is a request or not.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$msg.type`

Returns the type of the current message.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$oP`

Reference to transport protocol of original R-URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$oU`

Reference to username in request's original URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$od`

Reference to domain in request's original R-URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$op`

Reference to port of original R-URI.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$ou`

Reference to request's original URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$pU`

Reference to user in request's P-Preferred-Identity header URI (see RFC 3325).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$param`

Retrieves the parameters of the route.

- **Type:** string
- **Read/write:** read-only
- **Scope:** route
## `$pd`

Reference to domain in request's P-Preferred-Identity header URI (see RFC 3325).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$pn`

Reference to Display Name in request's P-Preferred-Identity header (see RFC 3325).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$pp`

Reference to process id (pid).

- **Type:** integer
- **Read/write:** read-only
- **Scope:** process
## `$pu`

Reference to URI in request's P-Preferred-Identity header (see RFC 3325).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$rP`

Reference to transport protocol of R-URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$rU`

Reference to username in request's URI.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$rb`

Reference to the body or a body part of the SIP message.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$rc`

Reference to returned code by last invoked function.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** script
## `$rd`

Reference to domain in request's URI.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$re`

Reference to Remote-Party-ID header URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$return`

Returns the value of the previously executed route.

- **Type:** string
- **Read/write:** read-only
- **Scope:** route
## `$rm`

Reference to request's method.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$route`

Access route names of the current route call stack.

- **Type:** string
- **Read/write:** read-only
- **Scope:** route
## `$route.name`

Access the name of the current route.

- **Type:** string
- **Read/write:** read-only
- **Scope:** route
## `$route.type`

Access the type of the current route.

- **Type:** string
- **Read/write:** read-only
- **Scope:** route
## `$rp`

Reference to port of R-URI.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$rr`

Reference to reply's reason.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$rs`

Reference to reply's status.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$rt`

Reference to URI of refer-to header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ru`

Reference to request's URI.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$ru_q`

Reference to q value of the R-URI.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** message
## `$sdp`

Read/Write reference to the SDP body of the current SIP message.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$sdp.line`

Read/Write reference to SDP body lines, with filtering support.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$sdp.session`

Read/Write reference to the SDP body session, with filtering support.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$sdp.stream`

Read/Write reference to SDP body streams, with filtering support.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$sdp.stream.idx`

Read-Only reference to the index of the matched SDP stream. Yields NULL on no-match.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$si`

Reference to IP source address of the message.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$socket_in`

Read-only variable to get the description (proto:ip:port format) of the inbound socket (used for receiving the message).

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$socket_out`

Read-write variable for reading or changing the outbound socket of the message.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message
## `$sp`

Reference to the source port of the message.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** message
## `$tU`

Reference to username in URI of 'To' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$td`

Reference to domain in URI of 'To' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$time`

Returns the string formatted time according to UNIX date (see: man date).

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
## `$tn`

Reference to display name of 'To' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$tt`

Reference to tag parameter of 'To' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$tu`

Reference to URI of 'To' header.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$ua`

Reference to user agent header field.

- **Type:** string
- **Read/write:** read-only
- **Scope:** message
## `$var(name)`

Script variables are strictly bound to the script routes. They are process related and visible only in routing blocks executed by the same OpenSIPS process. They can hold integer or string values.

- **Type:** string
- **Read/write:** read-write
- **Scope:** script
## `$xlog_level`

Allows to set /reset the xlog() logging level on per-process bases.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** process
