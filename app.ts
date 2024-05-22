import { Application, Context } from 'https://deno.land/x/oak/mod.ts';
import { cron, daily } from 'https://deno.land/x/deno_cron@v1.0.0/cron.ts';
import { viewEngine, etaEngine, oakAdapter } from 'https://deno.land/x/view_engine@v10.6.0/mod.ts'

import {
  fetchActivityStatus,
  fetchAlerts,
  fetchCurrentStatus,
  sendAlert
} from './controllers/activityController.ts';

daily(() => {
  fetchActivityStatus()
});

cron('1 */15 * * * *', async () => {
  const parsedCurrentStatusFile = await fetchCurrentStatus()
  const { site_status }  = parsedCurrentStatusFile.current_status

  if (site_status['@status_id'] === Deno.env.get('ALERTABLE_STATUS')) {
    await fetchActivityStatus()
    await sendAlert()
  }
});

const app = new Application();

app.use(
  viewEngine(oakAdapter, etaEngine, {
    viewRoot: './views',
  })
);

app.use(async (ctx: Context) => {
  await fetchActivityStatus()
  const alerts = await fetchAlerts()
  ctx.render('index.ejs', { alerts: alerts.reverse() } )
});

await app.listen({ port: 8000 });
