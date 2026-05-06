import type { Plugin } from "@opencode-ai/plugin"

export const ShowRoutedModel: Plugin = async ({ client }) => {
  const shown = new Set<string>()

  return {
    event: async ({ event }) => {
      if (event.type === "message.updated") {
        const msg = event.properties.info
        if (
          msg.role === "assistant" &&
          msg.modelID &&
          msg.time?.completed &&
          !shown.has(msg.id)
        ) {
          shown.add(msg.id)
          client.tui.showToast({
            body: {
              message: `Model selected: ${msg.providerID}/${msg.modelID}`,
              variant: "info",
            },
          })
        }
      }
    },
  }
}
