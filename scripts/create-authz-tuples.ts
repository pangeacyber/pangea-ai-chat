import { config } from "@dotenvx/dotenvx";
import { drive, auth as gauth } from "@googleapis/drive";
import { type AuthZ, AuthZService, PangeaConfig } from "pangea-node-sdk";
import { defineCommand, runMain } from "citty";

import { GoogleDriveRetriever } from "../src/google";

/** Map Google Drive roles to AuthZ File Drive schema roles. */
const GDRIVE_ROLE_TO_AUTHZ_ROLE: Record<string, string> = {
  owner: "owner",
  reader: "reader",
  writer: "editor",
};

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

config({ path: ".env.local" });

if (!process.env.GOOGLE_DRIVE_CREDENTIALS) {
  console.warn(
    "Environment variable GOOGLE_DRIVE_CREDENTIALS has not been set.",
  );
  process.exit(1);
}

const googleCredentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS!);
const retriever = new GoogleDriveRetriever({
  credentials: googleCredentials,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  scopes: SCOPES,
});

const authz = new AuthZService(
  process.env.PANGEA_SERVICE_TOKEN!,
  new PangeaConfig({ domain: process.env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN }),
);

const main = defineCommand({
  args: {
    wipe: {
      type: "boolean",
      default: false,
      description:
        "Whether or not to wipe all existing tuples before creating new ones.",
    },
  },
  async run({ args }) {
    if (args.wipe) {
      const existingTuples = await authz.tupleList({ filter: {} });
      console.log(`Deleting ${existingTuples.result.tuples.length} tuples...`);
      await authz.tupleDelete({ tuples: existingTuples.result.tuples });
    }

    // Get all documents.
    console.log("Fetching documents...");
    const docs = await retriever.invoke("");

    if (!docs.length) {
      console.warn("No documents found.");
      process.exit(0);
    }

    const auth = new gauth.GoogleAuth({
      credentials: googleCredentials,
      scopes: SCOPES,
    });
    const permissionsClient = drive({ version: "v3", auth }).permissions;
    const tuples: AuthZ.Tuple[] = [];
    for (const doc of docs) {
      const response = await permissionsClient.list({
        fileId: doc.id,
        fields: "permissions(emailAddress, role)",
      });
      const permissions = response.data.permissions ?? [];

      for (const permission of permissions) {
        tuples.push({
          subject: { type: "user", id: permission.emailAddress! },
          relation: GDRIVE_ROLE_TO_AUTHZ_ROLE[permission.role!],
          resource: { type: "file", id: doc.id },
        });
      }
    }

    console.log(`Creating ${tuples.length} tuples...`);
    await authz.tupleCreate({ tuples });

    console.log("Done.");
  },
});

runMain(main);
