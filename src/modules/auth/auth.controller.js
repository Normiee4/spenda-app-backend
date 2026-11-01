import { getMe as getMeService } from './auth.service.js';

export function getMe(req, res, next) {
  try {
    res.json({ success: true, data: getMeService(req) });
  } catch (err) {
    next(err);
  }
}
