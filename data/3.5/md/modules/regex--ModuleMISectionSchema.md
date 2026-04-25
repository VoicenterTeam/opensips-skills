## 1.5.�Exported MI Functions

### 1.5.1.� `regex_reload`

Causes regex module to re-read the content of the text file and re-compile the regular expressions. The number of groups in the file can be modified safely.

Name: _regex\_reload_

Parameters: _none_

MI FIFO Command Format:

...
opensips-cli -x mi regex\_reload
...

### 1.5.2.� `regex_match`

Matches the given string parameter against the regular expression pcre\_regex. Returns "Match" if it matches, "Not Match" otherwise.

Name: _regex\_match_

Parameters:

*   string
    
*   pcre\_regex
    

MI FIFO Command Format:

...
opensips-cli -x mi regex\_match string="1234" pcre\_regex="^1234$"
"Match"
opensips-cli -x mi regex\_match string="1234" pcre\_regex="^1235$"
"Not Match"
...

### 1.5.3.� `regex_match_group`

It uses the groups readed from the text file to match the given string parameter against the compiled regular expression in group number group. Returns "Match" if it matches, "Not Match" otherwise.

Name: _regex\_match\_group_

Parameters:

*   string
    
*   group
    

MI FIFO Command Format:

...
opensips-cli -x mi regex\_match\_group string="1234" group="0"
"Match"
opensips-cli -x mi regex\_match\_group string="1234" group="1"
"Not Match"
...