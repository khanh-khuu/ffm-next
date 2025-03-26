export default function generateGithubName(str: string) {
  return str
    .replaceAll('"', "")
    .replaceAll(":", "")
    .replaceAll("<", "")
    .replaceAll(">", "")
    .replaceAll("|", "")
    .replaceAll("*", "")
    .replaceAll("?", "")
    .replaceAll("\r", "")
    .replaceAll("\n", "")
    .replaceAll("\\", "")
    .replaceAll("/", "");
}
