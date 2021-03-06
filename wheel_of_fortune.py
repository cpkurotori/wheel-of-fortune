from flask import Flask, request, render_template, redirect, url_for
import os, sys, random, json

from phrase_list import puzzles

app = Flask(__name__)
app.config['PUZZLE_NO'] = 0


@app.route('/')
def index():
    return render_template('index.html', category = puzzles[app.config['PUZZLE_NO']]['category'])

@app.route('/getLetter')
def getLetter():
    row = int(request.args.get('row'))
    cell = int(request.args.get('cell'))
    return puzzles[app.config['PUZZLE_NO']]['word'][row][cell]

@app.route('/loadPuzzle')
def loadPuzzle():
    return json.dumps(puzzles[app.config['PUZZLE_NO']])

@app.route('/getCount')
def getCount():
    return str(puzzles[app.config['PUZZLE_NO']]['count'])

@app.route('/win')
def win():
    return render_template('engaged.html')

@app.route('/next')
def next():
    if app.config['PUZZLE_NO'] < len(puzzles)-1:
        app.config['PUZZLE_NO'] += 1
        return redirect(url_for('index'))
    else:
        return redirect(url_for('win'))
        
@app.route('/changePuzzle')
def changePuzzle():
    app.config['PUZZLE_NO'] = len(puzzles)-2
        
@app.route('/reset')
def reset():
    app.config['PUZZLE_NO'] = 0
    return redirect(url_for('index'))

app.run(host=os.getenv('IP', '0.0.0.0'),port=int(os.getenv('PORT', '8080')))