function RunTrendViewer(){
  webSocket.Send({
    type: "show trends",
    data: ""
  }); 
}
