import urllib.request
import urllib.error

url = 'http://192.168.1.16:8000/onvif/device_service'
data = b'<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/></s:Body></s:Envelope>'

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/soap+xml; charset=utf-8'})

try:
    print('Sending ONVIF Ping to port 8000...')
    r = urllib.request.urlopen(req, timeout=3)
    print(f'Status: {r.status}')
    print(r.read()[:200])
except urllib.error.URLError as e:
    print(f'URL Error: {e.reason}')
except urllib.error.HTTPError as e:
    print(f'HTTP Error: {e.code} {e.reason}')
except Exception as e:
    print(f'Error: {e}')
