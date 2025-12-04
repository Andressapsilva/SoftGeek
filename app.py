from flask import Flask, render_template
import os

app = Flask(__name__)


@app.route('/')
def index():
	return render_template('index.html')


@app.route('/relatorios.html')
def relatorios():
	return render_template('relatorios.html')


if __name__ == '__main__':
	# Em desenvolvimento, use debug=True. Em produção (Render) o gunicorn será usado.
	app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
