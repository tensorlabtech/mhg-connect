import { expect, it } from "vitest";
import { nextCardRevision } from "./qr-card-revision";

it("always advances a transported millisecond revision", () => {
  const prior = new Date(1000);
  expect(nextCardRevision(prior, 1000).getTime()).toBe(1001);
  expect(nextCardRevision(prior, 900).getTime()).toBe(1001);
  expect(nextCardRevision(prior, 2000).getTime()).toBe(2000);
});
