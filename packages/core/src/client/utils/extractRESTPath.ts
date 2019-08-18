const urlWithSlashRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{1,4}(\/?([-a-zA-Z0-9@:%_?=]+\/?)*)$/;

/**
 * Return the REST part of the URL
 * https://site.com/foo/bar => /foo/bar
 * @param url
 */
export default (url: string) => {
  let result = urlWithSlashRegex.exec(url);
  return result ? result[2] || "/" : null;
};
