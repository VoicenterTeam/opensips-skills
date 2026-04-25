## 1.4.�Exported Functions

### 1.4.1.� `emergency_call()`

Checks whether the incoming call is an emergency call, case it is treats, and routes the call to the destination determined by VPC. The function returns true if is a emergency call and the treat was Ok.

This function can be used from the _REQUEST_ routes.

**Example�1.11.�`emergency_call()` usage**

...
# Example of treat of emergency call

��� if (emergency\_call()){

��� ��� xlog("emergency call\\n");
��� ��� t\_on\_failure("emergency\_call");
��      t\_relay();
��      exit;

  	}
...
		

  

### 1.4.2.� `failure()`

This function is used when trying to route the emergency call to the destination specified by the VPC and doesn't work, then uses this function to make one last attempt for a contingency number. The function returns true if the contingency treat was OK.

This function can be used from the _FAILURE_ routes.

**Example�1.12.�`failure()` usage**

...
# Example od treat of contingency in emergency call

    if (failure()) {
��� ��� if (!t\_relay()) {
��� ��� �� send\_reply(500,"Internal Error");
��� ��� };
��� ��� exit;
    }
...