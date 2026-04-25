## 1.5.�Exported MI Functions

### 1.5.1.� `imc_list_rooms`

Lists of the IM Conferencing rooms.

Name: _imc\_list\_rooms_

Parameters: none

MI FIFO Command Format:

		opensips-cli -x mi imc\_list\_rooms
		

### 1.5.2.� `imc_list_members`

Listing of the members in IM Conferencing rooms.

Name: _imc\_list\_members_

Parameters:

*   _room_ : the room for which you want to list the members
    

MI FIFO Command Format:

		opensips-cli -x mi imc\_list\_members sip:chat-000@opensips.org