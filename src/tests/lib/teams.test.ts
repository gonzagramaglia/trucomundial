import { describe, it, expect } from "vitest";
import {
  DEFAULT_TEAMS,
  ALL_TEAMS_LIST,
  isValidTeamSelection,
  getValidTeams,
} from "../../lib/teams";

describe("teams helper", () => {
  it("has valid DEFAULT_TEAMS", () => {
    expect(DEFAULT_TEAMS).toHaveLength(4);
    expect(isValidTeamSelection(DEFAULT_TEAMS)).toBe(true);
  });

  it("has 48 teams in ALL_TEAMS_LIST", () => {
    expect(ALL_TEAMS_LIST).toHaveLength(48);
  });

  it("validates valid 4 distinct team IDs", () => {
    expect(isValidTeamSelection(["Argentina", "Brasil", "Francia", "España"])).toBe(true);
  });

  it("rejects invalid selections", () => {
    expect(isValidTeamSelection(null)).toBe(false);
    expect(isValidTeamSelection(undefined)).toBe(false);
    expect(isValidTeamSelection(["Argentina", "Brasil"])).toBe(false);
    expect(isValidTeamSelection(["Argentina", "Brasil", "Francia", "España", "Alemania"])).toBe(false);
    expect(isValidTeamSelection(["Argentina", "Argentina", "Francia", "España"])).toBe(false);
    expect(isValidTeamSelection(["Argentina", "Brasil", "Francia", "Atlantis"])).toBe(false);
    expect(isValidTeamSelection([1, 2, 3, 4])).toBe(false);
  });

  it("parses stored JSON with safe fallback to DEFAULT_TEAMS", () => {
    expect(getValidTeams(null)).toEqual(DEFAULT_TEAMS);
    expect(getValidTeams("")).toEqual(DEFAULT_TEAMS);
    expect(getValidTeams("invalid json {")).toEqual(DEFAULT_TEAMS);
    expect(getValidTeams(JSON.stringify(["Argentina", "Atlantis", "Francia", "España"]))).toEqual(DEFAULT_TEAMS);
    expect(getValidTeams(JSON.stringify(["Argentina", "Brasil", "Francia"]))).toEqual(DEFAULT_TEAMS);

    const valid = ["Brasil", "Alemania", "Japón", "Uruguay"];
    expect(getValidTeams(JSON.stringify(valid))).toEqual(valid);
  });
});
