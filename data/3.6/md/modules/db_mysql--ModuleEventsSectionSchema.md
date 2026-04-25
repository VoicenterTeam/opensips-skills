## 1.6.�Exported Events

### 1.6.1.� `E_MYSQL_CONNECTION`

This event is raised when a MySQL connection is lost or recovered.

Parameters:

*   _url_ - the URL of the connection as specified by the _db\_url_ parameter.
    
*   _status_ - _connected_ if the connection recovered, or _disconnected_ if the connection was lost.