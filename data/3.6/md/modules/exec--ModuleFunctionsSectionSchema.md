## 1.4.�Exported Functions

### 1.4.1.� `exec(command, [stdin], [stdout], [stderr], [envavp])`

Executes an external command. The input is passed to the standard input of the new process, if specified, and the output is saved in the output variable.

The function waits for the external script until it provided all its output (not necessary to actually finish). If no output (standard output or standard error) is required by the function, it will not block at all - it will simply launch the external script and continue the script.

Meaning of the parameters is as follows:

*   _command (string)_ - command to be executed
    
*   _stdin (string, optional)_ - string to be passed to the standard input of the command
    
*   _stdout (var, optional)_ - optional output variable which will hold the standard output of the process
    
*   _stderr (var, optional)_ - optional output variable which will hold the standard error of the process
    
*   _envavp (var, optional)_ - optional AVP which holds the values for the environment variables to be passed for the command. The names of the environment variables will be "OSIPS\_EXEC\_#", where "#" starts from 0. For example, if we push two values (e.g. "b" and "a") into an AVP variable, which acts like a stack, OSIPS\_EXEC\_0 will hold "a", while OSIPS\_EXEC\_1 will hold "b".
    

NOTE: If expecting a multi-line formatted output, you should use $avp variables for the "stdout" and "stderr" parameters, to avoid only receiving the last lines of each stream.

WARNING: any OpenSIPS pseudo-vars which may contain special bourne shell (sh/bash) characters should be placed inside quotes, e.g. exec("update-stats.sh '$(ct{re.subst,/'//g})'");

WARNING: "stdin"/"stdout"/"stderr" parameters are not designed for large amounts of data, so one should be careful when using them. Because of the basic implementation, filled up pipes could cause a read deadlock.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE, ONREPLY\_ROUTE.

**Example�1.3.�`exec` usage**

...
$avp(env) = "a";
$avp(env) = "b";
exec("ls -l", , $var(out), $var(err), $avp(env));
xlog("The output is $var(out)\\n");
xlog("Received the following error\\n$var(err)");
...
$var(input) = "input";
exec("/home/../myscript.sh", "this is my $var(input) for exec\\n", , , $avp(env));
...