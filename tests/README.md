# Pick Random User Plugin – Automated Tests

End-to-end tests for the **Pick Random User Plugin** written with [Playwright](https://playwright.dev/).  
They reuse the shared test infrastructure from the
[BigBlueButton HTML Plugin SDK](https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk).

---

## Test scenarios

### Structural (`tests/structural/test.spec.ts`)

Verify that the plugin renders the correct elements with the correct labels and
initial state.

### Behavioural – single user (`tests/behavioral/single-user.spec.ts`)

Verify the pick-and-track workflow using only the moderator/presenter.

### Behavioural – multi-user (`tests/behavioral/multi-user.spec.ts`)

Verify real-time data-channel synchronization between the presenter and an
attendee in the same meeting.

---

## How to run the tests

### 1 – Install dependencies

From the **plugin root** (`plugin-pick-random-user/`):

```bash
npm install
npx playwright install --with-deps chromium
```

The SDK test utilities are resolved via relative paths to the sibling
`bigbluebutton-html-plugin-sdk/` directory:

```bash
cd ../bigbluebutton-html-plugin-sdk && npm install && cd -
```

### 2 – Configure environment variables

```bash
cp .env.template .env
# edit .env and set BBB_URL and BBB_SECRET
```

| Variable | Required | Description |
|----------|----------|-------------|
| `BBB_URL` | **yes** | Full API URL, e.g. `https://bbb.example.com/bigbluebutton/` |
| `BBB_SECRET` | **yes** | Shared secret of the BBB server |
| `PICK_RANDOM_USER_PLUGIN_URL` | no | Direct URL to `manifest.json`; auto-detected from server otherwise |
| `LOCAL_CONTAINER_NAME` | no | Docker container name for the local deployment script |
| `TIMEOUT_MULTIPLIER` | no | Multiply all timeouts (default 1 locally, 2 in CI) |
| `CI` | no | `"true"` enables CI reporter and single-worker mode |

### 3 – Build and deploy the plugin

To build the plugin use the command:

```bash
npm run build-bundle
```

Then you need to deploy the plugin serve it so that the target BBB server can access it. You can deploy it to a S3-like environment or to your own server that you are targeting the test to. For the second option, we have a command to do that already:

```bash
npm run publish-plugin:dev
```

---

## Running the tests

```bash
# All suites
npm test

# Only structural tests
npm test -- tests/structural

# Only behavioural tests
npm test -- tests/behavioral

# Only multi-user behavioural tests
npm test -- tests/behavioral/multi-user

# A single test by name
npm test -- -g "should show the same picked user name"

# View the HTML report after a run
npx playwright show-report
```

---

## Test output

| Artifact | Location |
|----------|----------|
| HTML report | `playwright-report/index.html` |
| Traces | Attached to every test in the HTML report |
| Screenshots | Captured for every test |
| Video | Every test locally; failure-only in CI |
