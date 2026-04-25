# Configuration File v3.6
<!-- generated-from: data/3.6/guides/configuration.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: configuration_guide -->

Configuration walkthrough for OpenSIPs 3.6. Read this file when assembling an opensips.cfg from scratch or restructuring an existing one around the recommended section layout.

## Contents

- [Overview](#overview)
- [Best Practices](#best-practices)

## Overview

The OpenSIPS configuration file contains all the parameters that control the OpenSIPS core and modules, along with the actual routing logic that OpenSIPS will use to route the SIP traffic.

## Best Practices

### Restarting OpenSIPS

If you do any change to the configuration file, in order for them to take effect, you MUST restart OpenSIPS.
### Checking Configuration Validity

Ensure that all changes are correct according to the OpenSIPS language syntax by running the validation command [INSTALL_PATH]/sbin/opensips -C [PATH_TO_CFG] before restarting.
