#!/usr/bin/env python


import SimpleHTTPServer
import SocketServer
import os
import sys


WRAPPER = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/markdown.css">
</head>
<body>{}</body>
</html>
"""

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self._root = ROOT
        return SimpleHTTPServer.SimpleHTTPRequestHandler.__init__(self, *args, **kwargs)

    def do_GET(self):
        if self.path == "/markdown.css":
            old_root = self._root
            old_path = self.path

            self._root = SCRIPT_ROOT
            self.path = "/github.css"
            result = self.do_GET()

            self.path = old_path
            self._root = old_root

            return result

        if self.path.endswith(".md"):
            import subprocess

            path = self.translate_path(self.path)
            try:
                f = open(path, "rb")
            except IOError:
                self.send_error(404, "File not found")
                return

            html, err = subprocess.Popen([SCRIPT_ROOT + "/node_modules/.bin/marked", "--gfm", "-i", path], stdout=subprocess.PIPE).communicate()
            html = WRAPPER.format(html)

            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", len(html))
            self.end_headers()
            self.wfile.write(html)
            return

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            if not self.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(307)
                self.send_header("Location", self.path + "/")
                self.end_headers()
                return None
            for index in "index.md", "index.html", "index.htm":
                if os.path.exists(os.path.join(path, index)):
                    self.send_response(307)
                    self.send_header("Location", self.path + index)
                    self.end_headers()
                    return None
            else:
                chunks = []
                chunks.append("<table><tbody>")
                for filename in os.listdir(path):
                    chunks.append("<tr><td><a href=\"{0}\">{0}</a></td></tr>".format(filename))
                chunks.append("</tbody></table>")
                html = WRAPPER.format("".join(chunks))

                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.send_header("Content-Length", len(html))
                self.end_headers()
                self.wfile.write(html)

                # self.send_error(404, "File not found")
                return

        return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def translate_path(self, path):
        import posixpath
        import urllib

        path = path.split('?',1)[0]
        path = path.split('#',1)[0]
        path = posixpath.normpath(urllib.unquote(path))
        words = path.split('/')
        words = filter(None, words)
        path = self._root
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', type=int, default=8080, help='The port.')
    parser.add_argument('-r', '--root', default='.', help='The root directory to host.')
    args = parser.parse_args()

    global PORT
    global ROOT
    global SCRIPT_ROOT
    PORT = args.port
    ROOT = os.path.abspath(args.root)
    SCRIPT_ROOT = os.path.abspath(os.path.dirname(sys.argv[0]))

    httpd = SocketServer.TCPServer(("", PORT), MyHandler)

    print "serving {} at port {}".format(ROOT, PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

    return 0


if __name__ == '__main__':
    sys.exit(main())
