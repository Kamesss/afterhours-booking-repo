import { UserModel } from '../models/UserModel';
import { ApiResponseView } from '../views/ApiResponseView';
import { D1Database, User } from '../../types';

export class UserController {
  private userModel: UserModel;

  constructor(db: D1Database) {
    this.userModel = new UserModel(db);
  }

  async index(): Promise<Response> {
    try {
      const rawUsers = await this.userModel.findAll();
      return ApiResponseView.success(rawUsers);
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to fetch users from D1', err.message);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Partial<User>;
      if (!body.email || !body.name) {
        return ApiResponseView.badRequest('Name and Email are required');
      }

      const created = await this.userModel.create(body);
      if (!created) {
        return ApiResponseView.serverError('Failed to create user in D1');
      }

      return ApiResponseView.created(created);
    } catch (err: any) {
      return ApiResponseView.serverError('Failed to save user', err.message);
    }
  }
}
