## 1.5.�Exported Functions

### 1.5.1.� `pike_check_req()`

Process the source IP of the current request and returns false if the IP was exceeding the blocking limit.

Return codes:

*   _1 (true)_ - IP is not to be blocked or internal error occurred.
    
    ### Warning
    
    IMPORTANT: in case of internal error, the function returns true to avoid reporting the current processed IP as blocked.
    
*   _\-1 (false)_ - IP is source of flooding, being previously detected
    
*   _\-2 (false)_ - IP is detected as a new source of flooding - first time detection
    

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�`pike_check_req` usage**

...
if (!pike\_check\_req()) { exit; };
...