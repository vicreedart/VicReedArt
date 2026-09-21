export function assertTargets(remote, configuredAccount, environmentAccount) {
  let approvedRepository =
    /^git@github\.com:vicreedart\/VicReedArt(?:\.git)?$/i.test(remote);
  try {
    const url = new URL(remote);
    approvedRepository =
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      !url.port &&
      !url.search &&
      !url.hash &&
      /^\/vicreedart\/VicReedArt(?:\.git)?\/?$/i.test(url.pathname);
  } catch {
    // Git's SSH shorthand is checked above. Never log remote credentials.
  }
  if (!approvedRepository)
    throw new Error(
      "Deployment refused: origin must be vicreedart/VicReedArt.",
    );
  const account = "96beea4cdf2cb1c69115c88264af1c01";
  if (
    configuredAccount !== account ||
    (environmentAccount && environmentAccount !== account)
  )
    throw new Error(
      "Deployment refused: only the artist’s Cloudflare account is allowed.",
    );
}
