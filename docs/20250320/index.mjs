export function generateCode(script) {
  return new Blob([ script ], { type: "application/javascript" });
}
