from onvif import ONVIFCamera
import sys

# CP Plus camera details
IP = '192.168.1.16'
PORT = 8000
USER = 'admin'
PASS = 'engineer2007'

try:
    print(f"Connecting to ONVIF on {IP}:{PORT}...")
    mycam = ONVIFCamera(IP, PORT, USER, PASS, '/wsdl/')
    # Wait, wsdl path might be different based on installation, usually onvif_zeep provides its own or we don't need it if installed
except Exception as e:
    try:
        mycam = ONVIFCamera(IP, PORT, USER, PASS) # Try default wsdl
    except Exception as e2:
        print("Failed to connect:", e2)
        sys.exit(1)

try:
    media = mycam.create_media_service()
    profiles = media.GetProfiles()
    for p in profiles:
        print(f"Profile: {p.token}")
        try:
            # Get Stream URI
            request = media.create_type('GetStreamUri')
            request.ProfileToken = p.token
            request.StreamSetup = {'Stream': 'RTP-Unicast', 'Transport': {'Protocol': 'RTSP'}}
            uri = media.GetStreamUri(request)
            print(f"  RTSP URL: {uri.Uri}")
        except Exception as e:
            print(f"  Could not get URI for profile {p.token}: {e}")
except Exception as e:
    print("Error getting media profiles:", e)
