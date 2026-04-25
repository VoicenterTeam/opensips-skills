## 1.5.�Exported MI Functions

### 1.5.1.� `LOAD_CPL`

For the given user, loads the XML cpl file, compiles it into binary format and stores both format into database.

Name: _LOAD\_CPL_

Parameters:

*   username : name of the user
    
*   cpl\_filename: file name
    

MI FIFO Command format:

                 opensips-cli -x mi LOAD\_CPL sip:bob@domain.com cpl\_script.xml

### 1.5.2.� `REMOVE_CPL`

For the given user, removes the entire database record (XML cpl and binary cpl); user with empty cpl scripts are not accepted.

Name: _REMOVE\_CPL_

Parameters:

*   username : name of the user
    

MI FIFO Command format:

                 opensips-cli -x mi REMOVE\_CPL sip:bob@domain.com

### 1.5.3.� `GET_CPL`

For the given user, returns the CPL script in XML format.

Name: _GET\_CPL_

Parameters:

*   username : name of the user
    

MI FIFO Command format:

                 opensips-cli -x mi GET\_CPL sip:bob@domain.com