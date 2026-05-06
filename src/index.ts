import type { Plugin } from "@opencode-ai/plugin"

export const ShowRoutedModel: Plugin = async ({ client }) => {
  const seen = new Set<string>()

  return {
    event: async ({ event }) => {
      if (event.type === "message.updated") {
        const msg = event.properties.info
        if (msg.role === "assistant" && msg.modelID && !seen.has(msg.id)) {
          seen.add(msg.id)
          const message = `Router selected: ${msg.providerID}/${msg.modelID}`

          await client.tui.appendPrompt({
            body: { text: `\n[${message}]` },
          })

          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              client.tui.showToast({
                body: {
                  message,
                  variant: "info",
                },
              })
            }, i * 2000)
          }
        }
      }
    },
  }
}
