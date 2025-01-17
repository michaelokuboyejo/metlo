import ApiResponseHandler from "api-response-handler"
import { Request, Response } from "express"
import { UserService } from "services/user"
import { LoginUserParams, RegisterUserParams } from "types"

export const registerUserHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const registerUserParams: RegisterUserParams = req.body
    const userApiKey = await UserService.registerUser(registerUserParams)
    const payload = {
      msg: "Successfully registered user",
      apiKey: userApiKey,
    }
    await ApiResponseHandler.success(res, payload)
  } catch (err) {
    await ApiResponseHandler.error(res, err)
  }
}

export const loginUserHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const loginUserParams: LoginUserParams = req.body
    const userPayload = await UserService.loginUser(loginUserParams)
    await ApiResponseHandler.success(res, userPayload)
  } catch (err) {
    await ApiResponseHandler.error(res, err)
  }
}
