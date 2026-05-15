/**
 * Behavioural tests – multi-user (moderator/presenter + attendee/viewer).
 */
import {
  test, BrowserContext, Browser, APIRequestContext, TestInfo,
} from '@playwright/test';
import { checkPluginAvailability } from '../core/fixtures/pluginBeforeAll';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../elements';
import { SessionPage as Page } from '../core/sessionPage';
import { Plugin } from '../core/plugin';
import {
  encodeCustomParams,
  getJoinURL,
  generateSettingsData,
} from '../core/helpers';
import {
  attendeeCleanupAfterTest,
  goBackToPresenterView,
  moderatorCleanupAfterTest,
  openModal,
} from './helpers';

const PLUGIN_NAME = 'pick-random-user-plugin';
const ENV_VAR_NAME = 'PICK_RANDOM_USER_PLUGIN_URL';

let pluginUrl: string | undefined = process.env[ENV_VAR_NAME];
const setPluginUrl = (url: string) => { pluginUrl = url; };
const getPluginUrl = () => pluginUrl;

/**
 * Wait for the attendee's page to finish loading the whiteboard.
 * This ensures the attendee is fully in the meeting before the presenter picks.
 */
async function waitForAttendeeMeeting(attendeePage: Page): Promise<void> {
  await attendeePage.page.waitForSelector(e.whiteboard, { timeout: ELEMENT_WAIT_LONGER_TIME });
}

/**
 * Reset state after each test for both pages:
 */
async function cleanupAfterTest(modPage: Page, attendeePage: Page): Promise<void> {
  await attendeeCleanupAfterTest(attendeePage);
  await moderatorCleanupAfterTest(modPage);
}

