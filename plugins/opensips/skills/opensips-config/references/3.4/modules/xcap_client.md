# xcap_client Module Reference
<!-- generated-from: data/3.4/modules/xcap_client.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 xcap_client module. Read this file when configuring or debugging the xcap_client module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
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
modparam("xcap_client", "periodical_query", 0)
```
### `query_period` (integer)

Should be set if periodical query is not disabled. Represents the time interval the xcap servers should be queried for an update

To disable it set this parameter to 0.

*Default value is 100.*

**Example.** 50.

```opensips
modparam("xcap_client", "query_period", 50)
```

## Exported Functions

### `bind_xcap_client_api(xcap_client_api_t* api)`

This function allows binding the needed functions.

**Parameters:**

- `api` *(xcap_client_api_t*, required)* — Pointer to the API structure.

**Usable from:** C_API

**Example.** xcap_client_api structure.

```c
typedef struct xcap_client_api {

	/* xcap node selection and retrieving functions*/
	xcap_get_elem_t get_elem;
	xcap_nodeSel_init_t int_node_sel;
	xcap_nodeSel_add_step_t add_step;
	xcap_nodeSel_add_terminal_t add_terminal;
	xcap_nodeSel_free_t free_node_sel;
	xcapGetNewDoc_t getNewDoc; /* an initial request for the module 
	fo fetch this document that does not exist in xcap db table
	and handle its update*/

	/* function to register a callback to document changes*/
	register_xcapcb_t register_xcb;
}xcap_client_api_t;
```

### `char* get_elem(char* xcap_root, xcap_doc_sel_t* doc_sel, xcap_node_sel_t* node_sel)`

This function sends a HTTP request and gets the specified information from the xcap server.

**Parameters:**

- `doc_sel` *(xcap_doc_sel_t*, required)* — structure with document selection info
- `node_sel` *(xcap_node_sel_t*, required)* — structure with node selection info
- `xcap_root` *(char*, required)* — the XCAP server address

**Usable from:** C_API

### `refreshXcapDoc(doc_uri, port)`

MI command that should be sent by an xcap server when a stored document changes.

**Parameters:**

- `doc_uri` *(string, required)* — the uri of the document
- `port` *(integer, required)* — the port of the xcap server

**Usable from:** MI_COMMAND

**Example.** MI FIFO Command Format.

```bash
opensips-cli -x mi refreshXcapDoc /xcap-root/resource-lists/users/eyebeam/buddies-resource-list.xml 8000
```

### `int register_xcb(int types, xcap_cb f)`

Registers a callback to be called when a MI command refreshXcapDoc is received and the document in question is retrieved.

**Parameters:**

- `f` *(xcap_cb, required)* — the callback function
- `types` *(int, required)* — can have a combined value of PRES_RULES, RESOURCE_LISTS, RLS_SERVICES, OMA_PRES_RULES and PIDF_MANIPULATION.
  - `PRES_RULES`
  - `RESOURCE_LISTS`
  - `RLS_SERVICES`
  - `OMA_PRES_RULES`
  - `PIDF_MANIPULATION`

**Usable from:** C_API

## Exported MI Functions

### `refreshXcapDoc`

MI command that should be sent by an xcap server when a stored document changes.

**Parameters:**

- `doc_uri` *(string, required)* — the uri of the document
- `port` *(integer, required)* — the port of the xcap server

**Example.** Refreshes an XCAP document using the MI interface

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

Represents the time interval the xcap servers should be queried for an update

```opensips
...
modparam("xcap_client", "query_period", 50)
...
```
