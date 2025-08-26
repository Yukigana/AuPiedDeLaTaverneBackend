# AuPiedDeLaTaverneBackend


## Log Level Configuration

The application uses **Winston** for log management.  
The log level can be set using the environment variable `LOG_LEVEL`.  

### Available levels
- `crit` → Critical failure (system unavailable).  
- `error` → Error, the application remains operational.  
- `warn` → Suspicious or rare event.  
- `info` → General information (default).  
- `debug` → Detailed technical logs for development/debugging.  

### Usage example
```bash
# Default level (info)
npm start

# Debug level (all details)
LOG_LEVEL=debug npm start

# Critical level only (sensitive production mode)
LOG_LEVEL=crit npm start
```

## Analytics Solution (not implemented)

To centralize and analyze logs, an analytics solution could be added.  
We propose **ELK Stack (Elasticsearch + Logstash + Kibana)** as a reference option.

### Benefits
- **Centralization**: all logs are stored in a single Elasticsearch index.  
- **Advanced search**: filter logs by user, error type, or time period.  
- **Visualization**: create dynamic dashboards in Kibana to monitor system activity.  
- **Alerts**: configure automatic anomaly detection with notifications (email, Slack, etc.).  

### Implications
- **Additional infrastructure**: requires setting up and maintaining Elasticsearch and Kibana servers.  
- **Cost**: hosting and resource consumption can be significant depending on system load.  
- **Data privacy / GDPR**: logs may contain sensitive information that must be secured.  
- **Complexity**: adds operational overhead (monitoring, backups, upgrades).  
