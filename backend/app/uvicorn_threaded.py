import threading
import time

import uvicorn


class UvicornServer(uvicorn.Server):

    def run(self, sockets=None):
        import asyncio

        """
        Parent implementation calls self.config.setup_event_loop(),
            but we need to create uvloop event loop manually
        """
        try:
            import uvloop
        except ImportError:  # pragma: no cover
            asyncio.set_event_loop(uvloop.new_event_loop())
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # When running in a thread, we'll not have an eventloop yet.
            loop = asyncio.new_event_loop()
        loop.run_until_complete(self.serve(sockets=sockets))

    def run_in_thread(self):
        self.thread = threading.Thread(target=self.run, name="FTUvicorn")
        self.thread.start()
        while not self.started:
            time.sleep(1e-3)

    def cleanup(self):
        self.should_exit = True
        self.thread.join()