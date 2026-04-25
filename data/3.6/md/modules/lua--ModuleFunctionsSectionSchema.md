## 1.6.�Exported Functions

### 1.6.1.�lua\_exec(func, \[param\])

Calls a Lua function with passing it the current SIP message. This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE and BRANCH\_ROUTE.

Parameters:

*   _func_ (string) - Lua function name
    
*   _param_ (string, optional) - Parameter to be passed to the Lua function.
    

**Example�1.2.�lua\_exec() usage**

...
if (lua\_exec("mongo\_alias")) {
	...
}
...

  

### 1.6.2.�lua\_meminfo()

Logs informations about memory.