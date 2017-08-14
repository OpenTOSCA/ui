FROM maven:3-jdk-8 as builder

RUN rm /dev/random && ln -s /dev/urandom /dev/random

WORKDIR /opt/opentosca/ui
COPY . /opt/opentosca/ui
RUN mvn package


FROM tomcat:8.5-jre8
LABEL maintainer "Michael Wurster <miwurster@gmail.com>"

RUN rm /dev/random && ln -s /dev/urandom /dev/random \
    && rm -rf ${CATALINA_HOME}/webapps/*

COPY --from=builder /opt/opentosca/ui/target/opentosca-ui.war ${CATALINA_HOME}/webapps/ROOT.war

EXPOSE 8080

CMD ${CATALINA_HOME}/bin/catalina.sh run
