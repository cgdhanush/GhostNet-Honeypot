"""
Definition of cli arguments used in arguments.py
"""

from argparse import ArgumentTypeError


def check_int_positive(value: str) -> int:
    try:
        uint = int(value)
        if uint <= 0:
            raise ValueError
    except ValueError:
        raise ArgumentTypeError(
            f"{value} is invalid for this parameter, should be a positive integer value"
        )
    return uint


def check_int_nonzero(value: str) -> int:
    try:
        uint = int(value)
        if uint == 0:
            raise ValueError
    except ValueError:
        raise ArgumentTypeError(
            f"{value} is invalid for this parameter, should be a non-zero integer value"
        )
    return uint


class Arg:
    # Optional CLI arguments
    def __init__(self, *args, **kwargs):
        self.cli = args
        self.kwargs = kwargs


# List of available command line options
AVAILABLE_CLI_OPTIONS = {
    # Common options
    "verbosity": Arg(
        "-v",
        "--verbose",
        help="Verbose mode (-vv for more, -vvv to get all messages).",
        action="count",
    ),
    "version": Arg(
        "-V",
        "--version",
        help="show program's version number and exit",
        action="store_true",
    ),
     "print_colorized": Arg(
        "--no-color",
        help="Disable colorization of hyperopt results. May be useful if you are "
        "redirecting output to a file.",
        action="store_false",
        default=True,
    ),
    "logfile": Arg(
        "--logfile",
        help="Path to a file where logs will be written. If not specified, logs will be written to stdout.",
        default=None,
    ),
    "hostname": Arg(
        "--hostname",
        help="Hostname or IP address to listen on (default: 0.0.0).",
        default="0.0.0.0",
    ),
    "port": Arg(
        "--port",
        help="Port number to listen on (default: 2222).",
        type=check_int_nonzero,
        default=2222,
    ),
    "ssh_version": Arg(
        "--version",
        help="SSH version string to present to clients (default: SSH-2.0-OpenSSH_7.4).",
        default="SSH-2.0-OpenSSH_7.4",
    ),
    "listen_ip_address": Arg(
        "--ip-address",
        help="IP address to listen on for the API server (default: 0.0 0.0).",
        default="0.0.0.0",
    ),
    "listen_port": Arg(
        "--port",
        help="Port number to listen on for the API server (default: 8000).",
        type=check_int_nonzero,
        default=8000,
    ),
    "CORS_origins": Arg(
        "--origins",
        help="Comma-separated list of allowed CORS origins for the API server (default: empty).",
        default="",
    ),
}
