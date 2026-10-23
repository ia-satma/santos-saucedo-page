import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { browser, baseURL, openPage, visit, loadPhotos, copy, output, errors, unexpectedWrites } from "./lib/careers-contact-browser.mjs";

await mkdir(output, { recursive: true });
let baseline;
try { baseline = JSON.parse(await readFile(`${output}/before.json`, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const sortObjects = array => array.map(v => JSON.stringify(v)).sort();
let checks = 0;
try {
  const matrix = [
    ...["es", "en"].flatMap(lang => [320, 375, 768, 1440].map(width => [lang, width])),
    ...[320, 768, 1440].map(width => ["ar", width]),
    ["de", 320], ...["fr", "it", "ru", "zh", "ko", "ja"].map(lang => [lang, 375]),
  ];
  for (const [language, width] of matrix) {
    const page = await openPage(language, width);
    for (const route of ["/careers", "/contact"]) {
      await visit(page, route);
      await loadPhotos(page);
      const current = await copy(page);
      const label = `${route} ${language} ${width}`;
      if (width === 1440 && baseline?.[language + route]) {
        const before = baseline[language + route];
        for (const key of ["paragraphs", "headings", "hero", "heroHeight", "formFields"]) {
          const clean = value => key === "hero"
            ? value.replace(/ data-replit-metadata="[^"]*"/g, "") : value;
          assert.deepEqual(clean(current[key]), clean(before[key]), `${label}: preserve ${key}`);
        }
        assert.deepEqual(sortObjects(current.images), sortObjects(before.images), `${label}: preserve photo sources and alternatives`);
        for (const link of before.links) {
          assert.ok(current.links.some(after => JSON.stringify(after) === JSON.stringify(link)),
            `${label}: preserve link ${link.href}`);
        }
      }
      assert.equal(current.images.length, 2, `${label}: both original photographs remain`);
      const layout = await page.locator("main").evaluate(main => {
        const failures = [];
        const mainBox = main.getBoundingClientRect();
        let finalContentBottom = 0;
        for (const el of main.querySelectorAll("h1,h2,h3,p,a,dd,figure,img,form,input,textarea,button,section")) {
          const style = getComputedStyle(el), box = el.getBoundingClientRect();
          if (!box.width || !box.height || style.visibility === "hidden"
            || el.closest('[aria-hidden="true"]') || style.position === "fixed") continue;
          if (box.left < -1 || box.right > innerWidth + 1) failures.push(`Offscreen: ${el.tagName} ${el.textContent.slice(0, 45)}`);
          if (["H1", "H2", "H3", "P", "DD"].includes(el.tagName) && el.scrollWidth > el.clientWidth + 1) {
            failures.push(`Text overflow: ${el.textContent.slice(0, 60)}`);
          }
          if (el.tagName === "P" && style.hyphens !== "none") failures.push("Automatic hyphens");
          if (el.tagName === "IMG" && /grayscale/.test(style.filter)) failures.push("Monochrome photo");
        }
        for (const el of main.querySelectorAll("h2,p,dl,figure,form")) {
          const box = el.getBoundingClientRect();
          if (box.height > 0) finalContentBottom = Math.max(finalContentBottom, box.bottom);
        }
        return {
          failures, overflow: document.documentElement.scrollWidth > innerWidth + 1,
          bottomGap: mainBox.bottom - finalContentBottom,
          heroMedia: main.querySelectorAll(".editorial-page-hero img,.editorial-page-hero video").length,
        };
      });
      assert.deepEqual(layout.failures, [], label);
      assert.ok(!layout.overflow, `${label}: no horizontal overflow`);
      assert.equal(layout.heroMedia, 0);
      assert.ok(layout.bottomGap <= 160, `${label}: no excessive empty space before footer (${layout.bottomGap}px)`);
      if (language === "es" && [375, 1440].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${output}/after-${route.slice(1)}-${width}.png`, fullPage: true });
        if (width === 1440) {
          const section = page.getByTestId(route === "/careers" ? "section-why-join" : "section-contact-office");
          await section.screenshot({ path: `${output}/detail-${route.slice(1)}.png` });
        }
      }
      // A keyboard-focused field must retain a visible focus treatment.
      const field = page.locator("main input:not([type=hidden]):not([tabindex='-1'])").first();
      await field.focus();
      await page.keyboard.press("Tab");
      assert.ok(await page.evaluate(() => {
        const css = getComputedStyle(document.activeElement);
        return css.outlineStyle !== "none" && parseFloat(css.outlineWidth) >= 2;
      }), `${label}: visible keyboard focus`);
      checks++;
    }
    await page.close();
  }
  for (const width of [320, 1440]) {
    const page = await openPage("es", width);
    const config = await (await page.request.get(`${baseURL}/api/site-config`)).json();
    config.careers = { ...config.careers, es: {
      ...config.careers?.es,
      heroTitle: "Carreras y desarrollo profesional en la firma ".repeat(3),
      introText: "Contenido de prueba extenso para comprobar la composición sin recortar información. ".repeat(8),
      cultureTitle: "Lo que aprenderás trabajando junto a nuestros socios ".repeat(3),
      internshipTitle: "Semillero S&S y formación de nuevos profesionales ".repeat(3),
    } };
    config.contact = { ...config.contact, es: {
      ...config.contact?.es,
      title: "Contacto y comunicación con nuestra firma ".repeat(3),
      formTitle: "Envíenos su mensaje y datos de contacto ".repeat(3),
      fullName: "Nombre completo de la persona de contacto ".repeat(3),
      hoursDetails: "Horario de atención de prueba y condiciones de visita. ".repeat(6),
    } };
    await page.route("**/api/site-config", route => route.fulfill({ json: config }));
    for (const route of ["/careers", "/contact"]) {
      await visit(page, route);
      assert.ok((await page.locator("main h1").textContent()).length > 100, "Long title passes through existing CMS");
      const failures = await page.locator("main").evaluate(main =>
        [...main.querySelectorAll("h1,h2,h3,p,dd,label")].filter(el => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1
            || (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1));
        }).map(el => el.textContent.slice(0, 80)));
      assert.deepEqual(failures, [], `${route} ${width}: long CMS text fits`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      checks++;
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedWrites, []);
  console.log(`PASS: ${checks} body layouts across ten languages; original copy/photos/links/forms/banners preserved, no clipping or excessive bottom gaps. Captures: ${output}`);
} finally { await browser.close(); }
