import os
import json
import pandas
import tkinter
import tkcalendar
import numpy as np
import datetime as dt
import tkinter.scrolledtext
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime as convert
     
# clear console
os.system("clear");

##########################
# Global Scope Variables # 
##########################

addedNames      = []
infoLocations   = []
allInfoToPlot   = []

###############################
# All functions and Callbacks # 
###############################

def PlotTheRequestedInfo():

    fig = plt.figure(1)

    #
    for tagNum in range(len(allInfoToPlot)):

        times = []

        #
        for x in range(len(allInfoToPlot[tagNum][1])):

            times.append(convert.strptime(allInfoToPlot[tagNum][1][x], '%Y/%m/%d %H:%M:%S'))

        ax = fig.add_subplot(len(allInfoToPlot), 1, tagNum + 1)
        ax.set_title(allInfoToPlot[tagNum][0])
        ax.grid("on")
        ax.plot(times, allInfoToPlot[tagNum][2])

    plt.show()

def FormatInfoArray(start, stop):

    #
    for tagNum in range(len(allInfoToPlot)):

        tagDateValid = True

        #
        for x in range(len(allInfoToPlot[tagNum][1])):

            #
            if (allInfoToPlot[tagNum][1][x] > stop[0]):
                tagDateValid = False
            
            #
            if (allInfoToPlot[tagNum][2][x] > stop[1]):
                tagDateValid = False

            #
            if (not tagDateValid):

                #
                allInfoToPlot[tagNum][1] = allInfoToPlot[tagNum][1][0:x]
                allInfoToPlot[tagNum][2] = allInfoToPlot[tagNum][2][0:x]
                allInfoToPlot[tagNum][3] = allInfoToPlot[tagNum][3][0:x]

                break

    #
    for tagNum in range(len(allInfoToPlot)):

        #
        for x in range(len(allInfoToPlot[tagNum][1])):

            allInfoToPlot[tagNum][1][x] = allInfoToPlot[tagNum][1][x] + " " + allInfoToPlot[tagNum][2][x]

        del allInfoToPlot[tagNum][2]

    PlotTheRequestedInfo()

def AddInfoToArray(newInfo):

    addNew = False

    #
    if (newInfo[0] not in addedNames):
        addedNames.append(newInfo[0])
        addNew = True

    if (not addNew):

        #
        for logNum in range(len(allInfoToPlot)):

            #
            if (allInfoToPlot[logNum][0] == newInfo[0]):

                #
                for x in range(len(newInfo[1])):

                    allInfoToPlot[logNum][1].append(newInfo[1][x])
                    allInfoToPlot[logNum][2].append(newInfo[2][x])
                    allInfoToPlot[logNum][3].append(newInfo[3][x])

    #
    if (addNew):

        allInfoToPlot.append(newInfo)

def GatherAllInfo(requested_headers, start, stop):

    # for all folders that contains info
    for folder in infoLocations:

        # for all files in a folder
        for file in os.scandir(folder):

            fileDateValid = True

            #
            currentFileDate = file.name.split("_")[1].split(".")[0]
            currentFileTime = file.name.split("_")[2].split(".")[0]

            #
            currentFileDate = currentFileDate.replace("-", "/")
            currentFileTime = currentFileTime.replace("-", ":")

            #
            if (currentFileDate < start[0]):
                fileDateValid = False

            #
            elif (currentFileTime < start[1]):
                fileDateValid = False

            #
            if (currentFileDate > stop[0]):
                fileDateValid = False

            #
            elif (currentFileTime > stop[1]):
                fileDateValid = False

            # if the file creation date falls between start and stop
            if (fileDateValid):

                saveData    = True
                fName       = folder + file.name
                
                # get headers of the current csv file
                currentHeaders = pandas.read_csv(
                fName, 
                nrows = 0
                ).columns.tolist()
                
                #
                for header in allHeaders:

                    #
                    if (header not in requested_headers):
                        saveData = False

                    #
                    if (header not in currentHeaders):
                        saveData = False

                    #
                    if (saveData == True):

                        # read all info in file
                        allNewInfo = pandas.read_csv(fName)
                        AddInfoToArray(
                        [
                            header,
                            allNewInfo["date"].tolist(),
                            allNewInfo["time"].tolist(),
                            allNewInfo[header].tolist()
                        ]);

    FormatInfoArray(start, stop)

def ReadUserRequest():
    print("")

##############################
# Get all of the needed data # 
##############################

# load the basic settings from JSON file
settings_file   = open("../../settings/logger.json");
settings        = json.load(settings_file)

# set up all locations that have data/error files
infoLocations.append(settings["Data Location Py"]); 
infoLocations.append(settings["Error Location Py"]);
infoLocations.append(settings["Backup Location Py"]);

