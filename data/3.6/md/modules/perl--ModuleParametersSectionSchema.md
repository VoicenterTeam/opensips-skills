## 1.5.�Exported Parameters

### 1.5.1.�`filename` (string)

This is the file name of your script. This may be set once only, but it may include an arbitary number of functions and “use” as many Perl module as necessary.

_May not be empty!_

**Example�1.1.�Set `filename` parameter**

...
modparam("perl", "filename", "/home/john/opensips/myperl.pl")
...

  

### 1.5.2.�`modpath` (string)

The path to the Perl modules included (OpenSIPS.pm et.al). It is not absolutely crucial to set this path, as you _may_ install the Modules in Perl's standard path, or update the “%INC” variable from within your script. Using this module parameter is the standard behavior, though.

**Example�1.2.�Set `modpath` parameter**

...
modparam("perl", "modpath", "/usr/local/lib/opensips/perl/")
...