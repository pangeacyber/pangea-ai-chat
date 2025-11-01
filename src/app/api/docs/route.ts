import type { NextRequest } from "next/server";
import { BedrockEmbeddings } from "@langchain/aws";
import type { AuthZ } from "pangea-node-sdk";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import type { PangeaResponse } from "@src/types";
import { GoogleDriveRetriever } from "@src/google";

import { authzCheckRequest, validateToken } from "../requests";

const docsLoader = new GoogleDriveRetriever({
  credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS!),
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const embeddingsModel = new BedrockEmbeddings({
  region: process.env.PANGEA_AI_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface RequestBody {
  /** Whether or not to apply AuthZ. */
  authz: boolean;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  const { success, username } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: RequestBody = await request.json();

  const vectorStore = await MemoryVectorStore.fromDocuments(
    await docsLoader.invoke(""), // Load all documents.
    embeddingsModel,
  );
  const retriever = vectorStore.asRetriever();
  let docs = await retriever.invoke(body.userPrompt);

  // Filter documents based on user's permissions in AuthZ.
  const authzResponses: PangeaResponse<AuthZ.CheckResult>[] = [];
  if (body.authz) {
    docs = await Promise.all(
      docs.map(async (doc) => {
        const response = await authzCheckRequest({
          subject: { type: "user", id: username },
          action: "read",
          resource: { type: "file", id: doc.id },
          debug: true,
        });
        if ("request_id" in response) {
          authzResponses.push({
            request_id: response.request_id,
            request_time: response.request_time,
            response_time: response.response_time,
            result: response.result,
            status: response.status,
            summary: response.summary,
          });
        }
        return response.result.allowed ? doc : null;
      }),
    ).then((results) => results.filter((doc) => doc !== null));
  }

  return Response.json({
    authzResponses,
    documents: docs.map(({ id, metadata, pageContent }) => ({
      id,
      metadata,
      pageContent,
    })),
  });
}
