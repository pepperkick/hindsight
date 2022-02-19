# Hindsight

Check resources usage across multiple platforms.

## Running

### Configure

```json5
{
  "lighthouseMongodbUri": "",  // URL to lighthouse mongodb
  "discordWebhook": "",        // Discord webhook to notify orphan resources
  "label": "",                 // Label in tags for lighthouse-v2
  "longRunningLimit": ""       // Time in minutes that defines a long running resource
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