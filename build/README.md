# OpenTOSCA UI: Production Build

We use Spring Boot and Spring Boot's Maven plugin to build a self-contained WAR archive (prerequisites: Java 8, Maven 3.x).

1. Build the WAR archive:

    ```shell
    mvn package
    ```

2. Run the self-contained WAR archive (or deploy it to a Apache Tomcat server instance):

    ```shell
    java -jar target\opentosca-ui-${version}.war
    ```

    Afterwards, open a browser and navigate to [http://localhost:8080/opentosca](http://localhost:8080/opentosca).
