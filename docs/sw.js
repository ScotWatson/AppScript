/*
(c) 2025 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let urlPort;
const resources = new Map();

self.addEventListener("install", (evt) => {
  urlPort = null;
  console.log("sw.js installed");
});

self.addEventListener("activate", (evt) => {
  self.clients.claim();
  console.log("sw.js activated");
});

self.addEventListener("fetch", (evt) => {
  const resource = resources.get(evt.request.url);
  if (resource) {
    evt.respondWith(new Response({
      body: resource,
    }));
  }
  evt.respondWith(fetch(evt.request));
});

self.addEventListener("message", (evt) => {
  switch (evt.data.name) {
    case "url":
      urlPort = evt.data.port;
      urlPort.addEventListener("message", urlPortHandler);
      urlPort.start();
      urlPort.postMessage(null);
      break;
    default:
      throw new Error("unrecognized port name");
  };
});

function urlPortHandler(evt) {
  resources.set(evt.data.url, evt.data.contents);
  evt.source.postMessage({
    type: "added",
    url: evt.data.url,
  });
}
