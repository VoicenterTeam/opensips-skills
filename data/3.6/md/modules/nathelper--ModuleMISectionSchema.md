## 1.6.�Exported MI Functions

### 1.6.1.�`nh_enable_ping`

Gets or sets the natpinging status.

Parameters:

*   _status_ (optional) - if not provided the function returns the current natping status. Otherwise, enables natping if parameter value greater than 0 or disables natping if parameter value is 0.
    

**Example�1.25.�`nh_enable_ping` usage**

...
$ opensips-cli -x mi nh\_enable\_ping
Status:: 1
$
$ opensips-cli -x mi nh\_enable\_ping 0
$
$ opensips-cli -x mi nh\_enable\_ping
Status:: 0
$
...