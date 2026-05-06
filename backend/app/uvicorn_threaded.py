import threading
import time

import uvicorn


class UvicornServer(uvicorn.Server):

    def run(self, sockets=None):
        import asyncio

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        loop.run_until_complete(self.serve(sockets=sockets))

    def run_in_thread(self):
        self.thread = threading.Thread(target=self.run, name="FTUvicorn")
        self.thread.start()
        self.thread.join()

        while not self.started:
            time.sleep(1e-3)

    def cleanup(self):
        self.should_exit = True
        self.thread.join()