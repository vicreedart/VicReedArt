export function assertSanityTarget(
  projectId: string | undefined,
  dataset: string | undefined,
) {
  if (projectId !== "oifmrrva" || dataset !== "production")
    throw new Error(
      "Sanity operation refused: only the artist’s project oifmrrva and production dataset are allowed.",
    );
}
