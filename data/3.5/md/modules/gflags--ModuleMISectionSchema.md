## 1.5.�Exported MI Functions

Functions that check or change some flags accepts one parameter which is the flag bitmap/mask specifing the corresponding flags. It is not possible to specify directly the flag position that should be changed as in the functions available in the routing script.

### 1.5.1.�`set_gflag`

Set the value of some flags (specified by bitmask) to 1.

The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Example�1.5.�`set_gflag` usage**

...
$ opensips-cli -x mi set\_gflag 1
$ opensips-cli -x mi set\_gflag 0x3
...

  

### 1.5.2.�`reset_gflag`

Reset the value of some flags to 0.

The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

**Example�1.6.� `reset_gflag` usage**

...
$ opensips-cli -x mi reset\_gflag 1
$ opensips-cli -x mi reset\_gflag 0x3
...

  

### 1.5.3.�`is_gflag`

Returns true if the all the flags from the bitmask are set.

The parameter value must be a bitmask in decimal or hexa format. The bitmaks has a 32 bit size.

The function returns TRUE if all the flags from the set are set and FALSE if at least one is not set.

**Example�1.7.�`is_gflag` usage**

...
$ opensips-cli -x mi set\_gflag 1024
$ opensips-cli -x mi is\_gflag 1024
TRUE
$ opensips-cli -x mi is\_gflag 1025
TRUE
$ opensips-cli -x mi is\_gflag 1023
FALSE
$ opensips-cli -x mi set\_gflag 0x10
$ opensips-cli -x mi is\_gflag 1023
TRUE
$ opensips-cli -x mi is\_gflag 1007
FALSE
$ opensips-cli -x mi is\_gflag 16
TRUE
...

  

### 1.5.4.�`get_gflags`

Return the bitmap with all flags. The function gets no parameters and returns the bitmap in hexa and decimal format.

**Example�1.8.� `get_gflags` usage**

...
$ opensips-cli -x mi get\_gflags
0x3039
12345
...