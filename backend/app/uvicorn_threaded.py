import threading
import time
import asyncio
import uvicorn


class UvicornServer(uvicorn.Server):

    def run(self, sockets=None):
        # Proper way: use asyncio to run the server
        asyncio.run(self.serve(sockets=sockets))

    def run_in_thread(self):
        self.thread = threading.Thread(
            target=self.run,
            kwargs={"sockets": None},
            name="FTUvicorn",
            daemon=True,
        )
        self.thread.start()

        # Wait until server is started
        while not self.started:
            time.sleep(0.01)

    def cleanup(self):
        # Signal uvicorn to stop
        self.should_exit = True

        # Wait for thread to finish safely
        if hasattr(self, "thread"):
            self.thread.join(timeout=5)