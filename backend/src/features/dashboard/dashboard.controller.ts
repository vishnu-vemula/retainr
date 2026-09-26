import type { Response } from 'express';
import type { DashboardService } from './dashboard.service';
import { asyncHandler, requireUser } from '../../common/utils/async-handler';
import type { RenewalAlertSync } from '../../common/utils/renewal-alert-sync';

export class DashboardController {
  constructor(private readonly dashboard: DashboardService, private readonly renewalAlerts: RenewalAlertSync) {}

  stats = asyncHandler(async (req, res: Response) => {
    const user = requireUser(req);
    await this.renewalAlerts.syncRenewals(user.uid);
    res.json({ data: await this.dashboard.stats(user.uid) });
  });
}
