## 1.5.�Exported Pseudo-Variables

### 1.5.1.�`$TH_callee_callid`

Read only variable that will contain the callid as it is propagated towards the callee side, in case topology\_hiding("C") is called.

NULL will be returned if there is no topology hiding dialog for the request or if topology\_hiding with callid encoding was not used for the current dialog.