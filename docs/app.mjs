/*
(c) 2025 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Main from "./main.mjs";
import * as AppScript from "./appScript@20250321.mjs";

const script = "export function hello() { console.log(\"Hello World!\"); }";
const controlled = new Promise((resolve) => {
  navigator.serviceWorker.addEventListener("controllerchange", resolve)
});
navigator.serviceWorker.register("sw.js");
console.log("registering");
navigator.serviceWorker.ready.then(() => { console.log("service worker ready"); });
controlled.then(() => { console.log("controlled"); });
(async () => {
  await controlled;
  console.log("controlled");
  const blobScript = AppScript.generateCode(script);
  const urlChannel = new MessageChannel();
  navigator.serviceWorker.controller.postMessage({
    name: "url",
    port: urlChannel.port2,
  }, [ urlChannel.port2 ]);
  await new Promise((resolve) => {
    urlChannel.port1.addEventListener("message", resolve);
    urlChannel.port1.start();
  });
  const contents = await blobScript.arrayBuffer();
  urlChannel.port1.postMessage({
    method: "add",
    url: "https://my-modules/test.mjs",
    contentType: blobScript.type,
    contents,
  }, [ contents ]);
  await new Promise((resolve) => {
    urlChannel.port1.postMessage("message", (evt) => {
      if ((evt.data.type === "added") && (evt.data.url === "https://my-modules/test.mjs")) {
         resolve();
      }
    });
  });
  const test = await import("https://my-modules/test.mjs");
  test.hello();
})();
