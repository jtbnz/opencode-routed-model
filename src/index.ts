import type { Plugin } from "@opencode-ai/plugin"

function extractModel(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return undefined
  if (/^[a-f0-9]{64}$/i.test(value)) return undefined

  try {
    const url = new URL(value)
    const queryModel = url.searchParams.get("model") ?? url.searchParams.get("deployment")
    if (queryModel) return queryModel

    const pathParts = url.pathname.split("/").filter(Boolean)
    const modelIndex = pathParts.findIndex((part) => part === "models" || part === "deployments")
    if (modelIndex >= 0 && pathParts[modelIndex + 1]) return pathParts[modelIndex + 1]

    return undefined
  } catch {
    const modelMatch = value.match(/\/(?:models|deployments)\/([^/:?]+)/)
    return modelMatch ? modelMatch[1] : value
  }
}

export const ShowRoutedModel: Plugin = async ({ client }) => {
  const shown = new Set<string>()

  return {
    event: async ({ event }) => {
      if (event.type === "message.updated") {
        const msg = event.properties.info as any
        if (
          msg.role === "assistant" &&
          msg.modelID &&
          msg.time?.completed &&
          !shown.has(msg.id)
        ) {
          shown.add(msg.id)
          const apiBase = msg.responseHeaders?.["x-litellm-model-api-base"]
          const deploymentName = msg.responseHeaders?.["llm_provider-x-ms-deployment-name"]
          const litellmModelId = msg.responseHeaders?.["x-litellm-model-id"]
          const routedModel =
            extractModel(deploymentName) ??
            extractModel(litellmModelId) ??
            extractModel(apiBase) ??
            `${msg.providerID}/${msg.modelID}`
          client.tui.showToast({
            body: {
              message: `Model used: ${routedModel}`,
              variant: "info",
            },
          })
        }
      }
    },
  }
}
