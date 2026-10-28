import { User, UserApiResponse } from "../types/user.types";



export function mapUser(
  dto: UserApiResponse
): User {

  return {
    id: dto.id,

    email: dto.email,

    mobile: dto.mobile,

    firstName: dto.first_name,

    lastName: dto.last_name,
    user_type: dto.user_type,
  };

}