# determine if their is info to be read
for folder in infoLocations:

    # if directory exists
    try:

        os.scandir(folder);

        # if there are no info in directory
        if (len(os.listdir(folder)) == 0):

            # remove directory
            infoLocations.remove(folder);
    
    # the directory does not exists
    except:

        # remove directory
        infoLocations.remove(folder);

allHeaders = [];

# for all folders that contains info
for folder in infoLocations:

    # for all files in a folder
    for file in os.scandir(folder):

        fName   = folder + file.name

        # get headers of the current csv file
        currentHeaders = pandas.read_csv(
        fName, 
        nrows = 0
        ).columns.tolist()

        # for all headers in current csv
        for header in currentHeaders:

            # if header is not found yet
            if (header not in allHeaders):

                # add header to data headers
                allHeaders.append(header)

# remove date and time headers
allHeaders.remove("date")
allHeaders.remove("time")

################################
# Set up GUI used for plotting #
################################

# create main window
root = tkinter.Tk()
root.title("Data Plotter")
root.geometry("500x700")
root.configure(bg = 'white')

# create a label frame for checkboxes
lFrame1 = tkinter.LabelFrame(
root,
text = "Select Info To Plot", 
padx = 20, 
pady = 20, 
bg = "white")
lFrame1.grid(row = 0, column = 0)

# create a label frame for buttons
lFrame2 = tkinter.LabelFrame(
root, 
text = "Commands", 
padx = 20, 
pady = 20, 
bg = "white")
lFrame2.grid(row = 0, column = 1)

# create scrollable area for the checkboxes
text = tkinter.scrolledtext.ScrolledText(
lFrame1, 
width = 45)
text.pack()

# create the check list
for checkBoxName in allHeaders:
    cb = tkinter.Checkbutton(
    text, 
    text = checkBoxName, 
    bg = 'white', 
    anchor = 'w')
    text.window_create('end', window = cb)
    text.insert('end', '\n')

# create start date selector frame
lFrame3 = tkinter.LabelFrame(
lFrame2, 
text = "Start Date", 
padx = 20, 
pady = 20, 
bg = "white")
lFrame3.pack()

# create start date selector
calStart = tkcalendar.Calendar(
lFrame3, 
selectmode = "day", 
year = 2023, 
month = 2,
day = 3)
calStart.pack()

# create start time selector frame
lFrame4 = tkinter.LabelFrame(
lFrame2, 
text = "Start Time", 
padx = 20, 
pady = 20, 
bg = "white")
lFrame4.pack()

# 
min_sb_start = tkinter.Spinbox(
lFrame4,
from_= 0,
to = 23,
wrap = True,
textvariable = 0,
width = 2,
state = "readonly",
justify = "center")

#
sec_hour_start = tkinter.Spinbox(
lFrame4,
from_= 0,
to = 59,
wrap = True,
textvariable = 0,
width = 2,
justify = "center")

#
sec_start = tkinter.Spinbox(
lFrame4,
from_= 0,
to = 59,
wrap = True,
textvariable = 0,
width = 2,
justify = "center")

min_sb_start.pack(
side = "left",
fill = "x", 
expand = True)

sec_hour_start.pack(
side = "left", 
fill = "x", 
expand = True)

sec_start.pack(
side = "left",
fill = "x", 
expand = True)

# create stop date slector frame
lFrame5 = tkinter.LabelFrame(
lFrame2, 
text = "Stop Date", 
padx = 20, 
pady = 20, 
bg = "white")
lFrame5.pack()

# create stop date selector
calStop = tkcalendar.Calendar(
lFrame5, 
selectmode = "day", 
year = 2023, 
month = 2,
day = 3)
calStop.pack()

# create stop time selector frame
lFrame6 = tkinter.LabelFrame(
lFrame2, 
text = "Stop Time", 
padx = 20, 
pady = 20, 
bg = "white")
lFrame6.pack()

# 
min_sb_stop = tkinter.Spinbox(
lFrame6,
from_= 0,
to = 23,
wrap = True,
textvariable = 0,
width = 2,
state = "readonly",
justify = "center")

#
sec_hour_stop = tkinter.Spinbox(
lFrame6,
from_= 0,
to = 59,
wrap = True,
textvariable = 0,
width = 2,
justify = "center")

#
sec_stop = tkinter.Spinbox(
lFrame6,
from_= 0,
to = 59,
wrap = True,
textvariable = 0,
width = 2,
justify = "center")

min_sb_stop.pack(
side = "left",
fill = "x", 
expand = True)

sec_hour_stop.pack(
side = "left", 
fill = "x", 
expand = True)

sec_stop.pack(
side = "left",
fill = "x", 
expand = True)

# create the button
button = tkinter.Button(
lFrame2, 
text = "Plot the data",
command = ReadUserRequest())
button.pack(pady = 10)

root.mainloop()

#GatherAllInfo(["Cutter Head 1 Direction", "Cutter Head 2 Direction", "Stop Machine"], ["2023/03/02", "00:00:00"], ["2023/03/05", "23:59:59"])  




