# opentelemetry Module Reference
<!-- generated-from: data/4.0/modules/opentelemetry.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 opentelemetry module. Read this file when configuring or debugging the opentelemetry module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The _opentelemetry_ module provides OpenTelemetry tracing for OpenSIPS route execution. It creates a root span per processed SIP message and a child span for each route entry.

## How It Works

The root SIP message span follows a local semantic convention inspired by the OpenTelemetry HTTP span conventions: it uses a method-plus-target span name, server/client/internal span kinds based on the OpenSIPS route type, and generic network, client, server and URL attributes wherever they fit the SIP model. Spans include common SIP attributes (request method, Call-ID, CSeq, response status) and connection metadata. While a span is active, OpenSIPS logs can be attached as OpenTelemetry events for easier correlation. Trace data is exported via the OTLP/HTTP exporter from the OpenTelemetry C++ SDK. The local SIP span convention emitted by this module is documented in `modules/opentelemetry/semantic-convention/sip-spans.md`.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `OpenTelemetry C++ SDK (opentelemetry-cpp)` — Must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `enable` (integer)

Enables or disables OpenTelemetry tracing at startup. It can also be changed at runtime using the `opentelemetry:enable` MI command.

The module is built only when the OpenTelemetry C++ SDK is available at build time.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("opentelemetry", "enable", 1)
```
### `exporter_endpoint` (string)

Overrides the OTLP/HTTP exporter endpoint. If empty, the OpenTelemetry SDK default is used.

*Default value is empty.*

**Example.** http://127.0.0.1:4318/v1/traces.

```opensips
modparam("opentelemetry", "exporter_endpoint", "http://127.0.0.1:4318/v1/traces")
```
### `log_level` (integer)

Log level threshold used by the OpenTelemetry log consumer when attaching log events to the active span.

*Default value is L_DBG.*

**Example.** 3.

```opensips
modparam("opentelemetry", "log_level", 3)
```
### `proc_profiling` (integer)

If enabled, the module will also profile/trace the OpenSIPS processes, not only the script.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("opentelemetry", "proc_profiling", 1)
```
### `service_name` (string)

Sets the OpenTelemetry “service.name” resource attribute.

*Default value is opensips.*

**Example.** edge-proxy.

```opensips
modparam("opentelemetry", "service_name", "edge-proxy")
```
### `use_batch` (integer)

Selects the OpenTelemetry span processor. When enabled, the module uses the batch span processor; otherwise it uses the simple span processor.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("opentelemetry", "use_batch", 0)
```

## Exported MI Functions

### `opentelemetry:enable`

Replaces obsolete MI command: _otel_enable_. Enables or disables OpenTelemetry tracing at runtime.

**Parameters:**

- `enable` *(integer, required)* — set to “1” to enable tracing or “0” to disable it.

**Example.** MI FIFO Command Format

```opensips-cli
		## enable tracing
		opensips-cli -x mi opentelemetry:enable enable=1
		## disable tracing
		opensips-cli -x mi opentelemetry:enable enable=0
```

## Configuration Examples

### Set `enable` parameter

Enables or disables OpenTelemetry tracing at startup. It can also be changed at runtime using the `opentelemetry:enable` MI command.

```opensips
...modparam("opentelemetry", "enable", 1)...
```
### Set `proc_profiling` parameter

If enabled, the module will also profile/trace the OpenSIPS processes, not only the script.

```opensips
...modparam("opentelemetry", "proc_profiling", 1)...
```
### Set `log_level` parameter

Log level threshold used by the OpenTelemetry log consumer when attaching log events to the active span.

```opensips
...modparam("opentelemetry", "log_level", 3)...
```
### Set `use_batch` parameter

Selects the OpenTelemetry span processor. When enabled, the module uses the batch span processor; otherwise it uses the simple span processor.

```opensips
...modparam("opentelemetry", "use_batch", 0)...
```
### Set `service_name` parameter

Sets the OpenTelemetry “service.name” resource attribute.

```opensips
...modparam("opentelemetry", "service_name", "edge-proxy")...
```
### Set `exporter_endpoint` parameter

Overrides the OTLP/HTTP exporter endpoint. If empty, the OpenTelemetry SDK default is used.

```opensips
...modparam("opentelemetry", "exporter_endpoint", "http://127.0.0.1:4318/v1/traces")...
```
