export function handleResponse(response) {
  let { content, contentType } = response;

  if (/image\/svg\+xml/.test(contentType)) {
    content = content.replace(/#/g, "%23");
  }
  return { content, contentType };
}
