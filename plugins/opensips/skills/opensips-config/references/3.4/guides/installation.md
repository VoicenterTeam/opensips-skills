# Compile and Install v3.4
<!-- generated-from: data/3.4/guides/installation.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: installation_guide -->

Compile and install instructions for OpenSIPs 3.4. Read this file when building OpenSIPs from source or preparing a deployment environment.

## Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)

## Overview

The following page of the manual is addressed to users that want to compile and install OpenSIPS 3.4 from sources.

## Prerequisites

- ncurses development library (required) — Required for running the curses-based menuconfig tool to configure compilation options.
- mysql devel library (optional) — Required for compiling the DB_MYSQL module.
- external JSON parser (optional) — Required for compiling the JSON module.

## Installation Steps

### Step 1: Compile OpenSIPS

Navigate to the OpenSIPS sources root folder and compile the core and configured modules.

```bash
make all
```

### Step 2: Configure Compilation Flags

Install ncurses and use menuconfig to change compile-time options like memory debugging or TLS support.

```bash
apt-get install libncurses5-dev
make menuconfig
```

Navigate to 'Configure Compile Options'. Use SpaceBar to toggle options. Save changes and re-compile.

### Step 3: Compiling Modules with External Dependencies

Use menuconfig to enable modules that require external libraries (e.g., DB_MYSQL, JSON).

```bash
make menuconfig
```

Go to 'Configure Excluded Modules'. Select modules with SpaceBar. Save changes. The tool will list required dependencies to install.

### Step 4: Install OpenSIPS

Install the compiled OpenSIPS binaries and files to the system.

```bash
make install
```

By default, OpenSIPS will be installed in the / directory.

### Step 5: Reduce Compile Time

Use parallel compilation to speed up the build process on multi-core machines.

```bash
FASTER=1 make -j4 install
```

Replace '4' with the number of cores. This method uses significant resources and suppresses most compile output.

### Step 6: Configure Install Path

Change the default installation directory using menuconfig.

```bash
make menuconfig
```

Go to 'Configure Install Prefix', type the custom directory, save, and run 'make install'.
