/** Layer 4 — fabric around RAG, knowledge, LLM, guardrails, memory. */
export { rag } from "@/rag";
export { knowledge } from "@/knowledge";
export { completeXai, QUANT_SYSTEM } from "@/llm";
export { guardInbound, parseStructured } from "@/guardrails";
export { memory, readChat, writeChat } from "@/memory";
export type { ChatTurn } from "@/memory";
