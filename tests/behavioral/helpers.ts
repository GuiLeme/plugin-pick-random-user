import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../elements';
import { SessionPage as Page } from '../core/sessionPage';

export async function openModal(modPage: Page): Promise<void> {
  await modPage.page.waitForSelector(e.whiteboard, { timeout: ELEMENT_WAIT_LONGER_TIME });
  await modPage.page.click(e.actions);
  await modPage.hasElement(e.pickRandomUserActionButton, 'action button should appear');
  await modPage.page.click(e.pickRandomUserActionButton);
}

export async function goBackToPresenterView(modPage: Page): Promise<void> {
  await modPage.hasElement(e.pickRandomUserBackButton, 'back button should be visible');
  await modPage.page.click(e.pickRandomUserBackButton);
  await modPage.hasElement(
    e.includeModeratorsCheckbox,
    'presenter view should be restored after clicking back',
    ELEMENT_WAIT_TIME,
  );
}

export async function moderatorCleanupAfterTest(modPage: Page): Promise<void> {
  if (await modPage.page.locator(e.pickRandomUserPickedUserViewTitle).isVisible()) {
    await modPage.page.click(e.pickRandomUserBackButton);
    await modPage.page.locator(e.pickRandomUserModalCloseButton).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME });
  }

  const modCloseBtn = modPage.page.locator(e.pickRandomUserModalCloseButton);
  if (await modCloseBtn.isVisible()) {
    // Uncheck any filter checkboxes that were left enabled.
    const includePickedUsers = modPage.page.locator(e.includePickedUsersCheckbox);
    if (await includePickedUsers.isChecked()) await includePickedUsers.click();
    const includeModerators = modPage.page.locator(e.includeModeratorsCheckbox);
    if (await includeModerators.isChecked()) await includeModerators.click();
    const includePresenter = modPage.page.locator(e.includePresenterCheckbox);
    if (await includePresenter.isChecked()) await includePresenter.click();

    // Clear the previously-picked history.
    const clearBtn = modPage.page.locator(e.pickRandomUserClearAllButton);
    if (await clearBtn.isVisible()) {
      await modPage.page.click(e.pickRandomUserClearAllButton);
    }

    await modCloseBtn.click();
    return;
  }

  // Dismiss the mod's actions dropdown if it was left open.
  if (await modPage.page.locator(e.pickRandomUserActionButton).isVisible()) {
    await modPage.page.keyboard.press('Escape');
  }
}

export async function attendeeCleanupAfterTest(attendeePage: Page): Promise<void> {
  const attendeeCloseBtn = attendeePage.page.locator(e.pickRandomUserModalCloseButton);
  if (await attendeeCloseBtn.isVisible()) {
    await attendeeCloseBtn.click();
  }
  // Dismiss the attendee's actions dropdown if it was left open.
  if (await attendeePage.page.locator(e.pickRandomUserActionButton).isVisible()) {
    await attendeePage.page.keyboard.press('Escape');
  }
}
