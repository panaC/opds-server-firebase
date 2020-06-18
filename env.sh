#! /bin/sh

`node -e "console.log(\"export GOOGLE_APPLICATION_CREDENTIALS=\" + require(\"./config.json\")[\"GOOGLE_APPLICATION_CREDENTIALS\"])"`

# source env.sh