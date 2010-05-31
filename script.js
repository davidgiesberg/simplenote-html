var notes = localStorage.notes ? (JSON.parse( localStorage.notes ) || {}) : {};
var needBodies = [];
var $noteListTemplate;

function startup() {
    justShow("#notes");

    $("#filter").keyup(doFilter).click(doFilter).val(localStorage.filter);

    $("#loginForm").submit(doLogin);

    $noteTemplate = $("#note-template");
    $noteListTemplate = $("#note-list-template");

    $(".action-showList").click(showList);
    $(".action-logout").click(showLogin);
    $(".action-refresh").click(fetchNoteList);

    // defer the complicated stuff so the loading bar goes away.
    setTimeout(loadNotes, 100);
    
    $("#main").css("min-height", (window.innerHeight - parseInt($("#main").css("padding-bottom"))) + "px" ); // footer is 50px

}

function loadNotes() {
    window.scrollTo(0,1) // get rid of address bar

    // do we have a login token?
    if (!localStorage.authEmail || !localStorage.authToken) {
        showLogin();
        return;
    }

    // we're logged in, so assume there's a notes list. Display it now
    // so there's something to look at.
    buildNotesList();

    // if it's been 20 mins since the last sync, do one.
    var now = new Date().getTime();
    var last = localStorage.lastSync ? localStorage.lastSync : 0;
    if (now - last > 20 * 60 * 1000) { // 20 mins
        console.log((now - last) + "ms since last sync");
        fetchNoteList();
        return;
    }

    // If any note bodies are missing, fetch them.
    $.each(notes, function(i,n) {
        if (!n.body) {
            queueBody(n.key);
        }
    });
}


function showList() {
    // we check this because I tend to use showList as a generic 'home' action.
    if (!localStorage.authToken) return showLogin();
    justShow("#notes");
    return false; // click handler
}

function showNote(key) {
    var note = notes[key];
    if (note) {
        $("#note").find(".body").html( htmlFilter(note.body) );
        $("#note").find(".page-title").text(note.title);
        justShow("#note");
    }
}

function doFilter() {
    localStorage.filter = $("#filter").val();
    buildNotesList();
}




function buildNotesList() {
    // remove these later, so we don't bump the scroll bar position
    var old = $("#notes").find("li"); 

    var added = 0;
    $.each(notes, function(i,note) {
        if (localStorage.filter && !note.body.match(localStorage.filter)) return;

        added++;

        var $html = $noteListTemplate.clone();

        $html.find(".note-title").text(note.title);
        $html.click(function() {
            showNote(note.key);
            return false;
        });

        $html.find(".modify").text(note.modify);

        var status = "";
        if (needBodies.indexOf(note.key) >= 0) { 
            status = "fetching";
        } else if (note.body) {
            status = "";
        } else {
            status = "broken";
        }
        $html.find(".status").text(status);

        $("#notes").find("ul").append($("<li>").append($html));
    });
    if (added == 0) { // do this rather than counting notes becuase of the filter
        $("#notes").find(".empty").show();
    } else {
        $("#notes").find(".empty").hide();
    }
    old.remove();
}




/******************************
 * login methods              
 ******************************/

function showLogin() {
    // destroy local storage
    localStorage.authToken = "";
    localStorage.notes = "";
    localStorage.filter = "";
    notes = {};
    buildNotesList();
    
    justShow("#login");
    $("#email").val( localStorage.authEmail );
    $("#password").val("");
}

function doLogin() {
    localStorage.authToken = "";
    $("#thinking").show();

    // hide iphone keyboard
    $("#email").blur();
    $("#password").blur();

    callLogin( $("#email").val(), $("#password").val() );
    return false; // form handler
}

function callLogin(email,password) {
    console.log("logging in");
    $("#loginError").text("");
    var auth = "email=" + encodeURIComponent(email) + "&password=" + encodeURIComponent(password);
    authToken = "";
    $.ajax({
        "url":"proxy.php/login",
        "type":"POST",
        "data":Base64.encode(auth),
        "success":function(data) {
            localStorage.authEmail = email;
            localStorage.authToken = data;
            showList();
            fetchNoteList();
        },
        "error":function(req,status,err) {
            console.log(status, err);
            $("#loginError").text("login problem!");
            showLogin();
        }
    });
}



/******************************
 * network methods
 ******************************/


function fetchNoteList() {
    console.log("getting note list");
    $(".action-refresh img").attr("src", "wait.gif");
    call("GET", "index", {}, function(data) {
        var list = JSON.parse(data);
        $.each(list, function(i,note) {
            var wantBody = false;
            // do we already know about this note?
            if (notes[note.key]) {
                // has it been changed?
                if (notes[note.key].modify != note.modify) {
                    wantBody = true;
                }
                // preserve the body, replace everything else
                var body = notes[note.key].body;
                notes[ note.key ] = note;
                notes[ note.key ].body = body;
                setTitle(note);

            } else {
                // new note.
                notes[ note.key ] = note;
                notes[ note.key ].body = null;
                notes[ note.key ].title = "...";
            }
            // we'll want to fetch notes with a blank body.
            if (!note.body) {
                wantBody = true;
            }
            // queue the bodies of these notes for fetch
            if (wantBody && !note.deleted) {
                queueBody(note.key);
            }
        });

        for (var key in notes) {
            // we're read-only, we don't care about deleted notes.
            if (notes[key].deleted || !notes[key].modify) {
                delete notes[key];
            }
        }
        
        localStorage.notes = JSON.stringify(notes);
        localStorage.lastSync = new Date().getTime();
        buildNotesList();
        $(".action-refresh img").attr("src", "refresh.png");
    });
}

var bodyFetchTimer = null;
function queueBody(key) {
    if (needBodies.indexOf(key) < 0) needBodies.push(key);
    if (bodyFetchTimer) clearTimeout(bodyFetchTimer);
    bodyFetchTimer = setTimeout(fetchOneBody,10);
}

function fetchOneBody() {
    $(".action-refresh img").attr("src", "wait.gif");
    if (needBodies.length > 0) {
        var key = needBodies.shift();
        console.log("fetching body " + key);
        call("GET", "note", { "key":key }, function(body) {
            notes[key].body = body;
            setTitle(notes[key]);
            localStorage.notes = JSON.stringify(notes);
            buildNotesList();
            fetchOneBody();
        });
    } else {
        $(".action-refresh img").attr("src", "refresh.png");
    }
}


/******************************
 * utility methods
 ******************************/


function call(verb, command, params, callback) {
    params = params ? params : {};
    if (localStorage.authEmail && localStorage.authToken) {
        params['email'] = localStorage.authEmail;
        params['auth'] = localStorage.authToken;
    }
    $.ajax({
        "url":"proxy.php/" + command,
        "type":verb,
        "data":params,
        "success":callback,
        "error":function(req,status,err) {
            console.log("Error: ", status, err);
            $("#loginError").text("API problem! Dumping to login form is the wrong thing to do here!");
            showLogin();
        }
    });
}

function htmlFilter(text) {
    var html = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;")
    html = html.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
    html = "<p>" + html.replace(/\n{2,}/g, "</p><p>").replace(/\n+/g,"<br>") + "</p>";
    return html;
}

function justShow(id) {
    $("#thinking").hide();
    $("#notes").hide();
    $("#note").hide();
    $("#login").hide();
    $(id).show();
    $("#main").show();
    window.scrollTo(0,1);
}

function setTitle(note) {
    // title is the first line of the note
    note.title = (note.body && note.body.match(/^(.*?)\n/)) ? note.body.match(/^(.*?)\n/)[1] : (note.body || "...");
}











$(startup);