import extractRESTPath from "../extractRESTPath";

it("should extract the REST path", () => {
  expect(extractRESTPath("https://someurl.co")).toEqual("/");
  expect(extractRESTPath("https://someurl.com/")).toEqual("/");
  expect(extractRESTPath("https://someurl.com/users")).toEqual("/users");
  expect(extractRESTPath("https://someurl.com/users?args=foo")).toEqual(
    "/users?args=foo"
  );
  expect(extractRESTPath("https://someurl.org.uk/users?args=foo")).toEqual(
    "/users?args=foo"
  );
  expect(extractRESTPath("https://www.someurl.org.uk/users?args=foo")).toEqual(
    "/users?args=foo"
  );
});
