import { Request, Response } from "express"
import ApiResponseHandler from "api-response-handler"
import { runTest } from "@metlo/testing"
import { AppDataSource } from "data-source"
import { ApiEndpointTest } from "models"
import { GetEndpointsService } from "services/get-endpoints"

export const runTestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { test, endpointUuid } = req.body
    const endpoint = await GetEndpointsService.getEndpoint(endpointUuid)
    let envVars = new Map<string, string>()
    envVars.set("baseUrl", `https://${endpoint.host}`)
    const testRes = await runTest(test, envVars)
    await ApiResponseHandler.success(res, testRes)
  } catch (err) {
    await ApiResponseHandler.error(res, err)
  }
}

export const saveTest = async (req: Request, res: Response): Promise<void> => {
  const {
    test: { uuid, name, tags, requests },
    endpointUuid,
  } = req.body
  let testInsert = await AppDataSource.getRepository(ApiEndpointTest)
    .createQueryBuilder()
    .insert()
    .into(ApiEndpointTest)
    .values({
      uuid: uuid,
      name,
      tags,
      requests,
      apiEndpoint: {
        uuid: endpointUuid,
      },
    })
    .orUpdate(["name", "tags", "requests"], ["uuid"])
    .execute()
  let resp = await AppDataSource.getRepository(ApiEndpointTest)
    .createQueryBuilder()
    .select()
    .where("uuid = :uuid", testInsert.identifiers[0])
    .getOne()
  await ApiResponseHandler.success(res, resp)
}

export const getTest = async (req: Request, res: Response): Promise<void> => {
  const { uuid } = req.params
  try {
    let resp = await AppDataSource.getRepository(ApiEndpointTest)
      .createQueryBuilder()
      .select()
      .where("uuid = :uuid", { uuid })
      .getOne()
    await ApiResponseHandler.success(res, resp)
  } catch (err) {
    await ApiResponseHandler.error(res, err)
  }
}

export const listTests = async (req: Request, res: Response): Promise<void> => {
  const { hostname } = req.query
  var resp: ApiEndpointTest[]
  try {
    let partial_resp = AppDataSource.getRepository(ApiEndpointTest)
      .createQueryBuilder("test")
      .select()
      .leftJoinAndSelect("test.apiEndpoint", "endpoint")
    if (hostname) {
      resp = await partial_resp
        .where("endpoint.host = :hostname", { hostname })
        .getMany()
    } else {
      resp = await partial_resp.getMany()
    }

    await ApiResponseHandler.success(res, resp)
  } catch (err) {
    await ApiResponseHandler.error(res, err)
  }
}

export const deleteTest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { uuid } = req.params

  try {
    let resp = await AppDataSource.getRepository(ApiEndpointTest)
      .createQueryBuilder()
      .delete()
      .from(ApiEndpointTest)
      .where("uuid = :uuid", { uuid })
      .execute()

    await ApiResponseHandler.success(res, resp)
  } catch (err) {
    await ApiResponseHandler.error(res, err)
  }
}
