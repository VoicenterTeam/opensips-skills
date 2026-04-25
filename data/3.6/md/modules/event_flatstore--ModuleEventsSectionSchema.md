## 1.8.�Exported Events

### 1.8.1.� `E_FLATSTORE_ROTATION`

The event is raised every time _event\_flatstore_ opens a new log file (manual **evi\_flat\_rotate**, auto-rotate by `rotate_period`, or thresholds `rotate_count`/`rotate_size`). External apps can subscribe to monitor log-rotation activity.

Parameters:

*   _timestamp_ – Unix epoch (seconds) when the rotation was performed.
    
*   _reason_ – one of the strings _count_, _size_, _period_ or _mi_.
    
*   _filename_ – full path of the new log file.
    
*   _old\_filename_ – full path of the previous log file, or empty string if none existed.