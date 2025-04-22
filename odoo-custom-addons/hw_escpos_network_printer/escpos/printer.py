# -*- coding: utf-8 -*-
from __future__ import print_function

import socket

from .escpos import Escpos


class Network(Escpos):
    """Define Network printer."""

    def __init__(self, host, port=9100):
        """
        @param host : Printer's hostname or IP address.

        @param port : Port to write to
        """
        self.host = host
        self.port = port
        self.open()

    def open(self):
        """Open TCP socket and set it as escpos device."""
        self.device = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.device.connect((self.host, self.port))

        if self.device is None:
            print("Could not open socket for %s" % self.host)

    def _raw(self, msg):
        self.device.send(msg)

    def __del__(self):
        """Close TCP connection."""
        self.device.close()
