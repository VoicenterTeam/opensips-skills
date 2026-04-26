# Compile and Install v4.0
<!-- generated-from: data/4.0/guides/installation.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: installation_guide -->

Compile and install instructions for OpenSIPs 4.0. Read this file when building OpenSIPs from source or preparing a deployment environment.

## Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Troubleshooting](#troubleshooting)

## Overview

The following page of the manual is addressed to users that want to compile and install OpenSIPS 4.0 from sources. It covers compiling, configuring flags, handling external module dependencies, and installation procedures.

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

Use the 'menuconfig' tool to change compile-time options like memory debugging allocator or TLS. Requires ncurses development library.

```bash
apt-get install libncurses5-dev
make menuconfig
```

Navigate to the 'Configure Compile Options' menu. Use arrow keys to navigate, SpaceBar to enable/disable, 'q' to go back, and 'Save Changes' to finish.

### Step 3: Compiling Modules with External Dependencies

Enable modules not compiled by default (like DB_MYSQL, JSON) using menuconfig.

```bash
make menuconfig
```

Go to 'Configure Excluded Modules'. Use SpaceBar to select modules. The tool will list dependencies required for compilation.

### Step 4: Install

Go to the sources root folder and run make install. By default, OpenSIPS will be installed in the / directory.

```bash
make install
```

### Step 5: Reduce compile time

Use the FASTER variable to leverage multi-core machines by compiling all modules in parallel.

```bash
FASTER=1 make -j4 install
```

The number of processes used should be equal or less than the number of cores. This variable suppresses most of the compile output.

### Step 6: Configuring Install Path

Change the OpenSIPS installation path using menuconfig.

```bash
make menuconfig
```

Go to 'Configure Install Prefix', type the custom directory, hit enter, and 'Save Changes'. Then run 'make install'.

## Troubleshooting

- **Changes to Compilation Flags not applied** — After any changes to the Compilation Flags, you should re-compile & re-install your OpenSIPS.
- **Modules with external dependencies fail to compile** — Ensure the required external dependencies (e.g., mysql devel library, external JSON parser) are installed on your system. The menuconfig tool will display the dependencies needed when you enable the module.
