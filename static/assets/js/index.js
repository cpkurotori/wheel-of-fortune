count = 0

function makeActive(row, cell){
    cell = $("#"+row+"-"+cell);
    cell.removeClass("inactive");
    cell.addClass("active");
}

function makeQueued(row,cell){
    cell = $("#"+row+"-"+cell);
    cell.attr("style","background-color: blue;");
    cell.attr("onclick", "getLetter(this); count++");
}

punctuation = ["'",",","!",".","?",";",":"," "]

function loadPuzzle(puzzle){
    puzzle = JSON.parse(puzzle);
    for (var row = 0; row < 4; row++){
        for (var cell = 0; cell < 14; cell++){
            spot = $('#'+row+'-'+cell);
            letter = puzzle['word'][row][cell]
            if (letter != ' '){
                makeActive(row,cell);
                if ($.inArray(letter,punctuation) >= 0){
                    getLetter(document.getElementById(row+'-'+cell));
                }

            }
        }

    }
}

guessed = []

function searchLetter(letter){
    already = $.inArray(letter,guessed) >= 0;
    if (letter != " " && !already){
        guessed.push(letter);
        $.ajax({
            url:'loadPuzzle',
            method:'GET',
            success: function(data){
                puzzle = JSON.parse(data);
                duples = []
                for (var row = 0; row < 4; row++){
                    for (var cell = 0; cell < 14; cell++){
                        if (puzzle['word'][row][cell].toUpperCase() == letter.toUpperCase()){
                            duples.push([row,cell]);
                        };
                    };
                };
                slowReveal(duples);
            }
        });
    };
}

function getLetter(cell){
    console.log(cell.attributes['row'].value+'-'+cell.attributes['cell'].value)
    console.log("getting letter...")
    cell.style.backgroundColor = "white"; 
    cell.removeAttribute("onclick");
    $.ajax({
        url:'getLetter',
        method:'GET',
        data:{row:cell.attributes['row'].value, cell:cell.attributes['cell'].value},
        success: function(result){
            cell.innerHTML = result;
        }
    });
}


function slowReveal(duples){
    row_col = duples.pop()
    makeQueued(row_col[0],row_col[1])
    if (duples.length == 0){
        return
    }
    else{
        return setTimeout(slowReveal,800, duples = duples)
    }
}

function checkWin(){
    $.ajax({
        url:'getCount',
        method:'GET',
        success: function(total){
            if (count == Number(total)){
                document.getElementById('next').style.display = "block";
                clearInterval()
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
    ready = false;
    $(document).keypress(function(event) {
        if (ready){
            searchLetter(event.key);
        }
    });
    setInterval(checkWin,1500);
});



