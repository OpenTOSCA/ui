FROM maven:3-jdk-8 as builder

WORKDIR /opt/opentosca/ui
COPY . /opt/opentosca/ui

RUN mvn package


FROM tomcat:8.5-jre8
LABEL maintainer "Michael Wurster <miwurster@gmail.com>"

WORKDIR ${CATALINA_HOME}/
RUN rm -rf webapps/*

RUN apt update && apt install gettext-base
COPY --from=builder /opt/opentosca/ui/target/opentosca-ui.war webapps/ROOT.war
COPY config_and_start.sh .

EXPOSE 8080

# URLs can be configured here
ENV API_ENDPOINT_HOST=""
ENV API_ENDPOINT_PORT=""
ENV WINERY_HOST=""
ENV WINERY_PORT=""

# write env vars into config file and start tomcat
CMD sh config_and_start.sh
