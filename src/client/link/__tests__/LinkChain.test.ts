import LinkChain from "../LinkChain";
import * as Observable from "zen-observable";

it("should refuse an empty list of links", () => {
  expect(() => {
    new LinkChain([]);
  }).toThrow();
});

it("should accept one simple link", async () => {
  const mockLink = (data: any) => {
    return Observable.from([data]);
  };
  const link = new LinkChain([mockLink]);
  const result = await link.emit({ foo: "bar" });
  expect(result).toEqual({ foo: "bar" });
});

it("should let data pass by multiple links", async () => {
  const firstLink = (data: any, forward) => {
    return new Observable(obs => {
      forward({
        ...data,
        passedByFirst: true
      }).subscribe({
        next: obs.next.bind(obs),
        error: obs.error.bind(obs),
        complete: obs.complete.bind(obs)
      });
    });
  };
  const terminalLink = (data: any) => {
    return Observable.from([
      {
        ...data,
        passedBySecond: true
      }
    ]);
  };

  const link = new LinkChain([firstLink, terminalLink]);
  const result = await link.emit({});
  expect(result).toEqual({
    passedByFirst: true,
    passedBySecond: true
  });
});
