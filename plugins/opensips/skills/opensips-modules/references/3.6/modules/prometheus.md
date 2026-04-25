# prometheus Module Reference
<!-- generated-from: data/3.6/modules/prometheus.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 prometheus module. Read this file when configuring or debugging the prometheus module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a HTTP interface for the [Prometheus](https://prometheus.io/) monitoring system, allowing it to fetch different statistics from OpenSIPS.

In order to use it, you have to explicitely define the statistics you want to provide by listing them in the [statistics](#param_statistics "1.3.7.statistics(string)") parameter.

Currently only _counter_ and _gauge_ metrics types are supported by the module, and whether to choose one or the other for a specific statistic is dictated by the way that statistic was defined either internally, or explicitely through the _variable_ parameter of the _statistics_ module.

Each exported statistic comes with a _group_ label that indicates the group it belongs to.

## Dependencies

### OpenSIPs Modules

- `httpd` — must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `delimiter` (string)

Specifies the delimiter to be used to separate prefix and group_prefix.

*Default value is _.*

**Example.** -.

```opensips
modparam("prometheus", "delimiter", "-")
```
### `group_label` (string)

Specifies the label used to store the group when group_mode is 2.

*Default value is group.*

**Example.** grp.

```opensips
modparam("prometheus", "group_label", "grp")
```
### `group_mode` (integer)

Specifies how the group of the statistic should be provisioned to Prometheus. Available modes are: 0 - do not send the statistics groups. 1 - send the group in the name of the statstic. For example, timestamp statistic from the core group would be exported as opensips_core_timestamp. Note that the group_prefix is still attached to the group's name. 2 - send the group as a label of the statstic. The name of the label is specified by the group_label parameter.

*Default value is 0.*

**Possible values:**

- 0
- 1
- 2

**Example.** 1.

```opensips
modparam("prometheus", "group_mode", 1)
```
### `group_prefix` (string)

Appends a prefix to the name of the group the statistic belongs to.

**Example.** opensips.

```opensips
modparam("prometheus", "group_prefix", "opensips")
```
### `labels` (string)

Rules that define how to convert the name of a statistic within a group to obtain the name and set of labels to be pushed in Prometheus. The format is group: regex, where group represents the group of statistics for whom the regular expression should be applied for, and regexp is a regular expression used to match the statistic's name and convert it to the desired name and labels. The regex format is /matching_expression/substitution_expression/flags. The substitution_expression resulted after the substituion should result in a string with the following format: name:labels, where name represents the name of the statistic as it will be pushed towards Prometheus, and labels the labels, expressed as key=value pairs separated by comma, as they are received by Prometheus. Note that the labels string resulted is concatenated to the other labeles as plain string - no other transformations are performed. If a statistic's name within the declared group does not match the regular, or the resulted format does not comply with the name:labels format, the statistics transformations are ignored and it shall be printed as a regular statistic, as if the rule was not even used. This parameter can be defined multiple times, even for a single group. However, if the statistic matches multiple regular expressions, only the first regular expression that matches is considered. The order they are checked is the order declared in the script.

**Notes:** This parameter can be defined multiple times, even for a single group. However, if the statistic matches multiple regular expressions, only the first regular expression that matches is considered. The order they are checked is the order declared in the script.

**Example.** group: /^(.*)_(.*)$/\\1:gateway=\"\\2\"/.

```opensips
modparam("prometheus", "labels", "group: /^(.*)_(.*)$/\\1:gateway=\"\\2\"/")
```
### `prefix` (string)

Appends a prefix to each statistic exported.

*Default value is opensips.*

**Example.** opensips_1.

```opensips
modparam("prometheus", "prefix", "opensips_1")
```
### `root` (string)

Specifies the root metrics path Promethus uses to query the stats: http://[opensips_IP]:[opensips_httpd_port]/[root]

*Default value is metrics.*

**Example.** prometheus.

```opensips
modparam("prometheus", "root", "prometheus")
```
### `script_route` (string)

Specifies the route name to be used to for adding custom prometheus information.

**Example.** my_custom_prometheus_route.

```opensips
modparam("prometheus", "script_route", "my_custom_prometheus_route")
```
### `statistics` (string)

The statistics that are being exported by OpenSIPS, separated by space. The list can also contain statistics groups's names - to do that, you shall add a colon (:) at the end of the groups's name. If the all value is used, then the module will expose all available statistics - therefore any other settings of this parameter is useless; This parameter can be defined multiple times.

**Notes:** This parameter can be defined multiple times.

**Example.** active_dialogs load:.

```opensips
modparam("prometheus", "statistics", "active_dialogs load:")
```

## Exported Functions

### `prometheus_declare_stat(name, [type], [help])`

Declares a custom statistic exported to Prometheus server. It specifies its type and optionally a help string.

**Parameters:**

- `help` *(string, optional)* — an optional value used to describe the statistic meaning. If missing, it is not used.
- `name` *(string, required)* — the name of the statistic
- `type` *(string, optional)* — the type of the statistic (i.e. counter or gauge). If missing the statistic is declared as gauge.
  - `counter`
  - `gauge`

**Usable from:** script_route

**Related:**

- `prometheus_push_stat`

**Example.** prometheus_declare_stat usage.

```opensips
...
modparam("prometheus", "script_route", "my_custom_prometheus_route")
...
route[my_custom_prometheus_route] {
	...
	prometheus_declare_stat("opensips_cps");
	prometheus_push_stat(3);
	...
}
```

### `prometheus_push_stat(value, [label_name], [label_value])`

Pushes a custom statistic value and optionally a set of labels to the Prometheus server.

**Parameters:**

- `label_name` *(string, optional)* — used to define labels for the pushed statistic. If the label_value parameter is missing, this parameter is appended to the name of the statisic - this means that it should contain the whole set of labels for the value (including curly brackets). If the label_value is provided as well, then the parameter should only contain one label's name.
- `label_value` *(string, optional)* — the value that should be used for the label_name parameter label.
- `value` *(integer, required)* — the value of the statistic

**Usable from:** script_route

**Related:**

- `prometheus_declare_stat`

**Example.** prometheus_push_stat usage.

```opensips
...
modparam("prometheus", "script_route", "my_custom_prometheus_route")
...
route[my_custom_prometheus_route] {
	...
	prometheus_declare_stat("opensips_cps");
	prometheus_push_stat(3); # no label is being used
	prometheus_declare_stat("opensips_cc");
	# the next two are equivalent
	prometheus_push_stat(10, "{gateway=\"gw1\"}"); # no label is being used
	prometheus_push_stat(10, "gateway", "gw1"); # same as the above
	...
}
```

## Configuration Examples

### Example 1.12. Prometheus Scrape Config

In order to have Prometheus query OpenSIPS for statistics, you need to tell him where to get statistics from. To do that, you should define a scarpe job in Prometheus's _scrape_configs_ config, indicating the IP and port you've configured the _httpd_ module to listen on (default: _0.0.0.0:8888_).

```opensips
scrape_configs:
  - job_name: opensips

    static_configs:
    - targets: \['localhost:8888'\]
```
