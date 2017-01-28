#!/usr/bin/env bash
jar cvf OpenTOSCAUi.war -C ./dist/ .
mkdir -p war
mv ./OpenTOSCAUi.war ./war/
