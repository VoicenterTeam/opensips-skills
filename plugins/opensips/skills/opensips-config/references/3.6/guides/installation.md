# Compile and Install v3.6
<!-- generated-from: data/3.6/guides/installation.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: installation_guide -->

Compile and install instructions for OpenSIPs 3.6. Read this file when building OpenSIPs from source or preparing a deployment environment.

## Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)

## Overview

The following page of the manual is addressed to users that want to compile and install OpenSIPS 3.6 from sources.

## Prerequisites

- ncurses development library (required) — Required for running the menuconfig tool.
- mysql devel library (optional) — Required for compiling the DB_MYSQL module.
- external JSON parser (optional) — Required for compiling the JSON module.

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

Navigate to the 'Configure Compile Options' menu. Use arrow keys to navigate, SpaceBar to enable/disable, 'q' to go back, and 'Save Changes' to finish. After any changes, re-compile & re-install OpenSIPS.

### Step 3: Compiling Modules with External Dependencies

Enable modules not compiled by default (like DB_MYSQL or JSON) that require external dependencies using the menuconfig tool.

```bash
make menuconfig
```

Go to 'Configure Excluded Modules'. Use SpaceBar to select modules. The tool will display required dependencies. After any changes, re-compile & re-install OpenSIPS.

### Step 4: Install

Install OpenSIPS to the default directory (/) by running make install from the sources root folder.

```bash
make install
```

By default, OpenSIPS will be installed in the / directory.

### Step 5: Reduce compile time

Use the FASTER variable to leverage multi-core machines for parallel compilation.

```bash
FASTER=1 make -j4 install
```

The number of processes used should be equal or less than the number of cores. This variable suppresses most of the compile output.

### Step 6: Configuring Install Path

Change the OpenSIPS installation path using the menuconfig tool.

```bash
make menuconfig
make install
```

Run 'make menuconfig', go to 'Configure Install Prefix', type the custom directory, and 'Save Changes'. Then run 'make install'.
