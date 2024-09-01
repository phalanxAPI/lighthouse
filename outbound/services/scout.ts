import { ResponseSchema, SchemaType } from "@google/generative-ai";
import { RequestLogSchemaDoc } from "../../arsenal/models/request-log";
import { executeGemini } from "./gemini";
import Issue from "../../arsenal/models/issue";
import { SecurityConfigType } from "../../arsenal/types/security-conf";

const DEFAULT_RES_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    concern: { type: SchemaType.BOOLEAN },
    severity: {
      type: SchemaType.STRING,
      enum: ["HIGH", "LOW"],
      nullable: true,
    },
    description: { type: SchemaType.STRING, nullable: true },
  },
};

export type ResponseType = {
  concern: boolean;
  severity?: "HIGH" | "LOW";
  description: string;
};

export const scoutAPILogs = async (
  history: RequestLogSchemaDoc[],
  current: RequestLogSchemaDoc,
  options: {
    appId: string;
    serverId: string;
  }
) => {
  try {
    let prompt =
      "You are a very senior security engineer. Your goal is to prevent `Unsafe Consumption of APIs` You have been asked to review the logs of external calls made by our servers for a particular endpoint. You are given the last 20 logs of the same API call and the current call. Please review the logs and provide the result if there are any security concerns. Provide details of the security concern and the severity of the issue if any. Keep the description concise.\n\n";
    prompt += "Logs:\n";
    prompt += history
      .map((log, index) => `Log ${index + 1}:\n${JSON.stringify(log)}`)
      .join("\n");
    prompt += "\nCurrent Log:\n";
    prompt += JSON.stringify(current);

    const result = await executeGemini(prompt, DEFAULT_RES_SCHEMA);
    const formattedResponse = JSON.parse(
      result.response.text()
    ) as ResponseType;

    if (formattedResponse.concern) {
      const issueDescription =
        "API: `" +
        (current.method ? current.method.toUpperCase() : "") +
        "` " +
        current.url +
        " is consuming APIs in an unsafe manner.\nRequest Server: " +
        options.serverId +
        "\n\nnConcerned Request Data: \n" +
        JSON.stringify(current, null, 2) +
        "\n\nLogs history: \n" +
        history
          .map(function (log) {
            return JSON.stringify(log, null, 2);
          })
          .join("\n") +
        "\n\nExplanation: \n" +
        formattedResponse.description;

      await Issue.create({
        appId: options.appId,
        title: SecurityConfigType.UNSAFE_CONSUMPTION_OF_APIS,
        description: issueDescription,
        severity: formattedResponse.severity || "HIGH",
      });
      return formattedResponse;
    }
  } catch (err) {
    console.error(`Error scouting API logs: ${err}`);
  }
};