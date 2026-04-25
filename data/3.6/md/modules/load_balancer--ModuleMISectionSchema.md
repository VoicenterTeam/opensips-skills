## 1.7.�Exported MI Functions

### 1.7.1.�`lb_reload`

Trigers the reload of the load balancing data from the DB.

MI FIFO Command Format:

		opensips-cli -x mi lb\_reload
		

### 1.7.2.�`lb_resize`

Changes the capacity for a resource of a destination.

Parameters:

*   _destination\_id_ - the ID (as per DB) of the destination.
    
*   _res\_name_ - name of the resource you want to resize.
    
*   _new\_capacity_ - new resource capacity.
    

MI FIFO Command Format:

		opensips-cli -x mi lb\_resize 11 voicemail 56
		

### 1.7.3.�`lb_list`

Lists all the destinations and the maximum and current load for each resource of the destination.

**Example�1.19.�`lb_list` usage**

$ opensips-cli -x mi lb\_list
Destination:: sip:127.0.0.1:5100 id=1 enabled=yes auto-re=on
        Resource:: pstn max=3 load=0
        Resource:: transc max=5 load=1
        Resource:: vm max=5 load=2
Destination:: sip:127.0.0.1:5200 id=2 enabled=no auto-re=on
        Resource:: pstn max=6 load=0
        Resource:: trans max=57 load=0
        Resource:: vm max=5 load=0

  

### 1.7.4.�`lb_status`

Gets or sets the status (enabled or disabled) of a destination.

Parameters:

*   _destination\_id_ - the ID (as per DB) of the destination.
    
*   _new\_status_ (optional) - If no new status is given, the function will return the current status. If a new status is given (0 - disable, 1 - enable), this status will be forced for the destination.
    

**Example�1.20.�`lb_status` usage**

$ opensips-cli -x mi lb\_status 2
enable:: no
$ opensips-cli -x mi lb\_status 2 1
$ opensips-cli -x mi lb\_status 2
enable:: yes