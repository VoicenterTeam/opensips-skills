## 1.5.�Exported MI Functions

### 1.5.1.� `msrp_gw_list_sessions`

Lists information about ongoing sessions.

Name: _msrp\_gw\_list\_sessions_

Parameters

*   _None_.
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_gw\_list\_sessions
		

### 1.5.2.� `msrp_gw_end_session`

Terminate an ongoing session.

Name: _msrp\_gw\_end\_session_

Parameters

*   _key_ (string) - session key
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_gw\_end\_session alice@opensips.org-bob@opensips.org