# Compile and Install v3.5
<!-- generated-from: data/3.5/guides/installation.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: installation_guide -->

Compile and install instructions for OpenSIPs 3.5. Read this file when building OpenSIPs from source or preparing a deployment environment.

## Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Best Practices](#best-practices)

## Overview

The following page of the manual is addressed to users that want to compile and install OpenSIPS 3.5 from sources.

## Prerequisites

- ncurses development library (required) — Required for the curses-based menuconfig tool.
- External module dependencies (optional) — Required for specific modules not compiled by default, such as mysql devel library for DB_MYSQL or external JSON parser for JSON.

## Installation Steps

### Step 1: Compile

Navigate to the OpenSIPS sources root folder. From this folder you can simply run make all and the OpenSIPS core, along with all it's configured modules, will be compiled.

```bash
make all
```

### Step 2: Configuring Compilation Flags

Use the 'menuconfig' tool to change compile-time options like memory debugging allocator or TLS. Before running menuconfig, install the ncurses development library.

```bash
apt-get install libncurses5-dev
make menuconfig
```

Navigate to the 'Configure Compile Options' menu. Use arrow keys to navigate, SpaceBar to enable/disable, 'q' to go back, and 'Save Changes' to finish. After any changes to the Compilation Flags, you should re-compile & re-install your OpenSIPS.

### Step 3: Compiling Modules with External Dependencies

Enable modules that are not compiled by default because they require external dependencies (e.g., DB_MYSQL, JSON).

```bash
make menuconfig
```

Run 'make menuconfig' and go to 'Configure Excluded Modules'. Use SpaceBar to select modules, 'q' to go back, and 'Save Changes'. The tool will display required dependencies. After any changes to the Compilation Flags, you should re-compile & re-install your OpenSIPS.

### Step 4: Install

Install OpenSIPS to the default directory (/).

```bash
make install
```

By default, OpenSIPS will be installed in the / directory.

### Step 5: Reduce compile time

Use the FASTER variable to leverage multi-core machines for parallel compilation.

```bash
FASTER=1 make -j4 install
```

This method might use a large amount of resources. The number of processes used should be equal or less than the number of cores. This variable suppresses most of the compile output.

### Step 6: Configuring Install Path

Change the OpenSIPS installation path using menuconfig.

```bash
make menuconfig
make install
```

Run 'make menuconfig', go to 'Configure Install Prefix', type the custom directory, and hit enter. Save changes and run 'make install' again.

## Best Practices

### Re-compile after changes

After any changes to the Compilation Flags, you should re-compile & re-install your OpenSIPS.
### Parallel Compilation

Use the FASTER variable on multi-core machines to reduce compile time, ensuring the number of processes does not exceed the number of cores.
