FROM maven:3-jdk-8 as builder


ENV CONTAINER_API_HOST=localhost
ENV CONTAINER_API_PORT=1337
ENV WINERY_HOST=localhost
ENV WINERY_PORT=8080

RUN apt update && apt install gettext-base

WORKDIR /opt/opentosca/ui
COPY . /opt/opentosca/ui

RUN envsubst < src/app/store/store.module.ts.template > src/app/store/store.module.ts
RUN mvn package


FROM tomcat:8.5-jre8
LABEL maintainer "Michael Wurster <miwurster@gmail.com>"

RUN rm -rf ${CATALINA_HOME}/webapps/*

COPY --from=builder /opt/opentosca/ui/target/opentosca-ui.war ${CATALINA_HOME}/webapps/ROOT.war

EXPOSE 8080

CMD ${CATALINA_HOME}/bin/catalina.sh run
