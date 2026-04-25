## 1.5.�Exported MI Functions

### 1.5.1.� `refreshXcapDoc`

MI command that should be sent by an xcap server when a stored document changes.

Name: _refreshXcapDoc_

Parameters:

*   doc\_uri: the uri of the document
    
*   port: the port of the xcap server
    

MI FIFO Command Format:

...
opensips-cli -x mi refreshXcapDoc /xcap-root/resource-lists/users/eyebeam/buddies-resource-list.xml 8000
...