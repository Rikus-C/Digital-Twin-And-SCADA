var graphList = []; // names of graphs that must be created
var allGraphs = []; // actual graph objects
var plotsCreated = false;

var colorList = [
    "#1E6EE7",  // Blue
    "#E26120",  // Orange 
    "#1FA810",  // Green
    "#A820E2",  // Purple
    "#DF2525",  // Red
    "#E2DB20"   // Yellow
];

/*create and insert plots for the current view*/
const CreatePlots = () =>
{
    plotsCreated = false;
    allGraphs = [];

    for (var i = 0; i < graphList.length; i++)
    {
        // Get all plots for this graph
        var linesPP = graphList[i].replace("Plot ", "").replace(", ", ",").split(",");

        // Create the datasets for this graph
        allDatasets = [];

        for (var x = 0; x < linesPP.length; x++){
            allDatasets.push({
                backgroundColor: colorList[x],
                borderColor: colorList[x],
            })
        }

        var newTitle = linesPP.toString();

        var currentGraph = new Chart(graphList[i] + "-p", 
        {
            type: "line",
            data: {
                datasets: allDatasets
            },
            options:{
                animation: false,
                plugins:{
                    legend: {display: false},
                    title: {
                        display: true,
                        text: " ",
                        padding: {
                            top: 10,
                            bottom: 10
                        },
                        font: {
                          size: 24,
                          style: 'italic',
                          family: 'Helvetica Neue'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            color: "white"
                        },
                        
                        ticks:{
                            color: "white",
                        }
                    },
                    x:{
                        title: {
                            display: false,
                            color: "white",
                        },
                        ticks:{
                            color: "white",
                        }
                    }
                },
            }
        });

        allGraphs.push(currentGraph);
    }

    plotsCreated = true;
}

const UpdatePlots = () => {
    // for each graph in the view
    allGraphs.forEach((graph, graphIndex) => {
        // Get all plots for this graph
        var linesPP = graphList[graphIndex].replace("Plot ", "").replace(", ", ",").split(",");

        //var linesPP = graphList[graphIndex].replace("Plot ", "").replace(", ", "").split(",");
        var linesPP = graphList[graphIndex].replace("Plot ", "").replace(", ", ",").split(",");
        // for each plot in the graph
        for (var x = 0; x < linesPP.length; x++) {
            var yVals = [];
            
            // Determine yValues
            for (var ii = 0; ii < dataBuffer.length; ii++){
                cur = dataBuffer[ii][linesPP[x]].value;
                yVals.push(cur);
            }

            // Add y values to the spesific plots
            graph.data.datasets[x].data = yVals;
        }

        // Determine xLabels (Values)
        graph.data.labels = [...Array(dataBuffer.length).keys()];
        
        // Update the graph
        graph.update();
    });
}
