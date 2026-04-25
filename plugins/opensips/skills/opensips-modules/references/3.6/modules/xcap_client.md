# xcap_client Module Reference
<!-- generated-from: data/3.6/modules/xcap_client.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 xcap_client module. Read this file when configuring or debugging the xcap_client module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The modules is an XCAP client for OpenSIPS that can be used by other modules. It fetches XCAP elements, either documents or part of them, by sending HTTP GET requests. It also offers support for conditional queries. It uses libcurl library as a client-side HTTP transfer library.

The module offers an xcap client interface with general functions that allow requesting for an specific element from an xcap server. In addition to that it also offers the service of storing and update in database the documents it receives. In this case only an initial request to the module is required - xcapGetNewDoc-which is like a request to the module to handle from that point on the referenced document so as to promise that the newest version will always be present in database.

The update method is also configurable, either through periodical queries, applicable to any kind of xcap server or with an MI command that should be sent by the server upon an update.

The module is currently used by the presence_xml module, if the 'integrated_xcap_server' parameter is not set.

## Dependencies

### OpenSIPs Modules

- `xcap`

### External Libraries

- `libcurl-dev`
- `libxml-dev`

## Exported Parameters

### `periodical_query` (integer)

A flag to disable periodical query as an update method for the documents the module is responsible for. It could be disabled when the xcap server is capable to send the exported MI command when a change occurs or when another module in OpenSIPS handles updates.

To disable it set this parameter to 0.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("xcap\_client", "periodical\_query", 0)
```
### `query_period` (integer)

Should be set if periodical query is not disabled. Represents the time interval the xcap servers should be queried for an update

To disable it set this parameter to 0.

*Default value is 100.*

**Example.** 50.

```opensips
modparam("xcap\_client", "query\_period", 50)
```

## Exported MI Functions

### `refreshXcapDoc`

MI command that should be sent by an xcap server when a stored document changes.

**Parameters:**

- `doc_uri` *(string, required)* — the uri of the document
- `port` *(integer, required)* — the port of the xcap server

**Example.** Refreshes an XCAP document using the CLI

```opensips-cli
opensips-cli -x mi refreshXcapDoc /xcap-root/resource-lists/users/eyebeam/buddies-resource-list.xml 8000
```

## Configuration Examples

### Set `periodical_query` parameter

To disable it set this parameter to 0.

```opensips
...
modparam("xcap_client", "periodical_query", 0)
...
```
### Set `query_period` parameter

Should be set if periodical query is not disabled. Represents the time interval the xcap servers should be queried for an update

```opensips
...
modparam("xcap_client", "query_period", 50)
...
```