const ISOLATED = process.env.TEST_MEETINGS === 'isolated';

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe('Pick Random User Plugin - Behavioural (multi-user)', () => {
  test.describe.configure({ mode: ISOLATED ? 'default' : 'serial' });

  let modPage: Page;
  let attendeePage: Page;
  let modContext: BrowserContext;
  let attendeeContext: BrowserContext;

  async function setupMeeting(browser: Browser, request: APIRequestContext, testInfo: TestInfo) {
    await checkPluginAvailability({
      pluginName: PLUGIN_NAME,
      envVarName: ENV_VAR_NAME,
      setPluginUrl,
      getPluginUrl,
    })({ request }, testInfo);

    const resolvedUrl = getPluginUrl();
    if (!resolvedUrl) return;

    const createParameter = encodeCustomParams(
      `pluginManifests=${JSON.stringify([{ url: resolvedUrl }])}`,
    );

    // ── Moderator / presenter ──────────────────────────────────────────────
    modContext = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write', 'camera', 'microphone'],
      viewport: { width: 1280, height: 720 },
    });
    const modRawPage = await modContext.newPage();
    const sample = new Plugin({ browser, context: modContext });
    await sample.initModPage(modRawPage, { createParameter });
    modPage = sample.modPage;

    // ── Attendee (viewer) ──────────────────────────────────────────────────
    attendeeContext = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write', 'camera', 'microphone'],
      viewport: { width: 1280, height: 720 },
    });
    const attendeeRawPage = await attendeeContext.newPage();
    attendeePage = new Page({ browser, page: attendeeRawPage });

    const joinUrl = getJoinURL({
      meetingID: modPage.meetingId,
      isModerator: false,
      skipSessionDetailsModal: true,
    });
    await attendeeRawPage.goto(joinUrl);
    await attendeeRawPage.waitForSelector('div#layout', { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    attendeePage.settings = await generateSettingsData(attendeeRawPage);
    if (attendeePage.settings?.autoJoinAudioModal) {
      await attendeePage.closeAudioModal();
    }
    await attendeeRawPage.addStyleTag({
      content: "body { font-family: 'Liberation Sans', Arial, sans-serif; }",
    });
    attendeePage.meetingId = modPage.meetingId;
  }

  if (ISOLATED) {
    test.beforeEach(async ({ browser, request }, testInfo) => {
      await setupMeeting(browser, request, testInfo);
    });
    test.afterEach(async () => {
      await modContext?.close();
      await attendeeContext?.close();
    });
  } else {
    test.beforeAll(async ({ browser, request }, testInfo) => {
      await setupMeeting(browser, request, testInfo);
    });
    test.afterAll(async () => {
      await modContext?.close();
      await attendeeContext?.close();
    });
    test.afterEach(async () => {
      if (modPage && attendeePage) await cleanupAfterTest(modPage, attendeePage);
    });
  }

  test('should show the same picked user name on both the presenter page and the attendee page', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);

    // With default filters the attendee is the only eligible viewer.
    await modPage.hasElement(
      e.pickRandomUserPickButton,
      'pick button should be visible: there is 1 eligible viewer (the attendee)',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Pick the user.
    await modPage.page.click(e.pickRandomUserPickButton);

    // Presenter page: transition to picked-user view.
    await modPage.hasElement(
      e.pickRandomUserPickedUserName,
      'presenter page should show the picked user name',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Attendee page: modal opens automatically.
    await attendeePage.hasElement(
      e.pickRandomUserPickedUserName,
      'attendee page should show the same picked user name (data channel sync)',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Both pages must display the exact same name text.
    const pickedNamePresenter = await modPage.getLocator(
      e.pickRandomUserPickedUserName,
    ).textContent();
    const pickedNameAttendee = await attendeePage
      .getLocator(e.pickRandomUserPickedUserName).textContent();

    test.expect(pickedNamePresenter, 'picked user name on presenter page should not be empty').toBeTruthy();
    test.expect(
      pickedNameAttendee,
      'picked user name shown to attendee must match the name shown to the presenter',
    ).toBe(pickedNamePresenter);
  });

  test('should open the attendee modal automatically without any action on the attendee side', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);
    await modPage.hasElement(e.pickRandomUserPickButton, 'pick button should be visible', ELEMENT_WAIT_LONGER_TIME);

    // Pick – the attendee has not interacted with their page at all.
    await modPage.page.click(e.pickRandomUserPickButton);

    // The attendee's modal should open driven purely by the data-channel push.
    await attendeePage.hasElement(
      e.pickRandomUserPickedUserViewTitle,
      'attendee modal should open automatically via data channel after the presenter picks',
      ELEMENT_WAIT_LONGER_TIME,
    );
  });

  test('should show "You have been randomly picked" to the picked attendee and "Randomly picked user" to the presenter', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);
    await modPage.hasElement(e.pickRandomUserPickButton, 'pick button should be visible', ELEMENT_WAIT_LONGER_TIME);
    await modPage.page.click(e.pickRandomUserPickButton);

    // Attendee is the picked user → sees "You have been randomly picked".
    await attendeePage.hasElement(e.pickRandomUserPickedUserViewTitle, 'attendee modal should open', ELEMENT_WAIT_LONGER_TIME);
    await attendeePage.hasText(
      e.pickRandomUserPickedUserViewTitle,
      'You have been randomly picked',
      'picked attendee should see the "You have been randomly picked" title',
    );

    // Presenter sees "Randomly picked user" (different user was picked).
    await modPage.hasElement(e.pickRandomUserPickedUserViewTitle, 'presenter modal should transition to picked-user view', ELEMENT_WAIT_LONGER_TIME);
    await modPage.hasText(
      e.pickRandomUserPickedUserViewTitle,
      'Randomly picked user',
      'presenter should see the "Randomly picked user" title (not their own name)',
    );
  });

  test('should show a countdown message only to the attendee and a countdown bar only to the presenter', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);
    await modPage.hasElement(e.pickRandomUserPickButton, 'pick button should be visible', ELEMENT_WAIT_LONGER_TIME);
    await modPage.page.click(e.pickRandomUserPickButton);

    await modPage.hasElement(e.pickRandomUserPickedUserViewTitle, 'presenter view should open', ELEMENT_WAIT_LONGER_TIME);
    await attendeePage.hasElement(e.pickRandomUserPickedUserViewTitle, 'attendee view should open', ELEMENT_WAIT_LONGER_TIME);

    const attendeeCountdown = attendeePage.getLocator(e.pickRandomUserCountDownMessage);
    await test.expect(
      attendeeCountdown,
      'attendee should see the countdown message during the prevent-close delay',
    ).toBeVisible({ timeout: ELEMENT_WAIT_TIME });

    const presenterCountdown = modPage.getLocator(e.pickRandomUserCountDownMessage);
    await test.expect(
      presenterCountdown,
      'presenter should NOT see the viewer-side countdown message',
    ).toBeHidden({ timeout: ELEMENT_WAIT_TIME });

    const presenterProgressBar = modPage.getLocator(e.pickRandomUserCountDownProgressBar);
    await test.expect(
      presenterProgressBar,
      'presenter should see the progress countdown bar',
    ).toBeVisible({ timeout: ELEMENT_WAIT_TIME });
  });

  test('should not close the picked attendee modal when clicking the overlay during the countdown lock period', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);
    await modPage.hasElement(e.pickRandomUserPickButton, 'pick button should be visible', ELEMENT_WAIT_LONGER_TIME);

    // Pick the attendee – the countdown lock starts on the attendee side immediately.
    await modPage.page.click(e.pickRandomUserPickButton);

    // Wait for the attendee's modal to open via data-channel sync.
    await attendeePage.hasElement(
      e.pickRandomUserPickedUserViewTitle,
      'attendee modal should open after being picked',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Click the modal overlay at the top-left corner (well outside the centred modal
    // content) while the countdown is still active (shouldCloseOnOverlayClick === false).
    await attendeePage.page.locator(e.pickRandomUserModalOverlay).click({
      position: { x: 5, y: 5 },
      force: true,
    });

    // The modal must still be open – the overlay click should have been swallowed.
    await test.expect(
      attendeePage.getLocator(e.pickRandomUserPickedUserViewTitle),
      'modal should remain open after clicking the overlay during the countdown lock period',
    ).toBeVisible({ timeout: ELEMENT_WAIT_TIME });
  });

  test('should keep the previously-picked viewer in the available pool and re-pick the same user when "include already picked users" is enabled and the presenter navigates back', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);

    // Enable "Include already picked users" so the viewer stays eligible after being picked.
    await modPage.page.click(e.includePickedUsersCheckbox);
    await modPage.hasElement(
      e.pickRandomUserPickButton,
      'pick button should be visible once the attendee is an eligible viewer',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Pick the attendee (the only eligible viewer with default filters).
    await modPage.page.click(e.pickRandomUserPickButton);
    await modPage.hasElement(
      e.pickRandomUserPickedUserViewTitle,
      'presenter should transition to the picked-user view',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Capture the name of the first picked user for later comparison.
    const firstPickedName = await modPage.getLocator(e.pickRandomUserPickedUserName).textContent();
    test.expect(firstPickedName, 'first picked user name should not be empty').toBeTruthy();

    // Return to the presenter view via the back button.
    await goBackToPresenterView(modPage);

    // ── Assertion 1: attendee appears in the "Previously picked" list ────────
    const pickedList = modPage.getLocator(`${e.pickRandomUserPreviouslyPickedList} li`);
    await pickedList.first().waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME });
    const pickedListCount = await pickedList.count();
    test.expect(
      pickedListCount,
      'previously-picked list must contain at least one entry – the attendee was picked',
    ).toBeGreaterThanOrEqual(1);

    // ── Assertion 2: picked user is still in the available-for-selection pool ─
    // With includePickedUsers=true the attendee is not removed from the eligible pool.
    await modPage.hasText(
      e.pickRandomUserAvailableContent,
      '1 viewer',
      'available section should still list the attendee as eligible (includePickedUsers is ON)',
    );
    await modPage.hasText(
      e.pickRandomUserPickButton,
      'Pick again',
      'pick button should read "Pick again" because a user has already been picked this session',
    );

    // ── Assertion 3: re-picking selects the same (and only) eligible user ─────
    await modPage.page.click(e.pickRandomUserPickButton);
    await modPage.hasElement(
      e.pickRandomUserPickedUserViewTitle,
      'presenter should transition to picked-user view after re-picking',
      ELEMENT_WAIT_LONGER_TIME,
    );
    const secondPickedName = await modPage.getLocator(e.pickRandomUserPickedUserName).textContent();
    test.expect(
      secondPickedName,
      'the same user must be picked again - they are the only eligible viewer in the pool',
    ).toBe(firstPickedName);
  });

  test('should inject "Display last randomly picked user" into the attendee actions dropdown after a pick', async (): Promise<void> => {
    await waitForAttendeeMeeting(attendeePage);
    await openModal(modPage);
    await modPage.hasElement(e.pickRandomUserPickButton, 'pick button should be visible', ELEMENT_WAIT_LONGER_TIME);
    await modPage.page.click(e.pickRandomUserPickButton);

    // Wait for the data channel to sync on the attendee side.
    await attendeePage.hasElement(
      e.pickRandomUserPickedUserViewTitle,
      'attendee modal should open (confirms data channel received the pick)',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Close the attendee modal so the actions dropdown is accessible.
    await attendeePage.page.click(e.pickRandomUserModalCloseButton);
    await attendeePage.wasRemoved(
      e.pickRandomUserPickedUserViewTitle,
      'attendee modal should close after clicking the close button',
      ELEMENT_WAIT_TIME,
    );

    // Open the attendee's actions dropdown.
    await attendeePage.page.waitForSelector(e.whiteboard, { timeout: ELEMENT_WAIT_LONGER_TIME });
    await attendeePage.page.click(e.actions);

    // The plugin injects "Display last randomly picked user" for attendees.
    await attendeePage.hasElement(
      e.displayLastRandomlyPickedUser,
      'attendee actions dropdown should contain the plugin option',
    );
    await attendeePage.hasText(
      e.displayLastRandomlyPickedUser,
      'Display last randomly picked user',
      'plugin option should read "Display last randomly picked user" for the attendee',
    );
  });
});
