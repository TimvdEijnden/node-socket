var ws = require("nodejs-websocket")


var connectionData = [];

var server = ws.createServer(function (conn) {    

    conn.on("text", function (str) {
        
        try{
            var chatData = JSON.parse(str);    
            addToConnectionData(chatData,conn);
			var responseObject = {error: false, chatData: chatData, connections: server.connections.length};  	
	        broadcast(JSON.stringify(responseObject),conn);
            conn.sendText(JSON.stringify({erorr: false, connections: server.connections.length}))
        }catch(error){
        	conn.sendText(JSON.stringify({error: true, message: error.message}));
        }
    	
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
        refreshConnecionData();
    })

    conn.on('error', function(error){
        console.log(error.message);
        refreshConnecionData();
    });
}).listen(11171);


function refreshConnecionData(){
    var names = [];
    var index = 0;
    connectionData.forEach(function(dataObject){
        var found = false;
        server.connections.forEach(function(conn){
            if(dataObject.conn.key == conn.key){
                found = true;
            }            
        });

        if(found) names.push(dataObject.nickname);
        else{
            connectionData.splice(index,1);
            var responseObject = {error: false, chatData: {nickname: dataObject.nickname, message: '<b>leaved the chat</b>'}, connections: server.connections.length};
            broadcast(JSON.stringify(responseObject));
        }
        index++;
    });
    broadcast(JSON.stringify({error: false, nicknames: names}));
}


function addToConnectionData(dataObject,connection)
{
    if(dataObject.nickname && !connectionExists(connection)){
        connectionData.push({conn: connection, nickname: dataObject.nickname});
    }
    refreshConnecionData();
}

function connectionExists(connection){
    for (var i = connectionData.length - 1; i >= 0; i--) {
        if(connectionData[i].conn.key == connection.key) return true;
    };
    return false;
}


function broadcast(str,conn) {
	server.connections.forEach(function (connection) {
		if((conn && connection != conn) || !conn){
			connection.sendText(str)
		}		
	})
}