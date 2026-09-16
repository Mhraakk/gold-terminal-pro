/** Object storage interface. Dev: none. Generated images would land here. */
export const files = {
  enabled: false as const,
  async put(_key: string, _bytes: Uint8Array) {
    throw new Error("files adapter disabled");
  },
};
