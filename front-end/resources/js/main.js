const server = "http://127.0.0.1:3000";
const socket = io(server);

let conversations = [];
let connectedUser = null;
let selectedConversation = null;
let writingPeople = [];
let lastTimeOut = null;

(function () {
  socket.on("writing", (username) => {
    onWriting(username);
  });

  socket.on("newMsg", (res) => {
    if (res.conversationID == selectedConversation._id) {
      selectedConversation.messages.push(res.msg);
      showConversation(selectedConversation);
    } else {
      var conv = conversations.find((x) => x._id == res.conversationID);
      var index = conversations.indexOf(conv);
      conv.messages.push(res.msg);
      conversations.splice(index, 1, conv);
    }
  });

  if (localStorage.getItem("token")) {
    loginFromToken(localStorage.getItem("token"));
  }
})();

function handleLogin() {
  localStorage.setItem("token", connectedUser.token);
  getConvs();
  var loginForm = document.getElementById("login-form");
  loginForm.style.display = "none";
  showUserName();
}

function showUserName() {
  var accountTile = document.getElementById("my-account");
  accountTile.addEventListener("click", disconnect);
  accountTile.style.display = "block";
  var accountNameSpan = document.getElementById("accountName");
  accountNameSpan.innerText = connectedUser.name;
}

