/**
 * Behavioural tests – single user (moderator / presenter only).
 *
 * These tests exercise the pick-and-track workflow: picking a user, verifying
 * the "Previously picked" list, and exercising the Clear All and filter
 * interactions that affect the eligible-user count.
 *
 * Setup: one BBB meeting, one participant (moderator who is also presenter).
 * The "Include moderators" and "Include presenter" filters are always enabled
 * so the presenter can pick themselves.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
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

async function openModal(modPage: ModPage): Promise<void> {
  await modPage.page.waitForSelector(e.whiteboard, { timeout: ELEMENT_WAIT_LONGER_TIME });
  await modPage.page.click(e.actions);
  await modPage.hasElement(e.pickRandomUserActionButton, 'action button should appear');
  await modPage.page.click(e.pickRandomUserActionButton);
}

/** Enable both inclusion filters so the single moderator/presenter is eligible. */
async function enableInclusionFilters(modPage: ModPage): Promise<void> {
  await modPage.page.click(e.includeModeratorsCheckbox);
  await modPage.page.click(e.includePresenterCheckbox);
  await modPage.hasElement(
    e.pickRandomUserPickButton,
    'pick button should appear after enabling both inclusion filters',
    ELEMENT_WAIT_LONGER_TIME,
  );
}

/** Enable all three filters (include picked users too, so "Pick again" is reachable). */
async function enableAllFilters(modPage: ModPage): Promise<void> {
  await modPage.page.click(e.includeModeratorsCheckbox);
  await modPage.page.click(e.includePresenterCheckbox);
  await modPage.page.click(e.includePickedUsersCheckbox);
  await modPage.hasElement(
    e.pickRandomUserPickButton,
    'pick button should appear after enabling all filters',
    ELEMENT_WAIT_LONGER_TIME,
  );
}

/** Pick a user and wait for the picked-user view to appear. */
async function pickUser(modPage: ModPage): Promise<void> {
  await modPage.page.click(e.pickRandomUserPickButton);
  await modPage.hasElement(
    e.pickRandomUserPickedUserViewTitle,
    'picked-user view should appear after clicking pick',
    ELEMENT_WAIT_LONGER_TIME,
  );
}

/** Click the back button to return from picked-user view to presenter view. */
async function goBackToPresenterView(modPage: ModPage): Promise<void> {
  await modPage.hasElement(e.pickRandomUserBackButton, 'back button should be visible');
  await modPage.page.click(e.pickRandomUserBackButton);
  await modPage.hasElement(
    e.includeModeratorsCheckbox,
    'presenter view should be restored after clicking back',
    ELEMENT_WAIT_TIME,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe.parallel('Pick Random User Plugin – Behavioural (single user)', () => {
  test.beforeAll(checkPluginAvailability({
    pluginName: PLUGIN_NAME,
    envVarName: ENV_VAR_NAME,
    setPluginUrl,
    getPluginUrl,
  }));

  test('should show "Pick again" button (not "Pick user") after navigating back from picked-user view', async ({ sampleTest }): Promise<void> => {
    // With "Include already picked users" ON the presenter stays in the pool
    // after being picked, so the pick button remains visible on return.
    await openModal(sampleTest.modPage);
    await enableAllFilters(sampleTest.modPage);
    await pickUser(sampleTest.modPage);
    await goBackToPresenterView(sampleTest.modPage);

    await sampleTest.modPage.hasElement(
      e.pickRandomUserPickButton,
      'pick button should still be visible (includePickedUsers is enabled)',
    );
    await sampleTest.modPage.hasText(
      e.pickRandomUserPickButton,
      'Pick again',
      'button label should read "Pick again" after a user has already been picked',
    );
  });

  test('should list the picked user in the "Previously picked" section after picking', async ({ sampleTest }): Promise<void> => {
    await openModal(sampleTest.modPage);
    await enableAllFilters(sampleTest.modPage);
    await pickUser(sampleTest.modPage);
    await goBackToPresenterView(sampleTest.modPage);

    // The "Previously picked" <ul> should contain at least one <li> entry.
    const pickedList = sampleTest.modPage.getLocator(
      `${e.pickRandomUserPreviouslyPickedList} li`,
    );
    await pickedList.first().waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME });
    const count = await pickedList.count();
    test.expect(count, 'previously-picked list should have at least one entry after picking').toBeGreaterThanOrEqual(1);
  });

  test('should empty the "Previously picked" list when "Clear All" is clicked', async ({ sampleTest }): Promise<void> => {
    await openModal(sampleTest.modPage);
    await enableAllFilters(sampleTest.modPage);
    await pickUser(sampleTest.modPage);
    await goBackToPresenterView(sampleTest.modPage);

    // Confirm there is at least one entry before clearing.
    const pickedList = sampleTest.modPage.getLocator(
      `${e.pickRandomUserPreviouslyPickedList} li`,
    );
    await pickedList.first().waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME });

    // Click Clear All.
    await sampleTest.modPage.page.click(e.pickRandomUserClearAllButton);

    // The list should now be empty.
    await sampleTest.modPage.wasRemoved(
      `${e.pickRandomUserPreviouslyPickedList} li`,
      '"Previously picked" list should be empty after clicking "Clear All"',
      ELEMENT_WAIT_LONGER_TIME,
    );
  });

  test('should drop available count to 0 and show "no users" warning after picking with "Include already picked users" unchecked', async ({ sampleTest }): Promise<void> => {
    // With includePickedUsers=false (default), a picked user is immediately
    // removed from the eligible pool after being selected.
    await openModal(sampleTest.modPage);
    await enableInclusionFilters(sampleTest.modPage); // does NOT enable includePickedUsers

    // Verify 1 user is available before picking.
    await sampleTest.modPage.hasText(
      e.pickRandomUserAvailableContent,
      '1 user',
      '"1 user" should be displayed before picking',
    );

    await pickUser(sampleTest.modPage);
    await goBackToPresenterView(sampleTest.modPage);

    // After picking, the presenter is now in the picked list and excluded.
    await sampleTest.modPage.hasElement(
      e.pickRandomUserNoUsersWarning,
      'no-users warning should appear: the only user was already picked',
    );
    await sampleTest.modPage.wasRemoved(
      e.pickRandomUserPickButton,
      'pick button should be hidden when there are 0 eligible users',
      ELEMENT_WAIT_TIME,
    );
  });

  test('should restore the pick button after "Clear All" resets the picked-user history', async ({ sampleTest }): Promise<void> => {
    // Scenario: pick once (user excluded) → warning shown → Clear All → user eligible again.
    await openModal(sampleTest.modPage);
    await enableInclusionFilters(sampleTest.modPage); // includePickedUsers stays OFF
    await pickUser(sampleTest.modPage);
    await goBackToPresenterView(sampleTest.modPage);

    // No-users warning is shown (picked user excluded).
    await sampleTest.modPage.hasElement(
      e.pickRandomUserNoUsersWarning,
      'no-users warning should be visible before Clear All',
    );

    // Clear the pick history – the user is no longer in the "picked" list.
    await sampleTest.modPage.page.click(e.pickRandomUserClearAllButton);

    // The user is now eligible again, so the pick button should reappear.
    await sampleTest.modPage.hasElement(
      e.pickRandomUserPickButton,
      'pick button should reappear after clearing the pick history',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await sampleTest.modPage.wasRemoved(
      e.pickRandomUserNoUsersWarning,
      'no-users warning should disappear once the pick button is available again',
      ELEMENT_WAIT_TIME,
    );
  });
});
