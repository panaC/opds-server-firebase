# opds-server-firebase
opds2 server on Google Firebase


## setup

### create a project

create a [firebase](https://console.firebase.google.com) project

#### the project uses 3 firebase features :

- Functions
- firestore : realTime database (enable it !)
- storage : file storage (enable it with an empty "publication" bucket)

### firebase CLI 

https://firebase.google.com/docs/cli/

    npm install -g firebase-tools

#### login with your google account

    firebase login

#### init the project in your computer

    firebase init

follow the guide

### authentification

to link your project with firebase, you need a private key generate by the firebase console: 

https://firebase.google.com/docs/admin/setup?authuser=0

![1](images/img1.png)

and click on 'generate a new key'

download the file in /functions and rename it "serviceAccountKey.json" .. Be carefull, it's important in codebase to respect the filename.

    it's not tracked by git

![2](images/img2.png)

### seting up the global env

in a shell :

    source env.sh

and check if GOOGLE_APPLICATION_CREDENTIALS is set :

    env | grep "GOO"


### firebase config key

setup the configuration key of the name of your server and algolia
text indexer services.

in `config.sh` file tunes this parameter:
```

firebase functions:config:set server.port=80
firebase functions:config:set server.name="opds-server"
firebase functions:config:set server.domain="my-domain"
firebase functions:config:set server.protocol="https"
firebase functions:config:set server.path=""


firebase functions:config:set algolia.appid=""
firebase functions:config:set algolia.apikey=""
firebase functions:config:set algolia.enabled=""

```

and then execute it

    ./config.sh

### once all is configured

### you can simulate it in your computer (localhost)

    firebase emulators:start

### and you can simply deploy it in firebase server

    firebase deploy
