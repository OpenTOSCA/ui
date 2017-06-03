import { OpentoscaUiPage } from './app.po';

describe('opentosca-ui App', () => {
  let page: OpentoscaUiPage;

  beforeEach(() => {
    page = new OpentoscaUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('opentosca-ui works!');
  });
});
