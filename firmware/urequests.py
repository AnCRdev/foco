
import usocket

import ussl

def get(url, timeout=None):
    try:
        if url.startswith('https://'):
            _, _, host, path = url.split('/', 3)
            port = 443
        elif url.startswith('http://'):
            _, _, host, path = url.split('/', 3)
            port = 80
        else:
            raise ValueError("Unsupported protocol")
            
        if ':' in host:
            host, port = host.split(':', 1)
            port = int(port)
            
        addr = usocket.getaddrinfo(host, port)[0][-1]
        s = usocket.socket()
        if timeout is not None:
            s.settimeout(timeout)
        s.connect(addr)
        if port == 443:
            s = ussl.wrap_socket(s, server_hostname=host)
            
        s.write(b"GET /%s HTTP/1.0\r\nHost: %s\r\n\r\n" % (path.encode(), host.encode()))
        
        l = s.readline()
        l = l.split(None, 2)
        status = int(l[1])
        while True:
            l = s.readline()
            if not l or l == b"\r\n":
                break
                
        text = s.read().decode('utf-8')
        s.close()
        
        class Response:
            def __init__(self, text, status_code):
                self.text = text
                self.status_code = status_code
            def json(self):
                import ujson
                return ujson.loads(self.text)
            def close(self):
                pass
                
        return Response(text, status)
    except Exception as e:
        class ErrorResponse:
            def json(self): return {}
            def close(self): pass
        return ErrorResponse()
