import { AuthType } from "@common/enums"
import { SessionMeta } from "@common/types"
import { AppDataSource } from "data-source"
import { ApiTrace, AuthenticationConfig } from "models"
import { encrypt, generate_iv } from "utils/encryption"

export class AuthenticationConfigService {
  static async setSessionMetadata(apiTrace: ApiTrace) {
    const authConfigRepo = AppDataSource.getRepository(AuthenticationConfig)
    const authConfig = await authConfigRepo.findOneBy({
      host: apiTrace.host,
    })
    if (!authConfig) {
      return
    }
    const key = process.env.ENCRYPTION_KEY
    const encryptionKey = Buffer.from(key, "base64")
    const keypairIv = generate_iv()

    const requestHeaders = apiTrace.requestHeaders
    const successfulAuth =
      apiTrace.responseStatus !== 401 && apiTrace.responseStatus !== 403
    let sessionMeta: SessionMeta = {
      authenticationProvided: false,
      authType: authConfig.authType,
      authenticationSuccessful: successfulAuth,
    } as SessionMeta
    requestHeaders.forEach(header => {
      switch (authConfig.authType) {
        case AuthType.BASIC:
          const authHeaderBasic = header.name.toLowerCase()
          const authHeaderValue = header.value.toLowerCase().includes("basic")
          if (authHeaderBasic === "authorization" && authHeaderValue) {
            const encodedValue = header.value.split("Basic")[1].trim()
            const decodedUser = Buffer.from(encodedValue, "base64")
              ?.toString()
              ?.split(":")[0]
            const { encrypted, tag } = encrypt(
              encodedValue,
              encryptionKey,
              keypairIv,
            )
            sessionMeta = {
              authenticationProvided: true,
              authenticationSuccessful: successfulAuth,
              authType: authConfig.authType,
              uniqueSession: {
                key: encrypted,
                iv: keypairIv.toString("base64"),
                tag: tag.toString("base64"),
              },
              user: decodedUser,
            }
          }
          break
        case AuthType.HEADER:
          const authHeader = authConfig.headerKey ?? ""
          if (header.name.toLowerCase() === authHeader.toLowerCase()) {
            const headerValue = header.value
            const { encrypted, tag } = encrypt(
              headerValue,
              encryptionKey,
              keypairIv,
            )
            sessionMeta = {
              authenticationProvided: true,
              authenticationSuccessful: successfulAuth,
              authType: authConfig.authType,
              uniqueSession: {
                key: encrypted,
                iv: keypairIv.toString("base64"),
                tag: tag.toString("base64"),
              },
            }
          }
          break
        case AuthType.SESSION_COOKIE:
          const cookieName = authConfig?.cookieName ?? ""
          if (header.name.toLowerCase() === cookieName.toLowerCase()) {
            const cookieValue = header.value
            const { encrypted, tag } = encrypt(
              cookieValue,
              encryptionKey,
              keypairIv,
            )
            sessionMeta = {
              authenticationProvided: true,
              authenticationSuccessful: successfulAuth,
              authType: authConfig.authType,
              uniqueSession: {
                key: encrypted,
                iv: keypairIv.toString("base64"),
                tag: tag.toString("base64"),
              },
            }
          }
          break
        case AuthType.JWT:
          const jwtHeader = authConfig.headerKey ?? ""
          if (header.name.toLowerCase() === jwtHeader.toLowerCase()) {
            const { encrypted, tag } = encrypt(
              header.value,
              encryptionKey,
              keypairIv,
            )
            sessionMeta = {
              authenticationProvided: true,
              authenticationSuccessful: successfulAuth,
              authType: authConfig.authType,
              uniqueSession: {
                key: encrypted,
                iv: keypairIv.toString("base64"),
                tag: tag.toString("base64"),
              },
            }
            const decodedPayload = JSON.parse(
              Buffer.from(
                header.value?.split(".")?.[1] ?? "",
                "base64",
              )?.toString() || "{}",
            )
            if (authConfig.jwtUserPath) {
              const jwtUser = authConfig.jwtUserPath
                .split(".")
                .reduce((o, k) => {
                  return o && o[k]
                }, decodedPayload)
              if (jwtUser && typeof jwtUser === "string") {
                sessionMeta = {
                  ...sessionMeta,
                  user: jwtUser,
                }
              }
            }
          }
          break
        default:
      }
    })
    apiTrace.sessionMeta = sessionMeta
  }
}