# Hindsight

Check resources usage across multiple platforms.

## Running

### Configure

```json5
{
  "lighthouseMongodbUri": "",  // URL to lighthouse mongodb
  "discordWebhook": "",        // Discord webhook to notify orphan resources
  "label": "",                 // Label in tags for lighthouse-v2  
  "monitorLongRunningInstances": {
    "enabled": false,          // Enable long-running instances monitoring
    "threshold": 240           // Time in minutes to consider a long-running instance
  }
}
```

### Application

Use
```shell
npm run start
```

## License
All rights are reserved to Qixalite.

Permission must be granted explicitly by Qixalite to use, copy, modify, and distribute this code and its related documentation for any reason.