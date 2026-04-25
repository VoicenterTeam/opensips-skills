## 1.5.�Exported Pseudo-Variables

Exported variables are listed in the next sections.

### 1.5.1.�$T\_branch\_idx

_$T\_branch\_idx_ - the index (starting with 0 for the first branch) of the currently proccessed branch. This index makes sense only in BRANCH and REPLY routes (where the processing is per branch) and in FAILURE route (where it points to the branch with the last final reply on the transaction). In all the other types of routes, the value of this index will be NULL.

### 1.5.2.�$T\_reply\_code

_$T\_reply\_code_ - the code of the reply, as follows: in request\_route will be the last stateful sent reply; in reply\_route will be the current processed reply; in failure\_route will be the negative winning reply. In case of no-reply or error, '0' value is returned.

### 1.5.3.�$T\_fr\_timeout

_$T\_fr\_timeout (R/W)_ - the timeout for the final reply to the current transaction

With each different request received, _$T\_fr\_timeout_ will initially be equal to the **[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")** parameter.

_"$T\_fr\_timeout = NULL;"_ will reset it to **[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")**.

### 1.5.4.�$T\_fr\_inv\_timeout

_$T\_fr\_inv\_timeout (R/W)_ - the timeout for the final reply to an INVITE request, after a 1XX reply was received. This variable may also be set in an onreply\_route (e.g. on 180 Ringing, after 100 Trying) and still take effect.

With each different request received, _$T\_fr\_inv\_timeout_ will initially be equal to the **[fr\_inv\_timeout](#param_fr_inv_timeout "1.3.2.�fr_inv_timeout (integer)")** parameter.

_"$T\_fr\_inv\_timeout = NULL;"_ will reset it to **[fr\_inv\_timeout](#param_fr_inv_timeout "1.3.2.�fr_inv_timeout (integer)")**.

### 1.5.5.�$T\_ruri

_$T\_ruri_ - the ruri of the current branch; this information is taken from the transaction structure, so you can access this information for any sip message (request/reply) that has a transaction.

### 1.5.6.�$bavp(name)

_$bavp(name)_ - a particular type of avp that can have different values for each branch. They can only be used in BRANCH, REPLY and FAILURE routes. Otherwise NULL value is returned.

### 1.5.7.�$T\_id

_$T\_id_ - returns the ID of the current transaction. The ID is an opaque hexa string, unique for each transaction. If there is no current transaction, NULL value is returned.

### 1.5.8.�$T\_branch\_last\_reply\_code

_$T\_branch\_last\_reply\_code_ - returns the last reply code received for a branch specified as parameter. If no parameter is specified, the last reply for the current branch is retrieved.

### 1.5.9.�$tm.branch.uri\[\]

_$tm.branch.uri_ - gives read-only access over the Request URI (as string) of a TM existing branch. The status of the branch (completed, ongoing, etc) is not relevant.

The TM (UAC side) branches are created when the request is sent to new destinations via "t\_relay()" or "t\_inject()".

The indexing of the branches starts from 0, giving access to all branches (past and active) of the transaction. Nevertheless the indexing supports two optional suffixes, to simplify the scripting:

*   _/active_ - the indexing starts also from 0, but it is relative to the last set of branches - the parallel branches created by the last "t\_relay()"-ing.
    
*   _/all_ - similar to "no suffix" case, meaning it is an absolute index, covering all the branches of the trasactions (resulted from all "t\_relay()"s performed over the transaction).
    

IF no index is specified, the current branch used. This depends on the scripting context. Like in reply route, the current branch is the branch the reply came for; in branch route, the current branch is the branch to be sent out; in failure route, the current branch is the winning branch.

NOTES:

*   The index ALL ( "\*" ) is not supported;
    
*   In branch route, only the "$tm.branch.attr" and "$tm.branch.flag" variables work for the current branch (the rest of the branch related variables will return NULL)
    
*   Negative values are accepted, meaning indexing from the end ( -1 is the latest/higher branch)
    

The variable can be used in BRANCH, ONREPLY and FAILURE routes.

### 1.5.10.�$tm.branch.duri\[\]

_$tm.branch.duri_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the Detination-URI value of the branch.

### 1.5.11.�$tm.branch.path\[\]

_$tm.branch.path_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the PATH value of the branch.

### 1.5.12.�$tm.branch.q\[\]

_$tm.branch.q_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the Q value of the branch.

### 1.5.13.�$tm.branch.flags\[\]

_$tm.branch.flags_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the list (comma separated) of per-branch flags which are set for the branch.

### 1.5.14.�$tm.branch.socket\[\]

_$tm.branch.socket_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the socket description (proto:ip:port) used for sending the branch out.

### 1.5.15.�$tm.branch.flag()\[\]

_$tm.branch.flag(name)_ - similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but gives read/write access to a single branch flag (by its name).

The accepted values are 0 for FALSE, pozitive non-zero for TRUE. The returned values are 0 for FALSE and 1 for TRUE.

The flags operated here are the same as the bflags you can operated with via the "\[re\]setbflag()" functions.

### 1.5.16.�$tm.branch.attr()\[\]

_$tm.branch.attr(name)_ - similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but gives read/write access to the attributed attached to the branch.

An attribute can have whatever name (no need to be pre-defined) and it can have a single value (at a time), string or integer.

### 1.5.17.�$tm.branch.last\_received\[\]

_$tm.branch.last\_received_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the reply code of the last received reply (from the network) on this branch. NULL is returned in no reply was received so far.

### 1.5.18.�$tm.branch.type\[\]

_$tm.branch.type_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the type of the current branch. This may be "phone" if it not a real branch (has no SIP signalling, used by waiting for branch injection) or "sip" (a real signalling branch).