let socketPromise;

function getSocketBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

async function loadSocketIoGlobal() {
  if (window.io) return window.io;

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-socket-io-client="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Socket script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `${getSocketBaseUrl()}/socket.io/socket.io.js`;
    script.async = true;
    script.dataset.socketIoClient = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Socket script failed"));
    document.head.appendChild(script);
  });

  return window.io;
}

export async function getSocketClient() {
  if (!socketPromise) {
    socketPromise = loadSocketIoGlobal().then((io) =>
      io(getSocketBaseUrl(), {
        transports: ["websocket", "polling"],
      })
    );
  }

  return socketPromise;
}
