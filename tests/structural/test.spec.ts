import { createSampleTest } from '../core/fixtures/sampleFixture';
import { checkPluginAvailability } from '../core/fixtures/sampleBeforeAll';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../elements';
import { SessionPage as ModPage } from '../core/sessionPage';

const PLUGIN_NAME = 'pick-random-user-plugin';
const ENV_VAR_NAME = 'PICK_RANDOM_USER_PLUGIN_URL';

const { test, setPluginUrl, getPluginUrl } = createSampleTest({
  envVarName: ENV_VAR_NAME,
  getPluginUrl: () => process.env[ENV_VAR_NAME],
});

/** Helper: open the plugin modal from the actions dropdown. */
async function openPickRandomUserModal(
  modPage: ModPage,
) {
  await modPage.page.waitForSelector(e.whiteboard, { timeout: ELEMENT_WAIT_LONGER_TIME });
  await modPage.page.click(e.actions);
  await modPage.hasElement(e.pickRandomUserActionButton, 'action button should be visible');
  await modPage.page.click(e.pickRandomUserActionButton);
}

test.describe.parallel('Pick Random User Plugin – Structural', () => {
  test.beforeAll(checkPluginAvailability({
    pluginName: PLUGIN_NAME,
    envVarName: ENV_VAR_NAME,
    setPluginUrl,
    getPluginUrl,
  }));

  test('should show "Pick random user" label in the actions dropdown for a presenter', async ({ sampleTest }): Promise<void> => {
    await sampleTest.modPage.page.waitForSelector(
      e.whiteboard,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await sampleTest.modPage.page.click(e.actions);
    await sampleTest.modPage.hasElement(
      e.pickRandomUserActionButton,
      'should display the plugin action-button item',
    );
    await sampleTest.modPage.hasText(
      e.pickRandomUserActionButton,
      'Pick random user',
      'should display the correct label "Pick random user"',
    );
  });

  test('should open the presenter modal when clicking the action-button option', async ({ sampleTest }): Promise<void> => {
    await openPickRandomUserModal(sampleTest.modPage);
    await sampleTest.modPage.hasElement(
      e.includeModeratorsCheckbox,
      'should show the modal presenter view with the "Include moderators" checkbox',
    );
    await sampleTest.modPage.hasElement(
      e.pickRandomUserAvailableContent,
      'should display the "Available for selection" section',
    );
  });

  test('should display all three filter checkboxes in the presenter view', async ({ sampleTest }): Promise<void> => {
    await openPickRandomUserModal(sampleTest.modPage);
    await sampleTest.modPage.hasElement(
      e.includeModeratorsCheckbox,
      'should display the "Include moderators" checkbox',
    );
    await sampleTest.modPage.hasElement(
      e.includePresenterCheckbox,
      'should display the "Include presenter" checkbox',
    );
    await sampleTest.modPage.hasElement(
      e.includePickedUsersCheckbox,
      'should display the "Include already picked user" checkbox',
    );
  });

  test('should have all three filter checkboxes unchecked by default', async ({ sampleTest }): Promise<void> => {
    await openPickRandomUserModal(sampleTest.modPage);
    await test.expect(
      sampleTest.modPage.getLocator(e.includeModeratorsCheckbox),
      '"Include moderators" should be unchecked by default',
    ).not.toBeChecked();
    await test.expect(
      sampleTest.modPage.getLocator(e.includePresenterCheckbox),
      '"Include presenter" should be unchecked by default',
    ).not.toBeChecked();
    await test.expect(
      sampleTest.modPage.getLocator(e.includePickedUsersCheckbox),
      '"Include already picked user" should be unchecked by default',
    ).not.toBeChecked();
  });

  test('should show "no users" warning and hide the pick button with default filters (only presenter in meeting)', async ({ sampleTest }): Promise<void> => {
    // Default: includeModerators=false, includePresenter=false →
    // the single moderator/presenter user is excluded by both rules → 0 eligible.
    await openPickRandomUserModal(sampleTest.modPage);
    await sampleTest.modPage.hasElement(
      e.pickRandomUserNoUsersWarning,
      'should show the "No {0} available" warning when 0 users are eligible',
    );
    await sampleTest.modPage.wasRemoved(
      e.pickRandomUserPickButton,
      'should NOT render the pick button when there are no eligible users',
      ELEMENT_WAIT_TIME,
    );
  });
});
