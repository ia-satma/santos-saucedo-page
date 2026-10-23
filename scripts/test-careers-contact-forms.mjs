import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { browser, baseURL, openPage, visit, errors, unexpectedWrites } from "./lib/careers-contact-browser.mjs";

const defaults = JSON.parse(await readFile("shared/cms-defaults.json", "utf8"));
const pdf = { name: "cv-prueba.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") };
let cases = 0;
try {
  // Contact: intercepted posts only; all form contracts remain intact.
  const contact = await openPage();
  let posts = 0, status = 200, release;
  await contact.route("**/api/contact", async route => {
    if (route.request().method() !== "POST") return route.continue();
    posts++;
    const data = route.request().postDataJSON();
    assert.equal(data.consent, true);
    assert.equal(data.website, "");
    assert.equal(data.fullName, "Prueba de interfaz");
    await new Promise(resolve => { release = resolve; });
    await route.fulfill({ status, json: status === 200 ? { success: true } : { error: "Prueba controlada" } });
  });
  await visit(contact, "/contact");
  const submit = contact.getByTestId("button-submit-contact");
  await submit.click();
  await contact.getByTestId("error-fullname").waitFor();
  await contact.getByTestId("error-email").waitFor();
  await contact.getByTestId("error-message").waitFor();
  await contact.getByTestId("error-consent").waitFor();
  assert.equal(posts, 0, "Invalid contact submission never sends");
  await contact.getByTestId("input-fullname").fill("Prueba de interfaz");
  await contact.getByTestId("input-email").fill("interfaz@example.invalid");
  await contact.getByTestId("textarea-message").fill("Mensaje sintético para comprobar la interfaz.");
  await submit.click();
  assert.equal(posts, 0, "Missing consent prevents contact submission");
  await contact.getByTestId("checkbox-consent").click();
  await contact.getByTestId("select-practice-area").click();
  const option = contact.locator('[role="option"]').first();
  await option.waitFor();
  await option.click();
  await submit.click();
  await contact.waitForFunction(() => document.querySelector('[data-testid="button-submit-contact"]').disabled);
  assert.equal(posts, 1);
  release();
  await contact.getByText("Mensaje enviado", { exact: true }).waitFor();
  assert.equal(await contact.getByTestId("input-fullname").inputValue(), "");
  status = 500;
  await contact.getByTestId("input-fullname").fill("Prueba de interfaz");
  await contact.getByTestId("input-email").fill("interfaz@example.invalid");
  await contact.getByTestId("textarea-message").fill("Mensaje sintético.");
  await contact.getByTestId("checkbox-consent").click();
  await submit.click();
  await contact.waitForFunction(() => document.querySelector('[data-testid="button-submit-contact"]').disabled);
  release();
  await contact.getByText("No fue posible enviar el mensaje. Intente de nuevo más tarde.", { exact: true }).waitFor();
  assert.equal(await contact.getByTestId("input-fullname").inputValue(), "Prueba de interfaz");
  await contact.close();
  cases += 5;

  const careers = await openPage();
  let applications = 0, applicationStatus = 500, releaseApplication;
  await careers.route("**/api/careers/apply", async route => {
    applications++;
    assert.match(route.request().headers()["content-type"], /multipart\/form-data/);
    const body = route.request().postDataBuffer().toString();
    assert.match(body, /cv-prueba\.pdf/);
    assert.match(body, /name="consent"\r\n\r\ntrue/);
    assert.match(body, /name="preferredLanguage"\r\n\r\nes/);
    await new Promise(resolve => { releaseApplication = resolve; });
    await route.fulfill({
      status: applicationStatus,
      json: applicationStatus === 200 ? { success: true } : { error: "Prueba controlada" },
    });
  });
  await visit(careers, "/careers");
  const form = careers.getByTestId("career-application-form");
  const apply = careers.getByTestId("submit-application-careers");
  await apply.click();
  assert.equal(applications, 0);
  assert.equal(await form.locator('input[name="fullName"]').evaluate(e => e.validity.valid), false);
  await form.locator('input[name="fullName"]').fill("Prueba de interfaz");
  await form.locator('input[name="email"]').fill("interfaz@example.invalid");
  await form.locator('input[name="cv"]').setInputFiles(pdf);
  await apply.click();
  assert.equal(applications, 0, "Application requires consent");
  await form.locator('input[name="consent"]').check();
  await form.locator('input[name="cv"]').setInputFiles({
    ...pdf, buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await apply.click();
  await form.getByRole("alert").waitFor();
  assert.equal(applications, 0, "Oversized CV is rejected before submission");
  await form.locator('input[name="cv"]').setInputFiles(pdf);
  await apply.click();
  await careers.waitForFunction(() => document.querySelector('[data-testid="submit-application-careers"]').disabled);
  assert.equal(applications, 1);
  releaseApplication();
  await form.getByRole("alert").waitFor();
  assert.equal(await form.locator('input[name="fullName"]').inputValue(), "Prueba de interfaz");
  applicationStatus = 200;
  await apply.click();
  await careers.waitForFunction(() => document.querySelector('[data-testid="submit-application-careers"]').disabled);
  releaseApplication();
  await form.getByRole("status").waitFor();
  assert.equal(await form.locator("form").count(), 0, "Application success presentation remains");
  await careers.close();
  cases += 5;

  for (const routeName of ["/careers", "/contact"]) {
    const page = await openPage();
    const config = await (await page.request.get(`${baseURL}/api/site-config`)).json();
    config.forms = {
      ...defaults.forms, ...config.forms,
      careers: { ...defaults.forms.careers, ...config.forms?.careers, enabled: false },
      contact: { ...defaults.forms.contact, ...config.forms?.contact, enabled: false },
    };
    await page.route("**/api/site-config", route => route.fulfill({ json: config }));
    await visit(page, routeName);
    assert.equal(await page.locator("main form").count(), 0);
    await page.locator("main").getByRole("status").waitFor();
    assert.equal(await page.locator("main img").count(), 2);
    await page.close();
    cases++;
  }
  for (const failed of [false, true]) {
    const page = await openPage();
    await page.route("**/api/jobs", route => route.fulfill(failed
      ? { status: 500, json: { error: "Prueba de carga" } }
      : { json: [
        { id: "test-url", titleEs: "Vacante de prueba A", title: "Test opening A", type: "full-time", descriptionEs: "Descripción de prueba", description: "Test description", applicationUrl: "https://example.invalid/postular" },
        { id: "test-email", titleEs: "Vacante de prueba B", title: "Test opening B", type: "full-time", descriptionEs: "Descripción de prueba", description: "Test description", applicationEmail: "vacantes@example.invalid" },
      ] }));
    await visit(page, "/careers");
    if (failed) {
      await page.getByTestId("section-positions").getByRole("status").waitFor();
      assert.equal(await page.getByTestId("text-positions-empty").count(), 0);
    } else {
      await page.getByTestId("card-position-1").waitFor();
      assert.equal(await page.getByTestId("section-positions").locator('a[href="https://example.invalid/postular"]').count(), 1);
      assert.equal(await page.getByTestId("section-positions").locator('a[href="mailto:vacantes@example.invalid"]').count(), 1);
      assert.equal(await page.getByTestId("text-positions-empty").count(), 0);
    }
    assert.equal(await page.locator('a[href="/careers/interns"]').count() > 0, true);
    await page.close();
    cases++;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedWrites, []);
  console.log(`PASS: ${cases} controlled form and vacancy states; validation, consent, CV limit, pending/success/error, disabled forms and real-job destinations; no writes to server.`);
} finally { await browser.close(); }
