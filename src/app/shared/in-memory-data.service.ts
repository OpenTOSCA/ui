import {InMemoryDbService} from 'angular2-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        let applications = [
            {
                id: 1,
                name: 'Wordpress 2.3',
                categories: ['IoT Application', 'Cloud Application'],
                logoPath: '../../assets/demonstratorImages/Wordpress_App_Icon.png',
                description: 'Wordpres description text...',
                screenshots: [],
                topologyTemplatePath: '',
                version: '1.3',
                authors: 'Oliver Kopp, Kalman Kepes, Uwe Breitenbücher'
            },
            {
                id: 2,
                name: 'Redmine 4.0',
                categories: ['IoT Application', 'Cloud Application'],
                logoPath: '../../assets/demonstratorImages/Redmine_App_Icon.png',
                description: 'Redmine description text...',
                screenshots: [],
                topologyTemplatePath: '',
                version: '1.3',
                authors: 'Oliver Kopp, Kalman Kepes, Uwe Breitenbücher'
            },
            {
                id: 3,
                name: 'Moodle 2.3',
                categories: ['IoT Application', 'Cloud Application'],
                logoPath: '../../assets/demonstratorImages/Moodle_App_Icon.png',
                description: `Moodle bietet Ihnen virtuelle Räume zum Lernen und für Projektarbeit. Wir machen online Lernen
                        einfach. Setzen Sie Texte, Bilder und Multimedia ein. Erstellen Sie Aufgaben und Tests selber.
                        Diskutieren Sie Inhalte und benachrichtigen Sie die Teilnehmer per Mail. Erarbeiten Sie
                        gemeinsam Inhalte. Bilden Sie Kursgruppen. Erstellen Sie Lernpfade. Moodle ist Open-Source.
                        Installieren Sie Moodle auf Ihrem eigenen Server. Lizenzkostenfrei. Oder beauftragen Sie eLeDia
                        mit allen technischen Aspekten und konzentrieren Sie sich selber auf die Lernprozesse.`,
                screenshots: ['../../assets/demonstratorImages/MoodleScreenshot.jpg',
                    '../../assets/demonstratorImages/MoodleScreenshot.jpg',
                    '../../assets/demonstratorImages/MoodleScreenshot.jpg'],
                topologyTemplatePath: '../../assets/demonstratorImages/Topology.png',
                version: '1.3',
                authors: 'Oliver Kopp, Kalman Kepes, Uwe Breitenbücher'
            },
            {
                id: 4,
                name: 'Ubuntu 14.04',
                categories: ['IoT Application'],
                logoPath: '../../assets/demonstratorImages/Ubuntu_App_Icon.png',
                description: 'Ubuntu description text...',
                screenshots: [],
                topologyTemplatePath: '',
                version: '1.3',
                authors: 'Oliver Kopp, Kalman Kepes, Uwe Breitenbücher'
            }
        ];
        return {applications};
    }
}
