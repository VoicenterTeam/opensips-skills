# Configuration File v3.4
<!-- generated-from: data/3.4/guides/configuration.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: configuration_guide -->

Configuration walkthrough for OpenSIPs 3.4. Read this file when assembling an opensips.cfg from scratch or restructuring an existing one around the recommended section layout.

## Contents

- [Overview](#overview)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The OpenSIPS configuration file contains all the parameters that control the OpenSIPS core and modules, along with the actual routing logic that OpenSIPS will use to route the SIP traffic.

## Best Practices

### Validate Configuration Before Restart

Due to the fact that you must restart OpenSIPS every time you make a change to the configuration file, it is of vital importance to ensure that all the changes you have made are correct according to the OpenSIPS language syntax.
### Restart Required for Changes

If you do any change to the configuration file, in order for them to take effect, you MUST restart OpenSIPS.

## Troubleshooting

- **Checking configuration file validity** — Run `[INSTALL_PATH]/sbin/opensips -C [PATH_TO_CFG]`. If the cfg is OK, OpenSIPS will return 0. If the config file contains any errors, they will be displayed in the console and OpenSIPS will return -1.
