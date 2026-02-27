import { Hono } from 'hono';
import routineTracker from './routine';
import treatmentsRoute from './treatments';
import treatmentLogsRoute from './treatment-logs';

import summaryRoute from './summary';
import heatmapRoute from './heatmap';

type Env = { DATABASE_URL: string };

const tracker = new Hono<{ Bindings: Env }>();

tracker.route('/routine', routineTracker);
tracker.route('/treatments', treatmentsRoute);
tracker.route('/treatment-logs', treatmentLogsRoute);

tracker.route('/summary', summaryRoute);
tracker.route('/heatmap', heatmapRoute);

export default tracker;
