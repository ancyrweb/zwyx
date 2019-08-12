export default (config: {
  response: any,
  status?: number
}) => jest.fn((url, req) : Promise<any> => {
  const status = config.status || 200;

  const data = {
    ok: status < 400,
    redirected: false,
    status: status,
    statusText: status < 400 ? "OK" : "Error",
    type: "default",
    url,
    headers: {},
    clone() {
      return { ...data };
    },
    json() {
      return Promise.resolve(config.response);
    },
    text() {
      return Promise.resolve(JSON.stringify(config.response));
    }
  };
  return Promise.resolve(data);
})
