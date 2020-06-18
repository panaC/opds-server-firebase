# opds-server-firebase
opds2 server on Google Firebase


## build

save `sourceAccountKey.json` from gcp firebase

create and fill `config.json` like this : 
```
{
    "FIREBASE_CONFIG": {
        "databaseURL": "https://projectId.firebaseio.com",
        "storageBucket": "projectId.appspot.com",
        "projectId": "projectId"
    },
    "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/serviceAccountKey.json"
}
```

and then exec : `source env.sh`