function getConvs() {
  let list = document.getElementById("conversation-list");
  list.innerHTML = "";
  fetch(`${server}/conversations/own`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${connectedUser.token}`,
    },
    body: JSON.stringify({
      userID: connectedUser.userId,
      userName: connectedUser.name,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      conversations = data;
      conversations.forEach((conv) => createConvTile(conv));
    });
}

async function login() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  connectedUser = await fetch(`${server}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((res) => res.json())
    .then((data) => data);
  handleLogin();
}

async function loginFromToken(token) {
  connectedUser = await fetch(`${server}/auth/tokenLogin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  })
    .then((res) => res.json())
    .then((data) => data);
  handleLogin();
}

function disconnect() {
  localStorage.removeItem("token");
  window.location.reload();
}

function createConvTile(conversation) {
  let list = document.getElementById("conversation-list");

  var card = document.createElement("li");

  var button = document.createElement("a");
  button.href = "#";

  var userIcon = document.createElement("i");
  userIcon.classList = "fa fa-user";

  var span = document.createElement("span");
  span.innerText = conversation.title;

  var clockIcon = document.createElement("i");
  clockIcon.classList = "fa fa-times";

  button.appendChild(userIcon);
  button.appendChild(span);
  button.appendChild(clockIcon);

  button.addEventListener("click", () => showConversation(conversation));

  card.appendChild(button);

  list.appendChild(card);
}

function showConversation(conversation) {
  selectedConversation = conversation;
  var content = document.getElementById("chat-area");
  content.innerHTML = "";

  var divTitle = document.createElement("div");
  divTitle.classList = "title";
  var title = document.createElement("b");
  title.innerText = conversation.title;
  var titleIcon = document.createElement("i");
  titleIcon.classList = "fa fa-search";

  divTitle.appendChild(title);
  divTitle.appendChild(titleIcon);

  var divChatList = document.createElement("div");
  divChatList.classList = "chat-list";
  var chatList = document.createElement("ul");

  conversation.messages.forEach((msg) => {
    var chat = document.createElement("li");

    var chatNameDiv = document.createElement("div");
    chatNameDiv.classList = "name";
    var chatNameSpan = document.createElement("span");
    chatNameSpan.innerText = msg.sender.userName;
    chatNameDiv.appendChild(chatNameSpan);

    var chatMsgDiv = document.createElement("div");
    chatMsgDiv.classList = "message";
    var chatMsgContent = document.createElement("p");
    chatMsgContent.innerText = msg.content;
    var chatMsgTimeSpan = document.createElement("span");
    chatMsgTimeSpan.classList = "msg-time";
    var date = new Date(msg.sendAt);
    var minutes = date.getMinutes();
    var time = `${date.getHours()}:${minutes < 10 ? `0${minutes}` : minutes}`;
    chatMsgTimeSpan.innerText = time;
    chatMsgDiv.appendChild(chatMsgContent);
    chatMsgDiv.appendChild(chatMsgTimeSpan);

    if (msg.sender.userID == connectedUser.userId) {
      chat.classList = "me";
    } else {
      chat.classList = "";
    }
    chat.appendChild(chatNameDiv);
    chat.appendChild(chatMsgDiv);

    chatList.appendChild(chat);
  });

  var inputArea = document.createElement("div");
  inputArea.classList = "input-area";
  var inputWrapper = document.createElement("div");
  inputWrapper.classList = "input-wrapper";
  var inputText = document.createElement("input");
  inputText.type = "Text";
  inputText.placeholder = "Message here";
  inputText.value = "";
  inputText.id = "msgInput";
  inputText.addEventListener("input", () => {
    socket.emit("writing", connectedUser.name);
  });
  inputText.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  var smileIcon = document.createElement("i");
  smileIcon.classList = "fa fa-smile-o";

  inputWrapper.appendChild(inputText);
  inputWrapper.appendChild(smileIcon);

  var submit = document.createElement("input");
  submit.type = "button";
  submit.classList = "send-btn";
  submit.value = "Submit";
  submit.addEventListener("click", sendMessage);

  inputArea.appendChild(inputWrapper);
  inputArea.appendChild(submit);

  var writingDiv = document.createElement("div");
  writingDiv.id = "writing-area";
  writingDiv.classList = "writing-area";

  var writingLabel = document.createElement("span");
  writingLabel.innerText = `Someone is writing ...`;
  writingDiv.style.display = "none";

  writingDiv.appendChild(writingLabel);

  content.appendChild(divTitle);
  content.appendChild(chatList);
  content.appendChild(writingDiv);
  content.appendChild(inputArea);

  // MemberList
  var memberList = document.getElementById("member-list");
  memberList.innerHTML = "";
  var totalMsg = document.createElement("span");
  totalMsg.innerText = `${conversation.messages.length} message${
    conversation.messages.length > 1 ? "s" : ""
  }`;
  memberList.appendChild(totalMsg);
  console.log(conversation.participants);
  conversation.participants.forEach((user) => {
    var memberListTile = document.createElement("li");
    var statusIcon = document.createElement("i");
    statusIcon.classList = "fa fa-circle-o";
    var statusSpan = document.createElement("span");
    statusSpan.classList = "status online";
    statusSpan.appendChild(statusIcon);
    var memberName = document.createElement("span");
    var msgCount = conversation.messages.filter(
      (x) => x.sender.userID == user.userID
    ).length;
    memberName.innerText = `${user.userName} (${msgCount})`;
    memberListTile.appendChild(statusSpan);
    memberListTile.appendChild(memberName);
    memberList.appendChild(memberListTile);
  });
}

// TODO: optimiser le nombre de message au socket
function onWriting(username) {
  if (lastTimeOut != null) {
    clearTimeout(lastTimeOut);
  }
  var writingDiv = document.getElementById("writing-area");
  lastTimeOut = setTimeout(() => {
    if (writingPeople.includes(username)) {
      writingPeople.splice(writingPeople.indexOf(username), 1);
    }
    if (writingPeople.length === 0) {
      writingDiv.style.display = "none";
    }
  }, 2000);
  if (!writingPeople.includes(username)) {
    writingPeople.push(username);
  }
  writingDiv.style.display = "block";
  if (writingPeople.length === 1) {
    writingDiv.children[0].innerText = `${writingPeople[0]} is writing ...`;
  } else if (writingPeople.length === 2) {
    writingDiv.children[0].innerText = `${writingPeople[0]} and ${writingPeople[1]} are writing ...`;
  } else {
    writingDiv.children[0].innerText = `Some people are writing ...`;
  }
}

function sendMessage() {
  var msg = document.getElementById("msgInput").value;
  var newMsg = {
    content: msg,
    sender: {
      userID: connectedUser.userId,
      userName: connectedUser.name,
    },
    sendAt: new Date(Date.now()),
  };
  socket.emit("newMsg", {
    conversationID: selectedConversation._id,
    msg: newMsg,
  });
}

function addConversationForm() {
  var content = document.getElementById("chat-area");
  content.innerHTML = "";
  var memberList = document.getElementById("member-list");
  memberList.innerHTML = "";

  var newConvForm = document.createElement("div");
  newConvForm.id = "conv-form";
  newConvForm.classList = "login";
  var strong = document.createElement("strong");
  strong.innerText = "Nouvelle conversation";
  var form = document.createElement("form");
  var entryDiv = document.createElement("div");
  entryDiv.classList = "entry";
  var label = document.createElement("label");
  label.innerText = "Nom";
  var input = document.createElement("input");
  input.type = "text";
  input.value = "";
  input.placeholder = "Nouvelle conversation";
  input.name = "convName";
  input.id = "convName";
  var button = document.createElement("button");
  button.type = "button";
  button.innerText = "Créer";
  button.addEventListener("click", addConversation);

  entryDiv.appendChild(label);
  entryDiv.appendChild(input);
  form.appendChild(entryDiv);
  newConvForm.appendChild(strong);
  newConvForm.appendChild(form);
  newConvForm.appendChild(button);

  content.appendChild(newConvForm);
}

function addConversation() {
  var convName = document.getElementById("convName").value;
  var body = JSON.stringify({
    title: convName,
    createdAt: new Date(Date.now()),
    participants: [
      {
        userID: connectedUser.userId,
        userName: connectedUser.name,
      },
    ],
    messages: [
      {
        sender: {
          userID: connectedUser.userId,
          userName: connectedUser.name,
        },
        content: "Voici le début de votre nouvelle conversation !",
        sendAt: new Date(Date.now()),
      },
    ],
  });

  console.log(body);

  fetch(`${server}/conversations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${connectedUser.token}`,
    },
    body: body,
  });
  getConvs();
}
