import { test } from "@playwright/test";
import { E2E_TEST_USER_EMAIL } from "../utils";

// The seed command wipes the database before each test run, so any fresh
// email is safe to use.  We add a timestamp so re-runs within the same
// session (without re-seeding) don't collide either.
const newUserEmail = () => `new_user_${Date.now()}@example.com`;

const PASSWORD = "E2eTestPass1";
const BIRTHDATE = "1990-01-15";

test("user can sign up", async ({ page }) => {
  await page.goto("/");

  await page.click('[data-testid="header-sign-up-button"]');
  await page.fill("div[data-testid='overlay-modal'] >> input[name='email']", newUserEmail());
  await page.fill("div[data-testid='overlay-modal'] >> input[name='password']", PASSWORD);
  await page.fill("div[data-testid='overlay-modal'] >> input[name='birthdate']", BIRTHDATE);
  await page.click("div[data-testid='overlay-modal'] >> text=Continue");

  // After successful signup the page reloads; the refreshToken cookie is set
  // and the startup refresh obtains an access token → authenticated header
  await page.waitForSelector('[data-testid="sidebar-home-link"]');

  // Navigating away and back keeps the session alive
  await page.goto("/");
  await page.waitForSelector('[data-testid="sidebar-home-link"]');
});

test("shows an error when the email address is already registered", async ({ page }) => {
  await page.goto("/");

  await page.click('[data-testid="header-sign-up-button"]');
  await page.fill("div[data-testid='overlay-modal'] >> input[name='email']", E2E_TEST_USER_EMAIL);
  await page.fill("div[data-testid='overlay-modal'] >> input[name='password']", PASSWORD);
  await page.fill("div[data-testid='overlay-modal'] >> input[name='birthdate']", BIRTHDATE);
  await page.click("div[data-testid='overlay-modal'] >> text=Continue");

  await page.waitForSelector("text=An account already exists for this email address.");
});
