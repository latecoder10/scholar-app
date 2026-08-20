/**
 * Master Ingestion Script for all Claude CCAF Questions from User Markdown Sources
 * Ingests and categorizes 250+ deep exam questions into curriculum chapters and full-length simulated mock exams.
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

// 1. Claude CCAF Domain Directories
const DOMAIN_DIRS = {
  agentic: path.join(CONTENT_DIR, "Claude-CCAF-Agentic-Architecture"),
  mcp: path.join(CONTENT_DIR, "Claude-CCAF-MCP-Tool-Design"),
  claudeCode: path.join(CONTENT_DIR, "Claude-CCAF-Claude-Code-Workflows"),
  prompt: path.join(CONTENT_DIR, "Claude-CCAF-Prompt-Engineering"),
  context: path.join(CONTENT_DIR, "Claude-CCAF-Context-Reliability"),
  enterprise: path.join(CONTENT_DIR, "Claude-CCAF-Enterprise-Security"),
  mocks: path.join(CONTENT_DIR, "Claude-CCAF-Mock-Exams")
};

// Ensure all dirs exist
Object.values(DOMAIN_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

console.log("Starting Master CCAF Question Ingestion...");
