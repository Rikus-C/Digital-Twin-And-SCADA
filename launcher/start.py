import sys
import time
import subprocess

while True: 
    # Run main application
    # If the main application crashes it will automatically restart 
    # process = subprocess.Popen(
    # [command, "start"], shell = True)
    process = subprocess.run(["npm", "start"], 
    capture_output=False, text=False, check=True)
    process.wait()  

    # Wait for 0.5 seconds before restarting
    time.sleep(0.5)
     
