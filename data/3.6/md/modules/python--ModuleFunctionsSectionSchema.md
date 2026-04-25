## 1.4.�Exported Functions

### 1.4.1.� `python_exec(method_name [, extra_args])`

This function is used to execute a method from the Python module loaded.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

Meaning of the parameters is as follows:

*   _method\_name_ (string) - name of the method called
    
*   _extra\_args_ (string, optional) - extra arguments that can be passed from the script to the python function.