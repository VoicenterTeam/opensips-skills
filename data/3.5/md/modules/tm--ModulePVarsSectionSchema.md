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