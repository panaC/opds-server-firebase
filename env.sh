#! /bin/sh

# `node -e "console.log(\"export GOOGLE_APPLICATION_CREDENTIALS=\" + require(\"./config.json\")[\"GOOGLE_APPLICATION_CREDENTIALS\"])"`

export GOOGLE_APPLICATION_CREDENTIALS="`pwd`/functions/serviceAccountKey.json"

# source env.sh