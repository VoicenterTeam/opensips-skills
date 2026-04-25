## 1.6.�Exported MI Functions

### 1.6.1.� `pike_list`

Lists the nodes in the pike tree.

Name: _pike\_list_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi pike\_list
		

### 1.6.2.� `pike_rm`

Remove a node from the pike tree by IP address.

Name: _pike\_rm_

Parameters:

*   _IP_ - IP address currently blocked.
    

MI FIFO Command Format:

		opensips-cli -x mi pike\_rm 10.0.0.106