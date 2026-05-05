"""
This module contains the argument manager class
"""

from argparse import ArgumentParser, Namespace, _ArgumentGroup
from typing import Any

from ghostnet.commands.cli_options import AVAILABLE_CLI_OPTIONS


ARGS_MAIN = ["version"]

ARGS_COMMON = [
    "verbosity",
    "print_colorized",
    "logfile",
    "version",
]

ARGS_WEBSERVER: list[str] = []


class Arguments:
    """
    Arguments Class. Manage the arguments received by the cli
    """

    def __init__(self, args: list[str] | None) -> None:
        self.args = args
        self._parsed_arg: Namespace | None = None

    def get_parsed_arg(self) -> dict[str, Any]:
        """
        Return the list of arguments
        :return: List[str] List of arguments
        """
        if self._parsed_arg is None:
            self._build_subcommands()
            self._parsed_arg = self._parse_args()

        return vars(self._parsed_arg)

    def _parse_args(self) -> Namespace:
        """
        Parses given arguments and returns an argparse Namespace instance.
        """
        parsed_arg = self.parser.parse_args(self.args)
        return parsed_arg

    def _build_args(
        self, optionlist: list[str], parser: ArgumentParser | _ArgumentGroup
    ) -> None:
        for val in optionlist:
            opt = AVAILABLE_CLI_OPTIONS[val]
            parser.add_argument(*opt.cli, dest=val, **opt.kwargs)

    def _build_subcommands(self) -> None:
        """
        Builds and attaches all subcommands.
        :return: None
        """
        # Build shared arguments (as group Common Options)
        # Build main command
        self.parser = ArgumentParser(
            prog="honeypot", description="Honeypot-Based Attack Monitoring System"
        )
        self._build_args(optionlist=ARGS_COMMON, parser=self.parser)

        from ghostnet.commands import start_webserver

        subparsers = self.parser.add_subparsers(
            dest="command",
        )

        # Add webserver subcommand
        webserver_cmd = subparsers.add_parser(
            "webserver",
            help="Webserver module.",
        )
        webserver_cmd.set_defaults(func=start_webserver)
        self._build_args(optionlist=ARGS_WEBSERVER, parser=webserver_cmd)
