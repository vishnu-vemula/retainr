import { Router } from 'express';
import type { AuthMiddleware } from '../../common/middleware/auth.middleware';
import type { ProposalsController } from './proposals.controller';

export function buildProposalsRouter(controller: ProposalsController, auth: AuthMiddleware): Router {
  const router = Router();
  router.get('/public/:token', controller.publicGet);
  router.post('/public/:token/respond', controller.publicRespond);
  router.use(auth.requireAuth);
  router.get('/', controller.list);
  router.post('/', controller.create);
  return router;
}
