from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/update_score', methods=['POST'])
def update_score():
    data = request.get_json()
    score = data.get('score', 0)
    # Here you could add database functionality to store high scores
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
