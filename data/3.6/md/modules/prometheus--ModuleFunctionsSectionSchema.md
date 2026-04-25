## 1.4.�Exported Functions

### 1.4.1.� `prometheus_declare_stat(name, [type], [help])`

_NOTE:_ this function can only be used in the route declared in the [script\_route](#param_script_route "1.3.9.�script_route(string)") parameter.

Declares a custom statistic exported to Prometheus server. It specifies its type and optionally a help string.

Parameters

*   _name_ (string) - the name of the statistic
    
    _type_ (string, optional) - the type of the statistic (i.e. _counter_ or _gauge_). If missing the statistic is declared as _gauge_.
    
    _help_ (string, optional) - an optional value used to describe the statistic meaning. If missing, it is not used.
    

This function can only be used in the request route declared in the [script\_route](#param_script_route "1.3.9.�script_route(string)") parameter.

**Example�1.10.�`prometheus_declare_stat` usage**

...
modparam("prometheus", "script\_route", "my\_custom\_prometheus\_route")
...
route\[my\_custom\_prometheus\_route\] {
	...
	prometheus\_declare\_stat("opensips\_cps");
	prometheus\_push\_stat(3);
	...
}

  

### 1.4.2.� `prometheus_push_stat(value, [label_name], [label_value])`

_NOTE:_ this function can only be used in the route declared in the [script\_route](#param_script_route "1.3.9.�script_route(string)") parameter.

Pushes a custom statistic value and optionally a set of labels to the Prometheus server.

_NOTE:_ a statistic's value should only be pushed after it had been declared using the [prometheus\_declare\_stat](#func_prometheus_declare_stat "1.4.1.� prometheus_declare_stat(name, [type], [help])") function.

Parameters

*   _value_ (integer) - the value of the statistic
    
    _label\_name_ (string, optional) - used to define labels for the pushed statistic. If the _label\_value_ parameter is missing, this parameter is appended to the name of the statisic - this means that it should contain the whole set of labels for the value (including curly brackets). If the _label\_value_ is provided as well, then the parameter should only contain one label's name.
    
    _label\_value_ (string, optional) - the value that should be used for the _label\_name_ parameter label.
    

This function can only be used in the request route declared in the [script\_route](#param_script_route "1.3.9.�script_route(string)") parameter.

**Example�1.11.�`prometheus_push_stat` usage**

...
modparam("prometheus", "script\_route", "my\_custom\_prometheus\_route")
...
route\[my\_custom\_prometheus\_route\] {
	...
	prometheus\_declare\_stat("opensips\_cps");
	prometheus\_push\_stat(3); # no label is being used
	prometheus\_declare\_stat("opensips\_cc");
	# the next two are equivalent
	prometheus\_push\_stat(10, "{gateway=\\"gw1\\"}"); # no label is being used
	prometheus\_push\_stat(10, "gateway", "gw1"); # same as the above
	...
}