import express, { Express, json } from "express";
import request from "supertest";
import { SnifferManager, SnifferManagerController } from "../../../lib";
import { SnifferConfig } from "../../../lib/sniffer/sniffer";
import { ConfigLoader } from "../../../lib/model/setup-config/config-loader-interface";
import { SnifferConfigSetup } from "../../../lib/model/setup-config/file-config.types";
import { FileConfig } from "../../../lib/model/setup-config/file-config";

jest.mock("../../../lib/model/setup-config/file-config", () => {
  class MockFileConfig implements ConfigLoader {
    configData: SnifferConfigSetup[];

    constructor(configData: SnifferConfigSetup[]) {
      this.configData = configData;
    }

    getConfig(): SnifferConfigSetup[] {
      throw new Error("Method not implemented.");
    }

    getSetup(): SnifferConfigSetup[] {
      return [];
    }

    update(
      existingId: string,
      newConfig: SnifferConfig,
      isStarted: boolean,
    ): void {}
    addSniffer(snifferConfig: SnifferConfig): void {}
    removeSniffer(port: number): void {}
    setIsStarted(snifferId: string, isStarted: boolean): void {}
  }

  return { FileConfig: MockFileConfig };
});

describe("sniffer-manager-controller", () => {
  let app: Express;
  let configPersistency: ConfigLoader;
  let snifferManager: SnifferManager;
  let snifferManagerController: SnifferManagerController;

  beforeAll(() => {
    app = express();
    app.use(json());
    configPersistency = new FileConfig("");
    snifferManager = new SnifferManager(configPersistency);
    snifferManagerController = new SnifferManagerController(snifferManager);
    snifferManagerController.setup(app);
  });

  it("should exist", async () => {
    expect(snifferManagerController).toBeDefined();
  });

  it("should add sniffer", async () => {
    const snifferConfig: SnifferConfig = {
      downstreamUrl: "http://localhost:5173",
      port: 5555,
      id: "id",
      name: "sharkio",
    };

    const response = await request(app)
      .post("/sharkio/sniffer")
      .set("Content-Type", "application/json")
      .send(snifferConfig);

    expect(response.status).toEqual(201);
    expect(snifferManager.getAllSniffers().length).toEqual(1);
  });
});