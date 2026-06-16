# Research & Decisions: OBS Plugin Wrapper

## 1. Plugin Technology Choice

**Decision**: Use an OBS Lua Script (`.lua`) instead of a C++ Plugin.

**Rationale**:
- **Cross-Platform Compatibility**: Lua scripts run seamlessly on Windows, macOS, and Linux without requiring a dedicated compilation toolchain for each OS.
- **API Access**: The OBS Lua API provides full access to the required features: drawing settings UIs, subscribing to OBS lifecycle events (start/stop/save), and creating Browser Sources.
- **Maintainability**: A single `.lua` file is easier to distribute and maintain alongside a Node.js monorepo.

**Alternatives Considered**:
- *C++ Plugin*: Rejected due to the high maintenance burden of compiling binaries for different OBS versions and operating systems.
- *OBS Python Script*: Rejected because it requires the user to manually install Python and configure the Python path in OBS, which adds friction to the installation process.

## 2. Managing the Node.js Lifecycle

**Decision**: Use `os.execute` (or platform-specific native process spawning in Lua like `io.popen`) to run the Node.js local server in the background.

**Rationale**:
- The OBS script can capture the `script_load` and `script_unload` events to respectively start and stop the `apps/local-server` Node.js process.
- Storing the process ID (PID) locally allows the script to safely terminate the process if OBS is closed abruptly.

## 3. Settings UI Construction

**Decision**: Use the built-in OBS property objects (`obs_properties_create`, `obs_properties_add_text`, etc.) to define the UI.

**Rationale**:
- Native integration. It automatically renders correctly within the "Scripts" settings dialog in OBS.
- Data is automatically saved by OBS to the script's configuration file, so channel IDs persist between sessions.
