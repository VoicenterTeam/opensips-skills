# presence_mwi Module Reference
<!-- generated-from: data/3.6/modules/presence_mwi.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 presence_mwi module. Read this file when configuring or debugging the presence_mwi module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)

## Overview

The module does specific handling for notify-subscribe message-summary (message waiting indication) events as specified in RFC 3842. It is used with the general event handling module, presence. It constructs and adds message-summary event to it.

The module does not currently implement any authorization rules. It assumes that publish requests are only issued by a voicemail application and subscribe requests only by the owner of voicemail box. Authorization can thus be easily done by OpenSIPS configuration file before calling handle_publish() and handle_subscribe() functions.

The module implements a simple check of content type application/simple-message-summary: Content must start with Messages-Waiting status line followed by zero or more lines that consist of tabs and printable ASCII characters.

## Dependencies

### OpenSIPs Modules

- `presence`

### External Libraries

None.
