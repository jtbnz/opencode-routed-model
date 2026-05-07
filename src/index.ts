import type { Plugin } from "@opencode-ai/plugin"

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
          const routedModelRaw = deploymentName ?? apiBase ?? `${msg.providerID}/${msg.modelID}`
          // If the value is a full URL, extract just the model name from the path
          const urlModelMatch = routedModelRaw.match(/\/models\/([^/:]+)/)
          const routedModel = urlModelMatch ? urlModelMatch[1] : routedModelRaw
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
