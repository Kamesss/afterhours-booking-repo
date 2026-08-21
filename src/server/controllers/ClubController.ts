import { ClubModel } from '../models/ClubModel';
import { ClubView } from '../views/ClubView';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database, Club } from '../../types';

export class ClubController {
  private clubModel: ClubModel;

  constructor(db: D1Database) {
    this.clubModel = new ClubModel(db);
  }

  async index(): Promise<Response> {
    try {
      const rawClubs = await this.clubModel.findAll(true);
      const clubs = ClubView.renderList(rawClubs);
      return ApiResponseView.success(clubs);
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to fetch clubs from D1', err.message);
    }
  }

  async show(idOrSlug: string): Promise<Response> {
    try {
      const rawClub = await this.clubModel.findByIdOrSlug(idOrSlug);
      if (!rawClub) {
        return ApiResponseView.notFound(`Club '${idOrSlug}' not found in D1`);
      }
      return ApiResponseView.success(ClubView.render(rawClub));
    } catch (err: any) {
      return ApiResponseView.serverError(`Failed to fetch club ${idOrSlug}`, err.message);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<Club>;
      if (!body.name || !body.address) {
        return ApiResponseView.badRequest('Club name and address are required');
      }

      const created = await this.clubModel.create(body);
      if (!created) {
        return ApiResponseView.serverError('Failed to create club record');
      }

      return ApiResponseView.created(ClubView.render(created));
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to insert club into D1', err.message);
    }
  }
}
