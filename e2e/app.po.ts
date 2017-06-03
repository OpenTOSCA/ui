import { browser, element, by } from 'protractor';

export class OpentoscaUiPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('opentosca-ui-root h1')).getText();
  }
}
