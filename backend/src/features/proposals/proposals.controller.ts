import type { Response } from 'express';
import { asyncHandler, requireUser } from '../../common/utils/async-handler';
import { AppError } from '../../common/utils/app-error';
import type { ProposalsService } from './proposals.service';
import { createProposalSchema, listProposalsSchema, respondProposalSchema } from './proposals.schemas';

export class ProposalsController {
  constructor(private readonly proposals: ProposalsService) {}

  create = asyncHandler(async (req, res: Response) => {
    const user = requireUser(req);
    const input = createProposalSchema.parse(req.body);
    res.status(201).json({ data: await this.proposals.create(user.uid, input) });
  });

  list = asyncHandler(async (req, res: Response) => {
    const user = requireUser(req);
    const { dealId } = listProposalsSchema.parse(req.query);
    res.json({ data: await this.proposals.list(user.uid, dealId) });
  });

  publicGet = asyncHandler(async (req, res: Response) => {
    const { token } = req.params;
    if (!token) throw AppError.notFound('Proposal');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.json({ data: await this.proposals.getPublic(token) });
  });

  publicRespond = asyncHandler(async (req, res: Response) => {
    const { token } = req.params;
    if (!token) throw AppError.notFound('Proposal');
    const input = respondProposalSchema.parse(req.body);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.json({ data: await this.proposals.respond(token, input) });
  });
}
