import { UserModel } from '../models/UserModel';
import { ApiResponseView } from '../views/ApiResponseView';

export class UserController {
  private userModel: UserModel;

  constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  async getAllUsers(): Promise<Response> {
    try {
      const users = await this.userModel.getAll();
      return ApiResponseView.json({ success: true, data: users });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to fetch users: ${err.message}`, 500);
    }
  }

  async getUserByPromoterCode(code: string): Promise<Response> {
    try {
      const user = await this.userModel.getByPromoterCode(code);
      if (!user) return ApiResponseView.error('Promoter code not found', 404);
      return ApiResponseView.json({ success: true, data: user });
    } catch (err: any) {
      return ApiResponseView.error(`Failed to verify promoter code: ${err.message}`, 500);
    }
  }
}
