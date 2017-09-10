/* global $*/
var count = 0;
var snd = new Audio("static/assets/sounds/ding.mp3");

function makeActive(row, cell){
    cell = $("#"+row+"-"+cell);
    cell.removeClass("inactive");
    cell.addClass("active");
}

function makeQueued(row,cell){
    cell = $("#"+row+"-"+cell);
    snd.play();
    cell.attr("style","background-color: blue;");
    cell.attr("onclick", "getLetter(this); count++; checkWin()");
}

var punctuation = ["'",",","!",".","?",";",":"," "]

function loadPuzzle(puzzle){
    puzzle = JSON.parse(puzzle);
    for (var row = 0; row < 4; row++){
        for (var cell = 0; cell < 14; cell++){
            var spot = $('#'+row+'-'+cell);
            var letter = puzzle['word'][row][cell]
            if (letter != ' '){
                makeActive(row,cell);
                if ($.inArray(letter,punctuation) >= 0){
                    getLetter(document.getElementById(row+'-'+cell));
                }

            }
        }

    }
}

var guessed = []

function searchLetter(letter){
    var already = $.inArray(letter,guessed) >= 0;
    if (letter != " " && !already){
        guessed.push(letter);
        $.ajax({
            url:'loadPuzzle',
            method:'GET',
            success: function(data){
                var puzzle = JSON.parse(data);
                var duples = []
                for (var row = 0; row < 4; row++){
                    for (var cell = 0; cell < 14; cell++){
                        if (puzzle['word'][row][cell].toUpperCase() == letter.toUpperCase()){
                            duples.push([row,cell]);
                        };
                    };
                };
                if (duples.length > 0){
                    slowReveal(duples);
                }
            }
        });
    };
}

function solvePuzzle(){
    $('#solve').attr('style','display:none;')
    $('#next').attr('style','display:block')
    fireworks();
    for (var i = 0; i < 4; i++){
        for (var j = 0; j < 14; j++){
            getLetter(document.getElementById(i+'-'+j));
        }
    }
    
    
}


function getLetter(cell){
    $.ajax({
        url:'getLetter',
        method:'GET',
        data:{row:cell.attributes['row'].value, cell:cell.attributes['cell'].value},
        success: function(result){
            if (result != " "){
                cell.innerHTML = result;
                cell.style.backgroundColor = "white"; 
                cell.removeAttribute("onclick");
            }
        }
    });
}


function slowReveal(duples){
    var row_col = duples.pop()
    makeQueued(row_col[0],row_col[1])
    if (duples.length == 0){
        return
    }
    else{
        return setTimeout(slowReveal,1200, duples = duples)
    }
}

function checkWin(){
    $.ajax({
        url:'getCount',
        method:'GET',
        success: function(total){
            if (count == Number(total)){
                fireworks();
                document.getElementById('solve').style.display = "none";
                document.getElementById('next').style.display = "block";

            }
        }
    });    
}


$(document).ready(function(){
    for (var row = 0; row < 4; row++){
        $('#game-table').append('<tr id="r'+row+'"></tr>');
        for (var cell = 0; cell < 14; cell++){
            $('#r'+row).append('<td id="'+row+'-'+cell+'" class="inactive" row='+row+' cell='+cell+'></td>')
            if (row == 0 || row == 3){
                if (cell == 0 || cell == 13){
                    $('#'+row+'-'+cell).addClass("hidden");
                }
            }
        };
    };
    $.ajax({
        url:'loadPuzzle',
        method:'GET',
        success: loadPuzzle
    });

});


var ready = false;
$(document).keypress(function(event) {
    if (ready){
        searchLetter(event.key);
    }
});