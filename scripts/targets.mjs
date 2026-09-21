export function assertTargets(remote, configuredAccount, environmentAccount) {
  if (
    !/^(https:\/\/github\.com\/vicreedart\/VicReedArt(?:\.git)?|git@github\.com:vicreedart\/VicReedArt(?:\.git)?)$/i.test(
      remote,
    )
  )
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
