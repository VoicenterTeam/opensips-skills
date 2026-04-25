## 1.3.�Exported Parameters

### 1.3.1.�`force_single_dialog` (int)

By default the module aggregates all available dialog info into a single dialog-info document containing multiple "dialog" elements. If the phone does not support this, you can activate this parameter.

If this parameter is set, only the dialog element with the currently most interesting dialog state will be put into the dialog-info document. Thus, the dialog-info element will contain only a single "dialog" element. The algorithm chooses the state based onf the following order of priority (least important first): terminated, trying, proceeding, confirmed, early. Note: I consider the "early" state more intersting than confirmed as often you might want to pickup a call if the originall callee is already busy in a call.

_Default value is “0”._

**Example�1.1.�Set parameter**

...
modparam("presence\_dialoginfo", "force\_single\_dialog", 1)
...