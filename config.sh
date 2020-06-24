#! /bin/sh

firebase functions:config:set server.port=80
firebase functions:config:set server.name="opds-server"
firebase functions:config:set server.domain="my-domain"
firebase functions:config:set server.protocol="https"
firebase functions:config:set server.path=""
firebase functions:config:get