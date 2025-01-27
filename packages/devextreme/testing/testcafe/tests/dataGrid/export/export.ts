import url from '../../../helpers/getPageUrl';
import createWidget from '../../../helpers/createWidget';
import DataGrid from '../../../model/dataGrid';

fixture.disablePageReloads`Export`
  .page(url(__dirname, '../../container.html'));

const GRID_CONTAINER = '#container';

test('Warning should be thrown in console if exporting is enabled, but onExporting is not specified', async (t) => {
  const consoleMessages = await t.getBrowserConsoleMessages();
  const isWarningExist = !!consoleMessages?.warn.find((message) => message.startsWith('W1024'));

  await t.expect(isWarningExist).ok();
}).before(async () => {
  await createWidget('dxDataGrid', {
    dataSource: [],
    export: {
      enabled: true,
    },
  });
});

test('Warning should be thrown in console if exporting is enabled dynamically, but onExporting is not specified', async (t) => {
  const dataGrid = new DataGrid(GRID_CONTAINER);

  await dataGrid.option('export.enabled', true);

  const consoleMessages = await t.getBrowserConsoleMessages();
  const isWarningExist = !!consoleMessages?.warn.find((message) => message.startsWith('W1024'));

  await t.expect(isWarningExist).ok();
}).before(async () => {
  await createWidget('dxDataGrid', {
    dataSource: [],
  });
});
