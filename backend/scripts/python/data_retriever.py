# importing the modules
import os
import shutil
import tkinter

# Providing the folder path
origin = "C:\\Users\\Lenovo\\Downloads\\Works\\"
target = "C:\\Users\\Lenovo\\Downloads\\Work TP\\"

# Fetching the list of all the files
files = os.listdir(origin)

# Fetching all the files to directory
for file_name in files:

   shutil.copy(origin + file_name, target + file_name)

print("Files are copied successfully")