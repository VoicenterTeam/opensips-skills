# Configuration File v3.5
<!-- generated-from: data/3.5/guides/configuration.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: configuration_guide -->

Configuration walkthrough for OpenSIPs 3.5. Read this file when assembling an opensips.cfg from scratch or restructuring an existing one around the recommended section layout.

## Contents

- [Overview](#overview)
- [Best Practices](#best-practices)

## Overview

The OpenSIPS configuration file contains all the parameters that control the OpenSIPS core and modules, along with the actual routing logic that OpenSIPS will use to route the SIP traffic.

## Best Practices

### Restarting OpenSIPS

If you do any change to the configuration file, in order for them to take effect, you MUST restart OpenSIPS.
### Configuration Validation

Due to the fact that you must restart OpenSIPS every time you make a change to the configuration file, it is of vital importance to ensure that all the changes you have made are correct according to the OpenSIPS language syntax. You can check the OpenSIPS configuration file validity by running [INSTALL_PATH]/sbin/opensips -C [PATH_TO_CFG].
