import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { browser, baseURL, openPage as openBrowserPage, visit, errors, unexpectedWrites } from "./lib/careers-contact-browser.mjs";

// On a shared dev server, edits elsewhere make Vite reload the page in the middle of a flow: the
// test pages do not open the HMR socket (vite-hmr), so they keep the page they are testing.
// The Contact map (Google Maps iframe) is served blank: without network it becomes an error page
// where the helper's localStorage init script throws.
async function openPage(...args) {
  const page = await openBrowserPage(...args);
  await page.route(/^https:\/\/www\.google\.com\/maps/, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Mapa</title>" }));
  await page.addInitScript(() => {
    const Native = window.WebSocket;
    window.WebSocket = new Proxy(Native, {
      construct(target, [url, protocols]) {
        if ([protocols].flat().includes("vite-hmr")) {
          const quiet = new EventTarget();
          return Object.assign(quiet, { readyState: 0, url: String(url), send() {}, close() {} });
        }
        return new target(url, protocols);
      },
    });
  });
  return page;
}

const defaults = JSON.parse(await readFile("shared/cms-defaults.json", "utf8"));
const pdf = { name: "cv-prueba.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") };
let cases = 0;
try {
  const RETIRED_EMAIL = "info@santossaucedo.com";
  const normalize = text => text.replace(/\s+/g, " ").trim();
  const until = async (check, message) => {
    for (let i = 0; i < 100 && !check(); i++) await new Promise(resolve => setTimeout(resolve, 50));
    assert.ok(check(), message);
  };
  // Contact (demo v3): two steps, «Sus datos» → Continuar → «Su asunto», then the thanks step.
  // Posts are intercepted: nothing reaches the server.
  {
    const contact = await openPage();
    let posts = 0, status = 200, release, practice = "";
    await contact.route("**/api/contact", async route => {
      if (route.request().method() !== "POST") return route.continue();
      const data = route.request().postDataJSON();
      assert.equal(data.consent, true);
      assert.equal(data.website, "");
      assert.equal(data.fullName, "Prueba de interfaz");
      assert.equal(data.company, "Empresa de prueba");
      assert.equal(data.email, "interfaz@example.invalid");
      assert.equal(data.practiceArea ?? "", practice);
      await new Promise(resolve => { release = resolve; posts++; });
      await route.fulfill({ status, json: status === 200 ? { success: true } : { error: "Prueba controlada" } });
    });
    await visit(contact, "/contact");
    // General email: the site's (/api/site-content), never the retired info@
    const site = await (await contact.request.get(`${baseURL}/api/site-content`)).json();
    const shownEmail = normalize(await contact.getByTestId("link-office-email").textContent());
    assert.equal(shownEmail, site.email);
    assert.notEqual(shownEmail, RETIRED_EMAIL, "The retired general email is not shown");
    const form = contact.getByTestId("form-contact");
    const step = n => form.locator(`.sh-step[data-step="${n}"]`);
    const onStep = n => form.locator(`.sh-step[data-step="${n}"][data-state="on"]`);
    const next = form.getByTestId("button-contact-next");
    const submit = form.getByTestId("button-submit-contact");
    const company = form.getByTestId("input-company");
    const labelOf = async input => normalize(await form.locator(`label[for="${await input.getAttribute("id")}"]`).textContent());
    // Company is required: asterisk, aria-required and no «(opcional)»
    assert.equal(await labelOf(company), `${defaults.contact.es.companyLabel} *`);
    assert.doesNotMatch(await labelOf(company), /\(/);
    assert.equal(await company.getAttribute("aria-required"), "true");
    assert.equal(await labelOf(form.getByTestId("input-phone")), defaults.contact.es.telLabel, "Phone stays optional");
    assert.equal(await step(2).evaluate(el => el.inert), true, "Only the current step is usable");
    // Step 1 empty: name, company and email errors; phone is optional; the form stays on step 1
    await next.click();
    for (const field of ["fullname", "company", "email"]) await form.getByTestId(`error-${field}`).waitFor();
    assert.equal(await form.getByTestId("error-phone").count(), 0);
    assert.equal(await company.getAttribute("aria-invalid"), "true");
    assert.equal(await step(1).getAttribute("data-state"), "on");
    // Name and email alone are not enough; a company of blanks is not either
    await form.getByTestId("input-fullname").fill("Prueba de interfaz");
    await form.getByTestId("input-email").fill("interfaz@example.invalid");
    await company.fill("   ");
    await next.click();
    await form.getByTestId("error-company").waitFor();
    assert.equal(await form.getByTestId("error-fullname").count(), 0);
    assert.equal(await step(1).getAttribute("data-state"), "on", "A blank company keeps the form on step 1");
    await company.fill("Empresa de prueba");
    await next.click();
    await onStep(2).waitFor();
    assert.equal(await step(1).evaluate(el => el.inert), true);
    // Step 2: message and consent are required; nothing is sent while they are missing
    await submit.click();
    await form.getByTestId("error-message").waitFor();
    await form.getByTestId("error-consent").waitFor();
    assert.equal(posts, 0, "Invalid contact submission never sends");
    await form.getByTestId("textarea-message").fill("Mensaje sintético para comprobar la interfaz.");
    await submit.click();
    await form.getByTestId("error-consent").waitFor();
    assert.equal(posts, 0, "Missing consent prevents contact submission");
    await form.getByTestId("checkbox-consent").check();
    // Native <select>: «—», the site's practices and «Otro asunto»
    const select = form.getByTestId("select-practice-area");
    assert.equal(await select.evaluate(el => el.tagName), "SELECT");
    const practices = await (await contact.request.get(`${baseURL}/api/practice-groups`)).json();
    assert.equal(await select.locator("option").count(), practices.length + 2);
    practice = await select.locator("option").nth(1).getAttribute("value");
    await select.selectOption(practice);
    await submit.click();
    await contact.waitForFunction(() => document.querySelector('[data-testid="button-submit-contact"]').disabled);
    await until(() => posts === 1 && release, "The valid form sends once");
    release();
    await form.getByText(defaults["contact-feedback"].es.successTitle, { exact: true }).waitFor();
    await form.getByTestId("text-contact-success").waitFor();
    await form.getByTestId("button-contact-again").click();
    await onStep(1).waitFor();
    assert.equal(await form.getByTestId("input-fullname").inputValue(), "");
    assert.equal(await company.inputValue(), "");
    // Server error: the message stays on screen with the visitor's data
    status = 500;
    release = undefined;
    practice = "";
    await form.getByTestId("input-fullname").fill("Prueba de interfaz");
    await company.fill("Empresa de prueba");
    await form.getByTestId("input-email").fill("interfaz@example.invalid");
    await next.click();
    await onStep(2).waitFor();
    await form.getByTestId("textarea-message").fill("Mensaje sintético.");
    await form.getByTestId("checkbox-consent").check();
    await submit.click();
    await contact.waitForFunction(() => document.querySelector('[data-testid="button-submit-contact"]').disabled);
    await until(() => posts === 2 && release, "The retry sends once");
    release();
    await form.getByRole("alert").filter({ hasText: defaults["contact-feedback"].es.errorDescription }).waitFor();
    assert.equal(await form.getByTestId("textarea-message").inputValue(), "Mensaje sintético.");
    await form.getByTestId("button-contact-back").click();
    await onStep(1).waitFor();
    assert.equal(await form.getByTestId("input-fullname").inputValue(), "Prueba de interfaz");
    assert.equal(await company.inputValue(), "Empresa de prueba");
    await contact.close();
    cases += 6;
  }

  // A company label saved in the panel with «(opcional)» never shows next to the asterisk
  for (const [lang, label, expected] of [["es", "Empresa (opcional)", "Empresa *"], ["en", "Company (optional)", "Company *"], ["ja", "会社名（任意）", "会社名 *"]]) {
    const page = await openPage(lang);
    const config = await (await page.request.get(`${baseURL}/api/site-config`)).json();
    const stored = config.contact ?? defaults.contact;
    config.contact = { ...stored, [lang]: { ...defaults.contact[lang], ...stored[lang], companyLabel: label } };
    await page.route("**/api/site-config", route => route.fulfill({ json: config }));
    await visit(page, lang === "es" ? "/es/contacto" : `/${lang}/contact`);
    const input = page.getByTestId("form-contact").getByTestId("input-company");
    assert.equal(normalize(await page.locator(`label[for="${await input.getAttribute("id")}"]`).textContent()), expected);
    await page.close();
    cases++;
  }

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
    // The page's photos stay when the form is switched off (Contact: the six-photo office mosaic)
    await visit(page, routeName);
    const photos = await page.locator("main img").count();
    await page.route("**/api/site-config", route => route.fulfill({ json: config }));
    await page.reload();
    await page.locator("main h1").waitFor();
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator("main form").count(), 0);
    await page.locator("main").getByRole("status").waitFor();
    assert.equal(await page.locator("main img").count(), photos);
    if (routeName === "/contact") {
      assert.equal(await page.locator("main .sh-ofi img").count(), 6);
      const mail = page.locator("main .ct-form--off a[href^='mailto:']");
      assert.notEqual(normalize(await mail.textContent()), RETIRED_EMAIL);
      assert.equal(await mail.getAttribute("href"), `mailto:${normalize(await mail.textContent())}`);
    }
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
    assert.equal(await page.locator('a[href="/es/pasantias"], a[href="/pasantias"]').count() > 0, true);
    await page.close();
    cases++;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedWrites, []);
  console.log(`PASS: ${cases} controlled form and vacancy states; two-step contact form with required company, validation, consent, CV limit, pending/success/error, disabled forms and real-job destinations; no writes to server.`);
} finally { await browser.close(); }
