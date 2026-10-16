import 'dotenv/config';
import { ensureCmsSchema } from '../server/cms/siteConfig';
import { importBundledMedia } from '../server/cms/mediaImport';
try {
  await ensureCmsSchema();
  const result = await importBundledMedia();
  console.log(JSON.stringify(result));
  process.exit(0);
} catch (error) {
  console.error('[MediaImport]', (error as Error).message);
  process.exit(1);
}
