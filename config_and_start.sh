#!/bin/bash

unzip -d webapps/ROOT webapps/ROOT.war # unzip .war file
envsubst < webapps/ROOT/assets/config.json.template > webapps/ROOT/assets/config.json # substitute env vars into config file

sh bin/catalina.sh run # start tomcat
