
const list = [];

// load부분 원래는 ready였음..
$(document).load(() => {
    $(".input-message input[type=text]").on("keydown", (e) => {
        if(e.keyCode == 13) { 
            onEnterMessage();
        }
    });
});

function onEnterMessage() {
    var message = $(".input-message input[type=text]").val();
    $(".input-message input[type=text]").val("");

    if(message=='/clear') { clearMessage();
    } else { 
        sendMessage(message);
    }
    
}

//messageType: 0: System, 1:Self, 2:Other
function addMessage(nick, message, date, messageType = 1) {
    if(message == null || message == "") return;
    var chatBox = $(".chat-box"); 
    var newMessage = $(".chat-box .message.template").clone(); 
    list.push(newMessage);
    newMessage.removeClass("template"); 
    if(messageType == 0) newMessage.addClass("system"); 
    if(messageType == 1) newMessage.addClass("self");

    chatBox.append(newMessage); 

    
    newMessage.attr("date", date); 
    newMessage.find("img").attr("src", "https://via.placeholder.com/100x100.png?text=" + nick);
    newMessage.find(".text").text(message);
    newMessage.find(".time").text(moment(date).format("YYYY/MM/DD HH:mm:ss"));

    var element = chatBox.indexOf(room);
    element.scrollTop = element.scrollHeight - element.clientHeight;
}

function clearMessage() {
    $(".chat-box .message:not(.template)").remove();
}

var nick = null;
var room = null; 
// var url = null;

function onEnterNick() { 

    nick = $("input[name='nick']").val();
    room = $("input[name='room']").val();
    // // url = "/api/" + room;
    // $("#chat-window").attr("roomId", room);
    console.log("on Enter", nick, room);
    
    // a(room,url);
    
    $("#enter").hide();
    $("chat-window").show();
    addMessage(null, "닉네임: "+nick+" 방 이름: "+room, new Date().getTime(), 0);
    connectWebSocket();

}

// function a(room,url) {

//     fetch("/api/geturl", {
//         method: "POST",
//         headers: { 
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             room: room,
//             url: url
//         })
//     });
//    distingRoom(url);
// }

// function distingRoom(url) {
    
//     fetch(url, {
//         method: "Get",
//         headers: { 
//             'Content-Type': 'application/json'
//         }
//     }).then((res) => {
//         openChatRoom(nick, room);
//     });
   
// }

// function openChatRoom(nick, room) {

//     console.log("openChatRoom함수 실행");

//     $("#enter").hide();
//     $("#chat-window").show();
//     addMessage(null, "닉네임: "+nick+" 방 이름: "+room, new Date().getTime(), 0);
//     connectWebSocket();
// }


function sendMessage(message) {
    fetch("/api/send", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            room: room,
            nick: nick,
            message: message
        })
    }).then((res) => { 
        console.log(res);
    });
}

function loadMessages() {
    fetch("/api/messages", {
        method: "Get",
        headers: { 
            'Content-Type': 'application/json'
        } 
    }) 
    .then(response => response.json()) 
    .then((messages) => { 
        messages.forEach(data => {
            console.log(data.nick, data.message, data.date, "나오는건가");
            let type = data.nick == nick ? 1 : 2; 
            addMessage(data.nick, data.message, data.date, type); 
        });
    });
}

function pullMessages() {

    var messages = $(".message:not(.system)[date]");
    if (messages.length == 0)  return loadMessages(); 
    var lastMessage = messages.last();

    var date = lastMessage.attr("date");

    fetch("/api/pull", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date:date
        })
    }) 
    .then(response => response.json()) 
    .then((messages) => { 
        messages.forEach(data => {
            let type = data.nick == nick ? 1 : 2; 
            addMessage(data.nick, data.message, data.date, type); 
        });
    });
}

var ws = null;
function connectWebSocket() { 
    if (ws != null) { 
        try {
            ws.close();
        } catch (e) {}
    }
    ws = new WebSocket("ws://127.0.0.1:8080"); 
    ws.onclose = () => {
        setTimeout(connectWebSocket, 1000 ); 
    };
    ws.onmessage = (message) => { 
        pullMessages(); 
    }
}
