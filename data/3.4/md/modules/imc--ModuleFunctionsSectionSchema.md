## 1.4.�Exported Functions

### 1.4.1.� `imc_manager()`

Handles Message method.It detects if the body of the message is a conference command.If so it executes it, otherwise it sends the message to all the members in the room.

This function can be used from REQUEST\_ROUTE.

**Example�1.7.�Usage of `imc_manager()` function**

...
# the rooms will be named chat-xyz to avoid overlapping
# with usernames
if(is\_method("MESSAGE)
        && ($ru=~ "sip:chat-\[0-9\]+@" || ($ru=~ "sip:chat-manager@")
    imc\_manager();
...