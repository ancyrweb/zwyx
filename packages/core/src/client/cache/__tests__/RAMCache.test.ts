import RAMCache from "../RAMCache";

describe("subscription", () => {
  it("should notify the listener when data is set", () => {
    const cache = new RAMCache();
    const listener = jest.fn();
    const unsubscribe = cache.subscribe("foo", listener);
    cache.set("bar", null);
    expect(listener).not.toHaveBeenCalled();
    cache.set("foo", null);
    expect(listener).toHaveBeenCalledWith(["foo"]);
    unsubscribe();
    cache.set("foo", true);
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("should notify the listener when one of the keys is set", () => {
    const cache = new RAMCache();
    const listener = jest.fn();
    const unsubscribe = cache.subscribe(["foo", "bar"], listener);
    cache.set("bar", false);
    expect(listener).toHaveBeenCalledWith(["bar"]);
    cache.set("foo", false);
    expect(listener).toHaveBeenCalledWith(["foo"]);
    unsubscribe();
    cache.set("bar", true);
    expect(listener).toHaveBeenCalledTimes(2);
    cache.set("foo", true);
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it("should notify the listener when multiple keys are set", () => {
    const cache = new RAMCache();
    const listener = jest.fn();
    const unsubscribe = cache.subscribe(["foo", "bar"], listener);
    cache.merge({
      foo: true,
      bar: true
    });
    expect(listener).toHaveBeenCalledWith(["foo", "bar"]);
    unsubscribe();
    cache.merge({
      foo: false,
      bar: false
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("should notify the listener when multiple keys are set, even one that are not subscribed to", () => {
    const cache = new RAMCache();
    const listener = jest.fn();
    const unsubscribe = cache.subscribe(["foo", "bar"], listener);
    cache.merge({
      foo: true,
      bar: true,
      baz: true
    });
    expect(listener).toHaveBeenCalledWith(["foo", "bar", "baz"]);
    unsubscribe();
    cache.merge({
      foo: false,
      bar: false,
      baz: false
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
